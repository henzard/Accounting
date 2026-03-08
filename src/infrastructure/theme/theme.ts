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
  
  // Accent (Gold - use sparingly, 1-3% max)
  accent: {
    gold: string;           // Antique Gold (light) / Warm Gold (dark)
    goldBackground?: string; // Champagne Tint (light theme only)
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
// LIGHT THEME - "Polished Luxury"
// ============================================
export const lightTheme: Theme = {
  mode: 'light',
  
  background: {
    primary: '#F6F7F4',        // Soft Ivory - main app background
    secondary: '#ECEFF1',      // Cool Platinum - card backgrounds
    tertiary: '#F3E9D2',      // Champagne Tint - subtle section backgrounds
    elevated: '#FFFFFF',       // White - modals, dropdowns
  },
  
  surface: {
    default: '#ECEFF1',        // Cool Platinum
    raised: '#FFFFFF',         // White
    overlay: 'rgba(15, 30, 45, 0.5)',  // Deep Navy with opacity
  },
  
  text: {
    primary: '#0F1E2D',        // Deep Navy - main text
    secondary: '#4A5D73',      // Slate Blue-Gray - subdued text
    tertiary: '#8A95A3',       // Cool Gray - hints, placeholders
    disabled: '#D1D5D8',        // Brushed Steel - disabled
    inverse: '#FFFFFF',         // White - text on dark backgrounds
    link: '#0B3C78',           // Royal Blue - links
  },
  
  border: {
    default: '#D1D5D8',        // Brushed Steel - default borders
    strong: '#4A5D73',         // Slate Blue-Gray - strong borders
    focus: '#0B3C78',          // Royal Blue - focus states
  },
  
  interactive: {
    primary: '#0B3C78',        // Royal Blue - primary actions
    primaryHover: '#072A55',    // Midnight Blue - hover state
    primaryActive: '#0D47A1',  // Darker blue - active/pressed
    primaryDisabled: '#8A95A3', // Cool Gray - disabled
    secondary: '#ECEFF1',      // Cool Platinum - secondary actions
    secondaryHover: '#D1D5D8', // Brushed Steel - secondary hover
  },
  
  accent: {
    gold: '#C9A24D',        // Antique Gold - luxury accent (use sparingly, 1-3% max)
    goldBackground: '#F3E9D2', // Champagne Tint - accent background
  },
  
  status: {
    success: '#2E7D32',          // Green
    successBackground: '#E8F5E9',
    warning: '#F9A825',          // Amber
    warningBackground: '#FFF8E1',
    error: '#C62828',            // Red
    errorBackground: '#FFEBEE',
    info: '#0B3C78',             // Royal Blue
    infoBackground: '#E3F2FD',
  },
  
  financial: {
    income: '#2E7D32',          // Green - money coming in
    incomeBackground: '#E8F5E9',
    expense: '#C62828',         // Red - money going out
    expenseBackground: '#FFEBEE',
    savings: '#0B3C78',         // Royal Blue - savings/sinking funds
    savingsBackground: '#E3F2FD',
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
// DARK THEME - "Midnight Precision"
// ============================================
export const darkTheme: Theme = {
  mode: 'dark',
  
  background: {
    primary: '#0A1420',        // Near-Black Navy - main app background
    secondary: '#121E2B',       // Deep Steel Blue - card backgrounds
    tertiary: '#182636',        // Charcoal Navy - subtle sections
    elevated: '#182636',        // Charcoal Navy - modals, dropdowns
  },
  
  surface: {
    default: '#121E2B',        // Deep Steel Blue
    raised: '#182636',         // Charcoal Navy
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  text: {
    primary: '#E6E8E5',         // Soft Ivory - main text
    secondary: '#A8B1BC',       // Muted Steel - subdued text
    tertiary: '#6F7A85',        // Cool Gray - hints, placeholders
    disabled: '#4A5D73',        // Slate Blue-Gray - disabled
    inverse: '#0F1E2D',         // Deep Navy - text on light backgrounds
    link: '#1E5FA8',           // Royal Blue (brighter) - links
  },
  
  border: {
    default: '#223447',         // Blue-Gray Steel - default borders
    strong: '#4A5D73',          // Slate Blue-Gray - strong borders
    focus: '#1E5FA8',           // Royal Blue (brighter) - focus states
  },
  
  interactive: {
    primary: '#1E5FA8',         // Royal Blue (brighter) - primary actions
    primaryHover: '#2C76C9',    // Luminous Blue - hover state
    primaryActive: '#0B3C78',   // Royal Blue - active/pressed
    primaryDisabled: '#4A5D73', // Slate Blue-Gray - disabled
    secondary: '#182636',       // Charcoal Navy - secondary actions
    secondaryHover: '#223447',  // Blue-Gray Steel - secondary hover
  },
  
  accent: {
    gold: '#D4AF37',        // Warm Gold - luxury accent (use sparingly, 1-3% max)
    // goldBackground not used in dark theme
  },
  
  status: {
    success: '#66BB6A',          // Lighter green for dark mode
    successBackground: '#1B3D1F',
    warning: '#FFB74D',          // Lighter amber for dark mode
    warningBackground: '#3D3012',
    error: '#EF5350',             // Lighter red for dark mode
    errorBackground: '#3D1B1B',
    info: '#1E5FA8',             // Royal Blue (brighter)
    infoBackground: '#12283D',
  },
  
  financial: {
    income: '#66BB6A',           // Lighter green for dark mode
    incomeBackground: '#1B3D1F',
    expense: '#EF5350',          // Lighter red for dark mode
    expenseBackground: '#3D1B1B',
    savings: '#1E5FA8',          // Royal Blue (brighter)
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

