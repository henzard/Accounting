// Typography System for Premium UI
// Premium UI Standards: Max 8 text styles, semibold for headlines, 1.4× line height for body
// Typography Pairing Recommendations (from docs/design/color-theme.md):
// - Headings: Serif or high-contrast sans (Playfair Display, Canela, Cormorant, or Inter with tight tracking)
// - Body: Neutral modern sans (Inter, Source Sans 3, IBM Plex Sans)
// - Letter spacing: Slightly increased on headings
// - Font weights: Regular, Medium, Semibold only

export const FONTS = {
  // System fonts for best performance on mobile
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  
  // TODO: Add custom fonts for premium feel:
  // Headings: Playfair Display, Canela, Cormorant, or Inter (tight tracking)
  // Body: Inter, Source Sans 3, IBM Plex Sans
  // regular: 'Inter-Regular',
  // medium: 'Inter-Medium',
  // semibold: 'Inter-SemiBold',
} as const;

export const FONT_SIZES = {
  xs: 12,    // Captions, small labels
  sm: 14,    // Secondary text
  md: 16,    // Body text (base)
  lg: 18,    // Emphasized text
  xl: 20,    // Small headings
  '2xl': 24, // Section headings
  '3xl': 30, // Page titles
  '4xl': 36, // Hero text
  '5xl': 48, // Large display (rarely used)
} as const;

export const LINE_HEIGHTS = {
  tight: 1.25,   // For headings
  normal: 1.4,   // For body text (premium standard: 1.35-1.5×, prefer 1.4×)
  relaxed: 1.75, // For longer paragraphs (rarely used)
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

// ============================================
// PRE-DEFINED TEXT STYLES
// Premium UI Standards: Maximum 8 styles
// ============================================

export const TEXT_STYLES = {
  // ============================================
  // PREMIUM SET (8 styles max)
  // ============================================
  
  // Display (rare, hero text) - 28-32px range
  display: {
    fontSize: 30,           // 28-32 range
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 30 * LINE_HEIGHTS.tight, // 37.5px
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONTS.semibold,
  },
  
  // H1 (page titles) - 22-24px range
  h1: {
    fontSize: 24,          // 22-24 range (was 30px)
    fontWeight: FONT_WEIGHTS.semibold, // Changed from bold
    lineHeight: 24 * LINE_HEIGHTS.tight, // 30px
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONTS.semibold,
  },
  
  // H2 (section headers) - 18-20px range
  h2: {
    fontSize: 20,          // 18-20 range (was 24px)
    fontWeight: FONT_WEIGHTS.semibold, // Changed from bold
    lineHeight: 20 * LINE_HEIGHTS.tight, // 25px
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONTS.semibold,
  },
  
  // Body (default text) - 15-16px range
  body: {
    fontSize: 16,         // 15-16 range
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 16 * LINE_HEIGHTS.normal, // 22.4px (1.4× for premium feel)
    fontFamily: FONTS.regular,
  },
  
  // Body Emphasis - 15-16px range
  bodyEmphasis: {
    fontSize: 16,         // 15-16 range
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16 * LINE_HEIGHTS.normal, // 22.4px
    fontFamily: FONTS.medium,
  },
  
  // Caption (helper text) - 12-13px range
  caption: {
    fontSize: 13,         // 12-13 range (was 12px)
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 13 * LINE_HEIGHTS.normal, // 18.2px
    fontFamily: FONTS.regular,
  },
  
  // Overline / Label - 11-12px range
  overline: {
    fontSize: 12,         // 11-12 range
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 12 * LINE_HEIGHTS.normal, // 16.8px
    letterSpacing: LETTER_SPACING.wide,
    textTransform: 'uppercase' as const, // Optional, use sparingly
    fontFamily: FONTS.medium,
  },
  
  // Button - 16px
  button: {
    fontSize: 16,         // 16px
    fontWeight: FONT_WEIGHTS.medium, // Changed from semibold (can use medium or semibold)
    lineHeight: 16 * LINE_HEIGHTS.tight, // 20px
    letterSpacing: LETTER_SPACING.wide,
    fontFamily: FONTS.medium,
  },
  
  // ============================================
  // APP-SPECIFIC (Financial) - Not part of base 8
  // These are app-specific and don't count toward the 8-style limit
  // ============================================
  currency: {
    fontSize: 24,         // 24px
    fontWeight: FONT_WEIGHTS.semibold, // Changed from bold
    lineHeight: 24 * LINE_HEIGHTS.tight,
    fontFamily: FONTS.semibold,
    letterSpacing: LETTER_SPACING.normal,
    fontVariant: ['tabular-nums'] as const, // Aligns decimals for instrument-grade feel
  },
  currencyLarge: {
    fontSize: 36,         // 36px
    fontWeight: FONT_WEIGHTS.semibold, // Changed from bold
    lineHeight: 36 * LINE_HEIGHTS.tight,
    fontFamily: FONTS.semibold,
    letterSpacing: LETTER_SPACING.tight,
    fontVariant: ['tabular-nums'] as const,
  },
  currencySmall: {
    fontSize: 18,         // 18px
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 18 * LINE_HEIGHTS.tight,
    fontFamily: FONTS.semibold,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

// ============================================
// DEPRECATED STYLES (for migration)
// These are kept temporarily for backward compatibility
// TODO: Remove after migrating all components
// ============================================
/** @deprecated Use TEXT_STYLES.h2 instead */
export const TEXT_STYLES_DEPRECATED = {
  h3: {
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 20 * LINE_HEIGHTS.tight,
    fontFamily: FONTS.semibold,
  },
  h4: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 18 * LINE_HEIGHTS.normal,
    fontFamily: FONTS.semibold,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 18 * LINE_HEIGHTS.normal,
    fontFamily: FONTS.regular,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 14 * LINE_HEIGHTS.normal,
    fontFamily: FONTS.regular,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 14 * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
    fontFamily: FONTS.semibold,
  },
  label: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 14 * LINE_HEIGHTS.tight,
    fontFamily: FONTS.medium,
  },
} as const;

// Helper to create responsive font sizes
export const responsiveFontSize = (baseSize: number, scale: number = 1) => {
  return Math.round(baseSize * scale);
};

