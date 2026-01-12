// Animation Constants for Premium UI
// Premium UI Standards: Micro-animations only (150-220ms), no bouncy transitions
// See .cursor/rules/37-premium-ui-standards.mdc for details

import { Easing } from 'react-native';

export const ANIMATION = {
  duration: {
    micro: 150,   // Micro-interactions (button press, hover)
    fast: 200,    // Standard transitions (most common)
    normal: 220,  // Max for micro-animations (slower transitions)
  },
  
  easing: {
    easeOut: Easing.out(Easing.ease), // Standard ease-out for premium feel
  },
  
  // Spring configuration (for subtle affordances only - toggles, checkboxes)
  spring: {
    subtle: {
      damping: 20,      // Higher = less bouncy
      stiffness: 90,    // Higher = faster
      mass: 1,
    },
  },
} as const;

/**
 * Premium UI Animation Guidelines:
 * 
 * - Use micro-animations (150-220ms) for state changes
 * - Use standard ease-out easing (not bouncy springs)
 * - Springs only for tiny affordances (toggles, checkboxes) if subtle
 * - Avoid spring overshoot for core navigation/controls
 * - Use motion to clarify state changes, not decorate
 */
