// Theme System for Homebase Budget
// Provides light/dark theme with Homebase brand colors

import { COLORS } from '@/shared/constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/shared/constants/spacing';

export interface Theme {
  // Mode
  mode: 'light' | 'dark';
  
  // Backgrounds
  background: {
    primary: string;     // Main app background
    secondary: string;   // Card backgrounds
    tertiary: string;    // Subtle section backgrounds
    elevated: string;    // Modals, dropdowns
  };
  
  // Surfaces
  surface: {
    default: string;
    raised: string;
    overlay: string;
  };
  
  // Text
  text: {
    primary: string;     // Main text
    secondary: string;   // Subdued text
    tertiary: string;    // Hints, placeholders
    disabled: string;
    inverse: string;     // Text on dark backgrounds
    link: string;
  };
  
  // Borders
  border: {
    default: string;
    strong: string;
    focus: string;
  };
  
  // Interactive (Homebase blue)
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryDisabled: string;
    secondary: string;
    secondaryHover: string;
  };
  
  // Status
  status: {
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    error: string;
    errorBackground: string;
    info: string;
    infoBackground: string;
  };
  
  // Financial (app-specific)
  financial: {
    income: string;
    incomeBackground: string;
    expense: string;
    expenseBackground: string;
    savings: string;
    savingsBackground: string;
  };
  
  // Shadows
  shadow: {
    small: string;
    medium: string;
    large: string;
  };
  
  // Spacing & Borders (shared)
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
}

// ============================================
// LIGHT THEME - Homebase Budget
// ============================================
export const lightTheme: Theme = {
  mode: 'light',
  
  background: {
    primary: COLORS.neutral.white,        // #FFFFFF
    secondary: COLORS.neutral.gray50,     // #FAFAFA
    tertiary: COLORS.neutral.gray100,     // #F5F5F5
    elevated: COLORS.neutral.white,       // #FFFFFF
  },
  
  surface: {
    default: COLORS.neutral.white,
    raised: COLORS.neutral.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  text: {
    primary: COLORS.neutral.gray900,      // #212121 - high contrast
    secondary: COLORS.neutral.gray700,    // #4A4A4A - medium emphasis
    tertiary: COLORS.neutral.gray500,     // #9E9E9E - low emphasis
    disabled: COLORS.neutral.gray400,     // #BDBDBD
    inverse: COLORS.neutral.white,        // #FFFFFF
    link: COLORS.primary[500],            // Homebase blue
  },
  
  border: {
    default: COLORS.neutral.gray300,      // #E0E0E0
    strong: COLORS.neutral.gray400,       // #BDBDBD
    focus: COLORS.primary[500],           // Homebase blue
  },
  
  interactive: {
    primary: COLORS.primary[500],         // #1A44C8 - Homebase blue
    primaryHover: COLORS.primary[600],    // Darker blue
    primaryActive: COLORS.primary[700],   // Even darker
    primaryDisabled: COLORS.primary[200], // Light blue
    secondary: COLORS.neutral.gray100,    // #F5F5F5
    secondaryHover: COLORS.neutral.gray200, // #EEEEEE
  },
  
  status: {
    success: COLORS.success.main,         // #3DBE3D - Green
    successBackground: COLORS.success.light, // Light green
    warning: COLORS.warning.main,         // #FFB300 - Amber
    warningBackground: COLORS.warning.light, // Light amber
    error: COLORS.error.main,             // #D32F2F - Red
    errorBackground: COLORS.error.light,  // Light red
    info: COLORS.info.main,               // Homebase blue
    infoBackground: COLORS.info.light,    // Light blue
  },
  
  financial: {
    income: COLORS.financial.income,      // #3DBE3D - Green
    incomeBackground: '#E8F7E8',
    expense: COLORS.financial.expense,    // #D32F2F - Red
    expenseBackground: '#FFEBEE',
    savings: COLORS.financial.savings,    // #1A44C8 - Homebase blue
    savingsBackground: '#E3EAF8',
  },
  
  shadow: {
    small: SHADOWS.sm,
    medium: SHADOWS.md,
    large: SHADOWS.lg,
  },
  
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
};

// ============================================
// DARK THEME - Homebase Budget
// ============================================
export const darkTheme: Theme = {
  mode: 'dark',
  
  background: {
    primary: '#121212',                   // Dark background
    secondary: '#1E1E1E',                 // Card backgrounds
    tertiary: '#252525',                  // Subtle sections
    elevated: '#2D2D2D',                  // Modals, dropdowns
  },
  
  surface: {
    default: '#1E1E1E',
    raised: '#2D2D2D',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  text: {
    primary: COLORS.neutral.white,        // #FFFFFF
    secondary: '#B0B0B0',                 // Medium emphasis
    tertiary: COLORS.neutral.gray600,     // #757575 - low emphasis
    disabled: '#505050',
    inverse: COLORS.neutral.gray900,      // #212121
    link: COLORS.primary[300],            // Lighter blue for dark mode
  },
  
  border: {
    default: '#333333',
    strong: '#505050',
    focus: COLORS.primary[400],           // Lighter blue for dark mode
  },
  
  interactive: {
    primary: COLORS.primary[400],         // Lighter blue for dark mode
    primaryHover: COLORS.primary[300],    // Even lighter on hover
    primaryActive: COLORS.primary[500],   // Homebase blue on active
    primaryDisabled: COLORS.primary[800], // Dark blue
    secondary: '#2D2D2D',
    secondaryHover: '#3D3D3D',
  },
  
  status: {
    success: COLORS.accent[400],          // Lighter green for dark mode
    successBackground: '#1B3D1F',
    warning: COLORS.warning.main,
    warningBackground: '#3D3012',
    error: '#EF5350',                     // Lighter red for dark mode
    errorBackground: '#3D1B1B',
    info: COLORS.primary[400],
    infoBackground: '#12283D',
  },
  
  financial: {
    income: COLORS.accent[400],           // Lighter green
    incomeBackground: '#1B3D1F',
    expense: '#EF5350',                   // Lighter red
    expenseBackground: '#3D1B1B',
    savings: COLORS.primary[400],         // Lighter blue
    savingsBackground: '#12283D',
  },
  
  shadow: {
    small: '0 1px 2px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
    large: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
  
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
};

