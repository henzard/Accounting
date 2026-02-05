// Select Household Screen - Homebase Budget
// Choose which household to use (for users with multiple households)

import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card, PrimaryButton, OutlineButton, ScreenWrapper, AppText } from '@/presentation/components';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { Household, createHousehold } from '@/domain/entities';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export default function SelectHouseholdScreen() {
  const { theme } = useTheme();
  const { user, updateUserLocally } = useAuth();
  const router = useRouter();

  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHouseholds();
  }, [user]);

  const loadHouseholds = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🏠 Loading households for user:', user.id);
      console.log('📋 User household_ids:', user.household_ids);

      // Query households where user is a member (source of truth is household.member_ids)
      // This works even if user.household_ids hasn't been updated yet
      const householdsQuery = query(
        collection(db, 'households'),
        where('member_ids', 'array-contains', user.id)
      );

      const snapshot = await getDocs(householdsQuery);
      const loadedHouseholds = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Don't use createHousehold factory - it's for NEW households only
        // Instead, manually construct from Firestore data
        return {
          id: doc.id,
          name: data.name,
          owner_id: data.owner_id,
          member_ids: data.member_ids || [data.owner_id],
          timezone: data.timezone,
          currency: data.currency,
          current_baby_step: data.current_baby_step,
          baby_step_started_at: data.baby_step_started_at?.toDate(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date(),
          created_by: data.created_by,
        } as Household;
      });

      setHouseholds(loadedHouseholds);
      
      // Pre-select default household if available
      if (user.default_household_id) {
        setSelectedHouseholdId(user.default_household_id);
      } else if (loadedHouseholds.length === 1) {
        // Pre-select if only one household (user can still change it)
        setSelectedHouseholdId(loadedHouseholds[0].id);
      }

      console.log(`✅ Loaded ${loadedHouseholds.length} households`);
    } catch (error) {
      console.error('❌ Failed to load households:', error);
      Alert.alert('Error', 'Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHousehold = async (householdId?: string) => {
    const idToUse = householdId || selectedHouseholdId;
    if (!idToUse || !user) {
      if (!householdId) {
        Alert.alert('Error', 'Please select a household');
      }
      return;
    }

    setSaving(true);
    try {
      console.log('🏠 Setting default household:', idToUse);

      // Update user's default household
      await setDoc(
        doc(db, 'users', user.id),
        {
          default_household_id: idToUse,
          // Also ensure household_ids includes this household
          household_ids: user.household_ids.includes(idToUse) 
            ? user.household_ids 
            : [...user.household_ids, idToUse],
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('✅ Default household updated');

      // KISS: Update local user state immediately (don't wait for Firestore sync)
      updateUserLocally({
        default_household_id: idToUse,
        household_ids: user.household_ids.includes(idToUse) 
          ? user.household_ids 
          : [...user.household_ids, idToUse],
      });

      console.log('✅ User updated locally');

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Failed to set default household:', error);
      Alert.alert('Error', 'Failed to select household');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewHousehold = () => {
    router.push('/household/create');
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
          <AppText
            variant="body"
            style={{
              marginTop: SPACING[4],
              color: theme.text.secondary,
            }}
          >
            Loading households...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  // If no households, redirect to create
  if (households.length === 0) {
    return (
      <ScreenWrapper>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AppText
            variant="h1"
            style={{
              color: theme.text.primary,
              marginBottom: SPACING[4],
              textAlign: 'center',
            }}
          >
            No Households Found
          </AppText>
          <AppText
            variant="body"
            style={{
              color: theme.text.secondary,
              textAlign: 'center',
              marginBottom: SPACING[8],
            }}
          >
            Let's create your first household to get started!
          </AppText>
          <PrimaryButton
            title="Create Household"
            onPress={handleCreateNewHousehold}
            size="lg"
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING[8] }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: SPACING[8] }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.interactive.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING[4],
            }}
          >
            <AppText variant="display" style={{ color: theme.text.inverse }}>🏠</AppText>
          </View>
          <AppText
            variant="display"
            style={{
              color: theme.text.primary,
              marginBottom: SPACING[2],
              textAlign: 'center',
            }}
          >
            Select Household
          </AppText>
          <AppText
            variant="body"
            style={{
              color: theme.text.secondary,
              textAlign: 'center',
            }}
          >
            Choose which household you want to manage
          </AppText>
        </View>

        {/* Household List */}
        <View style={{ marginBottom: SPACING[6] }}>
          {households.map((household) => (
            <TouchableOpacity
              key={household.id}
              onPress={() => setSelectedHouseholdId(household.id)}
              activeOpacity={0.7}
            >
              <Card
                variant={selectedHouseholdId === household.id ? 'elevated' : 'outlined'}
                style={{
                  marginBottom: SPACING[3],
                  borderWidth: selectedHouseholdId === household.id ? 2 : 1,
                  borderColor: selectedHouseholdId === household.id
                    ? theme.interactive.primary
                    : theme.border.default,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Selection Indicator */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedHouseholdId === household.id
                        ? theme.interactive.primary
                        : theme.border.default,
                      backgroundColor: selectedHouseholdId === household.id
                        ? theme.interactive.primary
                        : 'transparent',
                      marginRight: SPACING[3],
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selectedHouseholdId === household.id && (
                      <AppText variant="body" style={{ color: theme.text.inverse }}>✓</AppText>
                    )}
                  </View>

                  {/* Household Info */}
                  <View style={{ flex: 1 }}>
                    <AppText
                      variant="h3"
                      style={{
                        color: theme.text.primary,
                        marginBottom: SPACING[1],
                      }}
                    >
                      {household.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.text.secondary }}>
                      Baby Step {household.current_baby_step} • {household.member_ids.length} member
                      {household.member_ids.length === 1 ? '' : 's'}
                    </AppText>
                    {household.owner_id === user?.id && (
                      <AppText variant="caption" style={{ color: theme.interactive.primary, marginTop: SPACING[1] }}>
                        Owner
                      </AppText>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <PrimaryButton
          title={saving ? 'Selecting...' : 'Continue'}
          onPress={handleSelectHousehold}
          loading={saving}
          disabled={!selectedHouseholdId || saving}
          fullWidth
          size="lg"
          style={{ marginBottom: SPACING[3] }}
          testID="continue-button"
        />

        <OutlineButton
          title="Create New Household"
          onPress={handleCreateNewHousehold}
          fullWidth
          testID="create-new-household-button"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

