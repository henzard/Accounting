// Select Household Screen - Homebase Budget
// Choose which household to use (for users with multiple households)

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card, PrimaryButton, OutlineButton } from '@/presentation/components';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { Household, createHousehold } from '@/domain/entities';

export default function SelectHouseholdScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHouseholds();
  }, [user]);

  const loadHouseholds = async () => {
    if (!user || user.household_ids.length === 0) {
      setLoading(false);
      return;
    }

    try {
      console.log('🏠 Loading households for user:', user.id);

      const householdsQuery = query(
        collection(db, 'households'),
        where('member_ids', 'array-contains', user.id)
      );

      const snapshot = await getDocs(householdsQuery);
      const loadedHouseholds = snapshot.docs.map((doc) => {
        const data = doc.data();
        return createHousehold({
          id: doc.id,
          name: data.name,
          owner_id: data.owner_id,
          member_ids: data.member_ids || [],
          timezone: data.timezone,
          currency: data.currency,
          current_baby_step: data.current_baby_step,
          baby_step_started_at: data.baby_step_started_at?.toDate(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date(),
          created_by: data.created_by,
        });
      });

      setHouseholds(loadedHouseholds);
      
      // Pre-select default household if available
      if (user.default_household_id) {
        setSelectedHouseholdId(user.default_household_id);
      } else if (loadedHouseholds.length === 1) {
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

  const handleSelectHousehold = async () => {
    if (!selectedHouseholdId || !user) {
      Alert.alert('Error', 'Please select a household');
      return;
    }

    setSaving(true);
    try {
      console.log('🏠 Setting default household:', selectedHouseholdId);

      // Update user's default household
      await setDoc(
        doc(db, 'users', user.id),
        {
          default_household_id: selectedHouseholdId,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('✅ Default household updated');

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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={theme.interactive.primary} />
        <Text
          style={{
            marginTop: theme.spacing[4],
            color: theme.text.secondary,
            fontSize: 16,
          }}
        >
          Loading households...
        </Text>
      </View>
    );
  }

  // If no households, redirect to create
  if (households.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background.primary,
          padding: theme.spacing[6],
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.text.primary,
            marginBottom: theme.spacing[4],
            textAlign: 'center',
          }}
        >
          No Households Found
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.text.secondary,
            textAlign: 'center',
            marginBottom: theme.spacing[8],
          }}
        >
          Let's create your first household to get started!
        </Text>
        <PrimaryButton
          title="Create Household"
          onPress={handleCreateNewHousehold}
          size="lg"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background.primary }}
      contentContainerStyle={{ padding: theme.spacing[6] }}
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
          Select Household
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.text.secondary,
            textAlign: 'center',
          }}
        >
          Choose which household you want to manage
        </Text>
      </View>

      {/* Household List */}
      <View style={{ marginBottom: theme.spacing[6] }}>
        {households.map((household) => (
          <TouchableOpacity
            key={household.id}
            onPress={() => setSelectedHouseholdId(household.id)}
            activeOpacity={0.7}
          >
            <Card
              variant={selectedHouseholdId === household.id ? 'elevated' : 'outlined'}
              style={{
                marginBottom: theme.spacing[3],
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
                    marginRight: theme.spacing[3],
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {selectedHouseholdId === household.id && (
                    <Text style={{ color: theme.text.inverse, fontSize: 16 }}>✓</Text>
                  )}
                </View>

                {/* Household Info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: 4,
                    }}
                  >
                    {household.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.text.secondary }}>
                    Baby Step {household.current_baby_step} • {household.member_ids.length} member
                    {household.member_ids.length === 1 ? '' : 's'}
                  </Text>
                  {household.owner_id === user?.id && (
                    <Text style={{ fontSize: 12, color: theme.interactive.primary, marginTop: 4 }}>
                      Owner
                    </Text>
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
        style={{ marginBottom: theme.spacing[3] }}
        testID="continue-button"
      />

      <OutlineButton
        title="Create New Household"
        onPress={handleCreateNewHousehold}
        fullWidth
        testID="create-new-household-button"
      />
    </ScrollView>
  );
}

