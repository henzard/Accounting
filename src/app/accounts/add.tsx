// Add Account Screen - Homebase Budget
// Create a new account

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, Button, Card, ScreenWrapper, AppText } from '@/presentation/components';
import { AccountType, createAccount } from '@/domain/entities/Account';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { showAlert } from '@/shared/utils/alert';
import { v4 as uuidv4 } from 'uuid';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

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
      showAlert('Validation Error', 'Please enter an account name');
      return;
    }

    if (!user?.default_household_id) {
      showAlert('Error', 'No household selected');
      return;
    }

    if (!user?.id) {
      showAlert('Error', 'User not authenticated');
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
      router.back();
      showAlert('Success', `${newAccount.name} created!`);
    } catch (error) {
      console.error('❌ Error creating account:', error);
      showAlert('Error', 'Failed to create account. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <AppText variant="h2">Add Account</AppText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Type Selection */}
          <Card>
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

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.status.infoBackground },
            ]}
          >
            <AppText variant="body" style={styles.infoIcon}>ℹ️</AppText>
            <AppText variant="caption" style={{ color: theme.status.info, flex: 1 }}>
              You can edit these details later. Starting balance will be your first
              transaction.
            </AppText>
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
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  infoCard: {
    flexDirection: 'row',
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING[4],
    marginBottom: SPACING[6],
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: SPACING[3],
  },
});

