// Card Component - Homebase Budget
// Themed container for content sections

import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/infrastructure/theme';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  testID,
}) => {
  const { theme } = useTheme();

  // Padding configurations
  const paddingStyles = {
    none: 0,
    sm: theme.spacing[3],   // 12px
    md: theme.spacing[4],   // 16px
    lg: theme.spacing[6],   // 24px
  };

  // Variant styles
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.surface.default,
      borderRadius: theme.borderRadius.lg,
      padding: paddingStyles[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4, // Android shadow
        };

      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.border.default,
        };

      case 'default':
      default:
        return baseStyle;
    }
  };

  return (
    <View testID={testID} style={[getVariantStyles(), style]}>
      {children}
    </View>
  );
};

// Convenience variants
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

