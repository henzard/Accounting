// Screen: Reconciliation List
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '@/presentation/components/screen-wrapper';
import { ScreenHeader } from '@/presentation/components/ScreenHeader';
import { Card } from '@/presentation/components/Card';
import { AppText } from '@/presentation/components/styled/app-text';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth/AuthContext';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { showAlert } from '@/shared/utils/alert';
import { Account, Reconciliation } from '@/domain/entities';
import { FirestoreAccountRepository, FirestoreReconciliationRepository } from '@/data/repositories';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

export default function ReconciliationListScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [inProgressReconciliations, setInProgressReconciliations] = useState<Reconciliation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const accountRepository = new FirestoreAccountRepository();
  const reconciliationRepository = new FirestoreReconciliationRepository();

  const loadHouseholdCurrency = useCallback(async () => {
    if (!user?.default_household_id) return;

    try {
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      
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
    if (!user?.default_household_id) return;

    try {
      setIsLoading(true);
      const allAccounts = await accountRepository.getAccountsByHousehold(user.default_household_id);
      setAccounts(allAccounts);

      // Also load in-progress reconciliations
      const inProgress = await reconciliationRepository.getInProgress(user.default_household_id);
      setInProgressReconciliations(inProgress);
    } catch (error) {
      console.error('Error loading accounts:', error);
      showAlert('Error', 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, [user?.default_household_id]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadHouseholdCurrency();
    }, [loadAccounts, loadHouseholdCurrency])
  );

  const renderAccountItem = ({ item }: { item: Account }) => (
    <Link href={`/reconcile/start?accountId=${item.id}`} asChild>
      <TouchableOpacity testID={`reconcile-account-${item.id}`}>
        <Card padding="md" style={styles.accountCard}>
          <View style={styles.accountRow}>
            <View style={styles.accountInfo}>
              <AppText 
                variant="bodyEmphasis" 
                style={[styles.accountName, { color: theme.text.primary }]}
                testID={`account-name-${item.id}`}
              >
                {item.name}
              </AppText>
              <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                {item.type === 'checking' ? '💳 Checking' : 
                 item.type === 'savings' ? '🏦 Savings' : 
                 item.type === 'cash' ? '💵 Cash' : '🏢 Business'}
              </AppText>
            </View>
            <View style={styles.accountBalanceContainer}>
              <AppText 
                variant="bodyEmphasis" 
                style={{ color: theme.text.primary }}
                testID={`account-balance-${item.id}`}
              >
                {formatCurrency(item.balance, householdCurrency)}
              </AppText>
              <AppText variant="caption" style={[styles.tapHint, { color: theme.text.tertiary }]}>
                Tap to reconcile →
              </AppText>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Link>
  );

  if (isLoading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Reconcile Accounts" showBack />
        <View style={styles.loadingContainer}>
          <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }} testID="loading-text">
            Loading accounts...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader title="Reconcile Accounts" showBack />

      <View style={styles.container}>
        {/* In-Progress Reconciliations */}
        {inProgressReconciliations.length > 0 && (
          <View style={styles.inProgressSection}>
            <AppText 
              variant="bodyEmphasis" 
              style={[styles.sectionTitle, { color: theme.text.primary }]}
            >
              In Progress
            </AppText>
            {inProgressReconciliations.map((recon) => {
              const account = accounts.find(a => a.id === recon.account_id);
              return (
                <Link key={recon.id} href={`/reconcile/${recon.id}`} asChild>
                  <TouchableOpacity testID={`in-progress-recon-${recon.id}`}>
                    <Card padding="md" style={[styles.reconCard, { backgroundColor: theme.status.warningBackground }]}>
                      <View style={styles.accountRow}>
                        <View style={styles.accountInfo}>
                          <AppText 
                            variant="bodyEmphasis" 
                            style={{ color: theme.status.warning }}
                            testID={`recon-account-name-${recon.id}`}
                          >
                            {account?.name || 'Unknown Account'}
                          </AppText>
                          <AppText 
                            variant="caption" 
                            style={{ color: theme.status.warning }}
                          >
                            Statement: {formatCurrency(recon.statement_balance, householdCurrency)}
                          </AppText>
                          <AppText 
                            variant="caption" 
                            style={[styles.tapHint, { color: theme.status.warning }]}
                          >
                            Tap to continue →
                          </AppText>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        )}

        {/* Info Card */}
        <Card
          padding="md"
          style={[styles.infoCard, { backgroundColor: theme.status.infoBackground }]}
        >
          <AppText variant="caption" style={{ color: theme.status.info }}>
            💡 Reconciliation ensures your account balances match your bank statements. 
            Select an account to start reconciling.
          </AppText>
        </Card>

        {/* Account List */}
        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }} testID="empty-state-text">
              No accounts found. Create an account first.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccountItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            testID="accounts-list"
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING[4],
  },
  loadingContainer: {
    padding: SPACING[4],
    paddingTop: SPACING[8],
  },
  inProgressSection: {
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    marginBottom: SPACING[3],
  },
  reconCard: {
    marginBottom: SPACING[2],
  },
  infoCard: {
    marginBottom: SPACING[6],
  },
  accountCard: {
    marginBottom: SPACING[2],
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    marginBottom: SPACING[1],
  },
  accountBalanceContainer: {
    alignItems: 'flex-end',
  },
  tapHint: {
    marginTop: SPACING[1],
  },
  emptyContainer: {
    paddingVertical: SPACING[8],
  },
  listContent: {
    paddingBottom: SPACING[4],
  },
});
