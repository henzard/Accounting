// Login Screen - Homebase Budget
// Email/password authentication

import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, PrimaryButton, GhostButton } from '@/presentation/components';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignIn = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      
      console.log('✅ Login successful, navigating to app...');
      
      // Navigate to home screen
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      Alert.alert('Login Failed', error.message || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignup = () => {
    router.push('/signup');
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
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing[8] }}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={{
              width: 120,
              height: 120,
              marginBottom: theme.spacing[4],
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: theme.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            Homebase Budget
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.text.secondary,
              textAlign: 'center',
            }}
          >
            Your financial homebase
          </Text>
        </View>

        {/* Login Form */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            onBlur={() => validateEmail(email)}
            error={emailError}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            testID="login-email-input"
          />

          <View style={{ height: theme.spacing[4] }} />

          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            onBlur={() => validatePassword(password)}
            error={passwordError}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            testID="login-password-input"
          />
        </View>

        {/* Sign In Button */}
        <PrimaryButton
          title={loading ? 'Signing in...' : 'Sign In'}
          onPress={handleSignIn}
          loading={loading}
          disabled={loading || authLoading}
          fullWidth
          size="lg"
          testID="login-submit-button"
        />

        {/* Sign Up Link */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing[6],
          }}
        >
          <Text style={{ color: theme.text.secondary, fontSize: 16 }}>
            Don&apos;t have an account?{' '}
          </Text>
          <GhostButton
            title="Sign Up"
            onPress={handleGoToSignup}
            size="sm"
            testID="go-to-signup-button"
          />
        </View>

        {/* Dev Mode Indicator */}
        {__DEV__ && (
          <View
            style={{
              marginTop: theme.spacing[8],
              padding: theme.spacing[3],
              backgroundColor: theme.status.infoBackground,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <Text style={{ color: theme.status.info, fontSize: 12, textAlign: 'center' }}>
              🧪 DEV MODE - Firebase Auth Test
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

