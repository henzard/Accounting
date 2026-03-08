// Screen: Start Reconciliation
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/presentation/components/screen-wrapper';
import { ScreenHeader } from '@/presentation/components/ScreenHeader';
import { Card } from '@/presentation/components/Card';
import { AppText } from '@/presentation/components/styled/app-text';
import { Button } from '@/presentation/components/Button';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth/AuthContext';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { formatDate } from '@/shared/utils/date';
import { showAlert } from '@/shared/utils/alert';
import { FirestoreAccountRepository, FirestoreReconciliationRepository, FirestoreTransactionRepository } from '@/data/repositories';
import { CreateReconciliationUseCase } from '@/domain/use-cases';

export default function StartReconciliationScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const accountId = params.accountId as string;

  const [statementDate] = useState(new Date());
  const [statementBalanceText, setStatementBalanceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accountName, setAccountName] = useState('');

  const accountRepository = new FirestoreAccountRepository();
  const reconciliationRepository = new FirestoreReconciliationRepository();
  const transactionRepository = new FirestoreTransactionRepository();

  // Load account name
  useEffect(() => {
    if (!accountId) return;

    accountRepository.getAccountById(accountId).then((account) => {
      if (account) {
        setAccountName(account.name);
      }
    });
  }, [accountId]);

  const handleStartReconciliation = useCallback(async () => {
    console.log('🔍 Validation check:', {
      hasHouseholdId: !!user?.default_household_id,
      householdId: user?.default_household_id,
      hasUserId: !!user?.id,
      userId: user?.id,
      hasAccountId: !!accountId,
      accountId: accountId,
    });

    if (!user?.default_household_id || !user?.id || !accountId) {
      showAlert('Error', `Missing required information:\n${!user?.default_household_id ? '- Household ID\n' : ''}${!user?.id ? '- User ID\n' : ''}${!accountId ? '- Account ID' : ''}`);
      return;
    }

    if (!statementBalanceText.trim()) {
      showAlert('Validation Error', 'Please enter your statement balance');
      return;
    }

    const statementBalanceInCents = Math.round(parseFloat(statementBalanceText.replace(/,/g, '')) * 100);

    if (isNaN(statementBalanceInCents)) {
      showAlert('Validation Error', 'Please enter a valid number');
      return;
    }

    try {
      setIsLoading(true);

      const createReconciliationUseCase = new CreateReconciliationUseCase(
        reconciliationRepository,
        transactionRepository,
        accountRepository
      );

      const reconciliation = await createReconciliationUseCase.execute({
        household_id: user.default_household_id,
        account_id: accountId,
        statement_date: statementDate,
        statement_balance: statementBalanceInCents,
        created_by: user.id,
      });

      // Navigate to reconcile screen with reconciliation ID
      router.replace(`/reconcile/${reconciliation.id}`);
    } catch (error: any) {
      console.error('Error starting reconciliation:', error);
      showAlert('Error', error.message || 'Failed to start reconciliation');
      setIsLoading(false);
    }
  }, [user?.default_household_id, user?.id, accountId, statementBalanceText, statementDate, reconciliationRepository, transactionRepository, accountRepository]);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Start Reconciliation" showBack />

      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Account Info */}
          <Card padding="md" style={styles.accountCard} testID="account-info-card">
            <AppText variant="caption" style={[styles.label, { color: theme.text.tertiary }]}>
              Account
            </AppText>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }} testID="account-name">
              {accountName}
            </AppText>
          </Card>

          {/* Statement Date - Using Today for now */}
          <Card padding="md" style={styles.dateCard} testID="statement-date-card">
            <AppText variant="bodyEmphasis" style={[styles.cardTitle, { color: theme.text.secondary }]}>
              Statement Date
            </AppText>
            <AppText variant="body" style={{ color: theme.text.primary }} testID="statement-date">
              {formatDate(statementDate)}
            </AppText>
            <AppText variant="caption" style={[styles.helperText, { color: theme.text.tertiary }]}>
              Using today's date
            </AppText>
          </Card>

          {/* Statement Balance */}
          <Card padding="md" style={styles.balanceCard} testID="statement-balance-card">
            <AppText variant="bodyEmphasis" style={[styles.cardTitle, { color: theme.text.secondary }]}>
              Statement Balance
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.secondary,
                  color: theme.text.primary,
                  borderColor: theme.border.default,
                },
              ]}
              value={statementBalanceText}
              onChangeText={setStatementBalanceText}
              placeholder="0.00"
              placeholderTextColor={theme.text.tertiary}
              keyboardType="decimal-pad"
              testID="statement-balance-input"
            />
            <AppText variant="caption" style={[styles.helperText, { color: theme.text.tertiary }]}>
              Enter the balance shown on your bank statement
            </AppText>
          </Card>

          {/* Info Card */}
          <Card
            padding="md"
            style={[styles.infoCard, { backgroundColor: theme.status.infoBackground }]}
            testID="info-card"
          >
            <AppText variant="caption" style={{ color: theme.status.info }}>
              💡 After you start, you'll mark transactions as cleared to match your statement.
              The goal is to make your cleared balance match your statement balance.
            </AppText>
          </Card>

          {/* Start Button */}
          <Button
            title="Start Reconciliation"
            onPress={handleStartReconciliation}
            loading={isLoading}
            disabled={isLoading}
            testID="start-reconciliation-button"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: SPACING[4],
  },
  accountCard: {
    marginBottom: SPACING[6],
  },
  dateCard: {
    marginBottom: SPACING[4],
  },
  balanceCard: {
    marginBottom: SPACING[6],
  },
  infoCard: {
    marginBottom: SPACING[6],
  },
  label: {
    marginBottom: SPACING[1],
  },
  cardTitle: {
    marginBottom: SPACING[2],
  },
  helperText: {
    marginTop: SPACING[2],
  },
  input: {
    fontSize: 16,
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
});
