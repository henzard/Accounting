// Add Transaction Screen
// Form to create new income or expense transaction

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import {
  ScreenHeader,
  AmountInput,
  Input,
  SearchableSelect,
  Card,
  PrimaryButton,
  OutlineButton,
} from '@/presentation/components';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { Transaction, TransactionType, createTransaction } from '@/domain/entities/Transaction';
import { Account } from '@/domain/entities/Account';
import { MasterCategory } from '@/shared/constants/budget-categories';
import { SelectOption } from '@/shared/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { v4 as uuidv4 } from 'uuid';
import { CurrencyCode } from '@/shared/utils/currency';

export default function AddTransactionScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountInCents, setAmountInCents] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [payee, setPayee] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date());

  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const accountRepo = new FirestoreAccountRepository();
  const transactionRepo = new FirestoreTransactionRepository();
  const budgetRepo = new FirestoreBudgetRepository();

  // Load accounts and categories
  useEffect(() => {
    const loadData = async () => {
      if (!user?.default_household_id) return;

      try {
        setLoading(true);

        // Load household currency
        const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
        if (householdDoc.exists()) {
          setHouseholdCurrency((householdDoc.data().currency as CurrencyCode) || 'USD');
        }

        // Load accounts
        const accts = await accountRepo.getAccountsByHousehold(user.default_household_id);
        setAccounts(accts);
        if (accts.length > 0) {
          setSelectedAccountId(accts[0].id);
        }

        // Load categories
        const cats = await budgetRepo.getMasterCategoriesByHousehold(user.default_household_id);
        setCategories(cats);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        Alert.alert('Error', 'Failed to load accounts and categories');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.default_household_id]);

  // Transform accounts for SearchableSelect
  const accountOptions: SelectOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.id,
    subtitle: account.account_type,
  }));

  // Transform categories for SearchableSelect (filter by type)
  const categoryOptions: SelectOption[] = categories
    .filter((cat) => {
      if (type === 'INCOME') {
        return cat.group === 'INCOME';
      } else {
        return cat.group !== 'INCOME';
      }
    })
    .map((cat) => ({
      label: cat.name,
      value: cat.id,
      subtitle: cat.group,
    }));

  // Validate form
  const validateForm = (): string | null => {
    if (amountInCents <= 0) {
      return 'Please enter an amount greater than zero';
    }
    if (!selectedAccountId) {
      return 'Please select an account';
    }
    if (!selectedCategoryId) {
      return 'Please select a category';
    }
    if (!payee.trim()) {
      return 'Please enter a payee';
    }
    return null;
  };

  // Save transaction
  const handleSave = async () => {
    // Validate
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSaving(true);
    try {
      // Create transaction
      const transaction = createTransaction({
        id: uuidv4(),
        household_id: user.default_household_id!,
        type,
        date: transactionDate,
        amount: amountInCents,
        account_id: selectedAccountId,
        category_id: selectedCategoryId,
        payee: payee.trim(),
        notes: notes.trim() || undefined,
        created_by: user.id,
        created_by_device: 'mobile-app', // TODO: Get actual device ID
      });

      // Save to Firestore
      await transactionRepo.createTransaction(transaction);

      console.log('✅ Transaction created:', transaction.id);

      // Update budget category actual amount
      if (selectedCategoryId) {
        try {
          // Get current month budget
          const now = new Date();
          const budget = await budgetRepo.getBudgetByMonth(
            user.default_household_id!,
            now.getMonth() + 1,
            now.getFullYear()
          );

          if (budget) {
            // Find category in budget
            const categoryIndex = budget.categories.findIndex((c) => c.category_id === selectedCategoryId);
            if (categoryIndex >= 0) {
              const currentActual = budget.categories[categoryIndex].actual_amount || 0;
              const newActual = type === 'INCOME' 
                ? currentActual + amountInCents  // Income adds
                : currentActual + amountInCents; // Expense adds (we track spending)

              await budgetRepo.updateCategoryActualAmount(
                budget.id,
                selectedCategoryId,
                newActual
              );
              console.log('✅ Budget category updated:', selectedCategoryId, newActual);
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to update budget category:', error);
          // Don't block transaction if budget update fails
        }
      }

      Alert.alert('Success', 'Transaction added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <ScreenHeader title="Add Transaction" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Add Transaction" showBack />

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ padding: 16 }}>
          {/* Transaction Type Toggle */}
          <Card padding="md" style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.text.secondary, fontSize: 14, marginBottom: 8 }}>
              Transaction Type
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setType('EXPENSE');
                  setSelectedCategoryId(''); // Reset category
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: type === 'EXPENSE' ? theme.financial.expense : theme.background.secondary,
                  borderWidth: 2,
                  borderColor: type === 'EXPENSE' ? theme.financial.expense : theme.border.default,
                }}
              >
                <Text
                  style={{
                    color: type === 'EXPENSE' ? '#FFFFFF' : theme.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setType('INCOME');
                  setSelectedCategoryId(''); // Reset category
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: type === 'INCOME' ? theme.financial.income : theme.background.secondary,
                  borderWidth: 2,
                  borderColor: type === 'INCOME' ? theme.financial.income : theme.border.default,
                }}
              >
                <Text
                  style={{
                    color: type === 'INCOME' ? '#FFFFFF' : theme.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Amount */}
          <AmountInput
            label="Amount *"
            value={amountInCents}
            onChangeValue={setAmountInCents}
            currency={householdCurrency}
            placeholder="0.00"
          />

          {/* Payee */}
          <Input
            label="Payee *"
            value={payee}
            onChangeText={setPayee}
            placeholder="Who did you pay or receive from?"
            autoCapitalize="words"
          />

          {/* Account */}
          <SearchableSelect
            label="Account *"
            value={selectedAccountId}
            onChange={setSelectedAccountId}
            options={accountOptions}
            placeholder="Select account"
          />

          {/* Category */}
          <SearchableSelect
            label="Category *"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            options={categoryOptions}
            placeholder={`Select ${type.toLowerCase()} category`}
          />

          {/* Notes */}
          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this transaction"
            multiline
            numberOfLines={3}
          />

          {/* Date - Future: Add date picker */}
          <Card padding="md" style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.text.secondary, fontSize: 14, marginBottom: 4 }}>
              Date
            </Text>
            <Text style={{ color: theme.text.primary, fontSize: 16 }}>
              {transactionDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </Card>

          {/* Save Button */}
          <PrimaryButton
            title={saving ? 'Saving...' : 'Save Transaction'}
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            fullWidth
            size="lg"
          />

          <OutlineButton
            title="Cancel"
            onPress={() => router.back()}
            disabled={saving}
            fullWidth
            size="lg"
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

