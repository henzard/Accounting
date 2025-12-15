// Signup Screen - Homebase Budget
// Create new account with email/password

import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Input, PrimaryButton, GhostButton } from '@/presentation/components';

export default function SignupScreen() {
  const { theme } = useTheme();
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateName = (name: string): boolean => {
    if (!name || name.trim().length === 0) {
      setNameError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

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

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignUp = async () => {
    // Validate all inputs
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      
      console.log('✅ Account created successfully');
      
      Alert.alert(
        'Welcome!',
        'Your account has been created successfully. Let us set up your household!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/household/create'),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      
      // User-friendly error messages
      let errorMessage = error.message;
      if (error.message?.includes('email-already-in-use')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.back();
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
        <View style={{ alignItems: 'center', marginBottom: theme.spacing[6] }}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={{
              width: 100,
              height: 100,
              marginBottom: theme.spacing[3],
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: theme.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.text.secondary,
              textAlign: 'center',
            }}
          >
            Start your debt-free journey today
          </Text>
        </View>

        {/* Signup Form */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <Input
            label="Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            onBlur={() => validateName(name)}
            error={nameError}
            placeholder="Your full name"
            autoCapitalize="words"
            autoComplete="name"
            testID="signup-name-input"
          />

          <View style={{ height: theme.spacing[4] }} />

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
            testID="signup-email-input"
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
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            testID="signup-password-input"
          />

          <View style={{ height: theme.spacing[4] }} />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError('');
            }}
            onBlur={() => validateConfirmPassword(confirmPassword)}
            error={confirmPasswordError}
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
            testID="signup-confirm-password-input"
          />
        </View>

        {/* Sign Up Button */}
        <PrimaryButton
          title={loading ? 'Creating account...' : 'Create Account'}
          onPress={handleSignUp}
          loading={loading}
          disabled={loading || authLoading}
          fullWidth
          size="lg"
          testID="signup-submit-button"
        />

        {/* Login Link */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing[6],
          }}
        >
          <Text style={{ color: theme.text.secondary, fontSize: 16 }}>
            Already have an account?{' '}
          </Text>
          <GhostButton
            title="Sign In"
            onPress={handleGoToLogin}
            size="sm"
            testID="go-to-login-button"
          />
        </View>

        {/* Terms */}
        <Text
          style={{
            fontSize: 12,
            color: theme.text.tertiary,
            textAlign: 'center',
            marginTop: theme.spacing[8],
          }}
        >
          By creating an account, you agree to follow Dave Ramsey&apos;s Baby Steps to financial freedom
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

