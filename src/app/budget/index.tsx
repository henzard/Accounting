// Budget Screen - Homebase Budget
// Zero-based budgeting (Dave Ramsey style) - Every dollar has a job!

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, AmountInput, PrimaryButton } from '@/presentation/components';
import { Budget, BudgetCategory, createBudget, createBudgetCategory, calculateRemainingToBudget, getBudgetMonthName } from '@/domain/entities';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { getDefaultCategories, CATEGORY_GROUP_INFO } from '@/shared/constants/budget-categories';
import { CurrencyCode, formatCurrency } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

export default function BudgetScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [plannedIncome, setPlannedIncome] = useState('');
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const budgetRepository = new FirestoreBudgetRepository();

  // Get current month/year
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  useFocusEffect(
    useCallback(() => {
      loadBudget();
      loadHouseholdCurrency();
    }, [user?.default_household_id])
  );

  async function loadHouseholdCurrency() {
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
  }

  async function loadBudget() {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      // Try to load existing budget for current month
      let existingBudget = await budgetRepository.getBudgetByMonth(
        user.default_household_id,
        currentMonth,
        currentYear
      );

      if (existingBudget) {
        setBudget(existingBudget);
        setPlannedIncome((existingBudget.planned_income / 100).toFixed(2));
      } else {
        // Create new budget with default categories
        const newBudget = await createNewBudget();
        setBudget(newBudget);
        setPlannedIncome('0.00');
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      Alert.alert('Error', 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }

  async function createNewBudget(): Promise<Budget> {
    if (!user?.default_household_id) {
      throw new Error('No household selected');
    }

    const budgetId = `${user.default_household_id}_${currentYear}_${currentMonth}`;
    
    // Get default categories and convert to budget categories
    const defaultCategories = getDefaultCategories();
    const budgetCategories: BudgetCategory[] = defaultCategories.map((cat, index) =>
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
      month: currentMonth,
      year: currentYear,
      planned_income: 0,
      categories: budgetCategories,
    });
  }

  async function handleSaveBudget() {
    if (!budget) return;

    setSaving(true);
    try {
      // Update planned income
      const incomeInCents = Math.round(parseFloat(plannedIncome || '0') * 100);
      budget.planned_income = incomeInCents;

      // Save to Firestore
      const existingBudget = await budgetRepository.getBudgetById(budget.id);
      if (existingBudget) {
        await budgetRepository.updateBudget(budget.id, budget);
      } else {
        await budgetRepository.createBudget(budget);
      }

      Alert.alert('Success! 🎉', 'Budget saved successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  }

  function handleUpdateCategoryAmount(categoryId: string, amount: string) {
    if (!budget) return;

    const amountInCents = Math.round(parseFloat(amount || '0') * 100);
    
    const updatedCategories = budget.categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, planned_amount: amountInCents }
        : cat
    );

    setBudget({ ...budget, categories: updatedCategories });
  }

  function getRemainingToBudget(): number {
    if (!budget) return 0;
    const incomeInCents = Math.round(parseFloat(plannedIncome || '0') * 100);
    const totalPlanned = budget.categories.reduce((sum, cat) => sum + cat.planned_amount, 0);
    return incomeInCents - totalPlanned;
  }

  const remaining = getRemainingToBudget();
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
        title={getBudgetMonthName(currentMonth, currentYear)}
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
        {/* Zero-Based Budget Status */}
        <Card style={[
          styles.statusCard,
          {
            backgroundColor: isZeroBased
              ? theme.status.successBackground
              : theme.status.warningBackground,
          },
        ]}>
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
              value={plannedIncome}
              onChangeText={setPlannedIncome}
              currency={householdCurrency}
              placeholder="0.00"
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
                  value={(category.planned_amount / 100).toFixed(2)}
                  onChangeText={(amount) => handleUpdateCategoryAmount(category.id, amount)}
                  currency={householdCurrency}
                  placeholder="0.00"
                />
              </Card>
            );
          })}
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
});

