// Edit Account Screen - Homebase Budget
// Edit an existing account

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, Button, Card, ScreenWrapper, AppText } from '@/presentation/components';
import { Account, AccountType } from '@/domain/entities/Account';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
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

  const accountRepository = new FirestoreAccountRepository();

  useEffect(() => {
    loadAccount();
    loadHouseholdCurrency();
  }, [id]);

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

  async function loadAccount() {
    if (!id) {
      Alert.alert('Error', 'No account ID provided');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const loadedAccount = await accountRepository.getAccountById(id);

      if (!loadedAccount) {
        Alert.alert('Error', 'Account not found');
        router.back();
        return;
      }

      setAccount(loadedAccount);
      setName(loadedAccount.name);
      setSelectedType(loadedAccount.type);
      setIsInBudget(loadedAccount.is_in_budget);
      setIsActive(loadedAccount.is_active);
    } catch (error) {
      console.error('❌ Error loading account:', error);
      Alert.alert('Error', 'Failed to load account');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter an account name');
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

      console.log('✅ Account updated:', account.id);
      Alert.alert('Success', 'Account updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('❌ Error updating account:', error);
      Alert.alert('Error', 'Failed to update account. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!account) return;

    Alert.alert(
      'Archive Account',
      `Are you sure you want to archive "${account.name}"? You can reactivate it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await accountRepository.archiveAccount(account.id);
              console.log('✅ Account archived:', account.id);
              Alert.alert('Success', 'Account archived', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('❌ Error archiving account:', error);
              Alert.alert('Error', 'Failed to archive account');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={{ color: theme.text.secondary, marginTop: SPACING[4] }}>
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText variant="body" style={{ color: theme.interactive.primary, width: 60 }}>
              Cancel
            </AppText>
          </TouchableOpacity>
          <AppText variant="h2">Edit Account</AppText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Display (Read-only) */}
          <Card>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary, marginBottom: SPACING[2] }}>
              Current Balance
            </AppText>
            <AppText variant="display" style={{ color: theme.text.primary, marginBottom: SPACING[1] }}>
              {formatCurrency(account.balance / 100, householdCurrency)}
            </AppText>
            <AppText variant="caption" style={{ color: theme.text.tertiary }}>
              Balance is updated automatically by transactions
            </AppText>
          </Card>

          {/* Account Type Selection */}
          <Card style={styles.card}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.primary, marginBottom: SPACING[4] }}>
              Account Type
            </AppText>
            <View style={styles.typeGrid}>
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
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
                    style={[
                      {
                        color:
                          selectedType === type.value
                            ? theme.text.inverse
                            : theme.text.primary,
                      },
                    ]}
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
            <TouchableOpacity
              onPress={() => setIsInBudget(!isInBudget)}
              style={styles.toggleRow}
            >
              <View style={styles.toggleInfo}>
                <AppText variant="bodyEmphasis" style={{ color: theme.text.primary, marginBottom: SPACING[1] }}>
                  Include in Budget
                </AppText>
                <AppText variant="caption" style={{ color: theme.text.secondary }}>
                  Track this account in your monthly budget
                </AppText>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: isInBudget
                      ? theme.status.success
                      : theme.background.tertiary,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.surface.default,
                      transform: [{ translateX: isInBudget ? 22 : 2 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Active Status Toggle */}
          <Card style={styles.card}>
            <TouchableOpacity
              onPress={() => setIsActive(!isActive)}
              style={styles.toggleRow}
            >
              <View style={styles.toggleInfo}>
                <AppText variant="bodyEmphasis" style={{ color: theme.text.primary, marginBottom: SPACING[1] }}>
                  Account Active
                </AppText>
                <AppText variant="caption" style={{ color: theme.text.secondary }}>
                  Show this account in lists and reports
                </AppText>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: isActive
                      ? theme.status.success
                      : theme.background.tertiary,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.surface.default,
                      transform: [{ translateX: isActive ? 22 : 2 }],
                    },
                  ]}
                />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[8],
    paddingBottom: SPACING[5],
  },
  scrollContent: {
    paddingBottom: SPACING[10],
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '31%',
    margin: SPACING[2], // 8px - 8pt grid compliant
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
  archiveButton: {
    marginTop: SPACING[4],
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
});

