# Premium UI Quick Reference

**Quick reference card for Premium UI Standards**

**Full Rules**: `.cursor/rules/37-premium-ui-standards.mdc`

---

## 🎯 Core Principles

**Luxury = Restraint**

Premium UIs feel expensive because they use space, typography, and color with discipline. Every pixel matters.

---

## 📏 Spacing (8pt Grid)

**Allowed Values ONLY**: `4, 8, 12, 16, 20, 24, 32, 40, 48`

```typescript
import { SPACING } from '@/shared/constants/spacing';

// ✅ GOOD
padding: SPACING[4]  // 16px
gap: SPACING[2]      // 8px

// ❌ BAD
padding: 14  // Not in 8pt grid!
```

**Screen Padding**: `SPACING[5]` (20px) - premium feel  
**Card Padding**: `SPACING[4]` (16px) - minimum `SPACING[3]` (12px)

---

## 🔤 Typography (8 Styles Max)

```typescript
import { AppText } from '@/presentation/components';

<AppText variant="h1">Title</AppText>
<AppText variant="body">Body text</AppText>
```

**Allowed Variants**:
- `display` (30px, semibold)
- `h1` (24px, semibold)
- `h2` (20px, semibold)
- `body` (16px, regular, 1.4× line height)
- `bodyEmphasis` (16px, medium)
- `caption` (13px, regular)
- `overline` (12px, medium, uppercase)
- `button` (16px, medium)

**Weights**: Regular (400), Medium (500), Semibold (600) - **NO Bold (700)**

---

## 🎨 Colors

**Distribution**:
- Neutrals: 85-95%
- Primary blue: 3-10%
- Gold accent: 1-3% (use sparingly!)

**Never Use**:
- ❌ Pure black (#000000)
- ❌ Pure white (#FFFFFF)

**Use Theme**:
```typescript
import { useTheme } from '@/infrastructure/theme';

const { theme } = useTheme();
backgroundColor: theme.background.primary  // Soft Ivory / Near-Black Navy
color: theme.text.primary                  // Deep Navy / Soft Ivory
```

---

## 🔲 Border Radius

```typescript
import { BORDER_RADIUS } from '@/shared/constants/spacing';

BORDER_RADIUS.sm  // 12px - Small controls (buttons, inputs)
BORDER_RADIUS.md  // 16px - Cards
BORDER_RADIUS.lg  // 20px - Sheets/Modals
```

---

## 🎛️ Components

### Buttons
- **Height**: 48-52px (use `BUTTON_HEIGHT.md` = 50px)
- **Radius**: 12px (`BORDER_RADIUS.sm`)
- **Variant**: `primary`, `secondary`, `destructive`

### Inputs
- **Height**: 48-52px (match button height)
- **Label**: Above input (not inside)
- **Border**: 1px hairline

### Lists
- **Row Height**: 56-64px
- **Dividers**: Hairline (`StyleSheet.hairlineWidth`)

---

## 🎬 Motion

**Micro-animations only**: 150-220ms

```typescript
import { ANIMATION } from '@/shared/constants/animations';

duration: ANIMATION.duration.fast  // 200ms
easing: ANIMATION.easing.easeOut
```

**No bouncy transitions** (except subtle toggles)

---

## 🧩 Component Tiers

### Tier 1: Base Components
```typescript
import { AppText, Surface } from '@/presentation/components';

<Surface variant="default" padding={SPACING[4]}>
  <AppText variant="h2">Title</AppText>
  <AppText variant="body">Content</AppText>
</Surface>
```

### Tier 2: Interactive
```typescript
import { Button } from '@/presentation/components';

<Button variant="primary" title="Action" onPress={handlePress} />
```

---

## 📱 Screen Wrapper

```typescript
import { ScreenWrapper } from '@/presentation/components';

export default function MyScreen() {
  return (
    <ScreenWrapper>
      {/* Screen content - automatically gets safe area, padding, background */}
    </ScreenWrapper>
  );
}
```

---

## ✅ Checklist

Before marking component complete:

- [ ] All spacing uses 8pt grid tokens
- [ ] Text uses AppText with one of 8 variants
- [ ] Colors from theme (no hardcoded hex)
- [ ] No pure black/white
- [ ] Border radius uses BORDER_RADIUS tokens
- [ ] Buttons 48-52px height
- [ ] Inputs 48-52px height
- [ ] Touch targets minimum 44×44px
- [ ] Screen uses ScreenWrapper

---

**Quick Links**:
- [Full Rules](.cursor/rules/37-premium-ui-standards.mdc)
- [Color Theme](color-theme.md)
- [Component Tiers Guide](component-tiers-guide.md)
