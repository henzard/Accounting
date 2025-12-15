// Add Account Screen - Homebase Budget
// Create a new account

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, Button, Card } from '@/presentation/components';
import { AccountType, createAccount } from '@/domain/entities/Account';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { v4 as uuidv4 } from 'uuid';

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'BANK', label: 'Checking', icon: '🏦' },
  { value: 'SAVINGS', label: 'Savings', icon: '💰' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'LOAN', label: 'Loan', icon: '🏠' },
  { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
];

export default function AddAccountScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType>('BANK');
  const [balance, setBalance] = useState('0.00');
  const [isInBudget, setIsInBudget] = useState(true);
  const [saving, setSaving] = useState(false);

  const accountRepository = new FirestoreAccountRepository();

  async function handleSave() {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter an account name');
      return;
    }

    if (!user?.default_household_id) {
      Alert.alert('Error', 'No household selected');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setSaving(true);

      // Parse balance (convert dollars to cents)
      const balanceInCents = Math.round(parseFloat(balance || '0') * 100);

      // Create account
      const newAccount = createAccount({
        id: uuidv4(),
        household_id: user.default_household_id,
        name: name.trim(),
        type: selectedType,
        balance: balanceInCents,
        currency: user.currency || 'USD',
        created_by: user.id,
      });

      // Override is_in_budget if user changed it
      newAccount.is_in_budget = isInBudget;

      // Save to Firestore
      await accountRepository.createAccount(newAccount);

      console.log('✅ Account created:', newAccount.name);
      Alert.alert('Success', `${newAccount.name} created!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('❌ Error creating account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Add Account
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Type Selection */}
          <Card>
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

          {/* Starting Balance */}
          <Card style={styles.card}>
            <Input
              label="Starting Balance"
              value={balance}
              onChangeText={setBalance}
              placeholder="0.00"
              keyboardType="decimal-pad"
              helperText="Enter the current balance of this account"
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

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.status.infoBackground },
            ]}
          >
            <Text style={[styles.infoIcon]}>ℹ️</Text>
            <Text style={[styles.infoText, { color: theme.status.info }]}>
              You can edit these details later. Starting balance will be your first
              transaction.
            </Text>
          </View>

          {/* Save Button */}
          <Button
            title={saving ? 'Creating...' : 'Create Account'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
            loading={saving}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
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
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

