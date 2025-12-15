// Accounts List Screen - Homebase Budget
// Shows all accounts for the current household

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card } from '@/presentation/components';
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

  useEffect(() => {
    loadAccounts();
    loadHouseholdCurrency();
  }, [user?.default_household_id]);

  async function loadHouseholdCurrency() {
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
  }

  async function loadAccounts() {
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
  }

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
    const balanceAmount = item.balance / 100;
    const isNegative = balanceAmount < 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/accounts/edit?id=${item.id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountIcon}>{getAccountIcon(item.type)}</Text>
              <View style={styles.accountText}>
                <Text style={[styles.accountName, { color: theme.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.accountType, { color: theme.text.secondary }]}>
                  {getAccountTypeLabel(item.type)}
                </Text>
              </View>
            </View>
            <View style={styles.balanceContainer}>
              <Text
                style={[
                  styles.balance,
                  {
                    color: isNegative ? theme.status.error : theme.text.primary,
                  },
                ]}
              >
                {formatCurrency(Math.abs(balanceAmount), householdCurrency)}
              </Text>
              {item.type === 'CREDIT_CARD' && (
                <Text style={[styles.creditLabel, { color: theme.text.tertiary }]}>
                  {isNegative ? 'Balance' : 'Credit Available'}
                </Text>
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
              <Text style={[styles.budgetBadgeText, { color: theme.status.warning }]}>
                Not in budget
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading accounts...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Accounts</Text>
        <TouchableOpacity
          onPress={() => router.push('/accounts/add')}
          style={[
            styles.addButton,
            { backgroundColor: theme.interactive.primary },
          ]}
        >
          <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>
            + Add Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total Balance Summary */}
      {accounts.length > 0 && (
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>
            Total Balance
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.text.primary }]}>
            {formatCurrency(
              accounts.reduce((sum, acc) => sum + acc.balance / 100, 0),
              householdCurrency
            )}
          </Text>
          <Text style={[styles.summarySubtext, { color: theme.text.tertiary }]}>
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </Text>
        </Card>
      )}

      {/* Account List */}
      {accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💼</Text>
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            No Accounts Yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
            Add your first account to start tracking your money
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/accounts/add')}
            style={[
              styles.emptyButton,
              { backgroundColor: theme.interactive.primary },
            ]}
          >
            <Text style={[styles.emptyButtonText, { color: theme.text.inverse }]}>
              Add Your First Account
            </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 20,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  accountCard: {
    marginBottom: 12,
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
    marginRight: 12,
  },
  accountText: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  creditLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  budgetBadge: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  budgetBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

