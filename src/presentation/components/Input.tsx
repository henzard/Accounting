// Input Component - Homebase Budget
// Themed text input with label, error states, and validation

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={[styles.container, fullWidth && { width: '100%' }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: hasError ? theme.status.error : theme.text.secondary,
              fontSize: 14,
              fontWeight: '500',
              marginBottom: theme.spacing[2],
            },
          ]}
        >
          {label}
          {required && (
            <Text style={{ color: theme.status.error }}> *</Text>
          )}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled
              ? theme.background.tertiary
              : theme.surface.default,
            borderWidth: 1,
            borderColor: hasError
              ? theme.status.error
              : isFocused
              ? theme.border.focus
              : theme.border.default,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing[3],
            minHeight: 48,
          },
          disabled && { opacity: 0.6 },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={[styles.icon, { marginRight: theme.spacing[2] }]}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          {...textInputProps}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              flex: 1,
              color: theme.text.primary,
              fontSize: 16,
            },
            style,
          ]}
          placeholderTextColor={theme.text.tertiary}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={[styles.icon, { marginLeft: theme.spacing[2] }]}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={[
            styles.helperText,
            {
              color: theme.status.error,
              fontSize: 12,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          {error}
        </Text>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <Text
          style={[
            styles.helperText,
            {
              color: theme.text.tertiary,
              fontSize: 12,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    // Themed in component
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    // Themed in component
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    // Themed in component
  },
});

