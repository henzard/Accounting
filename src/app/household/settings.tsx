// Household Settings Screen
// Configure household preferences: budget period, timezone, currency, baby step

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, PrimaryButton, SearchableSelect } from '@/presentation/components';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SelectOption } from '@/shared/types';

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
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!user?.default_household_id) return;

    // Validate budget period start day
    if (budgetPeriodStartDay < 1 || budgetPeriodStartDay > 31) {
      Alert.alert('Invalid Day', 'Budget period start day must be between 1 and 31');
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

      Alert.alert('Success! 🎉', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ScreenHeader title="Household Settings" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScreenHeader title="Household Settings" showBack={true} />

      <ScrollView style={styles.scrollView}>
        {/* Household Name */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Household
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Name</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>{householdName}</Text>
          </View>
        </Card>

        {/* Budget Period */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            💰 Budget Period
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.text.secondary }]}>
            Choose which day your budget period starts. This is useful if you get paid mid-month (e.g., 15th or 20th).
          </Text>

          <View style={{ marginTop: 16 }}>
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
            <Text style={[styles.previewLabel, { color: theme.status.info }]}>
              📅 Budget Period Preview
            </Text>
            <Text style={[styles.previewText, { color: theme.text.primary }]}>
              {budgetPeriodStartDay === 1
                ? 'Calendar month: 1st to last day of month'
                : `Custom period: ${budgetPeriodStartDay}th of one month to ${budgetPeriodStartDay - 1}${getDaySuffix(budgetPeriodStartDay - 1)} of next month`}
            </Text>
            {budgetPeriodStartDay !== 1 && (
              <Text style={[styles.previewExample, { color: theme.text.secondary }]}>
                Example: Dec {budgetPeriodStartDay} → Jan {budgetPeriodStartDay - 1}
              </Text>
            )}
          </View>
        </Card>

        {/* Baby Steps */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            📊 Dave Ramsey Baby Steps
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Current Baby Step
            </Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              Step {currentBabyStep}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/baby-steps/select')}
            style={[styles.linkButton, { borderColor: theme.border.default }]}
          >
            <Text style={[styles.linkButtonText, { color: theme.interactive.primary }]}>
              Change Baby Step →
            </Text>
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
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  previewBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewExample: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  linkButton: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

