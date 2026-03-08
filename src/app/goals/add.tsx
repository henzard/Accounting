// Add Goal Screen - Sinking Funds
// Create a new savings goal

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, Button, Card, ScreenWrapper, AppText, ScreenHeader, DatePicker } from '@/presentation/components';
import { showAlert } from '@/shared/utils/alert';
import { FirestoreGoalRepository } from '@/data/repositories/FirestoreGoalRepository';
import { CreateGoalUseCase } from '@/domain/use-cases/CreateGoalUseCase';
import { logger } from '@/shared/utils/logger';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { GOAL_ICONS } from '@/shared/constants/goals';

export default function AddGoalScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [saving, setSaving] = useState(false);

  const goalRepository = useMemo(() => new FirestoreGoalRepository(), []);
  const createGoalUseCase = useMemo(() => new CreateGoalUseCase(goalRepository), [goalRepository]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      showAlert('Validation Error', 'Please enter a goal name');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showAlert('Validation Error', 'Please enter a target amount greater than zero');
      return;
    }

    if (!user?.default_household_id) {
      showAlert('Error', 'No household selected');
      return;
    }

    try {
      setSaving(true);

      const amountInCents = Math.round(parseFloat(targetAmount) * 100);

      // CreateGoalUseCase validates name, amount > 0, household_id, and future target_date
      await createGoalUseCase.execute({
        household_id: user.default_household_id,
        name: name.trim(),
        target_amount: amountInCents,
        target_date: targetDate,
        icon: selectedIcon,
      });

      logger.info('Goal created', { name: name.trim() });
      showAlert('Success', `${name.trim()} created!`);
      router.back();
    } catch (error) {
      logger.error('Error creating goal', error);
      const message = error instanceof Error ? error.message : 'Failed to create goal. Please try again.';
      showAlert('Error', message);
    } finally {
      setSaving(false);
    }
  }, [name, targetAmount, targetDate, selectedIcon, user?.default_household_id, createGoalUseCase, router]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper>
        <ScreenHeader title="Add Goal" showBack={true} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon Selection */}
          <Card>
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
              helperText="How much do you need to save?"
              testID="target-amount-input"
            />
          </Card>

          {/* Target Date (Optional) */}
          <Card style={styles.card}>
            <DatePicker
              label="Target Date (Optional)"
              value={targetDate}
              onChange={setTargetDate}
              minimumDate={new Date()}
              helperText="When do you need this money? Leave blank if flexible"
              testID="target-date-input"
            />
          </Card>

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.status.infoBackground },
            ]}
          >
            <AppText variant="body" style={styles.infoIcon}>ℹ️</AppText>
            <AppText variant="caption" style={[styles.infoText, { color: theme.status.info }]}>
              Sinking funds help you save for irregular expenses. Add money manually or link
              to a budget category for automatic tracking.
            </AppText>
          </View>

          {/* Save Button */}
          <Button
            title={saving ? 'Creating...' : 'Create Goal'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
            loading={saving}
            testID="create-goal-button"
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
  scrollContent: {
    padding: SPACING[4],
  },
  sectionTitle: {
    marginBottom: SPACING[4],
  },
  card: {
    marginTop: SPACING[4],
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
  infoCard: {
    flexDirection: 'row',
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING[4],
    marginBottom: SPACING[4],
  },
  infoIcon: {
    marginRight: SPACING[2],
    fontSize: 16,
  },
  infoText: {
    flex: 1,
  },
});
