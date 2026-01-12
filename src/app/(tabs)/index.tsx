// Dashboard/Home Screen - Homebase Budget
// Financial overview: Baby Steps, Budget Status, Recent Transactions, Debt Progress

import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

import { Card, BabyStepsDisplay, ScreenWrapper, AppText, HouseholdSwitcherButton, ThemeToggleButton, PrimaryButton } from '@/presentation/components';
import { useTheme } from '@/infrastructure/theme';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { useAuth } from '@/infrastructure/auth';
import { CurrencyCode, formatCurrency } from '@/shared/utils/currency';
import { sanitizeBabyStep } from '@/shared/constants/baby-steps';
import { Budget, calculateRemainingToBudget, isZeroBasedBudget } from '@/domain/entities';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { FirestoreDebtRepository } from '@/data/repositories/FirestoreDebtRepository';
import { Transaction, Debt, calculateDebtSnowball } from '@/domain/entities';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBabyStep, setCurrentBabyStep] = useState<number>(1);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  const budgetRepository = new FirestoreBudgetRepository();
  const transactionRepository = new FirestoreTransactionRepository();
  const debtRepository = new FirestoreDebtRepository();

  const loadDashboardData = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      // Load household data
      const householdDoc = await getDoc(
        doc(db, 'households', user.default_household_id)
      );

      if (householdDoc.exists()) {
        const data = householdDoc.data();
        setCurrentBabyStep(sanitizeBabyStep(data.current_baby_step));
        setHouseholdCurrency((data.currency as CurrencyCode) || 'USD');
      }

      // Load current month budget
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const budget = await budgetRepository.getBudgetByMonth(
        user.default_household_id,
        currentMonth,
        currentYear
      );
      setCurrentBudget(budget || null);

      // Load recent transactions (last 5)
      const allTransactions = await transactionRepository.getTransactionsByHousehold(
        user.default_household_id
      );
      // Sort by date descending and take first 5
      const sorted = allTransactions.sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
      setRecentTransactions(sorted.slice(0, 5));

      // Load debts (if in Baby Step 2)
      const allDebts = await debtRepository.getDebtsByHousehold(user.default_household_id);
      const snowballDebts = calculateDebtSnowball(allDebts);
      setDebts(snowballDebts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.default_household_id, budgetRepository, transactionRepository, debtRepository]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Calculate budget summary
  const budgetSummary = currentBudget ? {
    isZeroBased: isZeroBasedBudget(currentBudget),
    remaining: calculateRemainingToBudget(currentBudget),
    totalPlanned: currentBudget.categories.reduce((sum, cat) => sum + cat.planned_amount, 0),
    totalActual: currentBudget.categories.reduce((sum, cat) => sum + cat.actual_amount, 0),
  } : null;

  // Format transaction date
  const formatTransactionDate = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[4] }}>
            Loading dashboard...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.interactive.primary}
          />
        }
      >
        {/* Welcome Header with Household Switcher and Theme Toggle */}
        <View style={[styles.header, { borderBottomColor: theme.border.default }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <AppText variant="h1" style={{ marginBottom: SPACING[1] }}>
                Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
              </AppText>
              <AppText variant="body" color={theme.text.secondary}>
                Here's your financial overview
              </AppText>
            </View>
            <View style={styles.headerRight}>
              <HouseholdSwitcherButton size={20} testID="home-household-switcher" />
              <View style={{ marginLeft: SPACING[2] }} />
              <ThemeToggleButton size={20} testID="home-theme-toggle" />
            </View>
          </View>
        </View>

        {/* Baby Steps Progress */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => router.push('/baby-steps/select')}
            activeOpacity={0.7}
          >
            <Card style={styles.babyStepsCard}>
              <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
                Your Journey
              </AppText>
              <View style={styles.babyStepsContainer}>
                <BabyStepsDisplay
                  currentStep={currentBabyStep}
                  currency={householdCurrency}
                  onPress={() => router.push('/baby-steps/select')}
                  testID="baby-steps-display"
                />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Current Month Budget Status */}
        {currentBudget && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => router.push('/budget')}
              activeOpacity={0.7}
            >
              <Card style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <AppText variant="h2">
                    📊 Current Month Budget
                  </AppText>
                  <AppText variant="body" color={theme.interactive.primary}>
                    View →
                  </AppText>
                </View>
                
                <View style={styles.budgetSummary}>
                  <View style={styles.budgetRow}>
                    <AppText variant="body" color={theme.text.secondary}>
                      Planned Income
                    </AppText>
                    <AppText variant="bodyEmphasis">
                      {formatCurrency(currentBudget.planned_income, householdCurrency)}
                    </AppText>
                  </View>
                  
                  <View style={styles.budgetRow}>
                    <AppText variant="body" color={theme.text.secondary}>
                      Planned Expenses
                    </AppText>
                    <AppText variant="bodyEmphasis">
                      {formatCurrency(budgetSummary!.totalPlanned, householdCurrency)}
                    </AppText>
                  </View>
                  
                  <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
                  
                  <View style={styles.budgetRow}>
                    <AppText variant="body" color={theme.text.secondary}>
                      Remaining to Budget
                    </AppText>
                    <AppText 
                      variant="bodyEmphasis"
                      color={budgetSummary!.remaining > 0
                        ? theme.status.success
                        : budgetSummary!.remaining < 0
                        ? theme.status.error
                        : theme.text.primary}
                    >
                      {formatCurrency(budgetSummary!.remaining, householdCurrency)}
                    </AppText>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: budgetSummary!.isZeroBased
                        ? theme.status.successBackground
                        : theme.status.warningBackground,
                      marginTop: SPACING[3],
                    },
                  ]}>
                    <AppText 
                      variant="body"
                      color={budgetSummary!.isZeroBased
                        ? theme.status.success
                        : theme.status.warning}
                    >
                      {budgetSummary!.isZeroBased ? '✅ Zero-Based Budget' : '⚠️ Budget Incomplete'}
                    </AppText>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h2">
              💸 Recent Transactions
            </AppText>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <AppText variant="body" color={theme.interactive.primary}>
                View All →
              </AppText>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            <Card>
              {recentTransactions.map((txn) => (
                <TouchableOpacity
                  key={txn.id}
                  onPress={() => router.push(`/transactions/${txn.id}`)}
                  style={styles.transactionItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <AppText variant="bodyEmphasis" style={{ marginBottom: SPACING[1] }}>
                      {txn.payee || 'No payee'}
                    </AppText>
                    <AppText variant="caption" color={theme.text.tertiary}>
                      {formatTransactionDate(txn.date)}
                    </AppText>
                  </View>
                  <AppText 
                    variant="bodyEmphasis"
                    color={txn.type === 'INCOME'
                      ? theme.financial.income
                      : theme.financial.expense}
                  >
                    {txn.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Math.abs(txn.amount), householdCurrency)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[4], textAlign: 'center' }}>
                No transactions yet. Add your first transaction to get started!
              </AppText>
              <PrimaryButton
                title="Add Transaction"
                onPress={() => router.push('/transactions/add')}
                fullWidth
                size="lg"
              />
            </Card>
          )}
        </View>

        {/* Debt Progress (Baby Step 2) */}
        {currentBabyStep === 2 && debts.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => router.push('/debts')}
              activeOpacity={0.7}
            >
              <Card style={styles.debtCard}>
                <View style={styles.budgetHeader}>
                  <AppText variant="h2">
                    ⛓️ Debt Snowball (Baby Step 2)
                  </AppText>
                  <AppText variant="body" color={theme.interactive.primary}>
                    View All →
                  </AppText>
                </View>
                
                <View style={styles.debtSummary}>
                  <View style={styles.budgetRow}>
                    <AppText variant="body" color={theme.text.secondary}>
                      Total Debt
                    </AppText>
                    <AppText variant="bodyEmphasis" color={theme.status.error}>
                      {formatCurrency(
                        debts.reduce((sum, d) => sum + d.current_balance, 0),
                        householdCurrency
                      )}
                    </AppText>
                  </View>
                  
                  {debts[0] && (
                    <>
                      <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
                      <View style={styles.focusDebt}>
                        <View style={[styles.focusBadge, { backgroundColor: theme.interactive.primary }]}>
                          <AppText variant="overline" color={theme.text.inverse}>
                            FOCUS DEBT
                          </AppText>
                        </View>
                        <AppText variant="bodyEmphasis" style={{ marginBottom: SPACING[1] }}>
                          {debts[0].name}
                        </AppText>
                        <AppText variant="h2" color={theme.status.error}>
                          {formatCurrency(debts[0].current_balance, householdCurrency)}
                        </AppText>
                      </View>
                    </>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
            Quick Actions
          </AppText>
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={() => router.push('/transactions/add')}
              style={[styles.quickActionButton, { backgroundColor: theme.interactive.primary }]}
            >
              <AppText variant="button" color={theme.text.inverse}>
                ➕ Add Transaction
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/budget')}
              style={[styles.quickActionButton, { backgroundColor: theme.background.secondary, borderColor: theme.border.default, marginRight: 0 }]}
            >
              <AppText variant="button" color={theme.text.primary}>
                📊 View Budget
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: SPACING[8] }} />
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
    padding: SPACING[8],
  },
  header: {
    paddingTop: SPACING[12] + 20, // Account for safe area
    paddingHorizontal: SPACING[5], // ScreenWrapper padding
    paddingBottom: SPACING[5],
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[1],
  },
  section: {
    padding: SPACING[5], // ScreenWrapper padding
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  babyStepsCard: {
    // Card handles its own padding
  },
  babyStepsContainer: {
    marginTop: SPACING[2],
  },
  budgetCard: {
    // Card handles its own padding
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  budgetSummary: {
    marginTop: SPACING[2],
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  divider: {
    height: 1,
    marginVertical: SPACING[3],
  },
  statusBadge: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionLeft: {
    flex: 1,
  },
  emptyCard: {
    padding: SPACING[6],
    alignItems: 'center',
  },
  debtCard: {
    // Card handles its own padding
  },
  debtSummary: {
    marginTop: SPACING[2],
  },
  focusDebt: {
    marginTop: SPACING[3],
    padding: SPACING[3],
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  focusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING[2],
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    marginRight: SPACING[1],
  },
});
