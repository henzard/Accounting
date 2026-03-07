// Claims Screen - List all reimbursement claims
// View, filter, and manage expense reimbursement claims

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import {
  ScreenHeader,
  Card,
  AppText,
  ScreenWrapper,
  PrimaryButton,
} from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreReimbursementClaimRepository } from '@/data/repositories/FirestoreReimbursementClaimRepository';
import { ReimbursementClaim, ClaimStatus } from '@/domain/entities';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STATUS_LABELS: Record<ClaimStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  REJECTED: 'Rejected',
};

export default function ClaimsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const claimRepo = useMemo(() => new FirestoreReimbursementClaimRepository(), []);
  const statusColors: Record<ClaimStatus, string> = useMemo(
    () => ({
      DRAFT: theme.text.tertiary,
      SUBMITTED: theme.status.info,
      APPROVED: theme.status.success,
      PAID: theme.status.success,
      PARTIALLY_PAID: theme.status.warning,
      REJECTED: theme.status.error,
    }),
    [theme]
  );

  const loadClaims = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      // Load household currency
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      if (householdDoc.exists()) {
        setHouseholdCurrency((householdDoc.data().currency as CurrencyCode) || 'USD');
      }

      const clms = await claimRepo.getClaimsByHousehold(user.default_household_id);
      setClaims(clms);
    } catch (error) {
      console.error('❌ Failed to load claims:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.default_household_id, claimRepo]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadClaims();
    }, [loadClaims])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadClaims();
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
        <ScreenHeader title="Reimbursement Claims" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Reimbursement Claims"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/claims/add')}
            style={styles.addButton}
          >
            <IconSymbol name="plus" size={20} color={theme.interactive.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.interactive.primary}
          />
        }
      >
        <View style={styles.content}>
          {claims.length === 0 ? (
            <Card padding="md" style={styles.emptyCard}>
              <AppText variant="body" color={theme.text.secondary} style={{ textAlign: 'center', marginBottom: SPACING[4] }}>
                No reimbursement claims yet
              </AppText>
              <PrimaryButton
                title="Create Your First Claim"
                onPress={() => router.push('/claims/add')}
                fullWidth
                size="lg"
              />
            </Card>
          ) : (
            claims.map((claim) => {
              const statusColor = statusColors[claim.status];
              const isPaid = claim.status === 'PAID' || claim.status === 'PARTIALLY_PAID';

              return (
                <TouchableOpacity
                  key={claim.id}
                  onPress={() => router.push(`/claims/${claim.id}`)}
                  activeOpacity={0.7}
                >
                  <Card padding="md" style={styles.claimCard}>
                    <View style={styles.claimHeader}>
                      <View style={styles.claimInfo}>
                        <AppText variant="h2" style={{ marginBottom: SPACING[1] }}>
                          {claim.name}
                        </AppText>
                        <AppText variant="caption" color={theme.text.secondary}>
                          {claim.business_name}
                        </AppText>
                      </View>
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

                    <View style={styles.claimDetails}>
                      <View style={styles.claimRow}>
                        <AppText variant="body" color={theme.text.secondary}>
                          Period:
                        </AppText>
                        <AppText variant="body">
                          {formatDate(claim.period_start)} - {formatDate(claim.period_end)}
                        </AppText>
                      </View>

                      <View style={styles.claimRow}>
                        <AppText variant="body" color={theme.text.secondary}>
                          Total:
                        </AppText>
                        <AppText variant="bodyEmphasis">
                          {formatCurrency(claim.total_amount, householdCurrency)}
                        </AppText>
                      </View>

                      {isPaid && (
                        <View style={styles.claimRow}>
                          <AppText variant="body" color={theme.text.secondary}>
                            Paid:
                          </AppText>
                          <AppText variant="bodyEmphasis" style={{ color: theme.status.success }}>
                            {formatCurrency(claim.paid_amount, householdCurrency)}
                          </AppText>
                        </View>
                      )}

                      <View style={styles.claimRow}>
                        <AppText variant="body" color={theme.text.secondary}>
                          Transactions:
                        </AppText>
                        <AppText variant="body">
                          {claim.transaction_ids.length} expense{claim.transaction_ids.length !== 1 ? 's' : ''}
                        </AppText>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
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
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING[8],
  },
  claimCard: {
    marginBottom: SPACING[3],
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  claimInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  claimDetails: {
    gap: SPACING[2],
  },
  claimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
