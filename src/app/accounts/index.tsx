// Accounts List Screen - Homebase Budget
// Shows all accounts for the current household

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card, ScreenHeader, ScreenWrapper, AppText } from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { Account, AccountType } from '@/domain/entities/Account';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

export default function AccountsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const accountRepository = new FirestoreAccountRepository();

  const loadHouseholdCurrency = useCallback(async () => {
    if (!user?.default_household_id) return;

    try {
      const householdDoc = await getDoc(
        doc(db, 'households', user.default_household_id)
      );
      
      if (householdDoc.exists()) {
        const currency = householdDoc.data()?.currency as CurrencyCode;
        if (currency) {
          setHouseholdCurrency(currency);
        }
      }
    } catch (error) {
      console.error('❌ Error loading household currency:', error);
    }
  }, [user?.default_household_id]);

  const loadAccounts = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const loadedAccounts = await accountRepository.getAccountsByHousehold(
        user.default_household_id
      );
      setAccounts(loadedAccounts);
    } catch (error) {
      console.error('❌ Error loading accounts:', error);
      Alert.alert('Error', 'Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [accountRepository, user?.default_household_id]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadHouseholdCurrency();
    }, [loadAccounts, loadHouseholdCurrency])
  );

  function getAccountIcon(type: AccountType): string {
    switch (type) {
      case 'BANK':
        return '🏦';
      case 'SAVINGS':
        return '💰';
      case 'CREDIT_CARD':
        return '💳';
      case 'CASH':
        return '💵';
      case 'LOAN':
        return '🏠';
      case 'INVESTMENT':
        return '📈';
      default:
        return '💼';
    }
  }

  function getAccountTypeLabel(type: AccountType): string {
    switch (type) {
      case 'BANK':
        return 'Checking';
      case 'SAVINGS':
        return 'Savings';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'CASH':
        return 'Cash';
      case 'LOAN':
        return 'Loan';
      case 'INVESTMENT':
        return 'Investment';
      default:
        return type;
    }
  }

  function renderAccount({ item }: { item: Account }) {
    const balanceAmountInCents = item.balance;
    const isNegative = balanceAmountInCents < 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/accounts/edit?id=${item.id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.accountInfo}>
              <AppText variant="h2" style={styles.accountIcon}>{getAccountIcon(item.type)}</AppText>
              <View style={styles.accountText}>
                <AppText variant="h2" style={{ marginBottom: SPACING[1] }}>
                  {item.name}
                </AppText>
                <AppText variant="caption" color={theme.text.secondary}>
                  {getAccountTypeLabel(item.type)}
                </AppText>
              </View>
            </View>
            <View style={styles.balanceContainer}>
              <AppText
                variant="h2"
                color={isNegative ? theme.status.error : theme.text.primary}
              >
                {formatCurrency(Math.abs(balanceAmountInCents), householdCurrency)}
              </AppText>
              {item.type === 'CREDIT_CARD' && (
                <AppText variant="caption" color={theme.text.tertiary} style={{ marginTop: SPACING[1] }}>
                  {isNegative ? 'Balance' : 'Credit Available'}
                </AppText>
              )}
            </View>
          </View>

          {!item.is_in_budget && (
            <View
              style={[
                styles.budgetBadge,
                { backgroundColor: theme.status.warningBackground },
              ]}
            >
              <AppText variant="caption" color={theme.status.warning}>
                Not in budget
              </AppText>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[4] }}>
            Loading accounts...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <ScreenHeader
        title="Accounts"
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/accounts/add')}
            style={[styles.addButton, { backgroundColor: theme.interactive.primary }]}
          >
            <AppText variant="h1" color={theme.text.inverse}>+</AppText>
          </TouchableOpacity>
        }
      />

      {/* Total Balance Summary */}
      {accounts.length > 0 && (
        <Card style={styles.summaryCard}>
          <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[2] }}>
            Total Balance
          </AppText>
          <AppText variant="display" style={{ marginBottom: SPACING[1] }}>
            {formatCurrency(
              accounts.reduce((sum, acc) => sum + acc.balance, 0),
              householdCurrency
            )}
          </AppText>
          <AppText variant="caption" color={theme.text.tertiary}>
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </AppText>
        </Card>
      )}

      {/* Account List */}
      {accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText variant="display" style={{ marginBottom: SPACING[4] }}>💼</AppText>
          <AppText variant="h1" style={{ marginBottom: SPACING[2] }}>
            No Accounts Yet
          </AppText>
          <AppText variant="body" color={theme.text.secondary} style={{ textAlign: 'center', marginBottom: SPACING[6] }}>
            Add your first account to start tracking your money
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/accounts/add')}
            style={[
              styles.emptyButton,
              { backgroundColor: theme.interactive.primary },
            ]}
          >
            <AppText variant="button" color={theme.text.inverse}>
              Add Your First Account
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: SPACING[5],
    marginBottom: SPACING[5],
    alignItems: 'center',
    paddingVertical: SPACING[5],
  },
  list: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[5],
  },
  accountCard: {
    marginBottom: SPACING[3],
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    fontSize: 32,
    marginRight: SPACING[3],
  },
  accountText: {
    flex: 1,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  budgetBadge: {
    marginTop: SPACING[3],
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[10],
  },
  emptyButton: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.sm,
  },
});

