import React, { useState, useCallback } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View, Alert } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { APP_VERSION, PHASE } from '@/shared/types';
import { Card, OutlineButton, BabyStepsDisplay } from '@/presentation/components';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { CurrencyCode } from '@/shared/utils/currency';
import { sanitizeBabyStep } from '@/shared/constants/baby-steps';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [currentBabyStep, setCurrentBabyStep] = useState<number>(1);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');

  // Load current baby step and currency from household when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadHouseholdData = async () => {
        if (!user?.default_household_id) return;

        try {
          const householdDoc = await getDoc(
            doc(db, 'households', user.default_household_id)
          );

          if (householdDoc.exists()) {
            const data = householdDoc.data();
            // Sanitize baby step to ensure it's valid (1-7)
            const rawStep = data.current_baby_step;
            setCurrentBabyStep(sanitizeBabyStep(rawStep));
            setHouseholdCurrency((data.currency as CurrencyCode) || 'USD');
          }
        } catch (error) {
          console.error('Error loading household data:', error);
        }
      };

      loadHouseholdData();
    }, [user?.default_household_id])
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to sign out');
              console.error('Sign out error:', err);
            }
          },
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Homebase Budget</ThemedText>
        <HelloWave />
      </ThemedView>
      
      {/* Welcome Message */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Welcome back, {user?.name}! 👋</ThemedText>
        <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>
          {user?.email}
        </ThemedText>
        {/* Debug: Show user data */}
        {__DEV__ && (
          <Card style={{ marginTop: theme.spacing[2], backgroundColor: theme.status.warningBackground }}>
            <ThemedText style={{ fontSize: 12, fontFamily: 'monospace' }}>
              🐛 DEBUG:{'\n'}
              User ID: {user?.id}{'\n'}
              Household IDs: {JSON.stringify(user?.household_ids)}{'\n'}
              Default Household: {user?.default_household_id || 'NONE'}
            </ThemedText>
          </Card>
        )}
      </ThemedView>
      
      {/* Version Info */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={{ color: '#00897B', fontWeight: 'bold' }}>
          ✅ v{APP_VERSION} - {PHASE}
        </ThemedText>
        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
          {new Date().toLocaleTimeString()} - Theme system ready!
        </ThemedText>
      </ThemedView>

      {/* Baby Steps Progress */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your Journey</ThemedText>
        <View style={{ marginTop: theme.spacing[3] }}>
          <BabyStepsDisplay
            currentStep={currentBabyStep}
            currency={householdCurrency}
            onPress={() => router.push('/baby-steps/select')}
            testID="baby-steps-display"
          />
        </View>
      </ThemedView>

      {/* Accounts Quick Link */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">💰 Accounts</ThemedText>
        <Link href="/accounts" style={{ marginTop: 10 }}>
          <ThemedText type="link">Manage Your Accounts →</ThemedText>
        </Link>
        <ThemedText style={{ fontSize: 12, marginTop: 5 }}>
          View balances, add accounts, track spending
        </ThemedText>
      </ThemedView>

      {/* Quick Links */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🎨 UI Components</ThemedText>
        <Link href="/components-demo" style={{ marginTop: 10 }}>
          <ThemedText type="link">View Component Library →</ThemedText>
        </Link>
        <ThemedText style={{ fontSize: 12, marginTop: 5 }}>
          Buttons, Cards, Inputs with Homebase theme
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🔥 Firebase Test</ThemedText>
        <Link href="/firebase-test" style={{ marginTop: 10 }}>
          <ThemedText type="link">Test Firebase Connection →</ThemedText>
        </Link>
        <ThemedText style={{ fontSize: 12, marginTop: 5 }}>
          Verify Firestore read/write and offline persistence
        </ThemedText>
      </ThemedView>

      {/* Sign Out */}
      <ThemedView style={styles.stepContainer}>
        <OutlineButton
          title="Sign Out"
          onPress={handleSignOut}
          testID="sign-out-button"
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
