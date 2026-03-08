// Color Palette for Homebase Budget App
// "Polished Luxury" Light Theme & "Midnight Precision" Dark Theme
// Based on design specification: Minimalist, Elegant, Expensive, Timeless

export const COLORS = {
  // ============================================
  // BRAND COLORS - Royal Blue
  // ============================================
  
  // Primary - Royal Blue (Light: #0B3C78, Dark: #1E5FA8)
  primary: {
    50: '#E3EAF8',   // Lightest blue - backgrounds
    100: '#B8CEEF',  // Light blue - hover states
    200: '#89ADE5',
    300: '#5A8CDB',
    400: '#3674D4',
    500: '#0B3C78',  // Royal Blue - main brand color (light theme)
    600: '#072A55',  // Midnight Blue - hover/active (light theme)
    700: '#0D47A1',  // Darker blue
    800: '#0A3D91',
    900: '#062A6E',  // Darkest
    // Dark theme variants
    dark500: '#1E5FA8',  // Royal Blue (brighter for dark mode)
    dark600: '#2C76C9',  // Luminous Blue - hover (dark theme)
  },

  // Secondary - Cool Platinum / Deep Steel Blue
  secondary: {
    50: '#F6F7F4',   // Soft Ivory (light background)
    100: '#ECEFF1',  // Cool Platinum (light cards)
    200: '#D1D5D8',  // Brushed Steel (light borders)
    300: '#8A95A3',  // Cool Gray (light muted text)
    400: '#4A5D73',  // Slate Blue-Gray (light secondary text)
    500: '#0F1E2D',  // Deep Navy (light primary text)
    600: '#121E2B',  // Deep Steel Blue (dark cards)
    700: '#182636',  // Charcoal Navy (dark elevated)
    800: '#0A1420',  // Near-Black Navy (dark background)
    900: '#223447',  // Blue-Gray Steel (dark divider)
  },

  // Accent - Gold (Luxury accent - use sparingly, 1-3% max)
  accent: {
    50: '#F3E9D2',   // Champagne Tint (light accent background)
    100: '#C9A24D',  // Antique Gold (light theme accent)
    200: '#D4AF37',  // Warm Gold (dark theme accent)
    300: '#B8941F',
    400: '#9A7A1A',
    500: '#7C6015',
  },

  // ============================================
  // SEMANTIC COLORS
  // ============================================

  // Success - Green (Goals met, debts paid)
  success: {
    light: '#E8F5E9',
    main: '#2E7D32',
    dark: '#1B5E20',
    contrast: '#FFFFFF',
  },

  // Warning - Amber (Budget warnings, late entries)
  warning: {
    light: '#FFF8E1',
    main: '#F9A825',
    dark: '#F57F17',
    contrast: '#212121',
  },

  // Error - Red (Overspending, debt)
  error: {
    light: '#FFEBEE',
    main: '#C62828',
    dark: '#B71C1C',
    contrast: '#FFFFFF',
  },

  // Info - Blue (Information, tips) - uses Royal Blue
  info: {
    light: '#E3F2FD',
    main: '#0B3C78',  // Royal Blue
    dark: '#1E5FA8',  // Brighter Royal Blue for dark mode
    contrast: '#FFFFFF',
  },

  // ============================================
  // NEUTRAL COLORS (from palette)
  // ============================================

  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    
    // Light Theme Grays (from "Polished Luxury")
    gray50: '#F6F7F4',   // Soft Ivory
    gray100: '#ECEFF1',  // Cool Platinum
    gray200: '#D1D5D8',  // Brushed Steel
    gray300: '#8A95A3',  // Cool Gray (muted text)
    gray400: '#4A5D73',  // Slate Blue-Gray (secondary text)
    gray500: '#0F1E2D',  // Deep Navy (primary text)
    
    // Dark Theme Grays (from "Midnight Precision")
    gray600: '#0A1420',  // Near-Black Navy (background)
    gray700: '#121E2B',  // Deep Steel Blue (cards)
    gray800: '#182636',  // Charcoal Navy (elevated)
    gray900: '#223447',  // Blue-Gray Steel (divider)
    
    // Text colors (theme-specific)
    textLight: {
      primary: '#0F1E2D',   // Deep Navy
      secondary: '#4A5D73', // Slate Blue-Gray
      tertiary: '#8A95A3',  // Cool Gray
    },
    textDark: {
      primary: '#E6E8E5',   // Soft Ivory
      secondary: '#A8B1BC', // Muted Steel
      tertiary: '#6F7A85',  // Cool Gray
    },
  },

  // ============================================
  // FINANCIAL COLORS (App-specific)
  // ============================================

  financial: {
    income: '#2E7D32',      // Green - money coming in
    expense: '#C62828',    // Red - money going out
    savings: '#0B3C78',    // Royal Blue - savings/sinking funds
    debt: '#F57F17',        // Amber - debt
    cash: '#2E7D32',        // Green - cash envelopes
    investment: '#1E5FA8',  // Luminous Blue - investments
  },

  // Baby Steps colors (Dave Ramsey system)
  babySteps: {
    step1: '#F9A825',  // Amber - $1000 emergency fund
    step2: '#F57F17',  // Orange - Debt snowball
    step3: '#2E7D32',  // Green - 3-6 months expenses
    step4: '#0B3C78',  // Royal Blue - 15% retirement
    step5: '#1E5FA8',  // Luminous Blue - College fund
    step6: '#C62828',  // Red - Pay off home
    step7: '#C9A24D',  // Antique Gold - Build wealth & give (light theme)
    step7Dark: '#D4AF37',  // Warm Gold - Build wealth & give (dark theme)
  },

} as const;

// Convenience exports
export const PRIMARY = COLORS.primary[500];  // Royal Blue
export const SUCCESS = COLORS.success.main;
export const WARNING = COLORS.warning.main;
export const ERROR = COLORS.error.main;
export const INFO = COLORS.info.main;


