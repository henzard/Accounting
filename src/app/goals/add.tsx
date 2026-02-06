// Add Goal Screen - Sinking Funds
// Create a new savings goal

import React, { useState, useCallback } from 'react';
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
import { Input, Button, Card, ScreenWrapper, AppText, ScreenHeader } from '@/presentation/components';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { createGoal } from '@/domain/entities/Goal';
import { FirestoreGoalRepository } from '@/data/repositories/FirestoreGoalRepository';
import { v4 as uuidv4 } from 'uuid';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

const GOAL_ICONS = ['🎯', '💰', '🏖️', '🚗', '🏠', '🎄', '🎓', '💍', '🎁', '✈️'];

export default function AddGoalScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [saving, setSaving] = useState(false);

  const goalRepository = new FirestoreGoalRepository();

  const handleSave = useCallback(async () => {
    // Validation
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

      // Parse amount (convert dollars to cents)
      const amountInCents = Math.round(parseFloat(targetAmount) * 100);

      // Parse target date if provided
      let parsedDate: Date | undefined;
      if (targetDate.trim()) {
        // Simple date parser (expects MM/DD/YYYY or YYYY-MM-DD)
        const date = new Date(targetDate);
        if (isNaN(date.getTime())) {
          showAlert('Validation Error', 'Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD');
          setSaving(false);
          return;
        }
        
        if (date < new Date()) {
          showAlert('Validation Error', 'Target date must be in the future');
          setSaving(false);
          return;
        }
        
        parsedDate = date;
      }

      // Create goal
      const newGoal = createGoal({
        id: uuidv4(),
        household_id: user.default_household_id,
        name: name.trim(),
        target_amount: amountInCents,
        current_amount: 0,
        target_date: parsedDate,
        icon: selectedIcon,
      });

      // Save to Firestore
      await goalRepository.createGoal(newGoal);

      console.log('✅ Goal created:', newGoal.name);
      showAlert('Success', `${newGoal.name} created!`);
      router.back();
    } catch (error) {
      console.error('❌ Error creating goal:', error);
      showAlert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, targetAmount, targetDate, selectedIcon, user?.default_household_id, goalRepository, router]);

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
            <Input
              label="Target Date (Optional)"
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="MM/DD/YYYY"
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
