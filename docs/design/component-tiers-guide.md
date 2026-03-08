# Component Tiers Guide

**Premium UI Standards**: Enforced component hierarchy for consistency

**Reference**: `.cursor/rules/37-premium-ui-standards.mdc`

---

## Overview

The Premium UI Standards enforce a component tier system to prevent arbitrary styling and ensure consistency:

- **Tier 1**: Base components (must use tokens)
  - `AppText` - Requires typography variant
  - `Surface` - Requires surface variant

- **Tier 2**: Interactive components
  - `Button` - Requires button variant

**Principle**: If a dev can't create arbitrary styles easily, consistency improves automatically.

---

## Tier 1: Base Components

### AppText Component

**Purpose**: Enforces typography preset requirement (one of 8 allowed styles)

**Location**: `src/presentation/components/styled/app-text.tsx`

**Usage**:
```tsx
import { AppText } from '@/presentation/components';

// Required variant prop
<AppText variant="h1">Page Title</AppText>
<AppText variant="body">Body text</AppText>
<AppText variant="caption" color={theme.text.secondary}>
  Helper text
</AppText>
```

**Allowed Variants** (8 max):
- `display` - Hero text (30px, semibold)
- `h1` - Page titles (24px, semibold)
- `h2` - Section headers (20px, semibold)
- `body` - Default text (16px, regular, 1.4× line height)
- `bodyEmphasis` - Emphasized text (16px, medium)
- `caption` - Helper text (13px, regular)
- `overline` - Labels (12px, medium, uppercase)
- `button` - Button text (16px, medium)

**Props**:
- `variant` (required) - One of 8 allowed styles
- `children` (required) - Text content
- `color` (optional) - Color override (defaults to theme.text.primary)
- `style` (optional) - Additional styles (merged with variant style)

**Convenience Exports**:
```tsx
import { 
  Heading1,      // AppText variant="h1"
  Heading2,      // AppText variant="h2"
  BodyText,      // AppText variant="body"
  CaptionText,   // AppText variant="caption"
} from '@/presentation/components';

<Heading1>Title</Heading1>
<BodyText>Content</BodyText>
```

---

### Surface Component

**Purpose**: Enforces surface type requirement (default, raised, overlay)

**Location**: `src/presentation/components/styled/surface.tsx`

**Usage**:
```tsx
import { Surface } from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

// Required variant prop
<Surface variant="default" padding={SPACING[4]}>
  <AppText variant="body">Card content</AppText>
</Surface>

<Surface variant="raised" borderRadius={BORDER_RADIUS.lg}>
  <ModalContent />
</Surface>
```

**Allowed Variants**:
- `default` - Standard surface (cards, containers) - uses border
- `raised` - Elevated surface (modals, dropdowns) - uses shadow
- `overlay` - Overlay surface (backdrops, sheets)

**Props**:
- `variant` (required) - One of 3 allowed variants
- `children` (required) - Content
- `padding` (optional) - Padding using SPACING tokens (default: SPACING[4])
- `borderRadius` (optional) - Border radius using BORDER_RADIUS tokens (default: BORDER_RADIUS.md)
- `style` (optional) - Additional styles

**Convenience Exports**:
```tsx
import { 
  DefaultSurface,  // Surface variant="default"
  RaisedSurface,   // Surface variant="raised"
  OverlaySurface,  // Surface variant="overlay"
} from '@/presentation/components';
```

---

## Tier 2: Interactive Components

### Button Component

**Purpose**: Enforces button variant requirement

**Location**: `src/presentation/components/Button.tsx`

**Usage**:
```tsx
import { Button } from '@/presentation/components';

// Required variant prop (defaults to 'primary')
<Button variant="primary" title="Save" onPress={handleSave} />
<Button variant="secondary" title="Cancel" onPress={handleCancel} />
<Button variant="destructive" title="Delete" onPress={handleDelete} />
```

**Allowed Variants**:
- `primary` - Primary actions (Royal Blue)
- `secondary` - Secondary actions (Neutral surface)
- `destructive` - Destructive actions (Red, rare, controlled)
- `outline` - Outline style (backward compatibility)
- `ghost` - Ghost style (backward compatibility)

**Premium Standards**:
- Height: 48-52px (sm: 48, md: 50, lg: 52)
- Border radius: 12px (BORDER_RADIUS.sm)
- Text: Uses TEXT_STYLES.button

**Props**:
- `variant` (optional, default: 'primary') - Button variant
- `title` (required) - Button text
- `onPress` (required) - Press handler
- `size` (optional) - sm, md, lg
- `disabled` (optional) - Disabled state
- `loading` (optional) - Loading state

---

## Component Tier Examples

### Example 1: Card with Text

**Using Component Tiers**:
```tsx
import { Surface, AppText, Button } from '@/presentation/components';
import { SPACING } from '@/shared/constants/spacing';

<Surface variant="default" padding={SPACING[4]}>
  <AppText variant="h2">Card Title</AppText>
  <AppText variant="body">Card description text</AppText>
  <Button variant="primary" title="Action" onPress={handleAction} />
</Surface>
```

**Benefits**:
- Enforced variants (can't use arbitrary styles)
- Automatic theme colors
- Consistent spacing
- Type-safe

---

### Example 2: Modal

**Using Component Tiers**:
```tsx
import { Surface, AppText, Button } from '@/presentation/components';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';

<Surface variant="raised" borderRadius={BORDER_RADIUS.lg} padding={SPACING[6]}>
  <AppText variant="h1">Modal Title</AppText>
  <AppText variant="body">Modal content goes here</AppText>
  <View style={{ flexDirection: 'row', gap: SPACING[3] }}>
    <Button variant="secondary" title="Cancel" onPress={handleCancel} />
    <Button variant="primary" title="Confirm" onPress={handleConfirm} />
  </View>
</Surface>
```

---

### Example 3: Screen Layout

**Using Component Tiers + ScreenWrapper**:
```tsx
import { ScreenWrapper, Surface, AppText, Button } from '@/presentation/components';
import { SPACING } from '@/shared/constants/spacing';

export default function MyScreen() {
  return (
    <ScreenWrapper>
      <AppText variant="h1">Screen Title</AppText>
      
      <Surface variant="default" padding={SPACING[4]} style={{ marginTop: SPACING[6] }}>
        <AppText variant="h2">Section</AppText>
        <AppText variant="body">Content</AppText>
      </Surface>
      
      <Button 
        variant="primary" 
        title="Action" 
        onPress={handleAction}
        style={{ marginTop: SPACING[8] }}
      />
    </ScreenWrapper>
  );
}
```

---

## Migration from Old Components

### Text → AppText

**Before**:
```tsx
<Text style={TEXT_STYLES.h1}>Title</Text>
```

**After**:
```tsx
<AppText variant="h1">Title</AppText>
```

---

### View → Surface

**Before**:
```tsx
<View style={{
  backgroundColor: theme.surface.default,
  borderRadius: 8,
  padding: 16,
}}>
  Content
</View>
```

**After**:
```tsx
<Surface variant="default" padding={SPACING[4]}>
  Content
</Surface>
```

---

### TouchableOpacity → Button

**Before**:
```tsx
<TouchableOpacity style={{
  backgroundColor: theme.interactive.primary,
  padding: 12,
  borderRadius: 8,
}}>
  <Text>Click</Text>
</TouchableOpacity>
```

**After**:
```tsx
<Button variant="primary" title="Click" onPress={handlePress} />
```

---

## Benefits of Component Tiers

1. **Consistency**: Enforced variants prevent arbitrary styling
2. **Type Safety**: TypeScript enforces correct variant usage
3. **Maintainability**: Changes to tokens automatically update components
4. **Premium Feel**: Consistent spacing, typography, colors
5. **Developer Experience**: Clear API, less decision fatigue

---

## When to Use Component Tiers

### ✅ Use Component Tiers For:
- New components
- Refactoring existing components
- Standard UI patterns (cards, buttons, text)
- Screens and layouts

### ⚠️ Can Still Use Base Components For:
- Complex custom layouts (but use tokens)
- One-off designs (but follow standards)
- Legacy code (migrate gradually)

---

## Best Practices

### DO ✅
- Use AppText for all text (enforces typography)
- Use Surface for cards/containers (enforces surface type)
- Use Button for all buttons (enforces variant)
- Use ScreenWrapper for all screens
- Use design tokens (SPACING, BORDER_RADIUS, TEXT_STYLES)

### DON'T ❌
- Don't use raw Text with arbitrary styles
- Don't use raw View with hardcoded colors/spacing
- Don't create custom button components (use Button)
- Don't bypass component tiers without good reason

---

## Troubleshooting

### Issue: Need a style not in variants

**Solution**: 
1. Check if it fits an existing variant
2. Use `style` prop to override (not recommended)
3. Consider if it should be a new variant (discuss with team)

### Issue: Component tier feels restrictive

**Solution**: That's the point! Restrictions improve consistency. If you need flexibility, document why.

---

**Last Updated**: 2025-01-XX  
**Status**: Active Guide
