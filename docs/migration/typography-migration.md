# Typography Migration Guide

**Purpose**: Guide for migrating from old typography styles to premium UI standards (8 styles max)

**Reference**: `.cursor/rules/37-premium-ui-standards.mdc`

---

## Overview

The typography system has been updated to comply with Premium UI Standards:
- **Maximum 8 text styles** (was 13+)
- **Headlines use semibold** (600), not bold (700)
- **Body line height**: 1.4× (was 1.5×)
- **New component tier**: `AppText` enforces typography preset

---

## Quick Reference: Old → New

| Old Style | New Style | Notes |
|-----------|-----------|-------|
| `TEXT_STYLES.h1` (30px, bold) | `AppText variant="h1"` (24px, semibold) | Smaller, lighter weight |
| `TEXT_STYLES.h2` (24px, bold) | `AppText variant="h2"` (20px, semibold) | Smaller, lighter weight |
| `TEXT_STYLES.h3` (20px, semibold) | `AppText variant="h2"` or deprecated | Use h2 or deprecated h3 |
| `TEXT_STYLES.h4` (18px, semibold) | `AppText variant="bodyEmphasis"` | Similar size, different purpose |
| `TEXT_STYLES.bodyLarge` (18px) | `AppText variant="body"` | Use body, or bodyEmphasis for emphasis |
| `TEXT_STYLES.body` (16px, 1.5×) | `AppText variant="body"` (16px, 1.4×) | Same size, tighter line height |
| `TEXT_STYLES.bodySmall` (14px) | `AppText variant="caption"` | Use caption for smaller text |
| `TEXT_STYLES.button` (16px) | `AppText variant="button"` | Same, but use Button component |
| `TEXT_STYLES.buttonSmall` (14px) | `AppText variant="button"` | Use same button style |
| `TEXT_STYLES.caption` (12px) | `AppText variant="caption"` (13px) | Slightly larger |
| `TEXT_STYLES.label` (14px, medium) | `AppText variant="overline"` | Use overline for labels |

---

## Migration Patterns

### Pattern 1: Direct Replacement (Recommended)

**Before**:
```tsx
import { Text } from 'react-native';
import { TEXT_STYLES } from '@/shared/constants/typography';

<Text style={TEXT_STYLES.h1}>Page Title</Text>
<Text style={TEXT_STYLES.body}>Body text</Text>
```

**After** (Using AppText):
```tsx
import { AppText } from '@/presentation/components';

<AppText variant="h1">Page Title</AppText>
<AppText variant="body">Body text</AppText>
```

**Benefits**:
- Enforces typography preset (can't use arbitrary styles)
- Automatic theme color
- Type-safe variants

---

### Pattern 2: Keep Using TEXT_STYLES (Backward Compatible)

**Before**:
```tsx
<Text style={TEXT_STYLES.h1}>Title</Text>
```

**After** (Still works, but updated values):
```tsx
<Text style={TEXT_STYLES.h1}>Title</Text>
// Now: 24px, semibold (was: 30px, bold)
```

**Note**: This still works, but values have changed. Use AppText for consistency.

---

### Pattern 3: Deprecated Styles (Temporary)

**Before**:
```tsx
<Text style={TEXT_STYLES.h3}>Subsection</Text>
<Text style={TEXT_STYLES.bodyLarge}>Large body</Text>
```

**After** (Using deprecated styles temporarily):
```tsx
import { TEXT_STYLES_DEPRECATED } from '@/shared/constants/typography';

<Text style={TEXT_STYLES_DEPRECATED.h3}>Subsection</Text>
<Text style={TEXT_STYLES_DEPRECATED.bodyLarge}>Large body</Text>
```

**Note**: These will be removed in a future version. Migrate to AppText variants.

---

## Common Migration Scenarios

### Scenario 1: Page Title

**Before**:
```tsx
<Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>
  Settings
</Text>
```

**After**:
```tsx
<AppText variant="h1">Settings</AppText>
// Color automatically uses theme.text.primary
```

---

### Scenario 2: Body Text with Custom Color

**Before**:
```tsx
<Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
  Helper text
</Text>
```

**After**:
```tsx
<AppText variant="body" color={theme.text.secondary}>
  Helper text
</AppText>
```

---

### Scenario 3: Button Text

**Before**:
```tsx
<TouchableOpacity>
  <Text style={TEXT_STYLES.button}>Click Me</Text>
</TouchableOpacity>
```

**After** (Use Button component):
```tsx
import { Button } from '@/presentation/components';

<Button variant="primary" title="Click Me" onPress={handlePress} />
```

**Or** (If custom button needed):
```tsx
<TouchableOpacity>
  <AppText variant="button">Click Me</AppText>
</TouchableOpacity>
```

---

### Scenario 4: Label/Overline

**Before**:
```tsx
<Text style={TEXT_STYLES.label}>CATEGORY</Text>
```

**After**:
```tsx
<AppText variant="overline">CATEGORY</AppText>
// Automatically uppercase
```

---

### Scenario 5: Emphasis Text

**Before**:
```tsx
<Text style={[TEXT_STYLES.body, { fontWeight: '500' }]}>
  Important text
</Text>
```

**After**:
```tsx
<AppText variant="bodyEmphasis">Important text</AppText>
// 16px, medium weight
```

---

## Size Changes Summary

| Style | Old Size | New Size | Change |
|-------|----------|----------|--------|
| h1 | 30px | 24px | -6px |
| h2 | 24px | 20px | -4px |
| body | 16px | 16px | Same |
| caption | 12px | 13px | +1px |

**Impact**: Headings are smaller. This is intentional for premium feel.

---

## Weight Changes Summary

| Style | Old Weight | New Weight | Change |
|-------|------------|------------|--------|
| h1 | Bold (700) | Semibold (600) | Lighter |
| h2 | Bold (700) | Semibold (600) | Lighter |
| body | Regular (400) | Regular (400) | Same |
| button | Semibold (600) | Medium (500) | Lighter |

**Impact**: Headlines are lighter. This is intentional for premium feel.

---

## Line Height Changes

| Style | Old Line Height | New Line Height | Change |
|-------|-----------------|-----------------|--------|
| body | 1.5× (24px) | 1.4× (22.4px) | Tighter |

**Impact**: Body text has tighter line height for premium feel.

---

## Migration Checklist

For each component using typography:

- [ ] Identify all `Text` components using `TEXT_STYLES`
- [ ] Replace with `AppText` component where possible
- [ ] Update variant names (h1→h1, but check size changes)
- [ ] Test visual appearance (headings will be smaller)
- [ ] Update any hardcoded font sizes to use variants
- [ ] Remove custom fontWeight/styles (use variants instead)
- [ ] Verify theme colors are applied correctly

---

## Breaking Changes

### Visual Changes
- **Headings are smaller**: h1 (30px→24px), h2 (24px→20px)
- **Headings are lighter**: bold→semibold
- **Body line height tighter**: 1.5×→1.4×

### API Changes
- `TEXT_STYLES.h3`, `h4`, `bodyLarge`, `bodySmall`, `buttonSmall`, `label` moved to `TEXT_STYLES_DEPRECATED`
- New styles: `display`, `bodyEmphasis`, `overline`

---

## Best Practices

### DO ✅
- Use `AppText` component for new code
- Use one of 8 allowed variants
- Let AppText handle theme colors
- Use convenience exports (Heading1, BodyText, etc.)

### DON'T ❌
- Don't use deprecated styles in new code
- Don't mix TEXT_STYLES and AppText in same component
- Don't override fontSize/fontWeight (use correct variant)
- Don't create custom text styles (max 8 allowed)

---

## Examples

### Complete Component Migration

**Before**:
```tsx
import { View, Text } from 'react-native';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { useTheme } from '@/infrastructure/theme';

export const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View>
      <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>
        Title
      </Text>
      <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
        Description
      </Text>
      <Text style={TEXT_STYLES.caption}>
        Helper text
      </Text>
    </View>
  );
};
```

**After**:
```tsx
import { View } from 'react-native';
import { AppText } from '@/presentation/components';
import { useTheme } from '@/infrastructure/theme';

export const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View>
      <AppText variant="h1">Title</AppText>
      <AppText variant="body" color={theme.text.secondary}>
        Description
      </AppText>
      <AppText variant="caption">Helper text</AppText>
    </View>
  );
};
```

---

## Troubleshooting

### Issue: Heading looks too small

**Solution**: This is intentional for premium feel. If you need larger, use `display` variant (30px).

### Issue: Text color not applying

**Solution**: Use `color` prop on AppText, or let it default to `theme.text.primary`.

### Issue: Need custom font size

**Solution**: Use the closest variant, or override with `style` prop (not recommended).

---

**Last Updated**: 2025-01-XX  
**Status**: Active Migration Guide
