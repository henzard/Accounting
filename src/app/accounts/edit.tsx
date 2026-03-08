// Edit Account Screen - Homebase Budget
// Edit an existing account

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, Button, Card, ScreenWrapper, AppText, ConfirmationModal } from '@/presentation/components';
import { Account, AccountType } from '@/domain/entities/Account';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { FirestoreHouseholdRepository } from '@/data/repositories/FirestoreHouseholdRepository';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { showAlert } from '@/shared/utils/alert';
import { logger } from '@/shared/utils/logger';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'BANK', label: 'Checking', icon: '🏦' },
  { value: 'SAVINGS', label: 'Savings', icon: '💰' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'LOAN', label: 'Loan', icon: '🏠' },
  { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
];

export default function EditAccountScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType>('BANK');
  const [isInBudget, setIsInBudget] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const accountRepository = useMemo(() => new FirestoreAccountRepository(), []);
  const householdRepository = useMemo(() => new FirestoreHouseholdRepository(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      if (!id) {
        showAlert('Error', 'No account ID provided');
        router.back();
        return;
      }

      try {
        setLoading(true);
        const loadedAccount = await accountRepository.getAccountById(id);

        if (!isMounted) return;

        if (!loadedAccount) {
          showAlert('Error', 'Account not found');
          router.back();
          return;
        }

        setAccount(loadedAccount);
        setName(loadedAccount.name);
        setSelectedType(loadedAccount.type);
        setIsInBudget(loadedAccount.is_in_budget);
        setIsActive(loadedAccount.is_active);
      } catch (error) {
        logger.error('Error loading account', error);
        if (isMounted) {
          showAlert('Error', 'Failed to load account');
          router.back();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function loadHouseholdCurrency() {
      if (!user?.default_household_id) return;

      try {
        const household = await householdRepository.getHouseholdById(user.default_household_id);
        if (isMounted && household?.currency) {
          setHouseholdCurrency(household.currency as CurrencyCode);
        }
      } catch (error) {
        logger.error('Error loading household currency', error);
      }
    }

    loadAccount();
    loadHouseholdCurrency();

    return () => {
      isMounted = false;
    };
  }, [id, user?.default_household_id]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      showAlert('Validation Error', 'Please enter an account name');
      return;
    }

    if (!account) return;

    try {
      setSaving(true);

      await accountRepository.updateAccount(account.id, {
        name: name.trim(),
        type: selectedType,
        is_in_budget: isInBudget,
        is_active: isActive,
        updated_at: new Date(),
      });

      logger.info('Account updated', { accountId: account.id });
      router.back();
      showAlert('Success', 'Account updated!');
    } catch (error) {
      logger.error('Error updating account', error);
      showAlert('Error', 'Failed to update account. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, account, selectedType, isInBudget, isActive, accountRepository, router]);

  const handleArchive = useCallback(() => {
    if (!account) return;
    setShowArchiveModal(true);
  }, [account]);

  const confirmArchive = useCallback(async () => {
    if (!account) return;
    setShowArchiveModal(false);

    try {
      await accountRepository.archiveAccount(account.id);
      logger.info('Account archived', { accountId: account.id });
      router.back();
      showAlert('Success', 'Account archived');
    } catch (error) {
      logger.error('Error archiving account', error);
      showAlert('Error', 'Failed to archive account');
    }
  }, [account, accountRepository, router]);

  const handleToggleInBudget = useCallback(() => setIsInBudget(prev => !prev), []);
  const handleToggleActive = useCallback(() => setIsActive(prev => !prev), []);
  const handleSelectType = useCallback((type: AccountType) => setSelectedType(type), []);
  const handleCancelArchive = useCallback(() => setShowArchiveModal(false), []);
  const handleCancel = useCallback(() => router.back(), [router]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading account...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <AppText variant="body" style={[styles.cancelText, { color: theme.interactive.primary }]}>
              Cancel
            </AppText>
          </TouchableOpacity>
          <AppText variant="h2">Edit Account</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Display (Read-only) */}
          <Card>
            <AppText variant="bodyEmphasis" style={[styles.sectionLabel, { color: theme.text.secondary }]}>
              Account Balances
            </AppText>

            <View style={styles.balanceRow}>
              <AppText variant="caption" style={[styles.balanceCaption, { color: theme.text.tertiary }]}>
                Available Balance
              </AppText>
              <AppText variant="display" style={{ color: theme.text.primary }}>
                {formatCurrency(account.balance, householdCurrency)}
              </AppText>
              <AppText variant="caption" style={[styles.balanceHint, { color: theme.text.tertiary }]}>
                Includes all pending and cleared transactions
              </AppText>
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.status.infoBackground }]}>
              <AppText variant="caption" style={{ color: theme.status.info }}>
                💡 To see your cleared balance (what your bank shows), mark transactions as cleared on the Transactions tab, then reconcile this account.
              </AppText>
            </View>
          </Card>

          {/* Account Type Selection */}
          <Card style={styles.card}>
            <AppText variant="bodyEmphasis" style={[styles.sectionLabel, { color: theme.text.primary }]}>
              Account Type
            </AppText>
            <View style={styles.typeGrid}>
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => handleSelectType(type.value)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor:
                        selectedType === type.value
                          ? theme.interactive.primary
                          : theme.background.secondary,
                      borderColor:
                        selectedType === type.value
                          ? theme.interactive.primary
                          : theme.border.default,
                    },
                  ]}
                >
                  <AppText variant="display" style={styles.typeIcon}>{type.icon}</AppText>
                  <AppText
                    variant="overline"
                    style={{
                      color:
                        selectedType === type.value
                          ? theme.text.inverse
                          : theme.text.primary,
                    }}
                  >
                    {type.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Account Name */}
          <Card style={styles.card}>
            <Input
              label="Account Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Chase Checking"
              autoCapitalize="words"
            />
          </Card>

          {/* Include in Budget Toggle */}
          <Card style={styles.card}>
            <TouchableOpacity onPress={handleToggleInBudget} style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <AppText variant="bodyEmphasis" style={[styles.toggleTitle, { color: theme.text.primary }]}>
                  Include in Budget
                </AppText>
                <AppText variant="caption" style={{ color: theme.text.secondary }}>
                  Track this account in your monthly budget
                </AppText>
              </View>
              <View style={[styles.toggle, { backgroundColor: isInBudget ? theme.status.success : theme.background.tertiary }]}>
                <View style={[styles.toggleThumb, {
                  backgroundColor: theme.surface.default,
                  transform: [{ translateX: isInBudget ? 22 : 2 }],
                }]} />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Active Status Toggle */}
          <Card style={styles.card}>
            <TouchableOpacity onPress={handleToggleActive} style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <AppText variant="bodyEmphasis" style={[styles.toggleTitle, { color: theme.text.primary }]}>
                  Account Active
                </AppText>
                <AppText variant="caption" style={{ color: theme.text.secondary }}>
                  Show this account in lists and reports
                </AppText>
              </View>
              <View style={[styles.toggle, { backgroundColor: isActive ? theme.status.success : theme.background.tertiary }]}>
                <View style={[styles.toggleThumb, {
                  backgroundColor: theme.surface.default,
                  transform: [{ translateX: isActive ? 22 : 2 }],
                }]} />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Save Button */}
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
            loading={saving}
          />

          {/* Archive Button */}
          <TouchableOpacity
            onPress={handleArchive}
            style={[styles.archiveButton, { borderColor: theme.status.error }]}
          >
            <AppText variant="bodyEmphasis" style={{ color: theme.status.error }}>
              Archive Account
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </ScreenWrapper>

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        visible={showArchiveModal}
        title="Archive Account"
        message={`Are you sure you want to archive "${account?.name}"? You can reactivate it later.`}
        onConfirm={confirmArchive}
        onCancel={handleCancelArchive}
        confirmText="Archive"
        cancelText="Cancel"
        variant="confirm"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[8],
    paddingBottom: SPACING[5],
  },
  cancelText: {
    width: 60,
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    paddingBottom: SPACING[10],
  },
  sectionLabel: {
    marginBottom: SPACING[3],
  },
  balanceRow: {
    marginBottom: SPACING[4],
  },
  balanceCaption: {
    marginBottom: SPACING[1],
  },
  balanceHint: {
    marginTop: SPACING[1],
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '31%',
    margin: SPACING[2],
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeIcon: {
    marginBottom: SPACING[2],
  },
  card: {
    marginTop: SPACING[4],
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: SPACING[4],
  },
  toggleTitle: {
    marginBottom: SPACING[1],
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  infoBox: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.sm,
  },
  archiveButton: {
    marginTop: SPACING[4],
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
});
