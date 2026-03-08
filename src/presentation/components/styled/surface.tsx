// Surface Component - Premium UI Component Tier
// Enforces surface type requirement (default, raised, overlay)
// Premium UI Standards: View → Surface (surface type required)
// See .cursor/rules/37-premium-ui-standards.mdc for details

import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

// Allowed surface variants
export type SurfaceVariant = 'default' | 'raised' | 'overlay';

interface SurfaceProps {
  /**
   * Surface variant (REQUIRED)
   * - default: Standard surface (cards, containers)
   * - raised: Elevated surface (modals, dropdowns)
   * - overlay: Overlay surface (backdrops, sheets)
   */
  variant: SurfaceVariant;
  /**
   * Content
   */
  children: ReactNode;
  /**
   * Padding (uses SPACING tokens)
   * Default: SPACING[4] (16px)
   */
  padding?: number;
  /**
   * Border radius (uses BORDER_RADIUS tokens)
   * Default: BORDER_RADIUS.md (16px for cards)
   */
  borderRadius?: number;
  /**
   * Additional style (will be merged with variant style)
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Surface - Enforced surface component
 * 
 * Premium UI Standard: All surfaces must use one of 3 allowed variants.
 * This component enforces the surface type requirement.
 * 
 * @example
 * ```tsx
 * // Default surface (cards)
 * <Surface variant="default" padding={SPACING[4]}>
 *   <AppText variant="body">Card content</AppText>
 * </Surface>
 * 
 * // Raised surface (modals)
 * <Surface variant="raised" borderRadius={BORDER_RADIUS.lg}>
 *   <ModalContent />
 * </Surface>
 * ```
 */
export const Surface: React.FC<SurfaceProps> = ({
  variant,
  children,
  padding = SPACING[4], // 16px default
  borderRadius = BORDER_RADIUS.md, // 16px default for cards
  style,
  testID,
}) => {
  const { theme } = useTheme();
  
  // Get base style based on variant
  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.surface[variant],
      borderRadius,
      padding,
    };

    switch (variant) {
      case 'raised':
        // Raised surfaces get subtle shadow (modals, dropdowns)
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4, // Android
        };
      
      case 'overlay':
        // Overlay surfaces (backdrops)
        return {
          ...baseStyle,
          backgroundColor: theme.surface.overlay,
        };
      
      case 'default':
      default:
        // Default surfaces use borders, not shadows (premium standard)
        return {
          ...baseStyle,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border.default,
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View testID={testID} style={[variantStyle, style]}>
      {children}
    </View>
  );
};

// Convenience exports for specific variants
export const DefaultSurface: React.FC<Omit<SurfaceProps, 'variant'>> = (props) => (
  <Surface {...props} variant="default" />
);

export const RaisedSurface: React.FC<Omit<SurfaceProps, 'variant'>> = (props) => (
  <Surface {...props} variant="raised" />
);

export const OverlaySurface: React.FC<Omit<SurfaceProps, 'variant'>> = (props) => (
  <Surface {...props} variant="overlay" />
);
