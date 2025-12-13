// Button Component - Homebase Budget
// Themed button with multiple variants

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();

  // Size configurations
  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      fontSize: 14,
      minHeight: 32,
    },
    md: {
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      fontSize: 16,
      minHeight: 44,
    },
    lg: {
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[6],
      fontSize: 18,
      minHeight: 56,
    },
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles[size],
    };

    const baseTextStyle: TextStyle = {
      fontSize: sizeStyles[size].fontSize,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled
              ? theme.interactive.primaryDisabled
              : theme.interactive.primary,
          },
          text: {
            ...baseTextStyle,
            color: theme.text.inverse,
          },
        };

      case 'secondary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled
              ? theme.interactive.secondary
              : theme.interactive.secondary,
            borderWidth: 1,
            borderColor: theme.border.default,
          },
          text: {
            ...baseTextStyle,
            color: disabled ? theme.text.disabled : theme.text.primary,
          },
        };

      case 'outline':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: disabled
              ? theme.border.default
              : theme.interactive.primary,
          },
          text: {
            ...baseTextStyle,
            color: disabled ? theme.text.disabled : theme.interactive.primary,
          },
        };

      case 'ghost':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
          },
          text: {
            ...baseTextStyle,
            color: disabled ? theme.text.disabled : theme.interactive.primary,
          },
        };

      default:
        return {
          container: baseStyle,
          text: baseTextStyle,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        variantStyles.container,
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.text.inverse : theme.interactive.primary}
          size="small"
        />
      ) : (
        <Text style={[variantStyles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// Convenience exports for specific button types
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="outline" />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="ghost" />
);

