# Master TODO: Dave Ramsey Budgeting App

**Philosophy**: Eating an elephant - one bite at a time  
**Strategy**: Build → Test → Run → Verify → Next  
**Rule**: Run `npm run android` frequently to ensure nothing breaks

---

## 🎯 Progress Overview

- **Phase 0**: Project Setup ✅ (Complete)
- **Phase 1**: Foundation & Infrastructure 🔄 (Current)
- **Phase 2**: Domain Layer (Business Logic)
- **Phase 3**: Data Layer (Firebase Integration)
- **Phase 4**: Presentation Layer (Basic UI)
- **Phase 5**: MVP Features (Core Functionality)
- **Phase 6**: Polish & Production Ready

---

## Phase 0: Project Setup ✅ COMPLETE

- [x] Create Expo project with TypeScript
- [x] Rename project folder to `src/`
- [x] Update rules for `src/` pattern
- [x] Verify basic structure exists
- [x] Initial `.gitignore` configured

**Status**: ✅ Complete  
**Next**: Phase 1

---

## Phase 1: Foundation & Infrastructure

### 1.1: Verify Current Setup (5 min)

- [ ] **Test app runs**
  ```powershell
  cd C:\Project\Accounting\src
  npm run android
  ```
- [ ] Verify emulator opens
- [ ] Verify default Expo app displays
- [ ] Press 'r' to reload - works?
- [ ] Metro bundler running - no errors?

**Exit Criteria**: App runs, no errors  
**If broken**: Fix before proceeding

---

### 1.2: Add Clean Architecture Folders (5 min)

- [ ] Create folder structure:
  ```powershell
  cd C:\Project\Accounting\src
  mkdir domain
  mkdir domain\entities
  mkdir domain\repositories
  mkdir domain\use-cases
  mkdir data
  mkdir data\repositories
  mkdir data\datasources
  mkdir data\models
  mkdir presentation
  mkdir presentation\components
  mkdir presentation\screens
  mkdir presentation\hooks
  mkdir infrastructure
  mkdir infrastructure\firebase
  mkdir infrastructure\di
  mkdir shared
  mkdir shared\types
  mkdir shared\utils
  mkdir shared\constants
  ```

- [ ] **Test app still runs**
  ```powershell
  npm run android
  ```

**Exit Criteria**: Folders created, app still runs

---

### 1.3: Configure TypeScript Paths (10 min)

- [ ] Update `src/tsconfig.json` with path aliases
- [ ] Update `src/babel.config.js` with module-resolver
- [ ] Create simple test file to verify imports work
- [ ] **Test app still runs**

**Exit Criteria**: Path aliases work, app runs

---

### 1.4: Install Core Dependencies (15 min)

**Install batch 1 (Firebase)**:
```powershell
cd C:\Project\Accounting\src
npm install firebase
```

- [ ] Install Firebase
- [ ] **Test app runs** after Firebase install

**Install batch 2 (Expo packages)**:
```powershell
npx expo install expo-sqlite
npx expo install expo-secure-store
npx expo install expo-file-system
```

- [ ] Install expo-sqlite
- [ ] Install expo-secure-store
- [ ] Install expo-file-system
- [ ] **Test app runs** after Expo packages

**Install batch 3 (Utilities)**:
```powershell
npm install uuid date-fns
npm install --save-dev @types/uuid
```

- [ ] Install uuid
- [ ] Install date-fns
- [ ] Install types
- [ ] **Test app runs** after utilities

**Install batch 4 (State & Forms)**:
```powershell
npm install mobx mobx-react-lite
npm install react-hook-form @hookform/resolvers yup
```

- [ ] Install MobX
- [ ] Install react-hook-form
- [ ] **Test app runs** after state management

**Exit Criteria**: All deps installed, app runs

---

### 1.5: Firebase Configuration (20 min)

- [ ] Create Firebase project (in Firebase Console)
- [ ] Enable Firestore Database
- [ ] Enable Firebase Auth
- [ ] Enable Firebase Storage
- [ ] Download config JSON
- [ ] Create `src/infrastructure/firebase/config.ts`
- [ ] **DO NOT commit** firebase config (add to .gitignore)
- [ ] Create `.env.example` with placeholder keys
- [ ] **Test app runs** with Firebase config

**Exit Criteria**: Firebase configured, app runs

---

## Phase 2: Domain Layer (Business Logic)

### 2.1: Core Entities (30 min)

**Create one at a time, test after each:**

- [ ] Create `User.ts` entity
  - Fields: id, email, name, household_ids
  - **Test app runs**

- [ ] Create `Household.ts` entity
  - Fields: id, name, owner_id, current_baby_step
  - **Test app runs**

- [ ] Create `Account.ts` entity
  - Fields: id, name, type, balance
  - **Test app runs**

- [ ] Create `Transaction.ts` entity
  - Fields: id, amount, date, account_id, type
  - **Test app runs**

- [ ] Create `Budget.ts` entity
  - Fields: id, month, year, planned_income, planned_expenses
  - **Test app runs**

- [ ] Create `BudgetCategory.ts` entity
  - Fields: id, name, planned_amount, actual_amount
  - **Test app runs**

- [ ] Create `Debt.ts` entity
  - Fields: id, name, balance, minimum_payment
  - **Test app runs**

**Exit Criteria**: All entities created, app runs

---

### 2.2: Repository Interfaces (20 min)

**Create interfaces only (no implementation yet):**

- [ ] Create `IUserRepository.ts`
  - Methods: getCurrentUser(), updateUser()
  - **Test app runs**

- [ ] Create `IHouseholdRepository.ts`
  - Methods: getHousehold(), updateHousehold()
  - **Test app runs**

- [ ] Create `ITransactionRepository.ts`
  - Methods: getTransactions(), saveTransaction()
  - **Test app runs**

- [ ] Create `IBudgetRepository.ts`
  - Methods: getCurrentBudget(), saveBudget()
  - **Test app runs**

**Exit Criteria**: Interfaces created, app runs

---

### 2.3: Core Use Cases (30 min)

**Create simple use cases:**

- [ ] Create `CreateTransactionUseCase.ts`
  - Takes amount, date, account
  - Returns transaction
  - **Test app runs**

- [ ] Create `GetCurrentBudgetUseCase.ts`
  - Takes household_id
  - Returns current month budget
  - **Test app runs**

- [ ] Create `ValidateZeroBasedBudgetUseCase.ts`
  - Takes budget
  - Returns validation result
  - **Test app runs**

**Exit Criteria**: Use cases created, app runs

---

## Phase 3: Data Layer (Firebase Integration)

### 3.1: Firebase Service Setup (20 min)

- [ ] Create `src/infrastructure/firebase/firestore.ts`
  - Initialize Firestore
  - Enable offline persistence
  - **Test app runs**

- [ ] Create `src/infrastructure/firebase/auth.ts`
  - Initialize Auth
  - **Test app runs**

- [ ] Create `src/infrastructure/firebase/storage.ts`
  - Initialize Storage
  - **Test app runs**

**Exit Criteria**: Firebase services initialized, app runs

---

### 3.2: Data Models (DTOs) (30 min)

**Create Firestore data models:**

- [ ] Create `UserDTO.ts`
  - Map User entity ↔ Firestore
  - **Test app runs**

- [ ] Create `HouseholdDTO.ts`
  - Map Household entity ↔ Firestore
  - **Test app runs**

- [ ] Create `TransactionDTO.ts`
  - Map Transaction entity ↔ Firestore
  - **Test app runs**

**Exit Criteria**: DTOs created, app runs

---

### 3.3: Repository Implementations (45 min)

**Implement repositories one at a time:**

- [ ] Create `FirestoreUserRepository.ts`
  - Implement IUserRepository
  - Test with Firebase emulator (optional)
  - **Test app runs**

- [ ] Create `FirestoreHouseholdRepository.ts`
  - Implement IHouseholdRepository
  - **Test app runs**

- [ ] Create `FirestoreTransactionRepository.ts`
  - Implement ITransactionRepository
  - **Test app runs**

**Exit Criteria**: Repositories implemented, app runs

---

### 3.4: Test Firebase Connection (15 min)

- [ ] Create test screen to write/read Firestore
- [ ] Write a test document
- [ ] Read it back
- [ ] Verify offline persistence works
- [ ] **Test app runs and connects to Firebase**

**Exit Criteria**: Firebase read/write works, offline works

---

## Phase 4: Presentation Layer (Basic UI)

### 4.1: Theme Setup (20 min)

- [ ] Create `src/shared/constants/colors.ts`
  - Define color palette
  - **Test app runs**

- [ ] Create `src/shared/constants/typography.ts`
  - Define text styles
  - **Test app runs**

- [ ] Create `src/infrastructure/theme/ThemeProvider.tsx`
  - Light/dark theme support
  - **Test app runs**

**Exit Criteria**: Theme system working, app runs

---

### 4.2: Basic Components (45 min)

**Create reusable components one at a time:**

- [ ] Create `Button.tsx`
  - Primary, secondary variants
  - **Test app runs**, see button on screen

- [ ] Create `Card.tsx`
  - Container component
  - **Test app runs**, see card on screen

- [ ] Create `Input.tsx`
  - Text input with validation
  - **Test app runs**, test typing

- [ ] Create `AmountInput.tsx`
  - Currency input (cents)
  - **Test app runs**, test amount entry

**Exit Criteria**: Components created, visible, interactive

---

### 4.3: Navigation Setup (30 min)

- [ ] Configure Expo Router tabs
- [ ] Create tab structure:
  - Home (Dashboard)
  - Transactions
  - Budget
  - More
- [ ] Add tab icons
- [ ] **Test app runs**, navigate between tabs

**Exit Criteria**: Navigation works, app runs

---

## Phase 5: MVP Features (Core Functionality)

### 5.1: Authentication Flow (1 hour)

- [ ] Create Login screen
- [ ] Create Signup screen
- [ ] Implement Firebase Auth
- [ ] Test sign up
- [ ] Test sign in
- [ ] Test sign out
- [ ] **Test app runs**, full auth flow works

**Exit Criteria**: Can create account, sign in/out

---

### 5.2: Household Setup (1 hour)

- [ ] Create Household creation screen
- [ ] Create Household selection screen
- [ ] Save household to Firestore
- [ ] Test creating household
- [ ] **Test app runs**, can create and select household

**Exit Criteria**: User can create/select household

---

### 5.3: Baby Steps Tracker (1.5 hours)

- [ ] Create Baby Steps display component
- [ ] Show current step (1-7)
- [ ] Show progress bar
- [ ] Create step selection screen
- [ ] Save to household
- [ ] **Test app runs**, Baby Steps visible

**Exit Criteria**: Baby Steps tracker functional

---

### 5.4: Account Management (2 hours)

- [ ] Create Account List screen
- [ ] Create Add Account screen
- [ ] Create Edit Account screen
- [ ] Implement save/update to Firestore
- [ ] Test adding account
- [ ] Test editing account
- [ ] **Test app runs**, accounts work

**Exit Criteria**: Can add/edit/view accounts

---

### 5.5: Monthly Budget Creation (3 hours)

**This is complex - break into sub-tasks:**

- [ ] Create Budget screen skeleton
- [ ] **Test app runs**

- [ ] Add income section
  - Input for planned income
  - **Test app runs**, can enter income

- [ ] Add expense categories section
  - List of categories
  - **Test app runs**, see categories

- [ ] Add category amounts
  - Input per category
  - **Test app runs**, can enter amounts

- [ ] Calculate zero-based status
  - Income - Expenses calculation
  - Show difference
  - **Test app runs**, see calculation

- [ ] Save budget to Firestore
  - **Test app runs**, budget persists

- [ ] Copy previous month feature
  - **Test app runs**, can copy budget

**Exit Criteria**: Can create monthly budget

---

### 5.6: Transaction Entry (3 hours)

**Most used feature - make it great:**

- [ ] Create Transaction List screen
  - Show recent transactions
  - **Test app runs**, see list

- [ ] Create Add Transaction screen
  - Amount input
  - Date picker
  - Account selector
  - **Test app runs**, can enter transaction

- [ ] Add category allocation
  - Select category
  - Split transaction (optional)
  - **Test app runs**, can allocate

- [ ] Save transaction to Firestore
  - Generate UUID
  - **Test app runs**, transaction saves

- [ ] Update category actual amounts
  - **Test app runs**, category updates

- [ ] Test offline transaction
  - Turn off WiFi
  - Add transaction
  - Turn on WiFi
  - Verify syncs
  - **Test app runs offline & online**

**Exit Criteria**: Can add transactions offline/online

---

### 5.7: Category Tracking (Envelopes) (2 hours)

- [ ] Create Category List screen
- [ ] Show planned vs actual per category
- [ ] Show progress bar
- [ ] Color code (good/warning/overspent)
- [ ] **Test app runs**, categories update live

**Exit Criteria**: Can track category spending

---

### 5.8: Debt Snowball (3 hours)

- [ ] Create Debt List screen
- [ ] Create Add Debt screen
- [ ] Implement Debt Snowball ordering
  - Sort by balance (smallest first)
  - Mark focus debt
  - **Test app runs**, see snowball order

- [ ] Show payoff projection
- [ ] Mark debt as paid off
  - Celebration animation
  - Roll to next debt
  - **Test app runs**, snowball works

**Exit Criteria**: Debt snowball functional

---

### 5.9: Dashboard/Home Screen (2 hours)

- [ ] Create Dashboard screen
- [ ] Show current Baby Step
- [ ] Show current month budget status
- [ ] Show recent transactions
- [ ] Show debt progress (if in Step 2)
- [ ] **Test app runs**, dashboard shows data

**Exit Criteria**: Dashboard summarizes financial status

---

## Phase 6: Polish & Testing

### 6.1: Business Expense Tracking (3 hours)

- [ ] Add "Business Expense" toggle to transaction
- [ ] Add reimbursement fields
- [ ] Create Claims screen
- [ ] Create claim workflow
- [ ] **Test app runs**, reimbursements work

---

### 6.2: Receipt Photos (2 hours)

- [ ] Integrate expo-image-picker
- [ ] Add photo to transaction
- [ ] Upload to Firebase Storage
- [ ] Display receipt in transaction detail
- [ ] **Test app runs**, photos work

---

### 6.3: Sinking Funds (2 hours)

- [ ] Create Goals screen
- [ ] Add sinking fund categories
- [ ] Track progress toward goals
- [ ] **Test app runs**, sinking funds work

---

### 6.4: Reports & Analytics (3 hours)

- [ ] Create Reports screen
- [ ] Spending by category chart
- [ ] Income vs expenses chart
- [ ] Debt payoff projection
- [ ] **Test app runs**, reports display

---

### 6.5: Onboarding Flow (2 hours)

- [ ] Create welcome screen
- [ ] Create Baby Step selector
- [ ] Create initial budget wizard
- [ ] **Test app runs**, onboarding smooth

---

### 6.6: Error Handling & Edge Cases (4 hours)

- [ ] Handle offline errors gracefully
- [ ] Handle sync conflicts
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error messages
- [ ] **Test app runs**, no crashes

---

### 6.7: Testing (8 hours)

- [ ] Write unit tests for use cases
- [ ] Write integration tests for repositories
- [ ] Write E2E tests for critical flows
- [ ] Test offline scenarios extensively
- [ ] **All tests pass**

---

### 6.8: Performance Optimization (4 hours)

- [ ] Optimize Firestore queries
- [ ] Add pagination
- [ ] Optimize images
- [ ] Reduce app size
- [ ] **Test app runs smoothly**

---

### 6.9: Production Build (2 hours)

- [ ] Test release APK
- [ ] Test iOS build
- [ ] Verify Firebase production config
- [ ] **Builds successfully**

---

## 🎯 Testing Checkpoints

**After every section above**:
```powershell
cd C:\Project\Accounting\src
npm run android
```

**Verify**:
- [ ] App opens
- [ ] No crash
- [ ] New feature visible (if UI)
- [ ] New feature works (test it!)
- [ ] No console errors

---

## 📝 Notes

### When to Test
- ✅ After adding dependencies
- ✅ After creating folders
- ✅ After adding entities
- ✅ After adding components
- ✅ After adding screens
- ✅ After Firebase changes
- ✅ Basically: **AFTER EVERYTHING**

### If App Breaks
1. Don't panic
2. Check Metro bundler errors
3. Check console errors
4. Undo last change
5. Test again
6. Add back incrementally

### Commit Frequency
- Commit after each completed phase
- Commit message: `feat: complete Phase X.Y - description`
- Example: `feat: complete Phase 2.1 - core entities`

### Time Estimates
- **Phase 0**: ✅ Complete (2 hours)
- **Phase 1**: ~1 hour
- **Phase 2**: ~1.5 hours
- **Phase 3**: ~2 hours
- **Phase 4**: ~2 hours
- **Phase 5**: ~20 hours (most complex)
- **Phase 6**: ~30 hours (polish & testing)

**Total**: ~58 hours (MVP)

---

## 🚀 Current Status

**You are here**: Phase 1.1 (Verify Current Setup)

**Next step**: 
```powershell
cd C:\Project\Accounting\src
npm run android
```

Does it work? ✅ → Move to Phase 1.2  
Does it break? ❌ → Fix it first

---

**Remember**: One bite at a time. Test frequently. Keep the app running. 🐘

