// Transaction Detail/Edit Screen
// View and edit individual transaction

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  GhostButton,
} from '@/presentation/components';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { Transaction, TransactionType } from '@/domain/entities/Transaction';
import { Account } from '@/domain/entities/Account';
import { MasterCategory } from '@/shared/constants/budget-categories';
import { SelectOption } from '@/shared/types';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';

export default function TransactionDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const transactionId = params.id as string;

  // View/Edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Transaction state
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountInCents, setAmountInCents] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [payee, setPayee] = useState('');
  const [notes, setNotes] = useState('');

  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const transactionRepo = new FirestoreTransactionRepository();
  const accountRepo = new FirestoreAccountRepository();
  const budgetRepo = new FirestoreBudgetRepository();

  // Load transaction
  useEffect(() => {
    const loadData = async () => {
      if (!user?.default_household_id || !transactionId) return;

      try {
        setLoading(true);

        // Load household currency
        const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
        if (householdDoc.exists()) {
          setHouseholdCurrency((householdDoc.data().currency as CurrencyCode) || 'USD');
        }

        // Load transaction
        const txn = await transactionRepo.getTransaction(transactionId);
        if (!txn) {
          Alert.alert('Error', 'Transaction not found');
          router.back();
          return;
        }

        setTransaction(txn);
        setType(txn.type);
        setAmountInCents(txn.amount);
        setSelectedAccountId(txn.account_id);
        setSelectedCategoryId(txn.category_id || '');
        setPayee(txn.payee || '');
        setNotes(txn.notes || '');

        // Load accounts and categories
        const accts = await accountRepo.getAccountsByHousehold(user.default_household_id);
        setAccounts(accts);

        const cats = await budgetRepo.getMasterCategoriesByHousehold(user.default_household_id);
        setCategories(cats);
      } catch (error) {
        console.error('❌ Failed to load transaction:', error);
        Alert.alert('Error', 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [transactionId, user?.default_household_id]);

  // Transform for SearchableSelect
  const accountOptions: SelectOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.id,
    subtitle: account.account_type,
  }));

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

  // Save edits
  const handleSave = async () => {
    if (!transaction || !user) return;

    if (amountInCents <= 0) {
      Alert.alert('Validation Error', 'Please enter an amount greater than zero');
      return;
    }

    if (!selectedAccountId || !selectedCategoryId || !payee.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Calculate difference for budget update
      const oldAmount = transaction.amount;
      const oldCategoryId = transaction.category_id;
      const amountDifference = amountInCents - oldAmount;

      // Update transaction
      const updatedTransaction: Transaction = {
        ...transaction,
        type,
        amount: amountInCents,
        account_id: selectedAccountId,
        category_id: selectedCategoryId,
        payee: payee.trim(),
        notes: notes.trim() || undefined,
        updated_at: new Date(),
      };

      await transactionRepo.updateTransaction(updatedTransaction);
      console.log('✅ Transaction updated:', transaction.id);

      // Update budget if category or amount changed
      if (oldCategoryId && (amountDifference !== 0 || oldCategoryId !== selectedCategoryId)) {
        try {
          const now = new Date();
          const budget = await budgetRepo.getBudgetByMonth(
            user.default_household_id!,
            now.getMonth() + 1,
            now.getFullYear()
          );

          if (budget) {
            // Remove from old category
            if (oldCategoryId !== selectedCategoryId) {
              const oldCatIndex = budget.categories.findIndex((c) => c.category_id === oldCategoryId);
              if (oldCatIndex >= 0) {
                const oldCatActual = budget.categories[oldCatIndex].actual_amount || 0;
                await budgetRepo.updateCategoryActualAmount(
                  budget.id,
                  oldCategoryId,
                  oldCatActual - oldAmount
                );
              }
            }

            // Add to new category
            const newCatIndex = budget.categories.findIndex((c) => c.category_id === selectedCategoryId);
            if (newCatIndex >= 0) {
              const currentActual = budget.categories[newCatIndex].actual_amount || 0;
              const newActual = oldCategoryId === selectedCategoryId
                ? currentActual + amountDifference  // Same category, adjust by difference
                : currentActual + amountInCents;    // New category, add full amount

              await budgetRepo.updateCategoryActualAmount(
                budget.id,
                selectedCategoryId,
                newActual
              );
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to update budget:', error);
        }
      }

      setTransaction(updatedTransaction);
      setIsEditing(false);
      Alert.alert('Success', 'Transaction updated successfully');
    } catch (error) {
      console.error('❌ Failed to update transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDelete = async () => {
    if (!transaction || !user) return;

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from budget first
              if (transaction.category_id) {
                const now = new Date();
                const budget = await budgetRepo.getBudgetByMonth(
                  user.default_household_id!,
                  now.getMonth() + 1,
                  now.getFullYear()
                );

                if (budget) {
                  const catIndex = budget.categories.findIndex(
                    (c) => c.category_id === transaction.category_id
                  );
                  if (catIndex >= 0) {
                    const currentActual = budget.categories[catIndex].actual_amount || 0;
                    await budgetRepo.updateCategoryActualAmount(
                      budget.id,
                      transaction.category_id,
                      currentActual - transaction.amount
                    );
                  }
                }
              }

              // Delete transaction
              await deleteDoc(doc(db, 'transactions', transaction.id));
              console.log('✅ Transaction deleted:', transaction.id);

              Alert.alert('Success', 'Transaction deleted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('❌ Failed to delete transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <ScreenHeader title="Transaction" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <ScreenHeader title="Transaction" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 16, color: theme.text.secondary }}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  // View Mode
  if (!isEditing) {
    const account = accounts.find((a) => a.id === transaction.account_id);
    const category = categories.find((c) => c.id === transaction.category_id);

    return (
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <ScreenHeader
          title="Transaction"
          showBack
          rightAction={
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={{ color: theme.interactive.primary, fontSize: 16, fontWeight: '600' }}>
                Edit
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            {/* Amount Card */}
            <Card padding="lg" style={{ marginBottom: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: transaction.type === 'INCOME' ? theme.financial.income : theme.financial.expense }}>
                {transaction.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(transaction.amount, householdCurrency)}
              </Text>
              <Text style={{ fontSize: 14, color: theme.text.secondary, marginTop: 8 }}>
                {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
              </Text>
            </Card>

            {/* Details */}
            <Card padding="md" style={{ marginBottom: 16 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: theme.text.tertiary, marginBottom: 4 }}>PAYEE</Text>
                <Text style={{ fontSize: 16, color: theme.text.primary }}>{transaction.payee || '—'}</Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: theme.text.tertiary, marginBottom: 4 }}>ACCOUNT</Text>
                <Text style={{ fontSize: 16, color: theme.text.primary }}>{account?.name || '—'}</Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: theme.text.tertiary, marginBottom: 4 }}>CATEGORY</Text>
                <Text style={{ fontSize: 16, color: theme.text.primary }}>{category?.name || '—'}</Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: theme.text.tertiary, marginBottom: 4 }}>DATE</Text>
                <Text style={{ fontSize: 16, color: theme.text.primary }}>
                  {transaction.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              {transaction.notes && (
                <View>
                  <Text style={{ fontSize: 12, color: theme.text.tertiary, marginBottom: 4 }}>NOTES</Text>
                  <Text style={{ fontSize: 16, color: theme.text.primary }}>{transaction.notes}</Text>
                </View>
              )}
            </Card>

            {/* Delete Button */}
            <GhostButton
              title="Delete Transaction"
              onPress={handleDelete}
              fullWidth
              size="lg"
              style={{ borderColor: theme.status.error }}
              textStyle={{ color: theme.status.error }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Edit Mode
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title="Edit Transaction"
        showBack
        onBackPress={() => setIsEditing(false)}
      />

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ padding: 16 }}>
          {/* Transaction Type */}
          <Card padding="md" style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.text.secondary, fontSize: 14, marginBottom: 8 }}>
              Transaction Type
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setType('EXPENSE')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: type === 'EXPENSE' ? theme.financial.expense : theme.background.secondary,
                  borderWidth: 2,
                  borderColor: type === 'EXPENSE' ? theme.financial.expense : theme.border.default,
                }}
              >
                <Text style={{ color: type === 'EXPENSE' ? '#FFFFFF' : theme.text.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('INCOME')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: type === 'INCOME' ? theme.financial.income : theme.background.secondary,
                  borderWidth: 2,
                  borderColor: type === 'INCOME' ? theme.financial.income : theme.border.default,
                }}
              >
                <Text style={{ color: type === 'INCOME' ? '#FFFFFF' : theme.text.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          <AmountInput
            label="Amount *"
            value={amountInCents}
            onChangeValue={setAmountInCents}
            currency={householdCurrency}
          />

          <Input label="Payee *" value={payee} onChangeText={setPayee} placeholder="Who did you pay?" />

          <SearchableSelect
            label="Account *"
            value={selectedAccountId}
            onChange={setSelectedAccountId}
            options={accountOptions}
            placeholder="Select account"
          />

          <SearchableSelect
            label="Category *"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            options={categoryOptions}
            placeholder="Select category"
          />

          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes"
            multiline
            numberOfLines={3}
          />

          <PrimaryButton
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            fullWidth
            size="lg"
          />

          <OutlineButton
            title="Cancel"
            onPress={() => setIsEditing(false)}
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

