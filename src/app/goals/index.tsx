// Goals List Screen - Sinking Funds
// Shows all savings goals for the current household

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card, ScreenHeader, ScreenWrapper, AppText } from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { showAlert } from '@/shared/utils/alert';
import { Goal, calculateGoalProgress, getGoalStatus, calculateDaysRemaining, calculateRemainingAmount } from '@/domain/entities/Goal';
import { FirestoreGoalRepository } from '@/data/repositories/FirestoreGoalRepository';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

export default function GoalsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const goalRepository = new FirestoreGoalRepository();

  useEffect(() => {
    loadGoals();
    loadHouseholdCurrency();
  }, [user?.default_household_id]);

  const loadHouseholdCurrency = useCallback(async () => {
    if (!user?.default_household_id) return;

    try {
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      
      if (householdDoc.exists()) {
        const currency = householdDoc.data()?.currency as CurrencyCode;
        if (currency) {
          setHouseholdCurrency(currency);
        }
      }
    } catch (error) {
      console.error('❌ Error loading household currency:', error);
    }
  }, [user?.default_household_id]);

  const loadGoals = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const loadedGoals = await goalRepository.getActiveGoals(user.default_household_id);
      setGoals(loadedGoals);
    } catch (error) {
      console.error('❌ Error loading goals:', error);
      showAlert('Error', 'Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.default_household_id]);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return theme.status.success;
      case 'AHEAD':
        return theme.status.success;
      case 'ON_TRACK':
        return theme.status.info;
      case 'BEHIND':
        return theme.status.warning;
      default:
        return theme.text.secondary;
    }
  }, [theme]);

  const getStatusLabel = useCallback((status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'Complete!';
      case 'AHEAD':
        return 'Ahead';
      case 'ON_TRACK':
        return 'On Track';
      case 'BEHIND':
        return 'Behind';
      default:
        return 'Active';
    }
  }, []);

  const renderGoal = useCallback(({ item }: { item: Goal }) => {
    const progress = calculateGoalProgress(item);
    const status = getGoalStatus(item);
    const remaining = calculateRemainingAmount(item);
    const daysRemaining = calculateDaysRemaining(item);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/goals/edit?id=${item.id}`)}
        activeOpacity={0.7}
        testID={`goal-card-${item.id}`}
      >
        <Card style={styles.goalCard}>
          {/* Header */}
          <View style={styles.goalHeader}>
            <View style={styles.goalInfo}>
              <AppText variant="h2" style={styles.goalIcon} testID={`goal-icon-${item.id}`}>
                {item.icon || '🎯'}
              </AppText>
              <View style={styles.goalText}>
                <AppText variant="h2" style={styles.goalName} testID={`goal-name-${item.id}`}>
                  {item.name}
                </AppText>
                <AppText variant="caption" color={theme.text.secondary}>
                  Target: {formatCurrency(item.target_amount / 100, householdCurrency)}
                </AppText>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <AppText
                variant="caption"
                color={getStatusColor(status)}
                style={styles.statusText}
                testID={`goal-status-${item.id}`}
              >
                {getStatusLabel(status)}
              </AppText>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View
              style={[
                styles.progressBarBackground,
                { backgroundColor: theme.background.secondary },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: getStatusColor(status),
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <AppText
              variant="caption"
              color={theme.text.secondary}
              style={styles.progressText}
              testID={`goal-progress-${item.id}`}
            >
              {progress}% • {formatCurrency(item.current_amount / 100, householdCurrency)} of{' '}
              {formatCurrency(item.target_amount / 100, householdCurrency)}
            </AppText>
          </View>

          {/* Footer */}
          <View style={styles.goalFooter}>
            <View>
              <AppText variant="caption" color={theme.text.tertiary}>
                Remaining
              </AppText>
              <AppText variant="body" color={theme.text.primary}>
                {formatCurrency(remaining / 100, householdCurrency)}
              </AppText>
            </View>
            {daysRemaining !== null && (
              <View style={styles.daysRemainingContainer}>
                <AppText variant="caption" color={theme.text.tertiary}>
                  {daysRemaining > 0 ? 'Days Remaining' : 'Days Overdue'}
                </AppText>
                <AppText
                  variant="body"
                  color={daysRemaining < 0 ? theme.status.error : theme.text.primary}
                >
                  {Math.abs(daysRemaining)} days
                </AppText>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  }, [router, theme, householdCurrency, getStatusColor, getStatusLabel]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" color={theme.text.secondary} style={styles.loadingText} testID="loading-text">
            Loading goals...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <ScreenHeader
        title="Sinking Funds"
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/goals/add')}
            style={[styles.addButton, { backgroundColor: theme.interactive.primary }]}
            testID="add-goal-button"
          >
            <AppText variant="h1" color={theme.text.inverse}>+</AppText>
          </TouchableOpacity>
        }
      />

      {/* Goals List */}
      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText variant="h1" style={styles.emptyIcon}>
            🎯
          </AppText>
          <AppText variant="h2" style={styles.emptyTitle}>
            No goals yet
          </AppText>
          <AppText
            variant="body"
            color={theme.text.secondary}
            style={styles.emptyDescription}
            testID="empty-state-text"
          >
            Create your first savings goal to track progress toward irregular expenses like
            vacations, car repairs, or holiday shopping.
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/goals/add')}
            style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
            testID="create-first-goal-button"
          >
            <AppText variant="body" color={theme.text.inverse}>
              Create First Goal
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="goals-list"
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING[4],
  },
  listContent: {
    padding: SPACING[4],
  },
  goalCard: {
    marginBottom: SPACING[4],
    padding: SPACING[4],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    fontSize: 32,
    marginRight: SPACING[3],
  },
  goalText: {
    flex: 1,
  },
  goalName: {
    marginBottom: SPACING[1],
  },
  statusBadge: {
    marginLeft: SPACING[2],
  },
  statusText: {
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: SPACING[3],
  },
  progressBarBackground: {
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING[2],
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  progressText: {
    fontSize: 12,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING[2],
  },
  daysRemainingContainer: {
    alignItems: 'flex-end',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[6],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING[4],
  },
  emptyTitle: {
    marginBottom: SPACING[2],
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  createButton: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
  },
});
