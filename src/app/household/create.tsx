// Create Household Screen - Homebase Budget
// First-time household setup after signup

import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, PrimaryButton, Card, SearchableSelect } from '@/presentation/components';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { createHousehold } from '@/domain/entities';
import { v4 as uuid } from 'uuid';
import { CURRENCY_OPTIONS } from '@/shared/constants/currencies';
import { TIMEZONE_OPTIONS } from '@/shared/constants/timezones';

export default function CreateHouseholdScreen() {
  const { theme } = useTheme();
  const { user, updateUserLocally } = useAuth();
  const router = useRouter();

  const [householdName, setHouseholdName] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const validateName = (name: string): boolean => {
    if (!name || name.trim().length === 0) {
      setNameError('Household name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleCreateHousehold = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a household');
      return;
    }

    if (!validateName(householdName)) {
      return;
    }

    setLoading(true);
    try {
      console.log('🏠 Creating household:', householdName);

      // Create household entity
      const household = createHousehold({
        id: uuid(),
        name: householdName.trim(),
        owner_id: user.id,
        timezone: timezone,
        currency: currency,
        current_baby_step: 1, // Start at Baby Step 1
      });

      // Save to Firestore
      await setDoc(doc(db, 'households', household.id), {
        name: household.name,
        owner_id: household.owner_id,
        member_ids: household.member_ids,
        timezone: household.timezone,
        currency: household.currency,
        current_baby_step: household.current_baby_step,
        baby_step_started_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: user.id,
      });

      console.log('✅ Household created:', household.id);

      // Update user with household_ids and default_household_id
      const updatedHouseholdIds = [...user.household_ids, household.id];
      
      await setDoc(
        doc(db, 'users', user.id),
        {
          household_ids: updatedHouseholdIds,
          default_household_id: household.id,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('✅ User updated with household');

      // KISS: Update local user state immediately (don't wait for Firestore sync)
      updateUserLocally({
        household_ids: updatedHouseholdIds,
        default_household_id: household.id,
      });

      console.log('✅ User updated locally');

      Alert.alert(
        'Success! 🎉',
        `${household.name} has been created. Let's start your debt-free journey!`,
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Failed to create household:', error);
      Alert.alert('Error', 'Failed to create household. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.spacing[6],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing[8] }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.interactive.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing[4],
            }}
          >
            <Text style={{ fontSize: 40, color: theme.text.inverse }}>🏠</Text>
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: theme.text.primary,
              marginBottom: theme.spacing[2],
              textAlign: 'center',
            }}
          >
            Create Your Household
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.text.secondary,
              textAlign: 'center',
            }}
          >
            Your household is your financial homebase. This is where you&apos;ll track your budget, transactions, and Baby Steps progress.
          </Text>
        </View>

        {/* Info Card */}
        <Card
          variant="outlined"
          style={{
            marginBottom: theme.spacing[6],
            backgroundColor: theme.status.infoBackground,
            borderColor: theme.status.info,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.status.info,
              marginBottom: theme.spacing[2],
              fontWeight: '600',
            }}
          >
            💡 What is a household?
          </Text>
          <Text style={{ fontSize: 14, color: theme.text.secondary }}>
            A household can be just you, or you and your spouse/partner. Multiple people can manage the same budget together.
          </Text>
        </Card>

        {/* Form */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Input
            label="Household Name"
            value={householdName}
            onChangeText={(text) => {
              setHouseholdName(text);
              setNameError('');
            }}
            onBlur={() => validateName(householdName)}
            error={nameError}
            placeholder="e.g., Smith Family, My Budget, John & Jane"
            autoCapitalize="words"
            testID="household-name-input"
            required
          />

          <View style={{ height: theme.spacing[4] }} />

          <SearchableSelect
            label="Currency"
            value={currency}
            onSelect={setCurrency}
            options={CURRENCY_OPTIONS}
            placeholder="Select currency"
            helperText="Your household's currency for all transactions"
            testID="household-currency-select"
            required
          />

          <View style={{ height: theme.spacing[4] }} />

          <SearchableSelect
            label="Timezone"
            value={timezone}
            onSelect={setTimezone}
            options={TIMEZONE_OPTIONS}
            placeholder="Select timezone"
            helperText="Your timezone for accurate date/time display"
            testID="household-timezone-select"
            required
          />
        </View>

        {/* Create Button */}
        <PrimaryButton
          title={loading ? 'Creating household...' : 'Create Household'}
          onPress={handleCreateHousehold}
          loading={loading}
          disabled={loading}
          fullWidth
          size="lg"
          testID="create-household-button"
        />

        {/* Baby Steps Preview */}
        <Card
          style={{
            marginTop: theme.spacing[8],
            backgroundColor: theme.background.tertiary,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            📈 You&apos;ll start at Baby Step 1
          </Text>
          <Text style={{ fontSize: 13, color: theme.text.secondary }}>
            Save $1,000 for your starter emergency fund. This is your first step toward financial freedom!
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

