// Businesses Screen - Manage businesses/employers
// List, add, edit, and delete businesses for expense tracking

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import {
  ScreenHeader,
  Card,
  AppText,
  ScreenWrapper,
  PrimaryButton,
} from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreBusinessRepository } from '@/data/repositories/FirestoreBusinessRepository';
import { Business } from '@/domain/entities';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BusinessesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const businessRepo = new FirestoreBusinessRepository();

  const loadBusinesses = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      const biz = await businessRepo.getBusinessesByHousehold(user.default_household_id);
      setBusinesses(biz);
    } catch (error) {
      console.error('❌ Failed to load businesses:', error);
      showAlert('Error', 'Failed to load businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.default_household_id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadBusinesses();
    }, [loadBusinesses])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBusinesses();
  };

  const handleDelete = async (business: Business) => {
    const confirmed = await showConfirm(
      'Delete Business',
      `Are you sure you want to delete "${business.name}"? This will not delete associated transactions or claims.`
    );

    if (!confirmed) return;

    try {
      await businessRepo.deleteBusiness(business.id);
      loadBusinesses();
    } catch (error) {
      console.error('❌ Failed to delete business:', error);
      showAlert('Error', 'Failed to delete business');
    }
  };

  const getTypeLabel = (type: Business['type']) => {
    switch (type) {
      case 'EMPLOYER':
        return 'Employer';
      case 'CLIENT':
        return 'Client';
      case 'OWN_BUSINESS':
        return 'Own Business';
    }
  };

  const getTypeIcon = (type: Business['type']) => {
    switch (type) {
      case 'EMPLOYER':
        return 'building.2.fill';
      case 'CLIENT':
        return 'person.2.fill';
      case 'OWN_BUSINESS':
        return 'briefcase.fill';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Businesses" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Businesses"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/businesses/add')}
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
          {businesses.length === 0 ? (
            <Card padding="md" style={styles.emptyCard}>
              <AppText variant="body" color={theme.text.secondary} style={{ textAlign: 'center', marginBottom: SPACING[4] }}>
                No businesses added yet
              </AppText>
              <PrimaryButton
                title="Add Your First Business"
                onPress={() => router.push('/businesses/add')}
                fullWidth
                size="lg"
              />
            </Card>
          ) : (
            <>
              {businesses.map((business) => (
                <Card key={business.id} padding="md" style={styles.businessCard}>
                  <View style={styles.businessHeader}>
                    <View style={styles.businessInfo}>
                      <View style={[styles.iconContainer, { backgroundColor: theme.interactive.primary + '20' }]}>
                        <IconSymbol
                          name={getTypeIcon(business.type)}
                          size={24}
                          color={theme.interactive.primary}
                        />
                      </View>
                      <View style={styles.businessDetails}>
                        <AppText variant="h2" style={{ marginBottom: SPACING[1] }}>
                          {business.name}
                        </AppText>
                        <AppText variant="caption" color={theme.text.secondary}>
                          {getTypeLabel(business.type)}
                          {business.contact_email && ` • ${business.contact_email}`}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.businessActions}>
                      <TouchableOpacity
                        onPress={() => router.push(`/businesses/edit?id=${business.id}`)}
                        style={[styles.actionButton, { marginRight: SPACING[2] }]}
                      >
                        <IconSymbol name="pencil" size={18} color={theme.interactive.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(business)}
                        style={styles.actionButton}
                      >
                        <IconSymbol name="trash" size={18} color={theme.status.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
              
              {/* Add Business Button - Always visible when there are businesses */}
              <PrimaryButton
                title="Add Business"
                onPress={() => router.push('/businesses/add')}
                fullWidth
                size="lg"
                style={{ marginTop: SPACING[4] }}
              />
            </>
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
  businessCard: {
    marginBottom: SPACING[3],
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  businessDetails: {
    flex: 1,
  },
  businessActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
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
