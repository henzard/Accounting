// Debt List Screen - Homebase Budget
// Debt Snowball: Pay off smallest debts first (Dave Ramsey Baby Step 2)

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { ScreenHeader, Card, ScreenWrapper, AppText, PrimaryButton } from '@/presentation/components';
import { Debt, DebtType, calculateDebtSnowball, calculatePayoffMonths } from '@/domain/entities';
import { FirestoreDebtRepository } from '@/data/repositories/FirestoreDebtRepository';
import { CurrencyCode, formatCurrency } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  CREDIT_CARD: 'Credit Card',
  PERSONAL_LOAN: 'Personal Loan',
  STUDENT_LOAN: 'Student Loan',
  CAR_LOAN: 'Car Loan',
  MEDICAL: 'Medical',
  MORTGAGE: 'Mortgage',
  OTHER: 'Other',
};

export default function DebtListScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const debtRepository = new FirestoreDebtRepository();

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

  const loadDebts = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      const allDebts = await debtRepository.getDebtsByHousehold(user.default_household_id);
      
      // Calculate snowball order
      const snowballDebts = calculateDebtSnowball(allDebts);
      
      // Combine with mortgages and paid debts (sorted separately)
      const mortgages = allDebts.filter(d => d.is_mortgage && d.status === 'active');
      const paidDebts = allDebts.filter(d => d.status === 'paid_off');
      
      // Sort: active snowball debts, then mortgages, then paid off
      const sortedDebts = [
        ...snowballDebts.sort((a, b) => a.snowball_order - b.snowball_order),
        ...mortgages,
        ...paidDebts.sort((a, b) => (b.paid_off_at?.getTime() || 0) - (a.paid_off_at?.getTime() || 0)),
      ];
      
      setDebts(sortedDebts);
    } catch (error) {
      console.error('Error loading debts:', error);
      showAlert('Error', 'Failed to load debts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.default_household_id, debtRepository]);

  useFocusEffect(
    useCallback(() => {
      loadDebts();
      loadHouseholdCurrency();
    }, [loadDebts, loadHouseholdCurrency])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDebts();
  };

  const handleMarkPaidOff = async (debt: Debt) => {
    if (!user?.default_household_id) {
      showAlert('Error', 'No household selected');
      return;
    }

    const confirmed = await showConfirm(
      'Mark as Paid Off?',
      `Are you sure you've paid off "${debt.name}"? This will celebrate your progress and move to the next debt!`
    );

    if (!confirmed) return;

    try {
      await debtRepository.updateDebt(debt.id, {
        status: 'paid_off',
        paid_off_at: new Date(),
        current_balance: 0,
        is_focus_debt: false,
        updated_at: new Date(),
      });
      // Recalculate snowball order for remaining debts
      await debtRepository.recalculateSnowballOrder(user.default_household_id);
      await loadDebts();
      
      showAlert(
        '🎉 Debt Paid Off!',
        `Congratulations! "${debt.name}" is now paid off. Keep going with the next debt in your snowball!`
      );
    } catch (error) {
      console.error('Error marking debt as paid off:', error);
      showAlert('Error', 'Failed to mark debt as paid off');
    }
  };

  const activeDebts = debts.filter(d => d.status === 'active' && !d.is_mortgage);
  const mortgages = debts.filter(d => d.is_mortgage && d.status === 'active');
  const paidDebts = debts.filter(d => d.status === 'paid_off');
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const totalMortgage = mortgages.reduce((sum, d) => sum + d.current_balance, 0);

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Debt Snowball" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={{ color: theme.text.secondary, marginTop: SPACING[4] }}>
            Loading debts...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Debt Snowball"
        showBack={true}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/debts/add')}>
            <AppText variant="display" style={{ color: theme.interactive.primary }}>
              +
            </AppText>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.interactive.primary} />
        }
      >
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
              Total Debt (Baby Step 2)
            </AppText>
            <AppText variant="h2" style={{ color: theme.status.error }}>
              {formatCurrency(totalDebt, householdCurrency)}
            </AppText>
          </View>
          {mortgages.length > 0 && (
            <View style={[styles.summaryRow, { marginTop: SPACING[2] }]}>
              <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
                Mortgage (Baby Step 6)
              </AppText>
              <AppText variant="h2" style={{ color: theme.text.primary }}>
                {formatCurrency(totalMortgage, householdCurrency)}
              </AppText>
            </View>
          )}
          <View style={[styles.summaryRow, { marginTop: SPACING[2] }]}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
              Active Debts
            </AppText>
            <AppText variant="h2" style={{ color: theme.text.primary }}>
              {activeDebts.length}
            </AppText>
          </View>
        </Card>

        {/* Active Debts (Snowball Order) */}
        {activeDebts.length > 0 && (
          <View style={styles.section}>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[3] }}>
              🎯 Debt Snowball (Pay Smallest First)
            </AppText>
            {activeDebts.map((debt, index) => {
              const payoffMonths = calculatePayoffMonths(
                debt.current_balance,
                debt.minimum_payment,
                debt.interest_rate
              );
              const progress = debt.original_balance > 0
                ? ((debt.original_balance - debt.current_balance) / debt.original_balance) * 100
                : 0;

              return (
                <Card key={debt.id} style={[
                  styles.debtCard,
                  debt.is_focus_debt && { borderColor: theme.interactive.primary, borderWidth: 2 }
                ]}>
                  <View style={styles.debtHeader}>
                    <View style={styles.debtInfo}>
                      <View style={styles.debtTitleRow}>
                        <AppText variant="h2" style={{ color: theme.text.primary, marginRight: SPACING[2] }}>
                          {debt.name}
                        </AppText>
                        {debt.is_focus_debt && (
                          <View style={[styles.focusBadge, { backgroundColor: theme.interactive.primary }]}>
                            <AppText variant="overline" style={{ color: theme.text.inverse }}>
                              FOCUS
                            </AppText>
                          </View>
                        )}
                      </View>
                      <AppText variant="caption" style={{ color: theme.text.secondary }}>
                        {DEBT_TYPE_LABELS[debt.type]} • #{debt.snowball_order} in snowball
                      </AppText>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleMarkPaidOff(debt)}
                      style={[styles.paidOffButton, { backgroundColor: theme.status.successBackground }]}
                    >
                      <AppText variant="overline" style={{ color: theme.status.success }}>
                        ✓ Paid
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.debtDetails}>
                    <View style={styles.debtDetailRow}>
                      <AppText variant="body" style={{ color: theme.text.secondary }}>
                        Current Balance
                      </AppText>
                      <AppText variant="bodyEmphasis" style={{ color: theme.status.error }}>
                        {formatCurrency(debt.current_balance, householdCurrency)}
                      </AppText>
                    </View>
                    <View style={styles.debtDetailRow}>
                      <AppText variant="body" style={{ color: theme.text.secondary }}>
                        Minimum Payment
                      </AppText>
                      <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                        {formatCurrency(debt.minimum_payment, householdCurrency)}/mo
                      </AppText>
                    </View>
                    {debt.interest_rate > 0 && (
                      <View style={styles.debtDetailRow}>
                        <AppText variant="body" style={{ color: theme.text.secondary }}>
                          Interest Rate
                        </AppText>
                        <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                          {debt.interest_rate.toFixed(2)}%
                        </AppText>
                      </View>
                    )}
                    <View style={styles.debtDetailRow}>
                      <AppText variant="body" style={{ color: theme.text.secondary }}>
                        Payoff Projection
                      </AppText>
                      <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                        {payoffMonths < 999 ? `${payoffMonths} months` : 'N/A'}
                      </AppText>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  {debt.original_balance > 0 && (
                    <View style={styles.progressSection}>
                      <View style={[styles.progressBarContainer, { backgroundColor: theme.background.secondary }]}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: theme.status.success,
                            },
                          ]}
                        />
                      </View>
                      <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                        {progress.toFixed(0)}% paid off
                      </AppText>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Mortgages (Baby Step 6) */}
        {mortgages.length > 0 && (
          <View style={styles.section}>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[3] }}>
              🏠 Mortgage (Baby Step 6)
            </AppText>
            {mortgages.map((debt) => {
              const payoffMonths = calculatePayoffMonths(
                debt.current_balance,
                debt.minimum_payment,
                debt.interest_rate
              );

              return (
                <Card key={debt.id} style={styles.debtCard}>
                  <View style={styles.debtHeader}>
                    <View style={styles.debtInfo}>
                      <AppText variant="h2" style={{ color: theme.text.primary }}>
                        {debt.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.text.secondary }}>
                        Mortgage
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.debtDetails}>
                    <View style={styles.debtDetailRow}>
                      <AppText variant="body" style={{ color: theme.text.secondary }}>
                        Current Balance
                      </AppText>
                      <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                        {formatCurrency(debt.current_balance, householdCurrency)}
                      </AppText>
                    </View>
                    <View style={styles.debtDetailRow}>
                      <AppText variant="body" style={{ color: theme.text.secondary }}>
                        Monthly Payment
                      </AppText>
                      <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                        {formatCurrency(debt.minimum_payment, householdCurrency)}/mo
                      </AppText>
                    </View>
                    {payoffMonths < 999 && (
                      <View style={styles.debtDetailRow}>
                        <AppText variant="body" style={{ color: theme.text.secondary }}>
                          Payoff Projection
                        </AppText>
                        <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                          {payoffMonths} months ({Math.round(payoffMonths / 12)} years)
                        </AppText>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Paid Off Debts */}
        {paidDebts.length > 0 && (
          <View style={styles.section}>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[3] }}>
              ✅ Paid Off ({paidDebts.length})
            </AppText>
            {paidDebts.map((debt) => (
              <Card key={debt.id} style={[styles.debtCard, { opacity: 0.7 }]}>
                <View style={styles.debtHeader}>
                  <View style={styles.debtInfo}>
                    <AppText variant="h2" style={{ color: theme.text.secondary }}>
                      {debt.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                      Paid off {debt.paid_off_at?.toLocaleDateString()}
                    </AppText>
                  </View>
                  <View style={[styles.paidBadge, { backgroundColor: theme.status.successBackground }]}>
                    <AppText variant="overline" style={{ color: theme.status.success }}>
                      ✓ PAID
                    </AppText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty State */}
        {debts.length === 0 && (
          <Card style={styles.emptyCard}>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[2], textAlign: 'center' }}>
              No Debts Yet
            </AppText>
            <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center', marginBottom: SPACING[6] }}>
              Add your first debt to start the Debt Snowball method. Pay off your smallest debt first, then roll that payment to the next!
            </AppText>
            <PrimaryButton
              title="Add Your First Debt"
              onPress={() => router.push('/debts/add')}
              fullWidth
              size="lg"
            />
          </Card>
        )}
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
  summaryCard: {
    margin: SPACING[4],
    marginBottom: SPACING[2],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginTop: SPACING[2],
    paddingHorizontal: SPACING[4],
  },
  debtCard: {
    marginBottom: SPACING[3],
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  debtInfo: {
    flex: 1,
  },
  debtTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  focusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  paidOffButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  debtDetails: {
    marginTop: SPACING[2],
  },
  debtDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  progressSection: {
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING[1],
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  paidBadge: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyCard: {
    margin: SPACING[4],
    padding: SPACING[8],
    alignItems: 'center',
  },
});
