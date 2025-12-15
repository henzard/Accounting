// Budget Screen - Homebase Budget
// Zero-based budgeting (Dave Ramsey style) - Every dollar has a job!

import React, { useState, useCallback } from 'react';
import { TextInput } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, AmountInput, PrimaryButton } from '@/presentation/components';
import { Budget, BudgetCategory, createBudget, createBudgetCategory, calculateRemainingToBudget, getBudgetMonthName } from '@/domain/entities';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { getDefaultCategories, CATEGORY_GROUP_INFO } from '@/shared/constants/budget-categories';
import { CurrencyCode, formatCurrency } from '@/shared/utils/currency';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

export default function BudgetScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [plannedIncomeInCents, setPlannedIncomeInCents] = useState(0); // Store income in cents
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  // Selected month/year (default to current)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // UX Enhancement State
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const budgetRepository = new FirestoreBudgetRepository();

  const loadHouseholdCurrency = useCallback(async () => {
    if (!user?.default_household_id) return;

    try {
      const householdDoc = await getDoc(
        doc(db, 'households', user.default_household_id)
      );

      if (householdDoc.exists()) {
        const data = householdDoc.data();
        setHouseholdCurrency((data.currency as CurrencyCode) || 'USD');
      }
    } catch (error) {
      console.error('Error loading household currency:', error);
    }
  }, [user?.default_household_id]);

  const loadBudget = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      // Try to load existing budget for selected month
      let existingBudget = await budgetRepository.getBudgetByMonth(
        user.default_household_id,
        selectedMonth,
        selectedYear
      );

      if (existingBudget) {
        setBudget(existingBudget);
        setPlannedIncomeInCents(existingBudget.planned_income); // Already in cents
      } else {
        // Create new budget with default categories
        const newBudget = await createNewBudget();
        setBudget(newBudget);
        setPlannedIncomeInCents(0);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      Alert.alert('Error', 'Failed to load budget');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.default_household_id, selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
      loadHouseholdCurrency();
    }, [loadBudget, loadHouseholdCurrency])
  );

  async function createNewBudget(): Promise<Budget> {
    if (!user?.default_household_id) {
      throw new Error('No household selected');
    }

    const budgetId = `${user.default_household_id}_${selectedYear}_${selectedMonth}`;
    
    // Load custom categories or use defaults
    const masterCategories = await loadMasterCategories();
    const budgetCategories: BudgetCategory[] = masterCategories.map((cat, index) =>
      createBudgetCategory({
        id: `${budgetId}_cat_${index}`,
        category_id: cat.id,
        name: cat.name,
        group: cat.group,
        icon: cat.icon,
        sort_order: cat.sort_order,
      })
    );

    return createBudget({
      id: budgetId,
      household_id: user.default_household_id,
      month: selectedMonth,
      year: selectedYear,
      planned_income: 0,
      categories: budgetCategories,
    });
  }

  async function loadMasterCategories() {
    if (!user?.default_household_id) {
      return getDefaultCategories();
    }

    try {
      // Try to load custom categories
      const categoriesQuery = query(
        collection(db, 'master_categories'),
        where('household_id', '==', user.default_household_id)
      );
      const snapshot = await getDocs(categoriesQuery);

      if (snapshot.empty) {
        // No custom categories - use defaults
        return getDefaultCategories();
      }

      // Return custom categories
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<import('@/shared/constants/budget-categories').MasterCategory, 'id'>,
      }));
    } catch (error) {
      console.error('Error loading master categories:', error);
      // Fall back to defaults on error
      return getDefaultCategories();
    }
  }

  async function handleSaveBudget() {
    if (!budget) return;

    setSaving(true);
    try {
      // Create new budget object with updated income (immutable update)
      const updatedBudget: Budget = {
        ...budget,
        planned_income: plannedIncomeInCents,
      };

      // Save to Firestore
      const existingBudget = await budgetRepository.getBudgetById(updatedBudget.id);
      if (existingBudget) {
        await budgetRepository.updateBudget(updatedBudget.id, updatedBudget);
      } else {
        await budgetRepository.createBudget(updatedBudget);
      }

      // Update local state with saved budget
      setBudget(updatedBudget);

      Alert.alert('Success! 🎉', 'Budget saved successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  }

  function handleUpdateCategoryAmount(categoryId: string, amountInCents: number) {
    if (!budget) return;
    
    const updatedCategories = budget.categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, planned_amount: amountInCents }
        : cat
    );

    setBudget({ ...budget, categories: updatedCategories });
  }

  // Month navigation functions
  function goToPreviousMonth() {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  function goToNextMonth() {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  function goToCurrentMonth() {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }

  // UX ENHANCEMENT FUNCTIONS
  function toggleGroupCollapse(group: string) {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  }

  function filterCategories(categories: BudgetCategory[]): BudgetCategory[] {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      cat.group.toLowerCase().includes(query)
    );
  }

  function calculateFundingStatus(category: BudgetCategory): 'funded' | 'partial' | 'empty' {
    if (category.planned_amount === 0) return 'empty';
    if (category.actual_amount >= category.planned_amount) return 'funded';
    if (category.actual_amount > 0) return 'partial';
    return 'empty';
  }

  // Calculate remaining to budget using domain helper (correctly excludes INCOME categories)
  const remaining = budget ? calculateRemainingToBudget(budget) : 0;
  const isZeroBased = remaining === 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ScreenHeader title="Budget" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading budget...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <ScreenHeader
        title="Budget"
        showBack={true}
        rightAction={
          <PrimaryButton
            title="Save"
            onPress={handleSaveBudget}
            loading={saving}
            size="sm"
          />
        }
      />

      <ScrollView style={styles.scrollView}>
        {/* Month Navigation */}
        <View style={[styles.monthNav, { borderBottomColor: theme.border.default }]}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={styles.navButton}
            testID="prev-month-button"
          >
            <Text style={[styles.navButtonText, { color: theme.interactive.primary }]}>
              ← Prev
            </Text>
          </TouchableOpacity>

          <View style={styles.monthDisplay}>
            <Text style={[styles.monthText, { color: theme.text.primary }]}>
              {getBudgetMonthName(selectedMonth, selectedYear)}
            </Text>
            {/* Show "Today" badge if current month */}
            {selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear() && (
              <View style={[styles.todayBadge, { backgroundColor: theme.status.infoBackground }]}>
                <Text style={[styles.todayBadgeText, { color: theme.status.info }]}>
                  Today
                </Text>
              </View>
            )}
            {/* Quick jump to current month */}
            {(selectedMonth !== new Date().getMonth() + 1 || selectedYear !== new Date().getFullYear()) && (
              <TouchableOpacity onPress={goToCurrentMonth} style={styles.todayButton}>
                <Text style={[styles.todayButtonText, { color: theme.interactive.primary }]}>
                  Go to Today
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navButton}
            testID="next-month-button"
          >
            <Text style={[styles.navButtonText, { color: theme.interactive.primary }]}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Zero-Based Budget Status */}
        <Card style={{
          ...styles.statusCard,
          backgroundColor: isZeroBased
            ? theme.status.successBackground
            : theme.status.warningBackground,
        }}>
          <Text style={[styles.statusTitle, {
            color: isZeroBased ? theme.status.success : theme.status.warning,
          }]}>
            {isZeroBased ? '✅ Zero-Based Budget!' : '⚠️ Budget Incomplete'}
          </Text>
          <Text style={[styles.statusSubtitle, { color: theme.text.secondary }]}>
            {isZeroBased
              ? 'Every dollar has a job! 🎉'
              : `${formatCurrency(Math.abs(remaining) / 100, householdCurrency)} ${remaining > 0 ? 'left to budget' : 'over budget'}`
            }
          </Text>
        </Card>

        {/* Income Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            💰 Income
          </Text>
          <Card>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Planned Income
            </Text>
            <AmountInput
              value={plannedIncomeInCents}
              onChangeValue={setPlannedIncomeInCents}
              currency={householdCurrency}
            />
          </Card>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            📋 Categories
          </Text>
          {budget?.categories.map((category) => {
            const groupInfo = CATEGORY_GROUP_INFO[category.group];
            return (
              <Card key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.categoryName, { color: theme.text.primary }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.categoryGroup, { color: theme.text.tertiary }]}>
                      {groupInfo.name}
                    </Text>
                  </View>
                </View>
                <AmountInput
                  value={category.planned_amount}
                  onChangeValue={(amountInCents) => handleUpdateCategoryAmount(category.id, amountInCents)}
                  currency={householdCurrency}
                />
              </Card>
            );
          })}

          {/* Manage Categories Button */}
          <TouchableOpacity
            onPress={() => router.push('/budget/manage-categories')}
            style={[styles.manageCategoriesButton, {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
            }]}
          >
            <Text style={[styles.manageCategoriesText, { color: theme.interactive.primary }]}>
              ⚙️ Manage Categories
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  // Month navigation
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  todayBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayButton: {
    marginTop: 4,
    paddingVertical: 4,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Status card
  statusCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryGroup: {
    fontSize: 12,
    marginTop: 2,
  },
  manageCategoriesButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  manageCategoriesText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

