// Color Palette for Homebase Budget App
// Based on official brand colors from design

export const COLORS = {
  // ============================================
  // BRAND COLORS - Homebase Budget Official
  // ============================================
  
  // Primary - Homebase Blue (from logo)
  primary: {
    50: '#E3EAF8',   // Lightest blue - backgrounds
    100: '#B8CEEF',  // Light blue - hover states
    200: '#89ADE5',
    300: '#5A8CDB',
    400: '#3674D4',
    500: '#1A44C8',  // Homebase brand blue - main (from palette)
    600: '#173EC2',  // Hover state
    700: '#1335BB',  // Active/pressed
    800: '#0F2DB4',
    900: '#081FA7',  // Darkest
  },

  // Secondary - Light Blue (from palette #5BC20D or similar)
  secondary: {
    50: '#E8F6FD',
    100: '#C6E9FA',
    200: '#A0DAF7',
    300: '#7ACBF4',
    400: '#5EC0F1',
    500: '#42B5EF',  // Light blue accent
    600: '#3CAEED',
    700: '#33A5EB',
    800: '#2B9DE9',
    900: '#1D8DE5',
  },

  // Accent - Homebase Green (from palette)
  accent: {
    50: '#E8F7E8',
    100: '#C5EBC5',
    200: '#9EDE9E',
    300: '#77D177',
    400: '#5AC75A',
    500: '#3DBE3D',  // Green accent
    600: '#37B837',
    700: '#2FAF2F',
    800: '#27A727',
    900: '#1A991A',
  },

  // ============================================
  // SEMANTIC COLORS
  // ============================================

  // Success - Green (Goals met, debts paid)
  success: {
    light: '#E8F7E8',
    main: '#3DBE3D',
    dark: '#1A991A',
    contrast: '#FFFFFF',
  },

  // Warning - Amber (Budget warnings, late entries)
  warning: {
    light: '#FFF8E1',
    main: '#FFB300',
    dark: '#FF6F00',
    contrast: '#000000',
  },

  // Error - Red (Overspending, debt)
  error: {
    light: '#FFEBEE',
    main: '#D32F2F',
    dark: '#B71C1C',
    contrast: '#FFFFFF',
  },

  // Info - Blue (Information, tips)
  info: {
    light: '#E3EAF8',
    main: '#1A44C8',
    dark: '#081FA7',
    contrast: '#FFFFFF',
  },

  // ============================================
  // NEUTRAL COLORS (from palette)
  // ============================================

  neutral: {
    white: '#FFFFFF',      // WWFIFN from palette
    black: '#000000',
    
    // Grays (Dark Grey from palette)
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#4A4A4A',     // Dark grey from palette
    gray800: '#424242',
    gray900: '#212121',
  },

  // ============================================
  // FINANCIAL COLORS (App-specific)
  // ============================================

  financial: {
    income: '#3DBE3D',      // Green - money coming in
    expense: '#D32F2F',     // Red - money going out
    savings: '#1A44C8',     // Homebase blue - savings/sinking funds
    debt: '#FF6F00',        // Orange - debt
    cash: '#3DBE3D',        // Green - cash envelopes
    investment: '#7B1FA2',  // Purple - investments
  },

  // Baby Steps colors (Dave Ramsey system)
  babySteps: {
    step1: '#FFB300',  // Amber - $1000 emergency fund
    step2: '#FF6F00',  // Orange - Debt snowball
    step3: '#3DBE3D',  // Green - 3-6 months expenses
    step4: '#1A44C8',  // Homebase blue - 15% retirement
    step5: '#7B1FA2',  // Purple - College fund
    step6: '#D32F2F',  // Red - Pay off home
    step7: '#FFD700',  // Gold - Build wealth & give
  },

} as const;

// Convenience exports
export const PRIMARY = COLORS.primary[500];
export const SUCCESS = COLORS.success.main;
export const WARNING = COLORS.warning.main;
export const ERROR = COLORS.error.main;
export const INFO = COLORS.info.main;


