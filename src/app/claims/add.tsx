// Add Claim Screen - Create a new reimbursement claim
// Select business, period, and transactions to include

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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert } from '@/shared/utils/alert';
import {
  ScreenHeader,
  Input,
  SearchableSelect,
  Card,
  PrimaryButton,
  OutlineButton,
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreReimbursementClaimRepository } from '@/data/repositories/FirestoreReimbursementClaimRepository';
import { FirestoreBusinessRepository } from '@/data/repositories/FirestoreBusinessRepository';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { createReimbursementClaim } from '@/domain/entities';
import { Business } from '@/domain/entities';
import { Transaction } from '@/domain/entities';
import { SelectOption } from '@/shared/types';
import { doc, getDoc, query, where, getDocs, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AddClaimScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [claimName, setClaimName] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [availableTransactions, setAvailableTransactions] = useState<Transaction[]>([]);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const claimRepo = new FirestoreReimbursementClaimRepository();
  const businessRepo = new FirestoreBusinessRepository();
  const transactionRepo = new FirestoreTransactionRepository();

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

        // Load businesses
        const biz = await businessRepo.getBusinessesByHousehold(user.default_household_id);
        setBusinesses(biz);

        // Load all transactions (we'll filter by business when one is selected)
        const allTransactions = await transactionRepo.getTransactionsByHousehold(user.default_household_id, 1000);
        
        console.log('📊 Total transactions loaded:', allTransactions.length);
        console.log('📊 Sample transaction:', allTransactions[0] ? {
          id: allTransactions[0].id,
          is_business: allTransactions[0].is_business,
          reimbursement_type: allTransactions[0].reimbursement_type,
          business_id: allTransactions[0].business_id,
          reimbursement_claim_id: allTransactions[0].reimbursement_claim_id,
        } : 'No transactions');
        
        // Filter for unclaimed business expenses
        const unclaimed = allTransactions.filter(
          (tx) =>
            tx.is_business &&
            tx.reimbursement_type === 'REIMBURSABLE' &&
            !tx.reimbursement_claim_id
        );
        
        console.log('📊 Unclaimed business expenses (all businesses):', unclaimed.length);
        console.log('📊 Unclaimed transactions:', unclaimed.map(tx => ({
          id: tx.id,
          payee: tx.payee,
          business_id: tx.business_id,
          amount: tx.amount,
        })));
        
        setAvailableTransactions(unclaimed);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        showAlert('Error', 'Failed to load businesses and transactions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.default_household_id]);

  // Filter transactions when business is selected
  const filteredTransactions = selectedBusinessId
    ? availableTransactions.filter((tx) => {
        const matches = tx.business_id === selectedBusinessId;
        if (!matches && tx.is_business && tx.reimbursement_type === 'REIMBURSABLE') {
          console.log('🔍 Transaction filtered out:', {
            txId: tx.id,
            txBusinessId: tx.business_id,
            selectedBusinessId,
            matches: tx.business_id === selectedBusinessId,
          });
        }
        return matches;
      })
    : [];

  // Debug logging when business is selected
  useEffect(() => {
    if (selectedBusinessId) {
      console.log('🔍 Selected business ID:', selectedBusinessId);
      console.log('🔍 Available transactions (all businesses):', availableTransactions.length);
      console.log('🔍 Filtered transactions (this business):', filteredTransactions.length);
      console.log('🔍 Available transaction business IDs:', [...new Set(availableTransactions.map(tx => tx.business_id))]);
    }
  }, [selectedBusinessId, availableTransactions.length, filteredTransactions.length]);

  // Calculate total from selected transactions
  const totalAmount = Array.from(selectedTransactionIds).reduce((sum, txId) => {
    const tx = availableTransactions.find((t) => t.id === txId);
    return sum + (tx?.amount || 0);
  }, 0);

  const businessOptions: SelectOption[] = businesses.map((biz) => ({
    label: biz.name,
    value: biz.id,
    subtitle: biz.type.replace('_', ' '),
  }));

  const validateForm = (): string | null => {
    if (!claimName.trim()) {
      return 'Please enter a claim name';
    }
    if (!selectedBusinessId) {
      return 'Please select a business';
    }
    if (selectedTransactionIds.size === 0) {
      return 'Please select at least one transaction';
    }
    return null;
  };

  const handleSave = async () => {
    console.log('🔵 Create Claim button clicked');
    console.log('🔵 Form state:', {
      claimName,
      selectedBusinessId,
      selectedTransactionIds: Array.from(selectedTransactionIds),
      selectedTransactionIdsSize: selectedTransactionIds.size,
    });

    const error = validateForm();
    if (error) {
      console.log('🔵 Validation error:', error);
      showAlert('Validation Error', error);
      return;
    }

    if (!user?.default_household_id) {
      console.log('🔵 Error: No household selected');
      showAlert('Error', 'No household selected');
      return;
    }

    const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
    if (!selectedBusiness) {
      console.log('🔵 Error: Selected business not found');
      showAlert('Error', 'Selected business not found');
      return;
    }

    console.log('🔵 All validations passed, starting save...');
    setSaving(true);
    try {
      console.log('🔵 Calculating claim total...');
      // Calculate total from selected transactions
      const calculatedTotal = await claimRepo.calculateClaimTotal(Array.from(selectedTransactionIds));
      console.log('🔵 Calculated total:', calculatedTotal);

      console.log('🔵 Creating claim object...');
      const claim = createReimbursementClaim({
        id: uuidv4(),
        household_id: user.default_household_id,
        name: claimName.trim(),
        business_id: selectedBusinessId,
        business_name: selectedBusiness.name,
        period_start: periodStart,
        period_end: periodEnd,
        created_by: user.id,
        transaction_ids: Array.from(selectedTransactionIds),
        notes: notes.trim() || undefined,
      });

      // Update total_amount
      claim.total_amount = calculatedTotal;
      console.log('🔵 Claim object created:', {
        id: claim.id,
        name: claim.name,
        business_id: claim.business_id,
        transaction_ids: claim.transaction_ids.length,
        total_amount: claim.total_amount,
      });

      console.log('🔵 Saving claim to Firestore...');
      await claimRepo.createClaim(claim);
      console.log('✅ Claim saved to Firestore');

      // Update transactions to link them to this claim
      console.log('🔵 Updating transactions to link to claim...');
      for (const txId of selectedTransactionIds) {
        console.log('🔵 Updating transaction:', txId);
        const tx = await transactionRepo.getTransaction(txId);
        if (tx) {
          tx.reimbursement_claim_id = claim.id;
          tx.updated_at = new Date();
          await transactionRepo.updateTransaction(tx);
          console.log('✅ Transaction updated:', txId);
        } else {
          console.warn('⚠️ Transaction not found:', txId);
        }
      }

      console.log('✅ All transactions updated, navigating back...');
      // Navigate back immediately after successful save
      router.back();
    } catch (error: any) {
      console.error('❌ Failed to save claim:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error?.message || 'Failed to save claim';
      showAlert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const toggleTransaction = (txId: string) => {
    const newSet = new Set(selectedTransactionIds);
    if (newSet.has(txId)) {
      newSet.delete(txId);
    } else {
      newSet.add(txId);
    }
    setSelectedTransactionIds(newSet);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Create Claim" showBack />
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
        <ScreenHeader title="Create Claim" showBack />

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ padding: SPACING[4] }}>
            <Input
              label="Claim Name *"
              value={claimName}
              onChangeText={setClaimName}
              placeholder="e.g., March 2024 ACME Expenses"
              autoCapitalize="words"
            />

            <View style={{ height: SPACING[4] }} />

            <SearchableSelect
              label="Business/Employer *"
              value={selectedBusinessId}
              onSelect={setSelectedBusinessId}
              options={businessOptions}
              placeholder="Select business or employer"
            />

            {businesses.length === 0 && (
              <Card padding="md" style={{ marginTop: SPACING[2], marginBottom: SPACING[4] }}>
                <AppText variant="caption" color={theme.text.secondary}>
                  No businesses found. Please add a business first.
                </AppText>
              </Card>
            )}

            {selectedBusinessId && filteredTransactions.length === 0 && (
              <Card padding="md" style={{ marginTop: SPACING[2], marginBottom: SPACING[4] }}>
                <AppText variant="caption" color={theme.text.secondary} style={{ marginBottom: SPACING[2] }}>
                  No unclaimed expenses found for this business.
                </AppText>
                {availableTransactions.length > 0 && (
                  <AppText variant="caption" color={theme.text.tertiary}>
                    Found {availableTransactions.length} unclaimed expense(s) for other businesses. Make sure the transaction's business_id matches the selected business.
                  </AppText>
                )}
                {availableTransactions.length === 0 && (
                  <AppText variant="caption" color={theme.text.tertiary}>
                    Mark transactions as business expenses with reimbursement type "REIMBURSABLE" first.
                  </AppText>
                )}
              </Card>
            )}

            {selectedBusinessId && filteredTransactions.length > 0 && (
              <>
                <View style={{ height: SPACING[4] }} />
                <AppText variant="h4" style={{ marginBottom: SPACING[2] }}>
                  Select Transactions ({selectedTransactionIds.size} selected)
                </AppText>
                <AppText variant="caption" color={theme.text.secondary} style={{ marginBottom: SPACING[3] }}>
                  Select the expenses to include in this claim
                </AppText>

                {filteredTransactions.map((tx) => {
                  const isSelected = selectedTransactionIds.has(tx.id);
                  return (
                    <TouchableOpacity
                      key={tx.id}
                      onPress={() => toggleTransaction(tx.id)}
                      style={[
                        styles.transactionItem,
                        {
                          backgroundColor: isSelected
                            ? theme.interactive.primary + '20'
                            : theme.surface.default,
                          borderColor: isSelected ? theme.interactive.primary : theme.border.default,
                        },
                      ]}
                    >
                      <View style={styles.transactionInfo}>
                        <AppText variant="bodyEmphasis">
                          {tx.payee || 'No payee'}
                        </AppText>
                        <AppText variant="caption" color={theme.text.secondary}>
                          {formatDate(tx.date)}
                        </AppText>
                      </View>
                      <View style={styles.transactionRight}>
                        <AppText variant="bodyEmphasis">
                          {formatCurrency(tx.amount, householdCurrency)}
                        </AppText>
                        {isSelected && (
                          <IconSymbol
                            name="checkmark.circle.fill"
                            size={20}
                            color={theme.interactive.primary}
                            style={{ marginLeft: SPACING[2] }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {selectedTransactionIds.size > 0 && (
              <Card padding="md" style={{ marginTop: SPACING[4], marginBottom: SPACING[4] }}>
                <View style={styles.totalRow}>
                  <AppText variant="h3">Total Claim Amount:</AppText>
                  <AppText variant="h3" style={{ color: theme.interactive.primary }}>
                    {formatCurrency(totalAmount, householdCurrency)}
                  </AppText>
                </View>
              </Card>
            )}

            <View style={{ height: SPACING[4] }} />

            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes about this claim"
              multiline
              numberOfLines={3}
            />

            <PrimaryButton
              title={saving ? 'Creating...' : 'Create Claim'}
              onPress={() => {
                console.log('🔵🔵🔵 CREATE CLAIM BUTTON PRESSED 🔵🔵🔵');
                console.log('🔵 Button state:', {
                  saving,
                  businessesLength: businesses.length,
                  disabled: saving || businesses.length === 0,
                });
                if (!saving && businesses.length > 0) {
                  handleSave();
                } else {
                  console.log('🔵 Button is disabled:', { saving, businessesLength: businesses.length });
                }
              }}
              disabled={saving || businesses.length === 0}
              loading={saving}
              fullWidth
              size="lg"
              style={{ marginTop: SPACING[4] }}
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

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING[2],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
