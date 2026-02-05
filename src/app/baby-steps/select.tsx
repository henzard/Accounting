// Baby Steps Selection Screen - Homebase Budget
// Allows user to select their current Baby Step

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { BABY_STEPS, sanitizeBabyStep, isValidBabyStep } from '@/shared/constants/baby-steps';
import { PrimaryButton, OutlineButton, Card, ScreenHeader, ScreenWrapper, AppText } from '@/presentation/components';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export default function BabyStepsSelectScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current baby step from household
  useEffect(() => {
    loadCurrentStep();
  }, [user]);

  const loadCurrentStep = async () => {
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
        const rawStep = data.current_baby_step;
        
        // Sanitize the step to ensure it's valid (1-7)
        const step = sanitizeBabyStep(rawStep);
        
        setCurrentStep(step);
        setSelectedStep(step);
      }
    } catch (error) {
      console.error('Error loading baby step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.default_household_id) {
      Alert.alert('Error', 'No household selected');
      return;
    }

    if (selectedStep === currentStep) {
      router.back();
      return;
    }

    // Validate selectedStep is within valid range (1-7)
    if (!isValidBabyStep(selectedStep)) {
      console.error(`❌ Invalid baby step: ${selectedStep}`);
      Alert.alert('Error', 'Please select a valid Baby Step (1-7)');
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, 'households', user.default_household_id),
        {
          current_baby_step: selectedStep,
          baby_step_started_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('✅ Baby step updated to:', selectedStep);
      
      // Safe array access - validated above with isValidBabyStep
      const stepInfo = BABY_STEPS[selectedStep - 1];
      
      Alert.alert(
        'Baby Step Updated! 🎉',
        `You're now on Baby Step ${selectedStep}: ${stepInfo.shortTitle}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving baby step:', error);
      Alert.alert('Error', 'Failed to save baby step');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <ScreenHeader title="Select Baby Step" showBack={true} />

      {/* Subtitle */}
      <View
        style={{
          paddingHorizontal: SPACING[4],
          paddingVertical: SPACING[3],
        }}
      >
        <AppText variant="caption" style={{ color: theme.text.secondary }}>
          Which Baby Step are you currently working on?
        </AppText>
      </View>

      {/* Steps List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING[4] }}
      >
        {BABY_STEPS.map((step) => {
          const isSelected = selectedStep === step.step;
          const isCompleted = step.step < currentStep;
          const isCurrent = step.step === currentStep;

          return (
            <TouchableOpacity
              key={step.step}
              onPress={() => setSelectedStep(step.step)}
              activeOpacity={0.7}
              style={{ marginBottom: SPACING[3] }}
            >
              <Card
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? theme.interactive.primary
                    : theme.border.default,
                  backgroundColor: isSelected
                    ? theme.interactive.primary + '08'
                    : theme.surface.default,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {/* Step Number/Check */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isCompleted
                        ? theme.status.success
                        : isSelected
                        ? theme.interactive.primary
                        : theme.background.tertiary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING[3],
                    }}
                  >
                    {isCompleted ? (
                      <AppText variant="body" style={{ color: 'white' }}>✓</AppText>
                    ) : (
                      <AppText
                        variant="h3"
                        style={{
                          color: isSelected
                            ? theme.text.inverse
                            : theme.text.secondary,
                        }}
                      >
                        {step.step}
                      </AppText>
                    )}
                  </View>

                  {/* Step Content */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: SPACING[1],
                      }}
                    >
                      <AppText
                        variant="bodyEmphasis"
                        style={{
                          color: theme.text.primary,
                          flex: 1,
                        }}
                      >
                        {step.shortTitle}
                      </AppText>
                      <AppText variant="h2" style={{ marginLeft: SPACING[2] }}>
                        {step.icon}
                      </AppText>
                    </View>

                    <AppText
                      variant="caption"
                      style={{
                        color: theme.text.secondary,
                      }}
                    >
                      {step.description}
                    </AppText>

                    {isCurrent && (
                      <View
                        style={{
                          marginTop: SPACING[2],
                          backgroundColor: theme.status.infoBackground,
                          paddingHorizontal: SPACING[2],
                          paddingVertical: SPACING[1],
                          borderRadius: BORDER_RADIUS.sm,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <AppText
                          variant="overline"
                          style={{
                            color: theme.status.info,
                          }}
                        >
                          CURRENT STEP
                        </AppText>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Buttons */}
      <View
        style={{
          padding: SPACING[4],
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.border.default,
          backgroundColor: theme.surface.default,
          gap: SPACING[3],
        }}
      >
        <PrimaryButton
          title={saving ? 'Saving...' : 'Save Baby Step'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          fullWidth
        />
        <OutlineButton
          title="Cancel"
          onPress={() => router.back()}
          disabled={saving}
          fullWidth
        />
      </View>
    </ScreenWrapper>
  );
}

