// Edit Account Screen - Homebase Budget
// Edit an existing account

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { Input, Button, Card } from '@/presentation/components';
import { Account, AccountType } from '@/domain/entities/Account';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading account...
          </Text>
        </View>
      </View>
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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancelButton, { color: theme.interactive.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text.primary }]}>Edit Account</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Display (Read-only) */}
          <Card>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Current Balance
            </Text>
            <Text style={[styles.balanceText, { color: theme.text.primary }]}>
              {formatCurrency(account.balance / 100, householdCurrency)}
            </Text>
            <Text style={[styles.helperText, { color: theme.text.tertiary }]}>
              Balance is updated automatically by transactions
            </Text>
          </Card>

          {/* Account Type Selection */}
          <Card style={styles.card}>
            <Text style={[styles.label, { color: theme.text.primary }]}>
              Account Type
            </Text>
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
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      {
                        color:
                          selectedType === type.value
                            ? theme.text.inverse
                            : theme.text.primary,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
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
                <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>
                  Include in Budget
                </Text>
                <Text style={[styles.toggleHelper, { color: theme.text.secondary }]}>
                  Track this account in your monthly budget
                </Text>
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
                <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>
                  Account Active
                </Text>
                <Text style={[styles.toggleHelper, { color: theme.text.secondary }]}>
                  Show this account in lists and reports
                </Text>
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
            <Text style={[styles.archiveButtonText, { color: theme.status.error }]}>
              Archive Account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 14,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '31%',
    margin: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    marginTop: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleHelper: {
    fontSize: 14,
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
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  archiveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

