import { Image } from 'expo-image';
import { StyleSheet, View, Alert } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { APP_VERSION, PHASE } from '@/shared/types';
import { Card, OutlineButton } from '@/presentation/components';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

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
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[2] }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.status.successBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing[3],
                }}
              >
                <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: theme.status.success }}>
                  1
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                  Baby Step 1
                </ThemedText>
                <ThemedText style={{ fontSize: 14, color: theme.text.secondary }}>
                  $1,000 Emergency Fund
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: theme.status.success }}>
                $750
              </ThemedText>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: theme.background.tertiary,
                borderRadius: theme.borderRadius.full,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: '75%',
                  backgroundColor: theme.status.success,
                }}
              />
            </View>
            <ThemedText style={{ fontSize: 12, color: theme.text.tertiary, marginTop: theme.spacing[2] }}>
              75% complete - $250 to go!
            </ThemedText>
          </Card>
        </View>
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
