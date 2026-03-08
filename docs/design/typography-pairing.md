# Typography Pairing Guide

**Premium UI Standards**: Typography pairing recommendations for "expensive" feel

**Reference**: `design/color-theme.md` and `.cursor/rules/37-premium-ui-standards.mdc`

---

## Overview

To complete the "expensive" feel of the premium UI, use specific font pairings that create visual hierarchy and sophistication.

---

## Recommended Font Pairings

### Headings: Serif or High-Contrast Sans

**Purpose**: Create visual interest and hierarchy for headings

**Recommended Fonts**:
- **Playfair Display** (Serif) - Elegant, classic serif
- **Canela** (Serif) - Modern serif with warmth
- **Cormorant** (Serif) - Refined serif with character
- **Inter** (Sans) - With tight letter spacing for high contrast

**Characteristics**:
- Letter spacing: Slightly increased on headings
- Weight: Semibold (600) - not bold (700)
- Size: 20-30px range (see TEXT_STYLES for exact sizes)

**Implementation**:
```typescript
// When custom fonts are added:
export const FONTS = {
  // Headings
  heading: 'PlayfairDisplay-SemiBold', // or 'Canela-Medium', 'Cormorant-SemiBold'
  
  // Body
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
} as const;
```

---

### Body: Neutral, Modern Sans

**Purpose**: Readable, professional body text

**Recommended Fonts**:
- **Inter** (Primary recommendation) - Clean, modern, highly readable
- **Source Sans 3** - Professional, neutral
- **IBM Plex Sans** - Technical, precise feel

**Characteristics**:
- Letter spacing: Normal (0)
- Weight: Regular (400) for body, Medium (500) for emphasis
- Size: 15-16px with 1.4× line height

**Implementation**:
```typescript
// Current (System fonts):
export const FONTS = {
  regular: 'System',  // Will use Inter when custom fonts added
  medium: 'System',
  semibold: 'System',
} as const;

// Future (Custom fonts):
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
} as const;
```

---

## Font Weight Guidelines

**Premium UI Standard**: Fewer choices (Regular, Medium, Semibold only)

### Weight Hierarchy

1. **Regular (400)** - Default for body text
2. **Medium (500)** - Emphasis, body emphasis, overline
3. **Semibold (600)** - Headlines, display text, buttons

**Avoid**: Bold (700) - too heavy for premium feel

---

## Letter Spacing

### Headings
- **Tight**: -0.5px (for large headings)
- **Normal**: 0px (for smaller headings)
- **Slightly increased**: 0.5px (optional, for serif headings)

### Body
- **Normal**: 0px (default)
- **Wide**: 0.5px (for buttons, overline)

---

## Current Implementation

### System Fonts (Current)

Currently using system fonts for best performance:

```typescript
export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
} as const;
```

### Text Styles (8 Max)

```typescript
// Premium set (8 styles)
display:    30px, semibold  // Hero text
h1:         24px, semibold  // Page titles
h2:         20px, semibold  // Section headers
body:       16px, regular   // Default text (1.4× line height)
bodyEmphasis: 16px, medium  // Emphasized text
caption:    13px, regular   // Helper text
overline:   12px, medium    // Labels (uppercase)
button:     16px, medium    // Button text
```

---

## Future: Custom Font Implementation

### Step 1: Add Font Files

1. Add font files to `src/assets/fonts/`:
   - `Inter-Regular.ttf`
   - `Inter-Medium.ttf`
   - `Inter-SemiBold.ttf`
   - `PlayfairDisplay-SemiBold.ttf` (optional, for headings)

### Step 2: Configure Expo

Update `app.json` or `app.config.js`:

```json
{
  "expo": {
    "fonts": [
      "./src/assets/fonts/Inter-Regular.ttf",
      "./src/assets/fonts/Inter-Medium.ttf",
      "./src/assets/fonts/Inter-SemiBold.ttf",
      "./src/assets/fonts/PlayfairDisplay-SemiBold.ttf"
    ]
  }
}
```

### Step 3: Update Typography Constants

```typescript
// src/shared/constants/typography.ts
export const FONTS = {
  // Headings (serif or high-contrast sans)
  heading: 'PlayfairDisplay-SemiBold', // or 'Inter-SemiBold' with tight tracking
  
  // Body (neutral modern sans)
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
} as const;
```

### Step 4: Update Text Styles

```typescript
export const TEXT_STYLES = {
  display: {
    fontSize: 30,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: FONTS.heading, // Use heading font
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: FONTS.heading, // Use heading font
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.regular, // Use body font
    letterSpacing: 0,
  },
  // ... etc
} as const;
```

---

## Visual Personality

The typography pairing contributes to the overall visual personality:

- **Minimalist** — Few font choices, disciplined usage
- **Elegant** — Serif headings add sophistication
- **Expensive** — High-quality font choices, proper spacing
- **Timeless** — Avoids trends, suitable for long-lived products

---

## Best Practices

### DO ✅
- Use semibold (600) for headlines, not bold (700)
- Use 1.4× line height for body text (premium feel)
- Keep letter spacing tight on headings
- Use system fonts until custom fonts are ready
- Limit to 8 text styles maximum

### DON'T ❌
- Don't use bold (700) weight
- Don't use more than 8 text styles
- Don't mix too many font families
- Don't use decorative fonts for body text
- Don't use fonts that reduce readability

---

## Resources

- **Inter Font**: https://rsms.me/inter/
- **Source Sans 3**: https://fonts.google.com/specimen/Source+Sans+3
- **IBM Plex Sans**: https://www.ibm.com/plex/
- **Playfair Display**: https://fonts.google.com/specimen/Playfair+Display

---

## Migration Checklist

When ready to add custom fonts:

- [ ] Download font files (Inter recommended)
- [ ] Add fonts to `src/assets/fonts/`
- [ ] Update `app.json` with font paths
- [ ] Update `FONTS` constant in `typography.ts`
- [ ] Update `TEXT_STYLES` to use custom fonts
- [ ] Test on iOS and Android
- [ ] Verify font loading performance
- [ ] Update documentation

---

**Last Updated**: 2025-01-XX  
**Status**: Ready for custom font implementation
