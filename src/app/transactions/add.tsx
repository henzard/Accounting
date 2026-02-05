// Add Transaction Screen
// Form to create new income or expense transaction

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert } from '@/shared/utils/alert';
import {
  ScreenHeader,
  AmountInput,
  Input,
  SearchableSelect,
  Card,
  PrimaryButton,
  OutlineButton,
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { FirestoreBusinessRepository } from '@/data/repositories/FirestoreBusinessRepository';
import { Transaction, TransactionType, ReimbursementType, createTransaction } from '@/domain/entities/Transaction';
import { Account } from '@/domain/entities/Account';
import { Business } from '@/domain/entities/Business';
import { MasterCategory } from '@/shared/constants/budget-categories';
import { SelectOption } from '@/shared/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { v4 as uuidv4 } from 'uuid';
import { CurrencyCode } from '@/shared/utils/currency';
import { pickReceiptImage, takeReceiptPhoto, uploadReceipts, ReceiptImage } from '@/shared/utils/receipt-upload';

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
  
  // Business expense state
  const [isBusiness, setIsBusiness] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [reimbursementType, setReimbursementType] = useState<'REIMBURSABLE' | 'BUSINESS_OWNED' | undefined>(undefined);

  // Receipt state
  const [receiptImages, setReceiptImages] = useState<ReceiptImage[]>([]);
  const [uploadingReceipts, setUploadingReceipts] = useState(false);

  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const accountRepo = new FirestoreAccountRepository();
  const transactionRepo = new FirestoreTransactionRepository();
  const budgetRepo = new FirestoreBudgetRepository();
  const businessRepo = new FirestoreBusinessRepository();

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

        // Load businesses
        const biz = await businessRepo.getBusinessesByHousehold(user.default_household_id);
        setBusinesses(biz);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        showAlert('Error', 'Failed to load accounts and categories');
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

  // Transform businesses for SearchableSelect
  const businessOptions: SelectOption[] = businesses.map((business) => ({
    label: business.name,
    value: business.id,
    subtitle: business.type === 'EMPLOYER' ? 'Employer' : business.type === 'CLIENT' ? 'Client' : 'Own Business',
  }));

  // Reimbursement type options
  const reimbursementTypeOptions: SelectOption[] = [
    { label: 'Reimbursable', value: 'REIMBURSABLE', subtitle: 'Will be reimbursed by employer/client' },
    { label: 'Business Owned', value: 'BUSINESS_OWNED', subtitle: 'Own business expense (tax deduction)' },
  ];

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

  // Handle receipt photo selection
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

  // Handle taking receipt photo
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

  // Remove receipt image
  const handleRemoveReceipt = (index: number) => {
    setReceiptImages(receiptImages.filter((_, i) => i !== index));
  };

  // Save transaction
  const handleSave = async () => {
    // Validate
    const error = validateForm();
    if (error) {
      showAlert('Validation Error', error);
      return;
    }

    if (!user) {
      showAlert('Error', 'User not authenticated');
      return;
    }

    setSaving(true);
    try {
      // Get business info if selected
      let businessName: string | undefined;
      let selectedBusiness: Business | undefined;
      if (isBusiness && selectedBusinessId) {
        selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
        if (selectedBusiness) {
          businessName = selectedBusiness.name;
        }
      }

      // Create transaction ID first (needed for receipt upload)
      const transactionId = uuidv4();

      // Upload receipts if any
      let receiptUrls: string[] = [];
      if (receiptImages.length > 0) {
        setUploadingReceipts(true);
        try {
          receiptUrls = await uploadReceipts(receiptImages, transactionId, user.default_household_id!);
          console.log(`✅ Uploaded ${receiptUrls.length} receipt(s)`);
        } catch (error: any) {
          console.error('❌ Failed to upload receipts:', error);
          
          // Check if it's a CORS/configuration error
          const errorMessage = error?.message || String(error);
          const isCorsError = errorMessage.includes('CORS') || 
                            errorMessage.includes('blocked by CORS') ||
                            errorMessage.includes('preflight');
          
          if (isCorsError) {
            // CORS error means Firebase Storage is not configured
            showAlert(
              'Receipt Upload Failed',
              'Receipt upload failed due to Firebase Storage CORS configuration.\n\n' +
              'The transaction will be saved without receipts.\n\n' +
              'To enable receipt uploads, configure Firebase Storage:\n' +
              '1. Go to Firebase Console → Storage → Rules\n' +
              '2. Add security rules (see docs/security/firebase-storage-rules.md)\n' +
              '3. Configure CORS for localhost:8081\n\n' +
              'You can add receipts later by editing this transaction.'
            );
          } else {
            // Other error - just warn and continue
            showAlert(
              'Receipt Upload Failed',
              'Transaction will be saved without receipts. You can add receipts later by editing the transaction.'
            );
          }
        } finally {
          setUploadingReceipts(false);
        }
      }

      // Create transaction
      const transaction = createTransaction({
        id: transactionId,
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

      // Set business expense fields
      transaction.is_business = isBusiness;
      if (isBusiness && selectedBusinessId && selectedBusiness) {
        transaction.business_id = selectedBusinessId;
        const typeLabel = selectedBusiness.type === 'EMPLOYER' ? 'Employer' : selectedBusiness.type === 'CLIENT' ? 'Client' : 'Business';
        transaction.reimbursement_target = businessName ? `${typeLabel}: ${businessName}` : undefined;
      }
      if (isBusiness && reimbursementType) {
        transaction.reimbursement_type = reimbursementType as ReimbursementType;
      }

      // Set receipt fields
      transaction.has_receipt = receiptUrls.length > 0;
      transaction.receipt_count = receiptUrls.length;
      transaction.receipt_urls = receiptUrls.length > 0 ? receiptUrls : undefined;

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

      // Navigate back immediately after successful save
      router.back();
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
      showAlert('Error', 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Add Transaction" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader title="Add Transaction" showBack />

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ padding: SPACING[4] }}>
            {/* Transaction Type Toggle */}
            <Card padding="md" style={{ marginBottom: SPACING[4] }}>
              <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[2] }}>
                Transaction Type
              </AppText>
              <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
                <TouchableOpacity
                  onPress={() => {
                    setType('EXPENSE');
                    setSelectedCategoryId(''); // Reset category
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING[3],
                    paddingHorizontal: SPACING[4],
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
                  onPress={() => {
                    setType('INCOME');
                    setSelectedCategoryId(''); // Reset category
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING[3],
                    paddingHorizontal: SPACING[4],
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
            onSelect={setSelectedAccountId}
            options={accountOptions}
            placeholder="Select account"
          />

          {/* Category */}
          <SearchableSelect
            label="Category *"
            value={selectedCategoryId}
            onSelect={setSelectedCategoryId}
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

          {/* Business Expense Section - Only for EXPENSE type */}
          {type === 'EXPENSE' && (
            <Card padding="md" style={{ marginBottom: SPACING[4] }}>
              <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[3] }}>
                Business Expense
              </AppText>
              
              {/* Is Business Toggle */}
              <TouchableOpacity
                onPress={() => {
                  setIsBusiness(!isBusiness);
                  if (!isBusiness) {
                    // When enabling, set default reimbursement type if business selected
                    if (selectedBusinessId) {
                      const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
                      if (selectedBusiness) {
                        setReimbursementType(selectedBusiness.default_reimbursement_type);
                      }
                    }
                  } else {
                    // When disabling, clear business fields
                    setSelectedBusinessId('');
                    setReimbursementType(undefined);
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: SPACING[2],
                  marginBottom: isBusiness ? SPACING[3] : 0,
                }}
              >
                <AppText variant="body">This is a business expense</AppText>
                <View
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
                      transform: [{ translateX: isBusiness ? 20 : 0 }],
                    }}
                  />
                </View>
              </TouchableOpacity>

              {/* Business Selector - Show if isBusiness is true */}
              {isBusiness && (
                <>
                  {businesses.length > 0 ? (
                    <SearchableSelect
                      label="Business/Employer *"
                      value={selectedBusinessId}
                      onSelect={(value) => {
                        setSelectedBusinessId(value);
                        // Auto-set reimbursement type from business default
                        const selectedBusiness = businesses.find(b => b.id === value);
                        if (selectedBusiness) {
                          setReimbursementType(selectedBusiness.default_reimbursement_type);
                        }
                      }}
                      options={businessOptions}
                      placeholder="Select business or employer"
                      style={{ marginBottom: SPACING[3] }}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => router.push('/businesses/add')}
                      style={{
                        padding: SPACING[3],
                        borderRadius: BORDER_RADIUS.sm,
                        borderWidth: 1,
                        borderColor: theme.border.default,
                        borderStyle: 'dashed',
                        marginBottom: SPACING[3],
                      }}
                    >
                      <AppText variant="body" color={theme.interactive.primary} style={{ textAlign: 'center' }}>
                        + Add Business/Employer
                      </AppText>
                    </TouchableOpacity>
                  )}

                  {/* Reimbursement Type - Show if business selected */}
                  {selectedBusinessId && (
                    <SearchableSelect
                      label="Reimbursement Type *"
                      value={reimbursementType || ''}
                      onSelect={(value) => setReimbursementType(value as 'REIMBURSABLE' | 'BUSINESS_OWNED')}
                      options={reimbursementTypeOptions}
                      placeholder="Select reimbursement type"
                    />
                  )}
                </>
              )}
            </Card>
          )}

          {/* Date - Future: Add date picker */}
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[1] }}>
              Date
            </AppText>
            <AppText variant="body">
              {transactionDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </AppText>
          </Card>

          {/* Receipt Photos */}
          <Card padding="md" style={{ marginBottom: SPACING[4] }}>
            <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[3] }}>
              Receipt Photos ({receiptImages.length})
            </AppText>

            {/* Receipt Images Grid */}
            {receiptImages.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING[3] }}>
                {receiptImages.map((image, index) => (
                  <View key={index} style={{ position: 'relative', width: 100, height: 100, marginRight: SPACING[2], marginBottom: SPACING[2] }}>
                    <Image
                      source={{ uri: image.uri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: BORDER_RADIUS.sm,
                        backgroundColor: theme.background.secondary,
                      }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveReceipt(index)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: theme.status.error,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <IconSymbol name="xmark" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Receipt Buttons */}
            <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
              <OutlineButton
                title="📷 Take Photo"
                onPress={handleTakeReceiptPhoto}
                size="sm"
                style={{ flex: 1 }}
              />
              <OutlineButton
                title="📁 Choose from Gallery"
                onPress={handleAddReceipt}
                size="sm"
                style={{ flex: 1 }}
              />
            </View>
          </Card>

          {/* Save Button */}
          <PrimaryButton
            title={
              uploadingReceipts
                ? 'Uploading Receipts...'
                : saving
                ? 'Saving...'
                : 'Save Transaction'
            }
            onPress={handleSave}
            disabled={saving || uploadingReceipts}
            loading={saving || uploadingReceipts}
            fullWidth
            size="lg"
          />

          <OutlineButton
            title="Cancel"
            onPress={() => router.back()}
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

