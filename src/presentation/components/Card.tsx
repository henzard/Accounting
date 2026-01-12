// Card Component - Homebase Budget
// Themed container for content sections
// Premium UI: Uses Surface component internally for consistency

import React, { ReactNode } from 'react';
import { ViewStyle } from 'react-native';
import { Surface } from './styled/surface';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
}

// Map Card variants to Surface variants
const mapCardVariantToSurface = (variant: CardVariant): 'default' | 'raised' => {
  switch (variant) {
    case 'elevated':
      return 'raised'; // Elevated cards use raised surface (with shadow)
    case 'outlined':
    case 'default':
    default:
      return 'default'; // Default and outlined use default surface (with border)
  }
};

// Map Card padding to SPACING tokens
const mapPaddingToSpacing = (padding: 'none' | 'sm' | 'md' | 'lg'): number => {
  switch (padding) {
    case 'none':
      return 0;
    case 'sm':
      return SPACING[3]; // 12px
    case 'md':
      return SPACING[4]; // 16px
    case 'lg':
      return SPACING[6]; // 24px
  }
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  testID,
}) => {
  // Map to Surface component
  const surfaceVariant = mapCardVariantToSurface(variant);
  const surfacePadding = mapPaddingToSpacing(padding);
  
  // For outlined variant, we need to add border (Surface default already has border)
  // For elevated, Surface raised already has shadow
  // For default, Surface default already has border
  
  return (
    <Surface
      variant={surfaceVariant}
      padding={surfacePadding}
      borderRadius={BORDER_RADIUS.md} // Cards use md (16px)
      style={style}
      testID={testID}
    >
      {children}
    </Surface>
  );
};

// Convenience variants
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

