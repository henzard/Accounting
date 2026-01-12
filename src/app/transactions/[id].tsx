// Transaction Detail/Edit Screen
// View and edit individual transaction

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import {
  ScreenHeader,
  AmountInput,
  Input,
  SearchableSelect,
  Card,
  PrimaryButton,
  OutlineButton,
  Button,
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { FirestoreBusinessRepository } from '@/data/repositories/FirestoreBusinessRepository';
import { Transaction, TransactionType, ReimbursementType } from '@/domain/entities/Transaction';
import { Account } from '@/domain/entities/Account';
import { Business } from '@/domain/entities/Business';
import { MasterCategory } from '@/shared/constants/budget-categories';
import { SelectOption } from '@/shared/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import {
  pickReceiptImage,
  takeReceiptPhoto,
  uploadReceipts,
  deleteReceipts,
  ReceiptImage,
} from '@/shared/utils/receipt-upload';
import { Image as ExpoImage } from 'expo-image';

export default function TransactionDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  // Handle both string and array formats from expo-router
  const transactionId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  // View/Edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Transaction state
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountInCents, setAmountInCents] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [payee, setPayee] = useState('');
  const [notes, setNotes] = useState('');
  
  // Business expense state
  const [isBusiness, setIsBusiness] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [reimbursementType, setReimbursementType] = useState<ReimbursementType>('NONE');

  // Receipt state
  const [receiptImages, setReceiptImages] = useState<ReceiptImage[]>([]); // New images to upload
  const [existingReceiptUrls, setExistingReceiptUrls] = useState<string[]>([]); // Existing URLs from transaction
  const [deletedReceiptUrls, setDeletedReceiptUrls] = useState<string[]>([]); // URLs to delete
  const [uploadingReceipts, setUploadingReceipts] = useState(false);

  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const transactionRepo = new FirestoreTransactionRepository();
  const accountRepo = new FirestoreAccountRepository();
  const budgetRepo = new FirestoreBudgetRepository();
  const businessRepo = new FirestoreBusinessRepository();

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
          showAlert('Error', 'Transaction not found');
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
        
        // Set business expense fields
        setIsBusiness(txn.is_business || false);
        setSelectedBusinessId(txn.business_id || '');
        setReimbursementType(txn.reimbursement_type || 'NONE');

        // Initialize receipt state
        setExistingReceiptUrls(txn.receipt_urls || []);
        setReceiptImages([]);
        setDeletedReceiptUrls([]);

        // Load accounts, categories, and businesses
        const accts = await accountRepo.getAccountsByHousehold(user.default_household_id);
        setAccounts(accts);

        const cats = await budgetRepo.getMasterCategoriesByHousehold(user.default_household_id);
        setCategories(cats);
        
        const biz = await businessRepo.getBusinessesByHousehold(user.default_household_id);
        setBusinesses(biz);
      } catch (error) {
        console.error('❌ Failed to load transaction:', error);
        showAlert('Error', 'Failed to load transaction');
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
    subtitle: account.type,
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

  const businessOptions: SelectOption[] = businesses.map((biz) => ({
    label: biz.name,
    value: biz.id,
    subtitle: biz.type.replace('_', ' '),
  }));

  const reimbursementTypeOptions: SelectOption[] = [
    { label: 'None', value: 'NONE' },
    { label: 'Reimbursable', value: 'REIMBURSABLE' },
    { label: 'Business Owned', value: 'BUSINESS_OWNED' },
  ];

  // Receipt handlers
  const handleAddReceipt = async () => {
    try {
      const image = await pickReceiptImage();
      if (image) {
        setReceiptImages([...receiptImages, image]);
      }
    } catch (error) {
      console.error('❌ Error selecting receipt:', error);
      showAlert('Error', 'Failed to select receipt photo');
    }
  };

  const handleTakeReceiptPhoto = async () => {
    try {
      const image = await takeReceiptPhoto();
      if (image) {
        setReceiptImages([...receiptImages, image]);
      }
    } catch (error) {
      console.error('❌ Error taking receipt photo:', error);
      showAlert('Error', 'Failed to take receipt photo');
    }
  };

  const handleRemoveNewReceipt = (index: number) => {
    setReceiptImages(receiptImages.filter((_, i) => i !== index));
  };

  const handleDeleteExistingReceipt = (url: string) => {
    setExistingReceiptUrls(existingReceiptUrls.filter((u) => u !== url));
    setDeletedReceiptUrls([...deletedReceiptUrls, url]);
  };

  // Save edits
  const handleSave = async () => {
    if (!transaction || !user) return;

    if (amountInCents <= 0) {
      showAlert('Validation Error', 'Please enter an amount greater than zero');
      return;
    }

    if (!selectedAccountId || !selectedCategoryId || !payee.trim()) {
      showAlert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Calculate difference for budget update
      const oldAmount = transaction.amount;
      const oldCategoryId = transaction.category_id;
      const amountDifference = amountInCents - oldAmount;

      // Handle receipt uploads and deletions
      let finalReceiptUrls = [...existingReceiptUrls];
      
      // Delete removed receipts
      if (deletedReceiptUrls.length > 0) {
        try {
          await deleteReceipts(deletedReceiptUrls);
          console.log(`✅ Deleted ${deletedReceiptUrls.length} receipt(s)`);
        } catch (error) {
          console.error('❌ Failed to delete some receipts:', error);
          // Continue anyway - receipts might already be deleted
        }
      }

      // Upload new receipts
      if (receiptImages.length > 0) {
        setUploadingReceipts(true);
        try {
          const newUrls = await uploadReceipts(receiptImages, transaction.id, user.default_household_id!);
          finalReceiptUrls = [...finalReceiptUrls, ...newUrls];
          console.log(`✅ Uploaded ${newUrls.length} receipt(s)`);
        } catch (error) {
          console.error('❌ Failed to upload receipts:', error);
          showAlert(
            'Receipt Upload Failed',
            'Transaction will be saved without the new receipts. You can add them later by editing the transaction.'
          );
        } finally {
          setUploadingReceipts(false);
        }
      }

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
        has_receipt: finalReceiptUrls.length > 0,
        receipt_count: finalReceiptUrls.length,
        receipt_urls: finalReceiptUrls.length > 0 ? finalReceiptUrls : undefined,
      };

      // Update business expense fields
      updatedTransaction.is_business = isBusiness;
      if (isBusiness && selectedBusinessId) {
        updatedTransaction.business_id = selectedBusinessId;
        const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
        if (selectedBusiness) {
          const typeLabel = selectedBusiness.type === 'EMPLOYER' ? 'Employer' : selectedBusiness.type === 'CLIENT' ? 'Client' : 'Business';
          updatedTransaction.reimbursement_target = `${typeLabel}: ${selectedBusiness.name}`;
        }
      } else {
        updatedTransaction.business_id = undefined;
        updatedTransaction.reimbursement_target = undefined;
      }
      
      if (isBusiness && reimbursementType && reimbursementType !== 'NONE') {
        updatedTransaction.reimbursement_type = reimbursementType;
      } else {
        updatedTransaction.reimbursement_type = 'NONE';
      }

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
      // Reset receipt state
      setExistingReceiptUrls(finalReceiptUrls);
      setReceiptImages([]);
      setDeletedReceiptUrls([]);
      setIsEditing(false);
      showAlert('Success', 'Transaction updated successfully');
    } catch (error) {
      console.error('❌ Failed to update transaction:', error);
      showAlert('Error', 'Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDelete = async () => {
    console.log('🔴 DELETE BUTTON CLICKED');
    console.log('🔴 Transaction:', transaction?.id);
    console.log('🔴 User:', user?.id);
    
    if (!transaction || !user) {
      console.log('🔴 Validation failed: missing transaction or user');
      showAlert(
        'Cannot Delete',
        'Transaction or user information is missing. Please refresh and try again.'
      );
      return;
    }

    // Check if transaction is part of a reimbursement claim
    if (transaction.reimbursement_claim_id) {
      console.log('🔴 Validation failed: transaction is part of claim:', transaction.reimbursement_claim_id);
      showAlert(
        'Cannot Delete',
        'This transaction is part of a reimbursement claim and cannot be deleted. Remove it from the claim first.'
      );
      return;
    }

    // Check if user has permission (must be household member)
    if (!user.default_household_id || transaction.household_id !== user.default_household_id) {
      console.log('🔴 Validation failed: permission denied', {
        userHousehold: user.default_household_id,
        transactionHousehold: transaction.household_id
      });
      showAlert(
        'Permission Denied',
        'You do not have permission to delete this transaction. It belongs to a different household.'
      );
      return;
    }

    console.log('🔴 All validations passed, showing delete confirmation');

    // Use showConfirm for web-compatible confirmation
    const confirmed = await showConfirm(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.'
    );
    
    if (confirmed) {
      console.log('🔴 Delete confirmed, starting deletion...');
      performDelete();
    } else {
      console.log('🔴 Delete cancelled by user');
    }
  };

  const performDelete = async () => {
    if (!transaction || !user) return;
    
    setDeleting(true);
    try {
      console.log('🗑️ Starting delete process for transaction:', transaction.id);
      
      // Remove from budget first
      if (transaction.category_id) {
        console.log('📊 Removing from budget category:', transaction.category_id);
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
            const newActual = currentActual - transaction.amount;
            console.log('📊 Updating budget category:', { currentActual, transactionAmount: transaction.amount, newActual });
            await budgetRepo.updateCategoryActualAmount(
              budget.id,
              transaction.category_id,
              newActual
            );
            console.log('✅ Budget category updated');
          } else {
            console.warn('⚠️ Category not found in budget:', transaction.category_id);
          }
        } else {
          console.warn('⚠️ Budget not found for current month');
        }
      } else {
        console.log('ℹ️ No category to remove from budget');
      }

      // Delete receipt images if any
      if (transaction.receipt_urls && transaction.receipt_urls.length > 0) {
        console.log('🗑️ Deleting receipt images:', transaction.receipt_urls.length);
        try {
          await deleteReceipts(transaction.receipt_urls);
          console.log('✅ Receipt images deleted successfully');
        } catch (error) {
          console.warn('⚠️ Failed to delete some receipt images:', error);
          // Continue with transaction deletion even if receipt deletion fails
        }
      }

      // Delete transaction using repository
      console.log('🗑️ Deleting transaction from Firestore:', transaction.id);
      await transactionRepo.deleteTransaction(transaction.id);
      console.log('✅ Transaction deleted successfully:', transaction.id);

      // Navigate back immediately after successful delete
      router.back();
    } catch (error: any) {
      console.error('❌ Failed to delete transaction:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to delete transaction.';
      
      if (error?.code === 'permission-denied') {
        errorMessage = 'You do not have permission to delete this transaction. It may be part of a reimbursement claim or you may not have access to this household.';
      } else if (error?.code === 'unavailable') {
        errorMessage = 'Network error. The transaction will be deleted when you are back online.';
      } else if (error?.code === 'not-found') {
        errorMessage = 'Transaction not found. It may have already been deleted.';
      } else if (error?.message) {
        errorMessage = `Failed to delete: ${error.message}`;
      }
      
      showAlert('Delete Failed', errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Transaction" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!transaction) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Transaction" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING[8] }}>
          <AppText variant="body" color={theme.text.secondary}>Transaction not found</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  // View Mode
  if (!isEditing) {
    const account = accounts.find((a) => a.id === transaction.account_id);
    const category = categories.find((c) => c.id === transaction.category_id);
    const business = businesses.find((b) => b.id === transaction.business_id);

    return (
      <ScreenWrapper>
        <ScreenHeader
          title="Transaction"
          showBack
          rightAction={
            <TouchableOpacity 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <IconSymbol name="pencil" size={20} color={theme.interactive.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: SPACING[4] }}>
            {/* Amount Card */}
            <Card padding="lg" style={{ marginBottom: SPACING[4], alignItems: 'center' }}>
              <AppText 
                variant="display" 
                color={transaction.type === 'INCOME' ? theme.financial.income : theme.financial.expense}
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {transaction.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(transaction.amount, householdCurrency)}
              </AppText>
              <AppText variant="caption" color={theme.text.secondary} style={{ marginTop: SPACING[2] }}>
                {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
              </AppText>
            </Card>

            {/* Details */}
            <Card padding="md" style={{ marginBottom: SPACING[4] }}>
              <View style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>PAYEE</AppText>
                <AppText variant="body">{transaction.payee || '—'}</AppText>
              </View>

              <View style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>ACCOUNT</AppText>
                <AppText variant="body">{account?.name || '—'}</AppText>
              </View>

              <View style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>CATEGORY</AppText>
                <AppText variant="body">{category?.name || '—'}</AppText>
              </View>

              <View style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>DATE</AppText>
                <AppText variant="body">
                  {transaction.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </AppText>
              </View>

              {transaction.is_business && (
                <>
                  <View style={{ marginBottom: SPACING[4] }}>
                    <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>BUSINESS</AppText>
                    <AppText variant="body">{business?.name || transaction.reimbursement_target || '—'}</AppText>
                  </View>

                  {transaction.reimbursement_type && transaction.reimbursement_type !== 'NONE' && (
                    <View style={{ marginBottom: SPACING[4] }}>
                      <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>REIMBURSEMENT TYPE</AppText>
                      <AppText variant="body">
                        {transaction.reimbursement_type === 'REIMBURSABLE' ? 'Reimbursable' : 'Business Owned'}
                      </AppText>
                    </View>
                  )}

                  {transaction.reimbursement_claim_id && (
                    <View style={{ marginBottom: SPACING[4] }}>
                      <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>CLAIM</AppText>
                      <AppText variant="body" color={theme.interactive.primary}>
                        Part of reimbursement claim
                      </AppText>
                    </View>
                  )}
                </>
              )}

              {transaction.notes && (
                <View>
                  <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>NOTES</AppText>
                  <AppText variant="body">{transaction.notes}</AppText>
                </View>
              )}
            </Card>

            {/* Receipt Photos */}
            {transaction.has_receipt && transaction.receipt_urls && transaction.receipt_urls.length > 0 && (
              <Card padding="md" style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[3] }}>
                  RECEIPTS ({transaction.receipt_count})
                </AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {transaction.receipt_urls.map((url, index) => (
                    <View key={index} style={{ marginRight: SPACING[2], marginBottom: SPACING[2] }}>
                      <ReceiptThumbnail url={url} theme={theme} />
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Delete Button */}
            <Button
              title={deleting ? 'Deleting...' : 'Delete Transaction'}
              onPress={() => {
                console.log('🔴🔴🔴 DELETE BUTTON PRESSED 🔴🔴🔴');
                console.log('🔴 handleDelete function:', typeof handleDelete);
                console.log('🔴 Transaction:', transaction?.id);
                console.log('🔴 User:', user?.id);
                if (handleDelete) {
                  handleDelete();
                } else {
                  console.error('🔴 ERROR: handleDelete is not a function!');
                  showAlert('Error', 'Delete handler is not available');
                }
              }}
              variant="destructive"
              fullWidth
              size="lg"
              disabled={deleting}
              loading={deleting}
            />
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // Edit Mode
  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScreenHeader
        title="Edit Transaction"
        showBack
        onBackPress={() => setIsEditing(false)}
      />

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ padding: SPACING[4] }}>
          {/* Transaction Type */}
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[2] }}>
              Transaction Type
            </AppText>
            <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
              <TouchableOpacity
                onPress={() => setType('EXPENSE')}
                style={{
                  flex: 1,
                  paddingVertical: SPACING[3],
                  borderRadius: BORDER_RADIUS.sm,
                  backgroundColor: type === 'EXPENSE' ? theme.financial.expense : theme.background.secondary,
                  borderWidth: 2,
                  borderColor: type === 'EXPENSE' ? theme.financial.expense : theme.border.default,
                }}
              >
                <AppText 
                  variant="button" 
                  color={type === 'EXPENSE' ? '#FFFFFF' : theme.text.primary}
                  style={{ textAlign: 'center' }}
                >
                  Expense
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('INCOME')}
                style={{
                  flex: 1,
                  paddingVertical: SPACING[3],
                  borderRadius: BORDER_RADIUS.sm,
                  backgroundColor: type === 'INCOME' ? theme.financial.income : theme.background.secondary,
                  borderWidth: 2,
                  borderColor: type === 'INCOME' ? theme.financial.income : theme.border.default,
                }}
              >
                <AppText 
                  variant="button" 
                  color={type === 'INCOME' ? '#FFFFFF' : theme.text.primary}
                  style={{ textAlign: 'center' }}
                >
                  Income
                </AppText>
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
            onSelect={setSelectedAccountId}
            options={accountOptions}
            placeholder="Select account"
          />

          <SearchableSelect
            label="Category *"
            value={selectedCategoryId}
            onSelect={setSelectedCategoryId}
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

          {/* Business Expense Section */}
          <View style={{ height: SPACING[4] }} />
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[3] }}>
              <AppText variant="h2">Business Expense</AppText>
              <TouchableOpacity
                onPress={() => {
                  setIsBusiness(!isBusiness);
                  if (!isBusiness) {
                    // When enabling, set default reimbursement type if business is selected
                    if (selectedBusinessId) {
                      const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
                      if (selectedBusiness?.default_reimbursement_type) {
                        setReimbursementType(selectedBusiness.default_reimbursement_type);
                      }
                    }
                  } else {
                    // When disabling, clear business fields
                    setSelectedBusinessId('');
                    setReimbursementType('NONE');
                  }
                }}
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: isBusiness ? theme.interactive.primary : theme.border.default,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: '#FFFFFF',
                    alignSelf: isBusiness ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {isBusiness && (
              <>
                <SearchableSelect
                  label="Business/Employer"
                  value={selectedBusinessId}
                  onSelect={(value) => {
                    setSelectedBusinessId(value);
                    // Set default reimbursement type when business is selected
                    const selectedBusiness = businesses.find((b) => b.id === value);
                    if (selectedBusiness?.default_reimbursement_type) {
                      setReimbursementType(selectedBusiness.default_reimbursement_type);
                    }
                  }}
                  options={businessOptions}
                  placeholder="Select business or employer"
                />

                <View style={{ height: SPACING[3] }} />

                <SearchableSelect
                  label="Reimbursement Type"
                  value={reimbursementType}
                  onSelect={(value) => setReimbursementType(value as ReimbursementType)}
                  options={reimbursementTypeOptions}
                  placeholder="Select reimbursement type"
                />
              </>
            )}
          </Card>

          {/* Receipt Photos Section */}
          <View style={{ height: SPACING[4] }} />
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>Receipt Photos</AppText>

            {/* Existing Receipts */}
            {existingReceiptUrls.length > 0 && (
              <View style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[2] }}>
                  EXISTING RECEIPTS
                </AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {existingReceiptUrls.map((url, index) => (
                    <View key={index} style={{ marginRight: SPACING[2], marginBottom: SPACING[2], position: 'relative' }}>
                      <ExpoImage
                        source={{ uri: url }}
                        style={{ width: 80, height: 80, borderRadius: BORDER_RADIUS.sm }}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        onPress={() => handleDeleteExistingReceipt(url)}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: theme.status.error,
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <IconSymbol name="xmark" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* New Receipts */}
            {receiptImages.length > 0 && (
              <View style={{ marginBottom: SPACING[4] }}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[2] }}>
                  NEW RECEIPTS
                </AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {receiptImages.map((image, index) => (
                    <View key={index} style={{ marginRight: SPACING[2], marginBottom: SPACING[2], position: 'relative' }}>
                      <ExpoImage
                        source={{ uri: image.uri }}
                        style={{ width: 80, height: 80, borderRadius: BORDER_RADIUS.sm }}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        onPress={() => handleRemoveNewReceipt(index)}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: theme.status.error,
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <IconSymbol name="xmark" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Add Receipt Buttons */}
            <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
              <TouchableOpacity
                onPress={handleTakeReceiptPhoto}
                disabled={uploadingReceipts}
                style={{
                  flex: 1,
                  paddingVertical: SPACING[3],
                  paddingHorizontal: SPACING[4],
                  borderRadius: BORDER_RADIUS.sm,
                  backgroundColor: theme.background.secondary,
                  borderWidth: 1,
                  borderColor: theme.border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: uploadingReceipts ? 0.5 : 1,
                }}
              >
                <IconSymbol name="camera" size={20} color={theme.text.primary} style={{ marginBottom: SPACING[1] }} />
                <AppText variant="caption" color={theme.text.secondary}>
                  Take Photo
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddReceipt}
                disabled={uploadingReceipts}
                style={{
                  flex: 1,
                  paddingVertical: SPACING[3],
                  paddingHorizontal: SPACING[4],
                  borderRadius: BORDER_RADIUS.sm,
                  backgroundColor: theme.background.secondary,
                  borderWidth: 1,
                  borderColor: theme.border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: uploadingReceipts ? 0.5 : 1,
                }}
              >
                <IconSymbol name="photo" size={20} color={theme.text.primary} style={{ marginBottom: SPACING[1] }} />
                <AppText variant="caption" color={theme.text.secondary}>
                  Choose from Gallery
                </AppText>
              </TouchableOpacity>
            </View>

            {uploadingReceipts && (
              <View style={{ marginTop: SPACING[2], alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.interactive.primary} />
                <AppText variant="caption" color={theme.text.tertiary} style={{ marginTop: SPACING[1] }}>
                  Uploading receipts...
                </AppText>
              </View>
            )}
          </Card>

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
            style={{ marginTop: SPACING[3] }}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

// Receipt Thumbnail Component
function ReceiptThumbnail({ url, theme }: { url: string; theme: any }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          width: 100,
          height: 100,
          borderRadius: BORDER_RADIUS.sm,
          overflow: 'hidden',
          backgroundColor: theme.background.secondary,
        }}
      >
        <ExpoImage
          source={{ uri: url }}
          style={{ width: 100, height: 100 }}
          contentFit="cover"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              height: '90%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ExpoImage
              source={{ uri: url }}
              style={{
                width: '100%',
                height: '100%',
              }}
              contentFit="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <IconSymbol name="xmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  editButton: {
    width: 44, // Premium UI: Minimum 44×44px touch target
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
