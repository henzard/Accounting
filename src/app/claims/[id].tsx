// Claim Detail Screen - View reimbursement claim details
// Shows claim information, status, transactions, and amounts

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert } from '@/shared/utils/alert';
import {
  ScreenHeader,
  Card,
  AppText,
  ScreenWrapper,
} from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreReimbursementClaimRepository } from '@/data/repositories/FirestoreReimbursementClaimRepository';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { ReimbursementClaim, ClaimStatus, Transaction } from '@/domain/entities';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STATUS_COLORS: Record<ClaimStatus, string> = {
  DRAFT: '#9E9E9E',
  SUBMITTED: '#1976D2',
  APPROVED: '#2E7D32',
  PAID: '#1B5E20',
  PARTIALLY_PAID: '#F9A825',
  REJECTED: '#C62828',
};

const STATUS_LABELS: Record<ClaimStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  REJECTED: 'Rejected',
};

export default function ClaimDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const claimId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [claim, setClaim] = useState<ReimbursementClaim | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  const [hasLoaded, setHasLoaded] = useState(false);

  const claimRepo = new FirestoreReimbursementClaimRepository();
  const transactionRepo = new FirestoreTransactionRepository();

  useEffect(() => {
    if (!user?.default_household_id || !claimId || hasLoaded) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setHasLoaded(true);

        // Load household currency
        const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
        if (householdDoc.exists()) {
          setHouseholdCurrency((householdDoc.data().currency as CurrencyCode) || 'USD');
        }

        // Load claim
        const clm = await claimRepo.getClaimById(claimId);
        if (!clm) {
          showAlert('Error', 'Claim not found');
          router.back();
          return;
        }

        // Verify claim belongs to user's household
        if (clm.household_id !== user.default_household_id) {
          showAlert('Permission Denied', 'You do not have access to this claim');
          router.back();
          return;
        }

        setClaim(clm);

        // Load transactions
        const txns = await Promise.all(
          clm.transaction_ids.map(async (txId) => {
            try {
              const tx = await transactionRepo.getTransaction(txId);
              return tx;
            } catch (error) {
              console.error(`Error loading transaction ${txId}:`, error);
              return null;
            }
          })
        );

        const validTransactions = txns.filter((tx): tx is Transaction => tx !== null);
        setTransactions(validTransactions);
      } catch (error) {
        console.error('❌ Failed to load claim:', error);
        showAlert('Error', 'Failed to load claim');
        setHasLoaded(false); // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [claimId, user?.default_household_id, hasLoaded]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Claim Details" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!claim) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Claim Details" showBack />
        <View style={styles.loadingContainer}>
          <AppText variant="body" color={theme.text.secondary}>
            Claim not found
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  const statusColor = STATUS_COLORS[claim.status];
  const isPaid = claim.status === 'PAID' || claim.status === 'PARTIALLY_PAID';

  return (
    <ScreenWrapper>
      <ScreenHeader title="Claim Details" showBack />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Status Card */}
          <Card padding="md" style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <AppText variant="h2">{claim.name}</AppText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + '20' },
                ]}
              >
                <AppText variant="caption" style={{ color: statusColor, fontWeight: '600' }}>
                  {STATUS_LABELS[claim.status]}
                </AppText>
              </View>
            </View>
            <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[2] }}>
              {claim.business_name}
            </AppText>
          </Card>

          {/* Amount Card */}
          <Card padding="lg" style={styles.amountCard}>
            <AppText variant="display" style={{ fontVariant: ['tabular-nums'] }}>
              {formatCurrency(claim.total_amount, householdCurrency)}
            </AppText>
            <AppText variant="caption" color={theme.text.secondary} style={{ marginTop: SPACING[2] }}>
              Total Claim Amount
            </AppText>
            {isPaid && (
              <View style={{ marginTop: SPACING[4] }}>
                <AppText variant="body" color={theme.text.secondary}>
                  Paid: {formatCurrency(claim.paid_amount, householdCurrency)}
                </AppText>
                {claim.status === 'PARTIALLY_PAID' && (
                  <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[1] }}>
                    Remaining: {formatCurrency(claim.total_amount - claim.paid_amount, householdCurrency)}
                  </AppText>
                )}
              </View>
            )}
          </Card>

          {/* Details Card */}
          <Card padding="md" style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                PERIOD
              </AppText>
              <AppText variant="body">
                {formatDate(claim.period_start)} - {formatDate(claim.period_end)}
              </AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                BUSINESS
              </AppText>
              <AppText variant="body">{claim.business_name}</AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                TRANSACTIONS
              </AppText>
              <AppText variant="body">
                {claim.transaction_ids.length} expense{claim.transaction_ids.length !== 1 ? 's' : ''}
              </AppText>
            </View>

            {claim.submitted_at && (
              <View style={styles.detailRow}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                  SUBMITTED
                </AppText>
                <AppText variant="body">{formatDate(claim.submitted_at)}</AppText>
              </View>
            )}

            {claim.approved_at && (
              <View style={styles.detailRow}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                  APPROVED
                </AppText>
                <AppText variant="body">{formatDate(claim.approved_at)}</AppText>
              </View>
            )}

            {claim.paid_at && (
              <View style={styles.detailRow}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                  PAID
                </AppText>
                <AppText variant="body">{formatDate(claim.paid_at)}</AppText>
              </View>
            )}

            {claim.rejection_reason && (
              <View style={styles.detailRow}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                  REJECTION REASON
                </AppText>
                <AppText variant="body" color={theme.status.error}>
                  {claim.rejection_reason}
                </AppText>
              </View>
            )}

            {claim.notes && (
              <View style={styles.detailRow}>
                <AppText variant="overline" color={theme.text.tertiary} style={{ marginBottom: SPACING[1] }}>
                  NOTES
                </AppText>
                <AppText variant="body">{claim.notes}</AppText>
              </View>
            )}
          </Card>

          {/* Transactions Card */}
          <Card padding="md" style={styles.transactionsCard}>
            <AppText variant="h3" style={{ marginBottom: SPACING[4] }}>
              Transactions ({transactions.length})
            </AppText>

            {transactions.length === 0 ? (
              <AppText variant="body" color={theme.text.secondary}>
                No transactions found
              </AppText>
            ) : (
              transactions.map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => router.push(`/transactions/${tx.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionRow}>
                    <View style={styles.transactionInfo}>
                      <AppText variant="bodyEmphasis">
                        {tx.payee || 'No payee'}
                      </AppText>
                      <AppText variant="caption" color={theme.text.secondary}>
                        {formatDate(tx.date)}
                      </AppText>
                    </View>
                    <View style={styles.transactionAmount}>
                      <AppText variant="bodyEmphasis" style={{ fontVariant: ['tabular-nums'] }}>
                        {formatCurrency(tx.amount, householdCurrency)}
                      </AppText>
                      <IconSymbol
                        name="chevron.right"
                        size={16}
                        color={theme.text.tertiary}
                        style={{ marginLeft: SPACING[2] }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING[4],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[8],
  },
  statusCard: {
    marginBottom: SPACING[4],
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  amountCard: {
    marginBottom: SPACING[4],
    alignItems: 'center',
  },
  detailsCard: {
    marginBottom: SPACING[4],
  },
  detailRow: {
    marginBottom: SPACING[4],
  },
  transactionsCard: {
    marginBottom: SPACING[4],
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
