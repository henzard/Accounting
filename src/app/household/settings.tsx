// Household Settings Screen
// Configure household preferences: budget period, timezone, currency, baby step

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, PrimaryButton, SearchableSelect, ScreenWrapper, AppText } from '@/presentation/components';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SelectOption } from '@/shared/types';
import { showAlert } from '@/shared/utils/alert';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export default function HouseholdSettingsScreen() {
  const { theme } = useTheme();
  const { user, updateUserLocally } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [budgetPeriodStartDay, setBudgetPeriodStartDay] = useState(1);
  const [householdName, setHouseholdName] = useState('');
  const [currentBabyStep, setCurrentBabyStep] = useState(1);

  useFocusEffect(
    useCallback(() => {
      loadHouseholdSettings();
    }, [user?.default_household_id])
  );

  async function loadHouseholdSettings() {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      const householdDoc = await getDoc(
        doc(db, 'households', user.default_household_id)
      );

      if (householdDoc.exists()) {
        const data = householdDoc.data();
        setBudgetPeriodStartDay(data.budget_period_start_day || 1);
        setHouseholdName(data.name || '');
        setCurrentBabyStep(data.current_baby_step || 1);
      }
    } catch (error) {
      console.error('Error loading household settings:', error);
      showAlert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!user?.default_household_id) return;

    // Validate budget period start day
    if (budgetPeriodStartDay < 1 || budgetPeriodStartDay > 31) {
      showAlert('Invalid Day', 'Budget period start day must be between 1 and 31');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(
        doc(db, 'households', user.default_household_id),
        {
          budget_period_start_day: budgetPeriodStartDay,
          updated_at: new Date(),
        }
      );

      showAlert('Success! 🎉', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  // Budget period start day options (1-31)
  const budgetPeriodOptions: SelectOption[] = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let label = `${day}`;
    if (day === 1) label += ' (1st - Calendar month)';
    else if (day === 15) label += ' (15th - Mid-month)';
    else if (day === 20) label += ' (20th - Popular choice)';
    
    return {
      value: String(day),
      label: label,
    };
  });

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Household Settings" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={{ color: theme.text.secondary, marginTop: SPACING[4] }}>
            Loading settings...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader title="Household Settings" showBack={true} />

      <ScrollView style={styles.scrollView}>
        {/* Household Name */}
        <Card style={styles.section}>
          <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[2] }}>
            Household
          </AppText>
          <View style={styles.infoRow}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>Name</AppText>
            <AppText variant="body" style={{ color: theme.text.primary }}>{householdName}</AppText>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/household/members')}
            style={[styles.linkButton, { borderColor: theme.border.default, marginTop: SPACING[3] }]}
          >
            <AppText variant="bodyEmphasis" style={{ color: theme.interactive.primary }}>
              Manage Members →
            </AppText>
          </TouchableOpacity>
        </Card>

        {/* Budget Period */}
        <Card style={styles.section}>
          <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[2] }}>
            💰 Budget Period
          </AppText>
          <AppText variant="body" style={{ color: theme.text.secondary, marginBottom: SPACING[4] }}>
            Choose which day your budget period starts. This is useful if you get paid mid-month (e.g., 15th or 20th).
          </AppText>

          <View style={{ marginTop: SPACING[4] }}>
            <SearchableSelect
              label="Budget Period Start Day"
              value={String(budgetPeriodStartDay)}
              onSelect={(value) => setBudgetPeriodStartDay(Number(value))}
              options={budgetPeriodOptions}
              placeholder="Select day of month"
            />
          </View>

          {/* Preview */}
          <View style={[styles.previewBox, { 
            backgroundColor: theme.status.infoBackground,
            borderColor: theme.status.info,
          }]}>
            <AppText variant="bodyEmphasis" style={{ color: theme.status.info, marginBottom: SPACING[2] }}>
              📅 Budget Period Preview
            </AppText>
            <AppText variant="body" style={{ color: theme.text.primary }}>
              {budgetPeriodStartDay === 1
                ? 'Calendar month: 1st to last day of month'
                : `Custom period: ${budgetPeriodStartDay}th of one month to ${budgetPeriodStartDay - 1}${getDaySuffix(budgetPeriodStartDay - 1)} of next month`}
            </AppText>
            {budgetPeriodStartDay !== 1 && (
              <AppText variant="caption" style={{ color: theme.text.secondary, marginTop: SPACING[1] }}>
                Example: Dec {budgetPeriodStartDay} → Jan {budgetPeriodStartDay - 1}
              </AppText>
            )}
          </View>
        </Card>

        {/* Baby Steps */}
        <Card style={styles.section}>
          <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[2] }}>
            📊 Dave Ramsey Baby Steps
          </AppText>
          <View style={styles.infoRow}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
              Current Baby Step
            </AppText>
            <AppText variant="body" style={{ color: theme.text.primary }}>
              Step {currentBabyStep}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/baby-steps/select')}
            style={[styles.linkButton, { borderColor: theme.border.default }]}
          >
            <AppText variant="bodyEmphasis" style={{ color: theme.interactive.primary }}>
              Change Baby Step →
            </AppText>
          </TouchableOpacity>
        </Card>

        {/* Save Button */}
        <View style={styles.section}>
          <PrimaryButton
            title="Save Settings"
            onPress={handleSaveSettings}
            loading={saving}
            fullWidth
          />
        </View>

        {/* Bottom spacer */}
        <View style={{ height: SPACING[12] }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

// Helper function to get day suffix (st, nd, rd, th)
function getDaySuffix(day: number): string {
  if (day === 1 || day === 21 || day === 31) return 'st';
  if (day === 2 || day === 22) return 'nd';
  if (day === 3 || day === 23) return 'rd';
  return 'th';
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    margin: SPACING[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
  },
  previewBox: {
    marginTop: SPACING[4],
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  linkButton: {
    marginTop: SPACING[3],
    padding: SPACING[3],
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
});

