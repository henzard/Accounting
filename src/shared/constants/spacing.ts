// Spacing System for Homebase Budget App
// Premium UI Standards: Strict 8pt grid system
// Allowed values ONLY: 4, 8, 12, 16, 20, 24, 32, 40, 48
// See .cursor/rules/37-premium-ui-standards.mdc for details

export const SPACING = {
  0: 0,      // No spacing
  1: 4,      // 0.5 × 8 - Tiny
  2: 8,      // 1 × 8 - Small
  3: 12,     // 1.5 × 8 - Medium-small
  4: 16,     // 2 × 8 - Medium (base)
  5: 20,     // 2.5 × 8 - Medium-large
  6: 24,     // 3 × 8 - Large
  8: 32,     // 4 × 8 - Extra large
  10: 40,    // 5 × 8 - 2x extra large
  12: 48,    // 6 × 8 - 3x extra large
  // Note: SPACING[16] = 64 and SPACING[20] = 80 removed - not in 8pt grid
  // Use SPACING[8] = 32 or SPACING[10] = 40 instead
} as const;

// Premium UI Standards: Consistent and moderate border radius
// Small controls: 10-12, Cards: 14-16, Sheets/Modals: 18-24
export const BORDER_RADIUS = {
  none: 0,
  sm: 12,    // Small controls (10-12 range) - buttons, inputs
  md: 16,    // Cards (14-16 range) - default card radius
  lg: 20,    // Sheets/Modals (18-24 range) - modals, bottom sheets
  full: 9999, // Fully rounded (circles, pills)
  // Note: xl and 2xl removed - use lg (20) for all large rounded elements
} as const;

export const BORDER_WIDTH = {
  none: 0,
  thin: 1,
  default: 2,
  thick: 4,
} as const;

// Container padding (screen edges)
export const CONTAINER_PADDING = {
  sm: SPACING[4],   // 16px - mobile
  md: SPACING[6],   // 24px - tablet
  lg: SPACING[8],   // 32px - desktop
} as const;

// Section spacing (between major sections)
export const SECTION_SPACING = {
  sm: SPACING[6],   // 24px
  md: SPACING[8],   // 32px
  lg: SPACING[12],  // 48px
} as const;

// Component spacing
export const COMPONENT_SPACING = {
  xs: SPACING[1],   // 4px - internal padding
  sm: SPACING[2],   // 8px - compact elements
  md: SPACING[3],   // 12px - standard elements
  lg: SPACING[4],   // 16px - comfortable spacing
} as const;

// Premium UI Standards: Buttons should be 48-52px height
export const BUTTON_HEIGHT = {
  sm: 48,   // Compact (48-52 range)
  md: 50,   // Default (48-52 range) - premium standard
  lg: 52,   // Large (48-52 range)
} as const;

// Premium UI Standards: Inputs should be 48-52px height (match button height)
export const INPUT_HEIGHT = {
  sm: 48,   // Compact (48-52 range)
  md: 50,   // Default (48-52 range) - premium standard
  lg: 52,   // Large (48-52 range)
} as const;

// Icon sizes
export const ICON_SIZE = {
  xs: 16,
  sm: 20,
  md: 24,   // Default
  lg: 32,
  xl: 48,
  '2xl': 64,
} as const;

// Avatar sizes
export const AVATAR_SIZE = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
} as const;

// Card padding
export const CARD_PADDING = {
  sm: SPACING[3],   // 12px
  md: SPACING[4],   // 16px
  lg: SPACING[6],   // 24px
} as const;

// Shadow depths (for elevation)
export const SHADOWS = {
  none: 'none',
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0px 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0px 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0px 20px 25px rgba(0, 0, 0, 0.15)',
  '2xl': '0px 25px 50px rgba(0, 0, 0, 0.25)',
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Opacity levels
export const OPACITY = {
  disabled: 0.38,
  hover: 0.08,
  selected: 0.12,
  pressed: 0.32,
  backdrop: 0.5,
} as const;

