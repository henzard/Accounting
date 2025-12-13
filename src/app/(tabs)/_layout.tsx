import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';

export default function TabLayout() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Auth guard: redirect to login if not authenticated
  // Household guard: redirect to household setup if no household
  useEffect(() => {
    // Only act when loading is complete
    if (loading) return;

    // Check authentication first
    if (!user) {
      console.log('🔒 User not authenticated, redirecting to login...');
      router.replace('/login');
      return;
    }

    // User is authenticated, check household
    if (!user.default_household_id) {
      console.log('🏠 No default household, redirecting to household setup...');
      
      // If user has households, let them select one
      if (user.household_ids && user.household_ids.length > 0) {
        router.replace('/household/select');
      } else {
        // Otherwise, create first household
        router.replace('/household/create');
      }
    }
  }, [user, loading]);

  // Show loading screen while checking auth
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
          Loading...
        </Text>
      </View>
    );
  }

  // Don't render tabs if not authenticated
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.interactive.primary, // Homebase blue
        tabBarInactiveTintColor: theme.text.tertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.surface.default,
          borderTopColor: theme.border.default,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.pie.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
