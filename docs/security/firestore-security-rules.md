# Firebase Security Rules - Production

**Status**: Not yet applied (still using test rules)  
**Apply when**: After implementing Authentication (Phase 5.1)

---

## Current Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEMPORARY FOR TESTING
    }
  }
}
```

⚠️ **Security Risk**: Database is publicly accessible  
✅ **OK for testing** with no real user data

---

## Production Rules (Future)

See the comprehensive security rules in this document that enforce:

### Core Principles
1. **Authentication Required** - All access requires Firebase Auth
2. **Household Isolation** - Users only access their household data
3. **Financial Integrity** - Transactions cannot be deleted
4. **Field Validation** - Required fields and data types enforced
5. **Owner Permissions** - Household owners control settings

### Key Rules

#### Users Collection
- Users can only read/write their own profile
- Cannot delete profiles (use soft delete)

#### Households Collection
- Members can read household data
- Only owner can update household settings
- Only owner can delete household

#### Transactions Collection
- All household members can create/read/update
- **Cannot delete** transactions (financial integrity)
- Amount must be positive
- Date cannot be in future

#### Budgets & Categories
- All household members have full access
- Shared responsibility for budgeting

#### Debts Collection
- All household members can manage debts
- Debt snowball accessible to all members

---

## Migration Plan

### Phase 1: Current (Testing)
```
✅ Open rules for testing
✅ No authentication required
⚠️ Only use test data
```

### Phase 2: After Auth Implementation (Phase 5.1)
```
1. Implement Firebase Authentication
2. Test auth flow thoroughly
3. Apply production rules gradually:
   - Start with users collection only
   - Add households collection
   - Add financial collections
   - Test at each step
4. Monitor Firebase Console for violations
```

### Phase 3: Before Production Launch
```
1. Remove test_connection rules
2. Enable all production rules
3. Test multi-user scenarios:
   - User A cannot see User B's data
   - Household members can all access shared data
   - Non-members cannot access household
4. Security audit
5. Launch
```

---

## Testing Security Rules

### Before Applying
Use Firebase Emulator to test rules locally:
```powershell
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

### After Applying
Test these scenarios in production:
- [ ] User can read own profile
- [ ] User cannot read other user's profile
- [ ] Household member can access household data
- [ ] Non-member cannot access household data
- [ ] Cannot delete transactions
- [ ] Cannot create transaction with negative amount
- [ ] Cannot create transaction with future date

---

## Security Rule Functions Explained

### `isAuthenticated()`
Checks if user is logged in with Firebase Auth.

### `isOwner(userId)`
Checks if the authenticated user matches the userId.

### `isHouseholdMember(householdId)`
Checks if authenticated user is in the household's member_ids array.

### `isHouseholdOwner(householdId)`
Checks if authenticated user is the household owner.

### `hasRequiredFields(required)`
Validates that all required fields are present in the data.

### `isValidTimestamp(timestamp)`
Ensures timestamp is not in the future.

---

## Common Security Rule Patterns

### Read Own Data
```javascript
allow read: if request.auth.uid == resource.data.user_id;
```

### Write with Validation
```javascript
allow create: if request.auth != null && 
                hasRequiredFields(['name', 'email']) &&
                request.resource.data.amount > 0;
```

### Prevent Deletion
```javascript
allow delete: if false;  // Never allow deletion
```

### Household Access
```javascript
allow read: if request.auth != null &&
              get(/databases/$(database)/documents/households/$(householdId))
                .data.member_ids.hasAny([request.auth.uid]);
```

---

## References

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/best-practices)
- [Testing Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Common Security Rule Patterns](https://firebase.google.com/docs/firestore/security/rules-query)

---

**Next Steps**: Keep testing with open rules until Phase 5.1 (Authentication), then migrate to production rules.

