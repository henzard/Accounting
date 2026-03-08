// Screen Wrapper Component
// Premium UI Standards: Single screen wrapper for consistent scaffolding
// Provides: Safe area handling, background color, default padding, standard header behavior
// See .cursor/rules/37-premium-ui-standards.mdc for details

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/infrastructure/theme';
import { SPACING } from '@/shared/constants/spacing';

interface ScreenWrapperProps {
  children: ReactNode;
  /**
   * Horizontal padding for screen content
   * Default: SPACING[5] (20px) - premium feel
   * Compact: SPACING[4] (16px) - for dense information screens
   */
  padding?: number;
  /**
   * Background color override
   * Default: theme.background.primary
   */
  backgroundColor?: string;
  /**
   * Custom style for the container
   */
  style?: ViewStyle;
  /**
   * Whether to include safe area insets
   * Default: true
   */
  safeArea?: boolean;
}

/**
 * ScreenWrapper - Standardized screen scaffolding
 * 
 * All screens should use this component for consistent:
 * - Safe area handling
 * - Background color
 * - Default padding (20px premium feel)
 * - Standard header behavior
 * 
 * @example
 * ```tsx
 * export default function MyScreen() {
 *   return (
 *     <ScreenWrapper>
 *       <Text>Screen content</Text>
 *     </ScreenWrapper>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Compact padding for dense screens
 * <ScreenWrapper padding={SPACING[4]}>
 *   <DenseContent />
 * </ScreenWrapper>
 * ```
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  padding = SPACING[5], // 20px default - premium feel
  backgroundColor,
  style,
  safeArea = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor || theme.background.primary,
    paddingHorizontal: padding,
  };

  if (safeArea) {
    return (
      <SafeAreaView
        style={[
          containerStyle,
          {
            // Don't add paddingTop here - ScreenHeader handles it
            paddingBottom: insets.bottom,
          },
          style,
        ]}
        edges={['bottom', 'left', 'right']} // Only handle bottom/left/right, let ScreenHeader handle top
      >
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles handled inline for theme integration
});
