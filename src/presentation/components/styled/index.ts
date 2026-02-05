// Styled Components - Premium UI Component Tiers
// Enforced component hierarchy for consistency
// See .cursor/rules/37-premium-ui-standards.mdc for details

export * from './app-text';
export * from './surface';

// Re-export Button from main components (already enforces variant)
export { Button, PrimaryButton, SecondaryButton } from '../Button';

/**
 * Component Tier System:
 * 
 * Tier 1: Base components (must use tokens)
 * - AppText: Requires variant (one of 8 text styles)
 * - Surface: Requires variant (default, raised, overlay)
 * 
 * Tier 2: Interactive components
 * - Button: Requires variant (primary, secondary, destructive)
 * 
 * If a dev can't create arbitrary styles easily, consistency improves automatically.
 */
