# Household Duplication Issue - Root Cause Analysis

## Problem Summary
The database had **10 households** instead of the expected **2 households**:
- 8 duplicate "Kruger Family" households (all with only `henzardkruger@gmail.com`)
- 1 correct "Kruger Family" household (with both members)
- 1 "Hetzel Family" household (correct)

## Root Cause

### 1. **No Duplicate Prevention in Household Creation**

Looking at `src/app/household/create.tsx` (lines 42-121):

```typescript
const handleCreateHousehold = async () => {
  // ... validation ...
  
  // Creates a NEW household with a NEW UUID every time
  const household = createHousehold({
    id: uuid(),  // ❌ Always generates a new ID
    name: householdName.trim(),
    // ...
  });
  
  // Saves to Firestore (no check if household with same name exists)
  await setDoc(doc(db, 'households', household.id), { /* ... */ });
  
  // Adds to user.household_ids (no check if already exists)
  const updatedHouseholdIds = [...user.household_ids, household.id];
  await setDoc(/* ... */);
}
```

**Issues:**
- ❌ No check if a household with the same name already exists
- ❌ No idempotency - each button click creates a new household
- ❌ No transaction/rollback if user update fails after household creation
- ❌ No cleanup of failed/duplicate households

### 2. **Race Conditions & Multiple Clicks**

**Scenario 1: User Impatience**
1. User clicks "Create Household" button
2. Network is slow, user doesn't see immediate feedback
3. User clicks button again (or multiple times)
4. Each click creates a new household with a new UUID
5. All households get added to `user.household_ids`

**Scenario 2: Error Recovery**
1. User creates household
2. Household is created in Firestore
3. User document update fails (network error, permission error)
4. User sees error, tries again
5. New household is created (old one still exists)

**Scenario 3: App Reload/Crash**
1. User creates household
2. Household is created in Firestore
3. App crashes or reloads before user document is updated
4. User sees "no household" and creates again
5. New household is created (old one still exists)

### 3. **Why All Duplicates Had Only One Member**

Looking at the test results:
- 8 duplicate "Kruger Family" households had only `henzardkruger@gmail.com`
- 1 correct "Kruger Family" had both members

**This suggests:**
- The duplicates were created BEFORE `aliciakruger87@gmail.com` was added as a member
- Or the duplicates were created during signup/onboarding when only the owner existed
- The correct household was created later (or was the first one) and had the member added

### 4. **The Loading Fix I Made**

I changed `src/app/household/manage.tsx` to query by `member_ids`:

```typescript
// OLD (broken):
const householdDocs = await Promise.all(
  user.household_ids.map(async (householdId) => {
    // Only loads households in user.household_ids
  })
);

// NEW (fixed):
const householdsQuery = query(
  collection(db, 'households'),
  where('member_ids', 'array-contains', user.id)
);
```

**Why this helped:**
- ✅ Shows ALL households the user belongs to (source of truth: `household.member_ids`)
- ✅ Works even if `user.household_ids` is out of sync
- ✅ But it doesn't PREVENT duplicates - it just shows them all

## How It Happened (Timeline)

Based on the evidence:

1. **Initial Signup**: `henzardkruger@gmail.com` signs up
2. **Multiple Household Creations**: User creates "Kruger Family" multiple times (8 times)
   - Possibly due to:
     - Network issues causing retries
     - App crashes during creation
     - User clicking multiple times
     - Testing the feature
3. **Each Creation**:
   - Generated new UUID
   - Created household document in Firestore
   - Added household ID to `user.household_ids`
   - All 8 households had only `henzardkruger@gmail.com` as member
4. **Member Addition**: Later, `aliciakruger87@gmail.com` was added to ONE of the households
5. **Hetzel Creation**: "Hetzel Family" was created (correctly, only once)
6. **Result**: 10 total households (8 duplicates + 1 correct Kruger + 1 Hetzel)

## Prevention Strategies

### 1. **Add Duplicate Check Before Creation**

```typescript
// Check if household with same name already exists for this user
const existingHouseholdsQuery = query(
  collection(db, 'households'),
  where('member_ids', 'array-contains', user.id),
  where('name', '==', householdName.trim())
);
const existing = await getDocs(existingHouseholdsQuery);

if (!existing.empty) {
  showAlert('Household Exists', 'You already have a household with this name.');
  return;
}
```

### 2. **Add Button Disable During Creation**

```typescript
const [creating, setCreating] = useState(false);

const handleCreateHousehold = async () => {
  if (creating) return; // Prevent multiple clicks
  setCreating(true);
  try {
    // ... creation logic ...
  } finally {
    setCreating(false);
  }
};
```

### 3. **Use Firestore Transactions**

```typescript
await runTransaction(db, async (transaction) => {
  // Check for duplicates
  // Create household
  // Update user
  // All or nothing
});
```

### 4. **Add Idempotency Key**

Store a creation timestamp/ID in user document to prevent duplicate creations within a time window.

### 5. **Better Error Handling**

If user update fails after household creation, delete the household or retry the user update.

## Cleanup Script

I created `src/scripts/cleanup-households.js` which:
- ✅ Identifies the correct households to keep
- ✅ Deletes duplicate households
- ✅ Updates user documents to reflect correct state
- ✅ Can be run anytime to clean up duplicates

## Lessons Learned

1. **Always check for duplicates** before creating resources
2. **Disable buttons during async operations** to prevent multiple clicks
3. **Use transactions** for multi-document operations
4. **Query by source of truth** (`member_ids`) not derived data (`user.household_ids`)
5. **Add cleanup scripts** for data integrity issues
