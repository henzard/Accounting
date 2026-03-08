// useTransactionForm Hook
// Encapsulates all form state, data loading, validation, and submission logic
// for the Add Transaction screen.

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/infrastructure/auth';
import { showAlert } from '@/shared/utils/alert';
import { logger } from '@/shared/utils/logger';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { FirestoreAccountRepository } from '@/data/repositories/FirestoreAccountRepository';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { FirestoreBusinessRepository } from '@/data/repositories/FirestoreBusinessRepository';
import { FirestoreHouseholdRepository } from '@/data/repositories/FirestoreHouseholdRepository';
import { Transaction, TransactionType, ReimbursementType, createTransaction } from '@/domain/entities/Transaction';
import { Account } from '@/domain/entities/Account';
import { Business } from '@/domain/entities/Business';
import { MasterCategory, CATEGORY_GROUP_INFO } from '@/shared/constants/budget-categories';
import { SelectOption } from '@/shared/types';
import { CurrencyCode } from '@/shared/utils/currency';
import { pickReceiptImage, takeReceiptPhoto, uploadReceipts, ReceiptImage } from '@/shared/utils/receipt-upload';
import { v4 as uuidv4 } from 'uuid';

const REIMBURSEMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Reimbursable', value: 'REIMBURSABLE', subtitle: 'Will be reimbursed by employer/client' },
  { label: 'Business Owned', value: 'BUSINESS_OWNED', subtitle: 'Own business expense (tax deduction)' },
];

export function useTransactionForm() {
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountInCents, setAmountInCents] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [payee, setPayee] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate] = useState(new Date());

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

  const accountRepo = useMemo(() => new FirestoreAccountRepository(), []);
  const transactionRepo = useMemo(() => new FirestoreTransactionRepository(), []);
  const budgetRepo = useMemo(() => new FirestoreBudgetRepository(), []);
  const businessRepo = useMemo(() => new FirestoreBusinessRepository(), []);
  const householdRepo = useMemo(() => new FirestoreHouseholdRepository(), []);

  // isMounted guard
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset category when group changes
  useEffect(() => {
    setSelectedCategoryId('');
  }, [selectedCategoryGroup]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      if (!user?.default_household_id) return;

      try {
        setLoading(true);

        const [household, accts, biz] = await Promise.all([
          householdRepo.getHouseholdById(user.default_household_id),
          accountRepo.getAccountsByHousehold(user.default_household_id),
          businessRepo.getBusinessesByHousehold(user.default_household_id),
        ]);

        if (!isMountedRef.current) return;

        if (household?.currency) {
          setHouseholdCurrency(household.currency as CurrencyCode);
        }

        setAccounts(accts);
        if (accts.length > 0) {
          setSelectedAccountId(accts[0].id);
        }

        setBusinesses(biz);

        const cats = await budgetRepo.getMasterCategoriesByHousehold(user.default_household_id);

        if (!isMountedRef.current) return;

        if (cats.length === 0) {
          const { getDefaultCategories } = await import('@/shared/constants/budget-categories');
          setCategories(getDefaultCategories());
        } else {
          setCategories(cats);
        }
      } catch (error) {
        logger.error('Failed to load transaction form data', error);
        if (isMountedRef.current) {
          showAlert('Error', 'Failed to load accounts and categories');
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    }

    loadData();
  }, [user?.default_household_id]);

  // Derived options
  const accountOptions: SelectOption[] = useMemo(() =>
    accounts.map((account) => ({
      label: account.name,
      value: account.id,
      subtitle: account.account_type,
    })),
    [accounts]
  );

  const categoryGroupOptions: SelectOption[] = useMemo(() => {
    const filtered = categories.filter((cat) =>
      type === 'INCOME' ? cat.group === 'INCOME' : cat.group !== 'INCOME'
    );
    const uniqueGroups = [...new Set(filtered.map(cat => cat.group))];
    return uniqueGroups.map(group => ({
      label: CATEGORY_GROUP_INFO[group]?.name || group,
      value: group,
      subtitle: CATEGORY_GROUP_INFO[group]?.recommendedPercent,
    }));
  }, [categories, type]);

  const categoryOptions: SelectOption[] = useMemo(() => {
    if (!selectedCategoryGroup) return [];
    return categories
      .filter((cat) => cat.group === selectedCategoryGroup)
      .map((cat) => ({ label: cat.name, value: cat.id, subtitle: cat.icon }));
  }, [categories, selectedCategoryGroup]);

  const businessOptions: SelectOption[] = useMemo(() =>
    businesses.map((business) => ({
      label: business.name,
      value: business.id,
      subtitle: business.type === 'EMPLOYER' ? 'Employer' : business.type === 'CLIENT' ? 'Client' : 'Own Business',
    })),
    [businesses]
  );

  const reimbursementTypeOptions = REIMBURSEMENT_TYPE_OPTIONS;

  // Validation
  const validateForm = useCallback((): string | null => {
    if (amountInCents <= 0) return 'Please enter an amount greater than zero';
    if (!selectedAccountId) return 'Please select an account';
    if (!selectedCategoryId) return 'Please select a category';
    if (!payee.trim()) return 'Please enter a payee';
    return null;
  }, [amountInCents, selectedAccountId, selectedCategoryId, payee]);

  // Receipt handlers
  const handleAddReceipt = useCallback(async () => {
    try {
      const image = await pickReceiptImage();
      if (image) {
        setReceiptImages(prev => [...prev, image]);
      }
    } catch (error) {
      logger.error('Error selecting receipt', error);
      showAlert('Error', 'Failed to select receipt photo');
    }
  }, []);

  const handleTakeReceiptPhoto = useCallback(async () => {
    try {
      const image = await takeReceiptPhoto();
      if (image) {
        setReceiptImages(prev => [...prev, image]);
      }
    } catch (error) {
      logger.error('Error taking receipt photo', error);
      showAlert('Error', 'Failed to take receipt photo');
    }
  }, []);

  const handleRemoveReceipt = useCallback((index: number) => {
    setReceiptImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Business toggle
  const handleToggleBusiness = useCallback(() => {
    setIsBusiness(prev => {
      const next = !prev;
      if (!next) {
        setSelectedBusinessId('');
        setReimbursementType(undefined);
      }
      return next;
    });
  }, []);

  const handleSelectBusiness = useCallback((value: string) => {
    setSelectedBusinessId(value);
    const biz = businesses.find(b => b.id === value);
    if (biz) {
      setReimbursementType(biz.default_reimbursement_type);
    }
  }, [businesses]);

  // Type toggle
  const handleSetType = useCallback((newType: TransactionType) => {
    setType(newType);
    setSelectedCategoryId('');
  }, []);

  // Save
  const handleSave = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      showAlert('Validation Error', validationError);
      return;
    }

    if (!user) {
      showAlert('Error', 'User not authenticated');
      return;
    }

    if (!user.default_household_id) {
      showAlert('Error', 'No household selected. Please select a household first.');
      return;
    }

    setSaving(true);
    try {
      const transactionId = uuidv4();

      // Upload receipts if any
      let receiptUrls: string[] = [];
      if (receiptImages.length > 0) {
        setUploadingReceipts(true);
        try {
          receiptUrls = await uploadReceipts(receiptImages, transactionId, user.default_household_id);
          logger.info(`Uploaded ${receiptUrls.length} receipt(s)`);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isCorsError = errorMessage.includes('CORS') ||
            errorMessage.includes('blocked by CORS') ||
            errorMessage.includes('preflight');

          if (isCorsError) {
            logger.warn('Receipt upload blocked by CORS policy');
          }
          showAlert(
            'Receipt Upload Failed',
            'Receipt upload is temporarily unavailable. The transaction will be saved without receipts. You can add receipts later by editing this transaction.'
          );
          logger.error('Failed to upload receipts', error);
        } finally {
          setUploadingReceipts(false);
        }
      }

      // Get business info if selected
      let businessName: string | undefined;
      let selectedBusiness: Business | undefined;
      if (isBusiness && selectedBusinessId) {
        selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
        if (selectedBusiness) {
          businessName = selectedBusiness.name;
        }
      }

      // Build transaction entity
      const transaction = createTransaction({
        id: transactionId,
        household_id: user.default_household_id,
        type,
        date: transactionDate,
        amount: amountInCents,
        account_id: selectedAccountId,
        category_id: selectedCategoryId,
        payee: payee.trim(),
        notes: notes.trim() || undefined,
        created_by: user.id,
        created_by_device: 'mobile-app',
      });

      transaction.is_business = isBusiness;
      if (isBusiness && selectedBusinessId && selectedBusiness) {
        transaction.business_id = selectedBusinessId;
        const typeLabel = selectedBusiness.type === 'EMPLOYER'
          ? 'Employer'
          : selectedBusiness.type === 'CLIENT'
          ? 'Client'
          : 'Business';
        transaction.reimbursement_target = businessName ? `${typeLabel}: ${businessName}` : undefined;
      }
      if (isBusiness && reimbursementType) {
        transaction.reimbursement_type = reimbursementType as ReimbursementType;
      }

      transaction.has_receipt = receiptUrls.length > 0;
      transaction.receipt_count = receiptUrls.length;
      transaction.receipt_urls = receiptUrls.length > 0 ? receiptUrls : undefined;

      await transactionRepo.createTransaction(transaction);
      logger.info('Transaction created', { transactionId: transaction.id });

      // Update budget category actual amount
      if (selectedCategoryId) {
        try {
          const now = new Date();
          const budget = await budgetRepo.getBudgetByMonth(
            user.default_household_id,
            now.getMonth() + 1,
            now.getFullYear()
          );

          if (budget) {
            const categoryIndex = budget.categories.findIndex((c) => c.category_id === selectedCategoryId);
            if (categoryIndex >= 0) {
              const currentActual = budget.categories[categoryIndex].actual_amount || 0;
              const newActual = currentActual + amountInCents;
              await budgetRepo.updateCategoryActualAmount(budget.id, selectedCategoryId, newActual);
            }
          }
        } catch (error) {
          logger.warn('Failed to update budget category actual amount', { categoryId: selectedCategoryId });
        }
      }

      router.back();
    } catch (error) {
      logger.error('Failed to save transaction', error);
      showAlert('Error', 'Failed to save transaction');
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  }, [
    validateForm, user, receiptImages, isBusiness, selectedBusinessId, businesses,
    reimbursementType, type, transactionDate, amountInCents, selectedAccountId,
    selectedCategoryId, payee, notes, transactionRepo, budgetRepo, router,
  ]);

  return {
    // Form state
    type, setType: handleSetType,
    amountInCents, setAmountInCents,
    selectedAccountId, setSelectedAccountId,
    selectedCategoryGroup, setSelectedCategoryGroup,
    selectedCategoryId, setSelectedCategoryId,
    payee, setPayee,
    notes, setNotes,
    transactionDate,
    // Business state
    isBusiness, handleToggleBusiness,
    selectedBusinessId, handleSelectBusiness,
    reimbursementType,
    setReimbursementType: (v: 'REIMBURSABLE' | 'BUSINESS_OWNED') => setReimbursementType(v),
    // Receipt state
    receiptImages, uploadingReceipts,
    handleAddReceipt, handleTakeReceiptPhoto, handleRemoveReceipt,
    // Data
    accounts, categories, businesses, loading, saving,
    householdCurrency,
    // Derived options
    accountOptions, categoryGroupOptions, categoryOptions,
    businessOptions, reimbursementTypeOptions,
    // Actions
    handleSave,
  };
}
