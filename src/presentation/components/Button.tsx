// Button Component - Premium UI Component Tier
// Enforces button variant requirement (primary, secondary, destructive)
// Premium UI Standards: Touchable → Button (variant required)
// See .cursor/rules/37-premium-ui-standards.mdc for details

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
import { BUTTON_HEIGHT, BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

// Premium UI Standard: Button variants (primary, secondary, destructive)
// Note: 'outline' and 'ghost' kept for backward compatibility but not in premium standard
type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
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

  // Premium UI Standard: Button heights 48-52px
  // Size configurations
  const sizeStyles = {
    sm: {
      paddingVertical: SPACING[2], // 8px
      paddingHorizontal: SPACING[4], // 16px
      minHeight: BUTTON_HEIGHT.sm, // 48px
    },
    md: {
      paddingVertical: SPACING[3], // 12px
      paddingHorizontal: SPACING[6], // 24px
      minHeight: BUTTON_HEIGHT.md, // 50px (premium standard)
    },
    lg: {
      paddingVertical: SPACING[3], // 12px
      paddingHorizontal: SPACING[8], // 32px
      minHeight: BUTTON_HEIGHT.lg, // 52px
    },
  };

  // Variant styles
  const getVariantStyles = () => {
    // Premium UI Standard: Border radius 12-14px for buttons
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.sm, // 12px (10-12 range for small controls)
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles[size],
    };

    // Premium UI Standard: Button text uses TEXT_STYLES.button
    const baseTextStyle: TextStyle = {
      ...TEXT_STYLES.button,
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

      case 'destructive':
        // Premium UI Standard: Destructive variant (rare, controlled)
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled
              ? theme.status.error + '40' // 40% opacity
              : theme.status.error,
          },
          text: {
            ...baseTextStyle,
            color: theme.text.inverse,
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

