// AppText Component - Premium UI Component Tier
// Enforces typography preset requirement (one of 8 allowed styles)
// Premium UI Standards: Text → AppText (typography preset required)
// See .cursor/rules/37-premium-ui-standards.mdc for details

import React, { ReactNode } from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { TEXT_STYLES } from '@/shared/constants/typography';

// Allowed text style variants (8 max - premium standard)
export type TextVariant = 
  | 'display'
  | 'h1'
  | 'h2'
  | 'body'
  | 'bodyEmphasis'
  | 'caption'
  | 'overline'
  | 'button';

interface AppTextProps extends Omit<TextProps, 'style'> {
  /**
   * Text style variant (REQUIRED)
   * Must be one of the 8 allowed premium text styles
   */
  variant: TextVariant;
  /**
   * Text content
   */
  children: ReactNode;
  /**
   * Additional style (will be merged with variant style)
   */
  style?: StyleProp<TextStyle>;
  /**
   * Color override (defaults to theme.text.primary)
   */
  color?: string;
}

/**
 * AppText - Enforced typography component
 * 
 * Premium UI Standard: All text must use one of 8 allowed text styles.
 * This component enforces the typography preset requirement.
 * 
 * @example
 * ```tsx
 * <AppText variant="h1">Page Title</AppText>
 * <AppText variant="body">Body text content</AppText>
 * <AppText variant="caption" color={theme.text.secondary}>
 *   Helper text
 * </AppText>
 * ```
 */
export const AppText: React.FC<AppTextProps> = ({
  variant,
  children,
  style,
  color,
  ...textProps
}) => {
  const { theme } = useTheme();
  
  // Get base style from TEXT_STYLES
  const baseStyle = TEXT_STYLES[variant];
  
  // Determine text color
  const textColor = color || theme.text.primary;
  
  return (
    <Text style={[baseStyle, { color: textColor }, style]} {...textProps}>
      {children}
    </Text>
  );
};

// Convenience exports for common variants
export const DisplayText: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="display" />
);

export const Heading1: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="h1" />
);

export const Heading2: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="h2" />
);

export const BodyText: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="body" />
);

export const BodyEmphasisText: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="bodyEmphasis" />
);

export const CaptionText: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="caption" />
);

export const OverlineText: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText {...props} variant="overline" />
);
