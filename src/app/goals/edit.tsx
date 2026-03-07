// Edit Goal Screen - Sinking Funds
// Edit an existing savings goal and add money to it

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, Button, Card, ScreenWrapper, AppText, ScreenHeader, DatePicker } from '@/presentation/components';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { Goal, calculateGoalProgress, getGoalStatus, calculateDaysRemaining, calculateRemainingAmount } from '@/domain/entities/Goal';
import { FirestoreGoalRepository } from '@/data/repositories/FirestoreGoalRepository';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

const GOAL_ICONS = ['🎯', '💰', '🏖️', '🚗', '🏠', '🎄', '🎓', '💍', '🎁', '✈️'];

export default function EditGoalScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [amountToAdd, setAmountToAdd] = useState('');
  const [saving, setSaving] = useState(false);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  const goalRepository = new FirestoreGoalRepository();

  useEffect(() => {
    loadGoal();
    loadHouseholdCurrency();
  }, [id]);

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

  const loadGoal = useCallback(async () => {
    if (!id) {
      showAlert('Error', 'No goal ID provided');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const loadedGoal = await goalRepository.getGoalById(id);

      if (!loadedGoal) {
        showAlert('Error', 'Goal not found');
        router.back();
        return;
      }

      setGoal(loadedGoal);
      setName(loadedGoal.name);
      setTargetAmount((loadedGoal.target_amount / 100).toFixed(2));
      setSelectedIcon(loadedGoal.icon || '🎯');
      
      if (loadedGoal.target_date) {
        setTargetDate(new Date(loadedGoal.target_date));
      }
    } catch (error) {
      console.error('❌ Error loading goal:', error);
      showAlert('Error', 'Failed to load goal');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, goalRepository, router]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      showAlert('Validation Error', 'Please enter a goal name');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showAlert('Validation Error', 'Please enter a target amount greater than zero');
      return;
    }

    if (!goal) return;

    try {
      setSaving(true);

      // Parse amount (convert dollars to cents)
      const amountInCents = Math.round(parseFloat(targetAmount) * 100);

      await goalRepository.updateGoal(goal.id, {
        name: name.trim(),
        target_amount: amountInCents,
        target_date: targetDate || undefined,
        icon: selectedIcon,
        updated_at: new Date(),
      });

      console.log('✅ Goal updated:', goal.id);
      showAlert('Success', 'Goal updated!');
      await loadGoal();
    } catch (error) {
      console.error('❌ Error updating goal:', error);
      showAlert('Error', 'Failed to update goal. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, targetAmount, targetDate, selectedIcon, goal, goalRepository, loadGoal]);

  const handleAddMoney = useCallback(async () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      showAlert('Validation Error', 'Please enter an amount greater than zero');
      return;
    }

    if (!goal) return;

    try {
      setSaving(true);

      // Parse amount (convert dollars to cents)
      const amountInCents = Math.round(parseFloat(amountToAdd) * 100);
      const newTotal = goal.current_amount + amountInCents;

      await goalRepository.updateGoalProgress(goal.id, newTotal);

      console.log('✅ Money added to goal:', goal.id);
      setAmountToAdd('');
      showAlert('Success', `${formatCurrency(amountInCents / 100, householdCurrency)} added to your goal!`);
      await loadGoal();
    } catch (error) {
      console.error('❌ Error adding money to goal:', error);
      showAlert('Error', 'Failed to add money. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [amountToAdd, goal, householdCurrency, goalRepository, loadGoal]);

  const handleArchive = useCallback(async () => {
    if (!goal) return;

    const confirmed = await showConfirm(
      'Archive Goal',
      `Are you sure you want to archive "${goal.name}"? You can view it later in archived goals.`
    );

    if (!confirmed) return;

    try {
      await goalRepository.archiveGoal(goal.id);
      console.log('✅ Goal archived:', goal.id);
      showAlert('Success', 'Goal archived');
      router.back();
    } catch (error) {
      console.error('❌ Error archiving goal:', error);
      showAlert('Error', 'Failed to archive goal');
    }
  }, [goal, goalRepository, router]);

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
        return 'Ahead of Schedule';
      case 'ON_TRACK':
        return 'On Track';
      case 'BEHIND':
        return 'Behind Schedule';
      default:
        return 'Active';
    }
  }, []);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={[styles.loadingText, { color: theme.text.secondary }]} testID="loading-text">
            Loading goal...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!goal) {
    return null;
  }

  const progress = calculateGoalProgress(goal);
  const status = getGoalStatus(goal);
  const remaining = calculateRemainingAmount(goal);
  const daysRemaining = calculateDaysRemaining(goal);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper>
        <ScreenHeader title="Edit Goal" showBack={true} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Display */}
          <Card>
            <View style={styles.progressHeader}>
              <View>
                <AppText variant="bodyEmphasis" style={[styles.progressLabel, { color: theme.text.secondary }]}>
                  Current Progress
                </AppText>
                <AppText variant="display" style={[styles.progressValue, { color: theme.text.primary }]} testID="goal-progress">
                  {progress}%
                </AppText>
                <AppText variant="body" style={{ color: theme.text.secondary }} testID="goal-amounts">
                  {formatCurrency(goal.current_amount / 100, householdCurrency)} of{' '}
                  {formatCurrency(goal.target_amount / 100, householdCurrency)}
                </AppText>
              </View>
              <View style={styles.statusContainer}>
                <AppText
                  variant="bodyEmphasis"
                  style={[styles.statusLabel, { color: getStatusColor(status) }]}
                  testID="goal-status"
                >
                  {getStatusLabel(status)}
                </AppText>
                {daysRemaining !== null && (
                  <>
                    <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                      {daysRemaining > 0 ? 'Days Remaining' : 'Days Overdue'}
                    </AppText>
                    <AppText
                      variant="body"
                      style={{ color: daysRemaining < 0 ? theme.status.error : theme.text.primary }}
                      testID="goal-days-remaining"
                    >
                      {Math.abs(daysRemaining)}
                    </AppText>
                  </>
                )}
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
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
            </View>

            <AppText variant="caption" style={[styles.remainingText, { color: theme.text.secondary }]}>
              {formatCurrency(remaining / 100, householdCurrency)} remaining
            </AppText>
          </Card>

          {/* Add Money Section */}
          <Card style={styles.card}>
            <AppText variant="bodyEmphasis" style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Add Money to Goal
            </AppText>
            <View style={styles.addMoneyRow}>
              <View style={styles.addMoneyInput}>
                <Input
                  value={amountToAdd}
                  onChangeText={setAmountToAdd}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  testID="amount-to-add-input"
                />
              </View>
              <Button
                title="Add"
                onPress={handleAddMoney}
                variant="primary"
                size="md"
                disabled={saving || !amountToAdd}
                testID="add-money-button"
              />
            </View>
          </Card>

          {/* Icon Selection */}
          <Card style={styles.card}>
            <AppText variant="bodyEmphasis" style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Icon
            </AppText>
            <View style={styles.iconGrid}>
              {GOAL_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconCard,
                    {
                      backgroundColor:
                        selectedIcon === icon
                          ? theme.interactive.primary
                          : theme.background.secondary,
                      borderColor:
                        selectedIcon === icon
                          ? theme.interactive.primary
                          : theme.border.default,
                    },
                  ]}
                  testID={`icon-${icon}`}
                >
                  <AppText variant="h1" style={styles.iconText}>{icon}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Goal Name */}
          <Card style={styles.card}>
            <Input
              label="Goal Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Christmas Shopping"
              autoCapitalize="words"
              testID="goal-name-input"
            />
          </Card>

          {/* Target Amount */}
          <Card style={styles.card}>
            <Input
              label="Target Amount"
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              testID="target-amount-input"
            />
          </Card>

          {/* Target Date */}
          <Card style={styles.card}>
            <DatePicker
              label="Target Date (Optional)"
              value={targetDate}
              onChange={setTargetDate}
              minimumDate={new Date()}
              helperText="Leave blank if no specific deadline"
              testID="target-date-input"
            />
          </Card>

          {/* Save Button */}
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
            loading={saving}
            testID="save-goal-button"
          />

          {/* Archive Button */}
          <Button
            title="Archive Goal"
            onPress={handleArchive}
            variant="secondary"
            size="lg"
            style={styles.archiveButton}
            testID="archive-goal-button"
          />
        </ScrollView>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING[4],
  },
  scrollContent: {
    padding: SPACING[4],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },
  progressLabel: {
    marginBottom: SPACING[2],
  },
  progressValue: {
    marginBottom: SPACING[1],
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    marginBottom: SPACING[2],
  },
  progressBarContainer: {
    marginTop: SPACING[2],
  },
  progressBarBackground: {
    height: 12,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  remainingText: {
    marginTop: SPACING[2],
  },
  card: {
    marginTop: SPACING[4],
  },
  sectionTitle: {
    marginBottom: SPACING[3],
  },
  addMoneyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addMoneyInput: {
    flex: 1,
    marginRight: SPACING[2],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  iconCard: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  archiveButton: {
    marginTop: SPACING[3],
  },
});
