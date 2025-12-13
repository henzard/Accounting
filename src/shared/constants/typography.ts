// Typography System for Dave Ramsey Budgeting App

export const FONTS = {
  // System fonts for best performance on mobile
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  
  // If you want to add custom fonts later:
  // regular: 'Inter-Regular',
  // medium: 'Inter-Medium',
  // semibold: 'Inter-SemiBold',
  // bold: 'Inter-Bold',
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
  normal: 1.5,   // For body text
  relaxed: 1.75, // For longer paragraphs
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
// ============================================

export const TEXT_STYLES = {
  // ============================================
  // HEADINGS
  // ============================================
  h1: {
    fontSize: FONT_SIZES['3xl'],      // 30px
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONTS.bold,
  },
  h2: {
    fontSize: FONT_SIZES['2xl'],      // 24px
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONTS.bold,
  },
  h3: {
    fontSize: FONT_SIZES.xl,          // 20px
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.tight,
    fontFamily: FONTS.semibold,
  },
  h4: {
    fontSize: FONT_SIZES.lg,          // 18px
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
    fontFamily: FONTS.semibold,
  },
  
  // ============================================
  // BODY TEXT
  // ============================================
  bodyLarge: {
    fontSize: FONT_SIZES.lg,          // 18px
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
    fontFamily: FONTS.regular,
  },
  body: {
    fontSize: FONT_SIZES.md,          // 16px (base)
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
    fontFamily: FONTS.regular,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,          // 14px
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
    fontFamily: FONTS.regular,
  },
  
  // ============================================
  // UI ELEMENTS
  // ============================================
  button: {
    fontSize: FONT_SIZES.md,          // 16px
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
    fontFamily: FONTS.semibold,
  },
  buttonSmall: {
    fontSize: FONT_SIZES.sm,          // 14px
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
    fontFamily: FONTS.semibold,
  },
  caption: {
    fontSize: FONT_SIZES.xs,          // 12px
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
    fontFamily: FONTS.regular,
  },
  label: {
    fontSize: FONT_SIZES.sm,          // 14px
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.tight,
    fontFamily: FONTS.medium,
  },
  
  // ============================================
  // FINANCIAL (App-specific)
  // ============================================
  currency: {
    fontSize: FONT_SIZES['2xl'],      // 24px
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.tight,
    fontFamily: FONTS.bold,
    letterSpacing: LETTER_SPACING.normal,
  },
  currencyLarge: {
    fontSize: FONT_SIZES['4xl'],      // 36px
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
    fontFamily: FONTS.bold,
    letterSpacing: LETTER_SPACING.tight,
  },
  currencySmall: {
    fontSize: FONT_SIZES.lg,          // 18px
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.tight,
    fontFamily: FONTS.semibold,
  },
};

// Helper to create responsive font sizes
export const responsiveFontSize = (baseSize: number, scale: number = 1) => {
  return Math.round(baseSize * scale);
};

