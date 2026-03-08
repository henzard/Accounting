// Screen: Active Reconciliation Session
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/presentation/components/screen-wrapper';
import { ScreenHeader } from '@/presentation/components/ScreenHeader';
import { Card } from '@/presentation/components/Card';
import { AppText } from '@/presentation/components/styled/app-text';
import { Button } from '@/presentation/components/Button';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth/AuthContext';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate } from '@/shared/utils/date';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { Reconciliation, Transaction, Account } from '@/domain/entities';
import { calculateClearedBalance } from '@/domain/entities/Transaction';
import {
  FirestoreReconciliationRepository,
  FirestoreTransactionRepository,
  FirestoreAccountRepository,
} from '@/data/repositories';
import { CompleteReconciliationUseCase } from '@/domain/use-cases';

export default function ReconciliationScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const reconciliationId = params.id as string;

  const [reconciliation, setReconciliation] = useState<Reconciliation | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [householdCurrency, setHouseholdCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const reconciliationRepository = new FirestoreReconciliationRepository();
  const transactionRepository = new FirestoreTransactionRepository();
  const accountRepository = new FirestoreAccountRepository();

  const loadHouseholdCurrency = useCallback(async () => {
    if (!user?.default_household_id) return;

    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/infrastructure/firebase');
      
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      
      if (householdDoc.exists()) {
        const currency = householdDoc.data()?.currency;
        if (currency) {
          setHouseholdCurrency(currency);
        }
      }
    } catch (error) {
      console.error('❌ Error loading household currency:', error);
    }
  }, [user?.default_household_id]);

  const loadReconciliationData = useCallback(async () => {
    if (!reconciliationId) return;

    try {
      setIsLoading(true);

      // Load reconciliation
      const reconData = await reconciliationRepository.getById(reconciliationId);
      if (!reconData) {
        showAlert('Error', 'Reconciliation not found');
        router.back();
        return;
      }

      setReconciliation(reconData);

      // Load account
      const accountData = await accountRepository.getAccountById(reconData.account_id);
      setAccount(accountData);

      // Load transactions
      const allTransactions = await transactionRepository.getTransactions({
        household_id: reconData.household_id,
        account_id: reconData.account_id,
      });
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading reconciliation data:', error);
      showAlert('Error', 'Failed to load reconciliation data');
    } finally {
      setIsLoading(false);
    }
  }, [reconciliationId]);

  useFocusEffect(
    useCallback(() => {
      loadHouseholdCurrency();
      loadReconciliationData();
    }, [loadHouseholdCurrency, loadReconciliationData])
  );

  const handleToggleCleared = async (transaction: Transaction) => {
    const isCleared = transaction.status !== 'pending';
    const updatedTransaction = isCleared
      ? { ...transaction, status: 'pending' as const, cleared_date: undefined }
      : { ...transaction, status: 'completed' as const, cleared_date: new Date() };

    // Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) => (t.id === transaction.id ? updatedTransaction : t))
    );

    try {
      if (isCleared) {
        await transactionRepository.markTransactionPending(transaction.id);
      } else {
        await transactionRepository.markTransactionCleared(transaction.id, new Date());
      }

      // Recalculate difference
      const updatedTransactions = await transactionRepository.getTransactions({
        household_id: reconciliation!.household_id,
        account_id: transaction.account_id,
      });
      setTransactions(updatedTransactions);
      
      const clearedBalance = calculateClearedBalance(updatedTransactions);
      if (reconciliation) {
        const updatedReconciliation = {
          ...reconciliation,
          difference: clearedBalance - reconciliation.statement_balance,
        };
        setReconciliation(updatedReconciliation);
        await reconciliationRepository.update(updatedReconciliation);
      }
    } catch (error) {
      console.error('Error toggling transaction:', error);
      // Revert optimistic update
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? transaction : t))
      );
      showAlert('Error', 'Failed to update transaction');
    }
  };

  const handleComplete = async () => {
    if (!reconciliation || !user?.uid) return;

    if (reconciliation.difference !== 0) {
      showAlert(
        'Unbalanced',
        `There is a difference of ${formatCurrency(Math.abs(reconciliation.difference), householdCurrency)}. ` +
        'Please resolve this before completing the reconciliation.'
      );
      return;
    }

    const confirmed = await showConfirm(
      'Complete Reconciliation?',
      'This will mark all cleared transactions as reconciled. This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      const completeUseCase = new CompleteReconciliationUseCase(
        reconciliationRepository,
        transactionRepository
      );

      await completeUseCase.execute({
        reconciliation_id: reconciliation.id,
        user_id: user.uid,
      });

      // Navigate back immediately
      router.replace('/reconcile');
      
      // Show success alert (non-blocking)
      showAlert('Success', 'Reconciliation completed successfully!');
    } catch (error: any) {
      console.error('Error completing reconciliation:', error);
      showAlert('Error', error.message || 'Failed to complete reconciliation');
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!reconciliation) return;

    const confirmed = await showConfirm(
      'Cancel Reconciliation?',
      'This will delete the reconciliation and unmark all cleared transactions. This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);

      // Unmark all cleared transactions
      const clearedTransactions = transactions.filter(t => t.status === 'cleared');
      for (const transaction of clearedTransactions) {
        await transactionRepository.markTransactionPending(transaction.id);
      }

      // Delete the reconciliation
      await reconciliationRepository.delete(reconciliation.id);

      // Navigate back immediately
      router.replace('/reconcile');
      
      // Show success alert (non-blocking)
      showAlert('Cancelled', 'Reconciliation has been cancelled successfully.');
    } catch (error: any) {
      console.error('Error cancelling reconciliation:', error);
      showAlert('Error', error.message || 'Failed to cancel reconciliation');
      setIsSaving(false);
    }
  };

  if (isLoading || !reconciliation) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Reconcile" showBack />
        <View style={{ padding: SPACING[4], paddingTop: SPACING[8] }}>
          <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }}>
            Loading...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  const clearedBalance = calculateClearedBalance(transactions);
  const isBalanced = reconciliation.difference === 0;

  return (
    <ScreenWrapper>
      <ScreenHeader title="Reconcile" showBack />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: SPACING[4] }}>
          {/* Account & Date */}
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <AppText variant="body" style={{ color: theme.text.primary, marginBottom: SPACING[1] }}>
              {account?.name || 'Account'}
            </AppText>
            <AppText variant="caption" style={{ color: theme.text.tertiary }}>
              Statement Date: {formatDate(reconciliation.statement_date)}
            </AppText>
          </Card>

          {/* Balance Comparison */}
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING[3] }}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ color: theme.text.tertiary, marginBottom: SPACING[1] }}>
                  Statement Balance
                </AppText>
                <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                  {formatCurrency(reconciliation.statement_balance, householdCurrency)}
                </AppText>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <AppText variant="caption" style={{ color: theme.text.tertiary, marginBottom: SPACING[1] }}>
                  Cleared Balance
                </AppText>
                <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                  {formatCurrency(clearedBalance, householdCurrency)}
                </AppText>
              </View>
            </View>

            {/* Difference */}
            <View
              style={[
                styles.differenceBox,
                {
                  backgroundColor: isBalanced
                    ? theme.status.successBackground
                    : theme.status.warningBackground,
                },
              ]}
            >
              <AppText variant="caption" style={{ color: theme.text.tertiary, marginBottom: SPACING[1] }}>
                Difference
              </AppText>
              <AppText
                variant="display"
                style={{
                  color: isBalanced ? theme.status.success : theme.status.warning,
                }}
              >
                {formatCurrency(Math.abs(reconciliation.difference), householdCurrency)}
              </AppText>
              {isBalanced && (
                <AppText variant="caption" style={{ color: theme.status.success, marginTop: SPACING[1] }}>
                  ✓ Balanced! Ready to complete
                </AppText>
              )}
            </View>
          </Card>

          {/* Transactions */}
          <AppText variant="bodyEmphasis" style={{ color: theme.text.primary, marginBottom: SPACING[3] }}>
            Transactions
          </AppText>
          <AppText variant="caption" style={{ color: theme.text.tertiary, marginBottom: SPACING[4] }}>
            Check each transaction that appears on your statement
          </AppText>

          {transactions.length === 0 ? (
            <Card padding="md">
              <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }}>
                No transactions found for this account
              </AppText>
            </Card>
          ) : (
            <View style={{ marginBottom: SPACING[6] }}>
              {transactions.map((transaction) => {
                const isCleared = transaction.status !== 'pending';
                return (
                  <Card key={transaction.id} padding="md" style={{ marginBottom: SPACING[2] }}>
                    <TouchableOpacity
                      onPress={() => handleToggleCleared(transaction)}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      {/* Checkbox */}
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isCleared ? theme.status.success : 'transparent',
                            borderColor: isCleared ? theme.status.success : theme.border.default,
                          },
                        ]}
                      >
                        {isCleared && (
                          <AppText variant="caption" color={theme.text.inverse}>
                            ✓
                          </AppText>
                        )}
                      </View>

                      {/* Transaction Details */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1, marginRight: SPACING[2] }}>
                            <AppText variant="body" style={{ color: theme.text.primary, marginBottom: SPACING[1] }}>
                              {transaction.payee}
                            </AppText>
                            <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                              {formatDate(transaction.date)} • {transaction.category_name}
                            </AppText>
                          </View>
                          <AppText
                            variant="bodyEmphasis"
                            style={{
                              color: transaction.type === 'income' ? theme.status.success : theme.text.primary,
                            }}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, householdCurrency)}
                          </AppText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Action Buttons */}
          <Button
            title="Complete Reconciliation"
            onPress={handleComplete}
            disabled={!isBalanced || isSaving}
            loading={isSaving}
            testID="complete-reconciliation-button"
            style={{ marginBottom: SPACING[3] }}
          />
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            disabled={isSaving}
            testID="cancel-reconciliation-button"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  differenceBox: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
});
