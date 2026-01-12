// Input Component - Homebase Budget
// Themed text input with label, error states, and validation

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { AppText } from './styled/app-text';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

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

  // Filter out any props that might cause issues with TextInput
  // TextInput doesn't support onSelect (only onSelectionChange)
  const { onSelect, ...safeTextInputProps } = textInputProps as any;

  return (
    <View style={[styles.container, fullWidth && { width: '100%' }, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING[1] }}>
          <AppText
            variant="body"
            color={hasError ? theme.status.error : theme.text.secondary}
          >
            {label}
          </AppText>
          {required && (
            <AppText variant="body" color={theme.status.error}> *</AppText>
          )}
        </View>
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
            borderRadius: BORDER_RADIUS.sm, // Inputs use sm (12px) per premium standards
            paddingHorizontal: SPACING[4],
            minHeight: 50, // Premium standard: 48-52px, using 50px
          },
          disabled && { opacity: 0.6 },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={[styles.icon, { marginRight: SPACING[2] }]}>
            {typeof leftIcon === 'string' ? (
              <AppText variant="body" color={theme.text.secondary}>
                {leftIcon}
              </AppText>
            ) : (
              leftIcon
            )}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          {...safeTextInputProps}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            safeTextInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            safeTextInputProps.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              flex: 1,
              color: theme.text.primary,
              fontSize: 16, // Premium standard body text size
            },
            style,
          ]}
          placeholderTextColor={theme.text.tertiary}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={[styles.icon, { marginLeft: SPACING[2] }]}>
            {typeof rightIcon === 'string' ? (
              <AppText variant="body" color={theme.text.secondary}>
                {rightIcon}
              </AppText>
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <AppText
          variant="caption"
          color={theme.status.error}
          style={{ marginTop: SPACING[1] }}
        >
          {error}
        </AppText>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <AppText
          variant="caption"
          color={theme.text.tertiary}
          style={{ marginTop: SPACING[1] }}
        >
          {helperText}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[1],
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
});

