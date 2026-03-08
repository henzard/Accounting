# ADR 004: Phase 5.2 Implementation - Lessons Learned

**Date**: 2025-01-13  
**Status**: ✅ Resolved - Phase 5.2 Complete with Bug Fixes  
**Context Tags**: #rollback #circular-dependency #uuid #auth-race-condition

---

## Context

We attempted to implement Phase 5.2 (Household Setup) but encountered multiple issues that prevented the app from running on Android emulator. After fixing several code bugs, we still couldn't get the emulator to launch the app properly.

## Decision

**Roll back to commit `80fae51` (Phase 5.1 complete) and restart Phase 5.2 with lessons learned.**

---

## What Worked ✅

### 1. SearchableSelect Component
- Modal-based dropdown with search
- FlatList for options
- Clean UI with theme integration
- **Keep this design pattern**

### 2. Household Screens Structure
- `household/create.tsx` - solid form design
- `household/select.tsx` - good list layout
- Firebase integration approach correct

### 3. Currency & Timezone Constants
- Comprehensive lists (30+ currencies, 40+ timezones)
- SelectOption interface pattern
- **Keep these files**

---

## Bugs Found and Fixed 🐛

### Critical Bug: Circular Dependency

**Problem**:
```
src/shared/constants/currencies.ts
  → imports SelectOption from SearchableSelect

src/app/household/create.tsx
  → imports CURRENCY_OPTIONS from currencies
  → imports SearchableSelect

RESULT: Circular dependency breaks Android Metro bundler
```

**Symptom**: Web bundled fine, Android failed to launch

**Solution**:
```typescript
// Move SelectOption to shared types
// src/shared/types/index.ts
export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

// Update all imports to use @/shared/types
```

**Files to change in next attempt**:
- `src/shared/types/index.ts` - Add SelectOption
- `src/presentation/components/SearchableSelect.tsx` - Import from types
- `src/shared/constants/currencies.ts` - Import from types
- `src/shared/constants/timezones.ts` - Import from types

### Bug: TypeScript Error in household/select.tsx

**Problem**: Used `createHousehold()` factory to reconstruct existing households from Firestore

**Why it failed**: Factory doesn't accept `member_ids`, `created_at`, etc. as params

**Solution**: 
- Use `createHousehold()` ONLY for NEW households
- Manually construct object when loading from Firestore:

```typescript
const household: Household = {
  id: doc.id,
  name: data.name,
  owner_id: data.owner_id,
  member_ids: data.member_ids || [data.owner_id],
  // ... rest of fields
};
```

### Bug: app.json newArchEnabled

**Problem**: `"newArchEnabled": true` requires development build, conflicts with Expo Go

**Solution**: Remove that line (we're not using new architecture yet)

---

## Infrastructure Issues 🚫

### Expo Go on Emulator
- Corrupted installation
- Insufficient storage (95% full)
- `monkey -p host.exp.exponent` error code 252

**Not a code issue** - emulator environment problem

---

## Lessons for Next Attempt

### 1. Fix Dependencies FIRST
**Before writing ANY code**:
```typescript
// Step 1: Add to src/shared/types/index.ts
export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}
```

This prevents circular dependency from the start.

### 2. Test Incrementally
- Create ONE file at a time
- Test after EACH file
- Don't create 5 files then test

**Order**:
1. Add SelectOption to types → Test
2. Create SearchableSelect → Test  
3. Create currencies.ts → Test
4. Create timezones.ts → Test
5. Create household/create.tsx → Test
6. Create household/select.tsx → Test

### 3. Use Physical Device OR Fix Emulator First
- Physical device more reliable
- OR: Wipe emulator and start fresh
- Don't waste time debugging emulator issues

### 4. Factory Pattern Rules
```typescript
// ✅ GOOD: New entity
const household = createHousehold({
  id: uuid(),
  name: 'My Family',
  owner_id: userId,
});

// ❌ BAD: Existing entity from Firestore  
const household = createHousehold({
  id: doc.id,
  member_ids: data.member_ids, // Factory doesn't accept this!
});

// ✅ GOOD: Existing entity
const household: Household = {
  id: doc.id,
  // ... all fields from Firestore
};
```

---

## Implementation Plan for Take 2

### Step 1: Infrastructure (5 min)
```powershell
# Option A: Test on physical device
# Connect phone, enable USB debugging

# Option B: Wipe emulator
# AVD Manager → Wipe Data → Cold Boot
```

### Step 2: Fix Dependencies (10 min)
1. Add SelectOption to `shared/types/index.ts`
2. Test: `npx tsc --noEmit`
3. Test: `npm start`
4. Verify no circular dependency warnings

### Step 3: Create SearchableSelect (20 min)
1. Create component (import SelectOption from types)
2. Add to `presentation/components/index.ts`
3. Test: Create test screen
4. Test: `npm run android` → See component work

### Step 4: Create Constants (10 min)
1. Create `currencies.ts` (import from types)
2. Create `timezones.ts` (import from types)
3. Test: Import in test screen
4. Test: `npm run android`

### Step 5: Create Household Screens (30 min each)
1. Create `household/create.tsx`
   - Use createHousehold() for NEW
   - Test Firebase write
   - Test: `npm run android`

2. Create `household/select.tsx`
   - Manual construct for EXISTING
   - Test Firebase read
   - Test: `npm run android`

---

## Success Criteria

**Phase 5.2 is complete when**:
- ✅ Can create household (name, currency, timezone)
- ✅ Household saves to Firestore
- ✅ Can select household from list
- ✅ User's default_household_id updates
- ✅ Tabs guard redirects properly
- ✅ **App runs on Android without errors**

---

## Final Resolution (Take 2)

### Additional Bugs Found and Fixed:

#### Bug 4: UUID Crypto Error
**Problem**: `uuid` package requires `crypto.getRandomValues()` not available in React Native

**Fix**: 
- Installed `react-native-get-random-values`
- Imported at top of `_layout.tsx` (must be first!)

#### Bug 5: Auth Race Condition (Firestore Sync Delay)
**Problem**: `refreshUser()` was reading from Firestore before write completed

**Solution (KISS)**: 
- Added `updateUserLocally()` function
- Updates state immediately (don't wait for Firestore sync)
- Navigation happens instantly with correct user state

### Final State:
- ✅ Phase 5.2 complete and working on fresh emulator
- ✅ All bugs resolved
- ✅ Household creation working
- ✅ UUID generation working
- ✅ No auth race conditions

---

## References

- Circular dependency explanation: https://nodejs.org/api/modules.html#cycles
- React Native Metro bundler: https://metrobundler.dev/
- Clean Architecture: Dependency rule (inner layers don't import outer)

---

**Next Action**: Start Phase 5.2 Take 2 with infrastructure fix first.

