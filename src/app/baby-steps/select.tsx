// Baby Steps Selection Screen - Homebase Budget
// Allows user to select their current Baby Step

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { BABY_STEPS, sanitizeBabyStep, isValidBabyStep } from '@/shared/constants/baby-steps';
import { PrimaryButton, OutlineButton, Card, ScreenHeader } from '@/presentation/components';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
      {/* Header */}
      <ScreenHeader title="Select Baby Step" showBack={true} />

      {/* Subtitle */}
      <View
        style={{
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: theme.text.secondary,
          }}
        >
          Which Baby Step are you currently working on?
        </Text>
      </View>

      {/* Steps List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing[4] }}
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
              style={{ marginBottom: theme.spacing[3] }}
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
                      marginRight: theme.spacing[3],
                    }}
                  >
                    {isCompleted ? (
                      <Text style={{ color: 'white', fontSize: 18 }}>✓</Text>
                    ) : (
                      <Text
                        style={{
                          color: isSelected
                            ? theme.text.inverse
                            : theme.text.secondary,
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}
                      >
                        {step.step}
                      </Text>
                    )}
                  </View>

                  {/* Step Content */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: theme.text.primary,
                          flex: 1,
                        }}
                      >
                        {step.shortTitle}
                      </Text>
                      <Text style={{ fontSize: 24, marginLeft: 8 }}>
                        {step.icon}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        color: theme.text.secondary,
                        lineHeight: 18,
                      }}
                    >
                      {step.description}
                    </Text>

                    {isCurrent && (
                      <View
                        style={{
                          marginTop: theme.spacing[2],
                          backgroundColor: theme.status.infoBackground,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: theme.status.info,
                            fontWeight: '600',
                          }}
                        >
                          CURRENT STEP
                        </Text>
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
          padding: theme.spacing[4],
          borderTopWidth: 1,
          borderTopColor: theme.border.default,
          backgroundColor: theme.surface.default,
          gap: theme.spacing[3],
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
    </View>
  );
}

