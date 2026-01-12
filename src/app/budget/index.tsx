// Budget Screen - Homebase Budget
// Zero-based budgeting (Dave Ramsey style) - Every dollar has a job!

import React, { useState, useCallback } from 'react';
import { TextInput } from 'react-native';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, AmountInput, PrimaryButton, ScreenWrapper, AppText } from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { Budget, BudgetCategory, createBudget, createBudgetCategory, calculateRemainingToBudget, getBudgetMonthName, calculateBudgetPeriod } from '@/domain/entities';
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
    
    // Load household budget_period_start_day
    let budgetPeriodStartDay = 1; // Default to calendar month
    try {
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      if (householdDoc.exists()) {
        budgetPeriodStartDay = householdDoc.data().budget_period_start_day || 1;
      }
    } catch (error) {
      console.warn('Failed to load budget_period_start_day, using default (1):', error);
    }

    // Calculate period dates based on custom start day
    const { period_start, period_end } = calculateBudgetPeriod(
      selectedMonth,
      selectedYear,
      budgetPeriodStartDay
    );

    console.log(`📅 Creating budget for ${selectedMonth}/${selectedYear} with period ${period_start.toLocaleDateString()} - ${period_end.toLocaleDateString()}`);
    
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
      period_start,
      period_end,
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
      <ScreenWrapper>
        <ScreenHeader title="Budget" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[4] }}>
            Loading budget...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
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
            <AppText variant="body" color={theme.interactive.primary}>
              ← Prev
            </AppText>
          </TouchableOpacity>

          <View style={styles.monthDisplay}>
            <AppText variant="h2">
              {getBudgetMonthName(selectedMonth, selectedYear)}
            </AppText>
            {/* Show "Today" badge if current month */}
            {selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear() && (
              <View style={[styles.todayBadge, { backgroundColor: theme.status.infoBackground }]}>
                <AppText variant="caption" color={theme.status.info}>
                  Today
                </AppText>
              </View>
            )}
            {/* Quick jump to current month */}
            {(selectedMonth !== new Date().getMonth() + 1 || selectedYear !== new Date().getFullYear()) && (
              <TouchableOpacity onPress={goToCurrentMonth} style={styles.todayButton}>
                <AppText variant="body" color={theme.interactive.primary}>
                  Go to Today
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navButton}
            testID="next-month-button"
          >
            <AppText variant="body" color={theme.interactive.primary}>
              Next →
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Zero-Based Budget Status */}
        <Card style={{
          ...styles.statusCard,
          backgroundColor: isZeroBased
            ? theme.status.successBackground
            : theme.status.warningBackground,
        }}>
          <AppText variant="h2" color={isZeroBased ? theme.status.success : theme.status.warning} style={{ marginBottom: SPACING[1] }}>
            {isZeroBased ? '✅ Zero-Based Budget!' : '⚠️ Budget Incomplete'}
          </AppText>
          <AppText variant="body" color={theme.text.secondary}>
            {isZeroBased
              ? 'Every dollar has a job! 🎉'
              : `${formatCurrency(Math.abs(remaining) / 100, householdCurrency)} ${remaining > 0 ? 'left to budget' : 'over budget'}`
            }
          </AppText>
        </Card>

        {/* Income Section */}
        <View style={styles.section}>
          <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
            💰 Income
          </AppText>
          <Card>
            <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[2] }}>
              Planned Income
            </AppText>
            <AmountInput
              value={plannedIncomeInCents}
              onChangeValue={setPlannedIncomeInCents}
              currency={householdCurrency}
            />
          </Card>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          {/* SEARCH BAR */}
          <View style={[styles.searchContainer, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.default }]}>
            <TextInput
              style={[styles.searchInput, { color: theme.text.primary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="🔍 Search categories..."
              placeholderTextColor={theme.text.tertiary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <AppText variant="body" color={theme.text.secondary}>✕</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* COLLAPSIBLE GROUPED CATEGORIES */}
          {(() => {
            // Filter and group categories
            const filteredCategories = budget?.categories ? filterCategories(budget.categories) : [];
            const groupedCategories = filteredCategories.reduce((acc, cat) => {
              if (!acc[cat.group]) acc[cat.group] = [];
              acc[cat.group].push(cat);
              return acc;
            }, {} as Record<string, BudgetCategory[]>);

            return (
              <>
                {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
                  const groupInfo = CATEGORY_GROUP_INFO[groupKey];
                  const isCollapsed = collapsedGroups.has(groupKey);
                  
                  // Calculate group totals
                  const groupTotal = groupCategories.reduce((sum, cat) => sum + cat.planned_amount, 0);
                  
                  return (
                    <View key={groupKey} style={{ marginBottom: SPACING[4] }}>
                      {/* COLLAPSIBLE GROUP HEADER */}
                      <TouchableOpacity 
                        onPress={() => toggleGroupCollapse(groupKey)}
                        style={[styles.groupHeader, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.default }]}
                        activeOpacity={0.7}
                      >
                        <AppText variant="body" style={styles.groupIcon}>{groupInfo.icon}</AppText>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <AppText variant="h2">
                              {groupInfo.name}
                            </AppText>
                            <AppText variant="caption" color={theme.text.tertiary} style={{ marginLeft: SPACING[1] }}>
                              ({groupCategories.length})
                            </AppText>
                          </View>
                          <AppText variant="bodyEmphasis" color={theme.text.secondary} style={{ marginTop: SPACING[1] }}>
                            {formatCurrency(groupTotal, householdCurrency)}
                          </AppText>
                        </View>
                        <AppText variant="body" color={theme.text.tertiary}>
                          {isCollapsed ? '▶' : '▼'}
                        </AppText>
                      </TouchableOpacity>

                      {/* CATEGORY CARDS (only show if not collapsed) */}
                      {!isCollapsed && groupCategories.map((category) => {
                        const fundingStatus = calculateFundingStatus(category);
                        
                        return (
                          <Card key={category.id} style={styles.categoryCard}>
                            <View style={styles.categoryHeader}>
                              <AppText variant="body" style={styles.categoryIcon}>{category.icon}</AppText>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[2], flexWrap: 'wrap' }}>
                                  <AppText variant="bodyEmphasis">
                                    {category.name}
                                  </AppText>
                                  {/* FUNDING STATUS INDICATOR */}
                                  {fundingStatus === 'funded' && (
                                    <View style={[styles.statusBadge, { backgroundColor: theme.status.success + '20' }]}>
                                      <AppText variant="caption" color={theme.status.success}>
                                        ● Funded
                                      </AppText>
                                    </View>
                                  )}
                                  {fundingStatus === 'partial' && (
                                    <View style={[styles.statusBadge, { backgroundColor: theme.status.warning + '20' }]}>
                                      <AppText variant="caption" color={theme.status.warning}>
                                        ● Partial
                                      </AppText>
                                    </View>
                                  )}
                                </View>
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
                    </View>
                  );
                })}

                {/* NO RESULTS STATE */}
                {filteredCategories.length === 0 && budget?.categories.length > 0 && (
                  <View style={styles.emptyState}>
                    <AppText variant="display" color={theme.text.tertiary} style={{ marginBottom: SPACING[2] }}>🔍</AppText>
                    <AppText variant="h2" style={{ marginBottom: SPACING[2] }}>
                      No Results Found
                    </AppText>
                    <AppText variant="body" color={theme.text.secondary}>
                      No categories match &quot;{searchQuery}&quot;. Try a different search term.
                    </AppText>
                  </View>
                )}
              </>
            );
          })()}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={() => router.push('/budget/categories')}
              style={[styles.actionButton, {
                backgroundColor: theme.interactive.primary,
                borderColor: theme.interactive.primary,
              }]}
            >
              <AppText variant="button" color={theme.text.inverse}>
                📊 Track Categories
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/budget/manage-categories')}
              style={[styles.actionButton, {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                marginRight: 0,
              }]}
            >
              <AppText variant="button" color={theme.interactive.primary}>
                ⚙️ Manage Categories
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: SPACING[12] + SPACING[4] }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Month navigation
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
  },
  navButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
  },
  monthDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  todayBadge: {
    marginTop: SPACING[1],
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  todayButton: {
    marginTop: SPACING[1],
    paddingVertical: SPACING[1],
  },
  // Status card
  statusCard: {
    margin: SPACING[4],
    padding: SPACING[5],
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[6],
  },
  categoryCard: {
    marginBottom: SPACING[3],
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: SPACING[3],
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[1],
  },
  // NEW UX ENHANCEMENT STYLES
  searchContainer: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: SPACING[2],
  },
  clearButton: {
    padding: SPACING[2],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    marginBottom: SPACING[2],
  },
  groupIcon: {
    fontSize: 24,
    marginRight: SPACING[3],
  },
  statusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[12] + SPACING[4], // 48 + 16 = 64px (not in 8pt grid, but acceptable for empty state)
  },
});

