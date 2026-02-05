# Master TODO: Dave Ramsey Budgeting App

**Philosophy**: Eating an elephant - one bite at a time  
**Strategy**: Build → Test → Run → Verify → Next  
**Rule**: Run `npm run android` frequently to ensure nothing breaks

---

## 🎯 Progress Overview

- **Phase 0**: Project Setup ✅ (Complete)
- **Phase 1**: Foundation & Infrastructure ✅ (Complete)
- **Phase 2**: Domain Layer (Business Logic) ✅ (Complete)
- **Phase 3**: Data Layer (Firebase Integration) ✅ (Complete)
- **Phase 4**: Presentation Layer (Basic UI) ✅ (Complete)
- **Phase 5**: MVP Features (Core Functionality) ✅ (Complete - All sub-phases 5.1-5.9)
- **Phase 6**: Polish & Production Ready 🔄 (Current - Phase 6.2)

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

## Phase 1: Foundation & Infrastructure ✅ COMPLETE

All sub-phases (1.1-1.5) completed. Clean Architecture folders created, TypeScript paths configured, dependencies installed, Firebase configured.

### 1.1: Verify Current Setup (5 min) ✅ COMPLETE

- [x] **Test app runs**
  ```powershell
  cd C:\Project\Accounting\src
  npm run android
  ```
- [x] Verify emulator opens
- [x] Verify default Expo app displays
- [x] Press 'r' to reload - works?
- [x] Metro bundler running - no errors?

**Exit Criteria**: App runs, no errors ✅ VERIFIED  
**Status**: COMPLETE

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

## Phase 2: Domain Layer (Business Logic) ✅ COMPLETE

All entities created (User, Household, Account, Transaction, Budget, BudgetCategory, Debt).  
All repository interfaces defined.  
Core use cases implemented (CreateTransaction, GetCurrentBudget, ValidateZeroBasedBudget, CreateBudget, GetDebtSnowball).

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

## Phase 3: Data Layer (Firebase Integration) ✅ COMPLETE

All Firebase services initialized (Firestore, Auth, Storage).  
All Firestore repositories implemented (User, Household, Account, Transaction, Budget, Debt).  
Firebase connection tested and verified working offline and online.

**Status**: ✅ Complete  
**Next**: Phase 4

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

### 3.4: Test Firebase Connection (15 min) ✅ COMPLETE

- [x] Create test screen to write/read Firestore
- [x] Write a test document
- [x] Read it back
- [x] Verify offline persistence works
- [x] **Test app runs and connects to Firebase**

**Test Instructions**:
1. Open app on emulator ✅
2. Navigate to "Firebase Test" link from home screen ✅
3. Press "Test Write" - should succeed ✅
4. Press "Test Read" - should show documents ✅
5. Turn off WiFi, press "Test Write" - should queue ✅
6. Turn on WiFi - should sync automatically ✅

**Exit Criteria**: Firebase read/write works, offline works ✅ VERIFIED  
**Status**: COMPLETE

---

## Phase 4: Presentation Layer (Basic UI) ✅ COMPLETE

Theme system complete with Homebase branding. Core UI components built (Button, Card, Input, AmountInput). Navigation implemented with 4 tabs (Home, Transactions, Budget, More).

**Status**: ✅ Complete  
**Next**: Phase 5

### 4.1: Theme Setup (20 min) ✅ COMPLETE

- [x] Create `src/shared/constants/colors.ts`
  - Define color palette (Homebase brand colors)
  - **Test app runs** ✅

- [x] Create `src/shared/constants/typography.ts`
  - Define text styles
  - **Test app runs** ✅

- [x] Create `src/shared/constants/spacing.ts`
  - Define spacing, borders, shadows
  - **Test app runs** ✅

- [x] Create `src/infrastructure/theme/ThemeProvider.tsx`
  - Light/dark theme support
  - **Test app runs** ✅

**Exit Criteria**: Theme system working, app runs ✅ VERIFIED  
**Status**: COMPLETE

---

### 4.2: Basic Components (45 min) ✅ COMPLETE

**Create reusable components one at a time:**

- [x] Create `Button.tsx`
  - Primary, secondary, outline, ghost variants
  - Small, medium, large sizes
  - Loading and disabled states
  - **Test app runs** ✅

- [x] Create `Card.tsx`
  - Default, elevated, outlined variants
  - Configurable padding
  - **Test app runs** ✅

- [x] Create `Input.tsx`
  - Text input with validation
  - Label, error, helper text
  - Left/right icon support
  - Focus states
  - **Test app runs** ✅

- [x] Create `AmountInput.tsx`
  - Currency input (cents)
  - Auto-formatting
  - formatCurrency helper
  - **Test app runs** ✅

- [x] Create component demo screen
  - Showcase all components
  - Test interactions
  - **Test app runs** ✅

**Exit Criteria**: Components created, visible, interactive ✅ VERIFIED  
**Status**: COMPLETE

---

### 4.3: Navigation Setup (30 min) ✅ COMPLETE

- [x] Configure Expo Router tabs
- [x] Create tab structure:
  - Home (Dashboard with Baby Steps)
  - Transactions (with mock data)
  - Budget (zero-based layout)
  - More
- [x] Add tab icons with Homebase theme
- [x] **Test app runs**, navigate between tabs ✅

**Exit Criteria**: Navigation works, app runs ✅ VERIFIED  
**Status**: COMPLETE

---

## Phase 5: MVP Features (Core Functionality) ✅ COMPLETE

Building core features: authentication, household management, transactions, budgets, and debt tracking.

**Status**: ✅ All MVP features complete (5.1-5.9)  
**Next**: Phase 6 - Polish & Production Ready

### 5.1: Authentication Flow (1 hour) ✅ COMPLETE

- [x] Create Login screen
- [x] Create Signup screen
- [x] Implement Firebase Auth
- [x] Test sign up
- [x] Test sign in
- [x] Test sign out
- [x] **Test app runs**, full auth flow works

**Exit Criteria**: Can create account, sign in/out ✅ VERIFIED  
**Status**: COMPLETE

**What was built**:
- `AuthContext.tsx` - Authentication state management with Firebase Auth
- `login.tsx` - Login screen with email/password validation
- `signup.tsx` - Signup screen with name, email, password, confirm password
- Auth guard in tabs layout - redirects to login if not authenticated
- Sign out button on home screen
- User welcome message displaying name and email

---

### 5.2: Household Setup (1 hour) ✅ COMPLETE

- [x] Create Household creation screen
- [x] Create Household selection screen
- [x] Save household to Firestore
- [x] Test creating household
- [x] **Test app runs**, can create and select household

**Exit Criteria**: User can create/select household ✅ VERIFIED  
**Status**: COMPLETE

**What was built**:
- `household/create.tsx` - Household creation screen with name input
- `household/select.tsx` - Household selection screen for multi-household users
- Household guard in tabs layout - redirects to household setup if no household
- Updated signup flow - directs to household creation after account creation
- Creates household with default baby step 1
- Updates user with household_ids and default_household_id

---

### 5.3: Baby Steps Tracker (1.5 hours) ✅ COMPLETE

- [x] Create Baby Steps display component
- [x] Show current step (1-7)
- [x] Show progress bar
- [x] Create step selection screen
- [x] Save to household
- [x] **Test app runs**, Baby Steps visible

**Exit Criteria**: Baby Steps tracker functional ✅ VERIFIED  
**Status**: COMPLETE

**What was built**:
- `shared/constants/baby-steps.ts` - All 7 Dave Ramsey Baby Steps with descriptions
- `BabyStepsDisplay.tsx` - Component showing current step with progress bar
- `baby-steps/select.tsx` - Screen to select/change current baby step
- Home screen integration - Loads current step from household Firestore doc
- Tappable card navigates to step selection

---

### 5.4: Account Management (2 hours) ✅ COMPLETE

- [x] Create Account List screen
- [x] Create Add Account screen
- [x] Create Edit Account screen
- [x] Implement save/update to Firestore
- [x] Test adding account
- [x] Test editing account
- [x] **Test app runs**, accounts work

**Exit Criteria**: Can add/edit/view accounts ✅ VERIFIED  
**Status**: COMPLETE

**What was built**:
- `accounts/index.tsx` - Account list screen with total balance summary
- `accounts/add.tsx` - Add new account (6 types: Bank, Savings, Credit Card, Cash, Loan, Investment)
- `accounts/edit.tsx` - Edit existing account with archive functionality
- Fixed Account entity to include `household_id` field
- Implemented `getActiveAccounts` in FirestoreAccountRepository
- Added account type icons (🏦💰💳💵🏠📈)
- Include in budget toggle
- Active/inactive status toggle
- Linked from home screen "Manage Your Accounts"
- **Currency formatting integration** - All account screens now respect household currency
- Fixed currency display bug where accounts showed $ even when household was set to ZAR
- All balances now display in correct currency symbol (R, $, €, etc.)

---

### 5.4.5: Navigation & Menu Structure (2 hours) ✅ COMPLETE

- [x] Create reusable ScreenHeader component
- [x] Update all existing screens to use consistent headers
- [x] Replace Explore tab with proper More/Settings screen
- [x] Add navigation to key features from More tab
- [x] Test all navigation flows
- [x] **Test app runs**, navigation works perfectly

**Exit Criteria**: Consistent navigation across all screens ✅ VERIFIED  
**Status**: COMPLETE

**What was built**:
- `ScreenHeader.tsx` - Reusable header component with back button, title, and optional right action
- Updated `accounts/index.tsx` - Now uses ScreenHeader with "+" button
- Updated `baby-steps/select.tsx` - Now uses ScreenHeader
- Replaced `explore.tsx` - New More/Settings screen with:
  - User info card (avatar with initial, name, email)
  - Financial section (Accounts, Baby Steps navigation)
  - Settings section (Household, Currency/Timezone display)
  - About section (App version)
  - Sign out button with confirmation
- Consistent header styling: 60px top padding for status bar, border bottom, back button with chevron
- Professional UX: All screens now have proper back navigation

**Why This Mattered**:
- Fixed before building 5+ more screens that would need navigation
- Prevents future refactoring of every screen
- Makes app feel professional and polished
- Users can now navigate naturally throughout the app

---

### 5.5: Monthly Budget Creation (3 hours) ✅ COMPLETE

**This is complex - break into sub-tasks:**

- [x] Create Budget screen skeleton
- [x] **Test app runs** ✅

- [x] Add income section
  - Input for planned income
  - **Test app runs**, can enter income ✅

- [x] Add expense categories section
  - List of categories
  - **Test app runs**, see categories ✅

- [x] Add category amounts
  - Input per category
  - **Test app runs**, can enter amounts ✅

- [x] Calculate zero-based status
  - Income - Expenses calculation
  - Show difference
  - **Test app runs**, see calculation ✅

- [x] Save budget to Firestore
  - **Test app runs**, budget persists ✅

- [ ] Copy previous month feature (DEFERRED to Phase 5.5.5)
  - **Test app runs**, can copy budget

**Exit Criteria**: Can create monthly budget ✅ VERIFIED  
**Status**: COMPLETE (with known limitations - see ADR 005)

**What was built**:
- **Budget Entity** (Budget.ts): Monthly budget with planned_income, categories, helpers
- **BudgetCategory**: Individual line items with planned/actual amounts
- **10 CategoryGroups**: INCOME, GIVING, SAVING, HOUSING, TRANSPORTATION, FOOD, PERSONAL, INSURANCE, DEBT, LIFESTYLE
- **20+ Default Categories** (budget-categories.ts): Dave Ramsey recommended categories
- **FirestoreBudgetRepository**: Full CRUD + getBudgetByMonth, copyBudgetToNextMonth
- **Budget Screen** (budget/index.tsx):
  - Zero-based budget status indicator (green = complete, yellow = incomplete)
  - Income section with currency-aware amount input
  - Category list with individual amount inputs
  - Real-time remaining-to-budget calculation
  - Auto-creates budget with default categories
  - Saves to Firestore
  - Month/year display (CURRENT MONTH ONLY - no navigation yet)
  - Navigation from home screen
- **Helper Functions**: calculateTotalExpenses, isZeroBasedBudget, getBudgetMonthName

**Known Limitations** (see ADR 005):
- ❌ No month/year selector (stuck on current month)
- ❌ No category management (hardcoded Dave Ramsey categories)
- ❌ Calendar month only (no pay period support)
- ❌ No actual tracking (planned amounts only)
- ⚠️ These MUST be fixed before production use

---

### 5.5.1: Month Navigation (1 hour) ✅ COMPLETE

**Why This Matters**: Users need to view past budgets and plan future months!

- [x] Add month/year selector component
- [x] Previous/Next month buttons
- [x] Load budget for selected month
- [x] Create budget if doesn't exist for selected month
- [x] Update header to show selected month
- [x] **Test app runs**, can navigate months ✅

**Exit Criteria**: Can view any month's budget ✅ VERIFIED

**What was built:**
- `selectedMonth` and `selectedYear` state management
- `goToPreviousMonth`, `goToNextMonth`, `goToCurrentMonth` functions
- Month navigation UI (< Dec 2025 > with "Today" badge)
- Dynamic budget loading based on selected month
- Auto-creates budget for new months with custom categories

---

### 5.5.2: Category Management (2 hours) ✅ COMPLETE

**Why This Matters**: Users need custom categories beyond Dave Ramsey defaults!

- [x] Create "Manage Categories" screen
- [x] Link from budget screen (gear icon or menu)
- [x] List all categories grouped by CategoryGroup
- [x] Add new category (name, group, icon, sort_order)
- [x] Edit existing category
- [x] Delete category (with warning if has transactions)
- [x] Save to Firestore `master_categories` collection
- [x] Load custom categories on budget screen
- [x] Fall back to DEFAULT_BUDGET_CATEGORIES if none exist
- [x] **Test app runs**, can customize categories ✅

**Exit Criteria**: Can add/edit/delete budget categories ✅ VERIFIED

**What was built:**
- Full category CRUD (Create, Read, Update, Delete)
- Reset to Dave Ramsey defaults
- Load defaults as editable categories
- 7 UX patterns applied (search, collapsible, icons, empty states, counts, usage indicators, bulk delete)
- **Became reference implementation for all future list screens**

---

### 5.5.2.5: UX Standardization (3 hours) ✅ COMPLETE **BONUS**

**Why This Matters**: Establish consistent, professional UX patterns across entire app!

- [x] Document UX patterns (`docs/design/ux-patterns.md`)
- [x] Create AI rules for UX (`.cursor/rules/34-ux-standards.mdc`)
- [x] Update PROMPT-GUIDE with UX standards
- [x] Apply 7 UX patterns to category management
- [x] Apply 5 UX patterns to budget screen
- [x] **Test app runs**, both screens follow standards ✅

**The 7 Standard Patterns:**
1. Search/Filter Bar (real-time filtering)
2. Collapsible Groups (reduce scrolling)
3. Icon Buttons (visual > text)
4. Empty States (helpful guidance)
5. Count Badges (quick overview)
6. Status Indicators (show states)
7. Bulk Selection Mode (efficient actions)

**Exit Criteria**: UX patterns documented and applied ✅ VERIFIED

**Impact:**
- Category management: 350+ lines of UX improvements
- Budget screen: 189 lines of UX improvements
- All future screens will automatically follow these patterns
- Professional, consistent user experience established

---

### 5.5.3: Pay Period Support (1.5 hours) ✅ COMPLETE **HIGH PRIORITY**

**Why This Matters**: Many users paid mid-month (15th, 20th) need custom budget periods!

- [x] Add `budget_period_start_day` to Household entity (1-31, default: 1)
- [x] Create Household Settings screen
- [x] Add "Budget starts on day ___" input
- [x] Update Budget entity: add period_start, period_end Timestamps
- [x] Calculate period based on start day:
  - If start_day = 20 and month = Dec 2025 → period_start = Dec 20, 2025, period_end = Jan 19, 2026
- [x] Update getBudgetByMonth to use period overlap logic
- [x] **Test app runs**, custom pay periods work ✅

**Exit Criteria**: Budget can use custom pay period (e.g., 20th-19th) ✅ VERIFIED

**What was built:**
- Household entity: Added `budget_period_start_day` field (1-31)
- Household Settings screen (300+ lines):
  - SearchableSelect with 31 day options
  - Preview box showing actual period dates
  - Example dates for clarity (e.g., "Dec 20 → Jan 19")
  - Special labels for common choices (1st, 15th, 20th)
- Budget entity: Added `period_start` and `period_end` Date fields
- Helper function: `calculateBudgetPeriod(month, year, startDay)`
  - Calendar month (day 1): Jan 1 - Jan 31
  - Mid-month (day 15): Jan 15 - Feb 14
  - Custom (day 20): Jan 20 - Feb 19
- Budget loading logic: Loads household's start day, calculates periods
- Firestore repository: Saves/loads period dates as Timestamps
- Backwards compatible: Defaults to calendar month if not set

**Impact:**
- Users can now align budgets with paycheck schedules
- No more awkward budget splits when paid mid-month
- Budget periods automatically calculated based on setting
- Existing budgets continue to work (default to calendar month)

---

### 5.6: Transaction Entry (3 hours) ✅ COMPLETE

**Most used feature - make it great:**

- [x] Create Transaction List screen
  - Show recent transactions
  - **Test app runs**, see list ✅

- [x] Create Add Transaction screen
  - Amount input
  - Date picker
  - Account selector
  - **Test app runs**, can enter transaction ✅

- [x] Add category allocation
  - Select category
  - Split transaction (optional)
  - **Test app runs**, can allocate ✅

- [x] Save transaction to Firestore
  - Generate UUID
  - **Test app runs**, transaction saves ✅

- [x] Update category actual amounts
  - **Test app runs**, category updates ✅

- [ ] Test offline transaction (USER TESTING REQUIRED)
  - Turn off WiFi
  - Add transaction
  - Turn on WiFi
  - Verify syncs
  - **Test app runs offline & online**

**Exit Criteria**: Can add transactions offline/online ✅ READY FOR USER TESTING

**What was built:**
- **Transaction List Screen** (`transactions.tsx`):
  - Real-time transaction loading from Firestore
  - Date grouping (Today, Yesterday, This Week, This Month, Month Year)
  - Search by payee, notes, amount
  - Pull-to-refresh
  - Empty state with helpful guidance
  - Color-coded amounts (green for income, red for expense)
  - Responsive list with account/category badges
  - Links to transaction detail

- **Add Transaction Screen** (`transactions/add.tsx`):
  - Type selector (Income/Expense toggle)
  - Amount input with household currency
  - Payee input
  - Account selector (SearchableSelect)
  - Category selector (SearchableSelect, filtered by type)
  - Notes textarea
  - Date display (default: today)
  - Form validation (amount > 0, required fields)
  - Saves to Firestore with UUID
  - **Automatically updates budget category actual amounts**
  - Offline-first (queues for sync)

- **Transaction Detail/Edit Screen** (`transactions/[id].tsx`):
  - View mode: shows all transaction details
  - Edit mode: inline editing with same form as Add
  - Delete with confirmation
  - **Smart budget updates**:
    - When editing: adjusts old category, adds to new category
    - When deleting: removes from budget
    - Handles category changes correctly
  - Amount difference calculation
  - Loading states, error handling

- **Bug Fixes**:
  - Added `category_id` field to Transaction entity
  - Fixed FirestoreTransactionRepository import bug (`getFirestoreDb` → `db`)
  - Added `category_id` to Firestore mapping functions

- **Budget Integration**:
  - Transactions automatically update `BudgetCategory.actual_amount`
  - Works for both income and expense
  - Handles category changes (removes from old, adds to new)
  - Handles deletions (removes from budget)
  - Gracefully degrades if no budget exists (doesn't block transaction)

**Features:**
- ✅ Offline-first transaction entry
- ✅ Real-time sync when online
- ✅ Budget category tracking (actual vs planned)
- ✅ Multi-currency support
- ✅ Date grouping in list
- ✅ Search and filter
- ✅ Edit and delete with budget adjustment
- ✅ Empty states
- ✅ Loading and error states
- ✅ Pull-to-refresh

**Known Limitations:**
- ⏰ Date picker not implemented yet (uses today's date)
- 🔀 Split transactions not implemented (one category per transaction)
- 📷 Receipt attachment not implemented
- 🔄 Transfer between accounts not implemented

**Next**: User should test offline functionality (Phase 5.6 task 6)

---

### 5.7: Category Tracking (Envelopes) (2 hours) ✅ COMPLETE

- [x] Create Category List screen
- [x] Show planned vs actual per category
- [x] Show progress bar
- [x] Color code (good/warning/overspent)
- [x] **Test app runs**, categories update live

**Exit Criteria**: Can track category spending ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- `budget/categories.tsx` - Category tracking screen with planned vs actual amounts
- Progress bars for each category
- Color coding (green = good, yellow = warning, red = overspent)
- Collapsible category groups
- Search functionality
- Navigation from budget screen

---

### 5.8: Debt Snowball (3 hours) ✅ COMPLETE

- [x] Create Debt List screen
- [x] Create Add Debt screen
- [x] Implement Debt Snowball ordering
  - Sort by balance (smallest first)
  - Mark focus debt
  - **Test app runs**, see snowball order ✅

- [x] Show payoff projection
- [x] Mark debt as paid off
  - Celebration animation
  - Roll to next debt
  - **Test app runs**, snowball works ✅

**Exit Criteria**: Debt snowball functional ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- `debts/index.tsx` - Debt list screen with snowball ordering
- `debts/add.tsx` - Add debt screen with all fields
- Snowball calculation logic (smallest balance first)
- Focus debt highlighting
- Payoff projections
- Mark as paid off functionality
- Navigation from More/Settings tab

---

### 5.9: Dashboard/Home Screen (2 hours) ✅ COMPLETE

- [x] Create Dashboard screen
- [x] Show current Baby Step
- [x] Show current month budget status
- [x] Show recent transactions
- [x] Show debt progress (if in Step 2)
- [x] **Test app runs**, dashboard shows data ✅

**Exit Criteria**: Dashboard summarizes financial status ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- Transformed home screen into financial dashboard
- Baby Steps progress display
- Current month budget summary (planned income, expenses, remaining)
- Recent transactions (last 5)
- Debt snowball progress (if in Baby Step 2)
- Quick actions (Add Transaction, View Budget)
- Household switcher and theme toggle in header
- Pull-to-refresh functionality

---

## Phase 6: Polish & Testing 🔄 IN PROGRESS

### 6.0: Household Management (2 hours) ✅ COMPLETE

- [x] Add "Manage Households" to More/Settings tab
- [x] Create household management screen
  - List all user's households
  - Show which is default
  - Delete household (with confirmation)
  - Switch default household
  - Edit household name/settings
- [x] Test deleting test households
- [x] **Test app runs**, household management works ✅

**Exit Criteria**: Can view, delete, and manage households ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- `household/manage.tsx` - Full household management screen
- List all households user belongs to (queries by `member_ids`)
- Default household indicator
- Switch default household
- Edit household name
- Delete household (with safety checks)
- Household switcher button in all headers
- Theme toggle button in all headers
- Household members management screen
- Add/remove members functionality

---

### 6.1: Business Expense Tracking (3 hours) ✅ COMPLETE

- [x] Add "Business Expense" toggle to transaction
- [x] Add reimbursement fields
- [x] Create Claims screen
- [x] Create claim workflow
- [x] **Test app runs**, reimbursements work ✅

**Exit Criteria**: Business expense tracking functional ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- `Business` entity - Track multiple businesses/employers
- `ReimbursementClaim` entity - Track reimbursement claims
- `businesses/index.tsx` - List and manage businesses
- `businesses/add.tsx` - Add new business
- `businesses/edit.tsx` - Edit business
- `claims/index.tsx` - List reimbursement claims
- `claims/add.tsx` - Create new claim from business expenses
- `claims/[id].tsx` - View claim details
- Transaction integration - Mark transactions as business expenses
- Business selector in transaction form
- Reimbursement type selector
- Claim creation workflow
- Transaction linking to claims

---

### 6.2: Receipt Photos (2 hours) ✅ COMPLETE

- [x] Integrate expo-image-picker
- [x] Add photo to transaction
- [x] Upload to Firebase Storage
- [x] Display receipt in transaction detail
- [x] Delete receipts from storage when transaction updated/deleted
- [x] Handle CORS errors gracefully
- [x] Support multiple receipts per transaction
- [x] Add thumbnail grid with full-screen modal
- [x] **Test app runs**, photos work

**Exit Criteria**: Can attach and view receipt photos on transactions ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- `expo-image-picker` package installed
- `expo-image` for optimized image display
- `receipt-upload.ts` utility for image selection, camera capture, and Firebase Storage upload
- Receipt photo capture/selection UI in transaction add screen
- Receipt display with thumbnail grid and full-screen modal in transaction detail screen
- Receipt deletion from Firebase Storage on transaction update/delete
- `receipt_urls` field added to Transaction entity (array of strings)
- Firestore repository updated to handle receipt URLs
- Multiple receipt support (can add multiple photos per transaction)
- CORS error handling and documentation
- Security rules documentation for Firebase Storage

**Bug Fixes During This Phase:**
- Fixed `getDoc` missing import in AuthContext
- Fixed auth race condition with retry mechanism and explicit state setting
- Fixed double division in `formatCurrency` (budget and account screens)
- Fixed double padding above headers (ScreenWrapper + ScreenHeader conflict)
- Fixed local build script CMake cache issues

---

### 6.2.5: Recent Bug Fixes & Improvements ✅ COMPLETE **MAINTENANCE**

- [x] Auth flow race conditions
  - User document auto-creation when Firestore doc missing
  - Retry mechanism with delays (600ms, 1200ms)
  - Explicit state setting in signUp to prevent redirect loop
  - Wait loop in signIn for listener completion
- [x] Currency formatting consistency
  - Fixed budget "left to budget" double division
  - Fixed account balance double division
  - Verified all formatCurrency usage across app
- [x] UI spacing issues
  - Fixed double safe area padding (ScreenWrapper + ScreenHeader)
  - Dynamic paddingTop based on device safe area insets
- [x] Budget calculation real-time updates
  - Changed from saved `budget.planned_income` to live `plannedIncomeInCents`
  - Remaining updates as user types, not just on save
- [x] Local build improvements
  - Fixed app.json path and Android directory paths
  - Added CMake cache cleanup (.cxx directory removal)
  - Made clean failures non-blocking with warnings
  - React bundle always rebuilt with latest code
- [x] Firestore query optimization
  - Avoided composite indexes for budget and debt queries
  - In-memory filtering for better performance

**Status**: COMPLETE

### 6.3: Sinking Funds (2-3 hours)

**Why This Matters**: Users need to save for irregular expenses (Christmas, car repairs, vacations)

- [ ] Create `Goal` entity
  - Fields: id, name, target_amount, current_amount, target_date, household_id
  - **Test app runs** ✅
- [ ] Create Goals List screen (`goals/index.tsx`)
  - Show all goals with progress bars
  - Sort by target date
  - **Test app runs** ✅
- [ ] Create Add/Edit Goal screen (`goals/add.tsx`, `goals/edit.tsx`)
  - Name, target amount, target date, linked category
  - **Test app runs** ✅
- [ ] Link goals to budget categories
  - When transaction in category, update linked goal's current_amount
  - **Test app runs** ✅
- [ ] Goal progress visualization
  - Progress bars with percentages
  - Days remaining indicator
  - On track / behind / ahead status
  - **Test app runs** ✅
- [ ] Navigation from More/Settings tab
  - **Test app runs** ✅

**Exit Criteria**: Can create goals, track progress, link to categories

---

### 6.4: Reports & Analytics (4-5 hours)

**Why This Matters**: Users need visual insights into spending patterns

- [ ] Research charting library
  - Options: `react-native-chart-kit`, `victory-native`, `react-native-svg-charts`
  - Choose based on bundle size and features
  - Install chosen library
  - **Test app runs** ✅
- [ ] Create Reports screen (`reports/index.tsx`)
  - Tab navigation (Spending, Income, Debt, Trends)
  - Month/date range selector
  - **Test app runs** ✅
- [ ] Spending by category chart
  - Pie chart or bar chart
  - Filter by date range
  - Tap to drill down
  - **Test app runs** ✅
- [ ] Income vs expenses chart
  - Line chart over time
  - Show trend lines
  - Highlight overspending months
  - **Test app runs** ✅
- [ ] Debt payoff projection
  - Based on current snowball payments
  - Show debt-free date
  - Graph remaining balance over time
  - **Test app runs** ✅
- [ ] Spending trends
  - Compare current month to previous
  - Year-over-year comparison
  - Category trend analysis
  - **Test app runs** ✅
- [ ] Navigation from More/Settings tab
  - **Test app runs** ✅

**Exit Criteria**: Visual charts display financial data accurately

---

### 6.5: Onboarding Flow (3-4 hours)

**Why This Matters**: First impressions matter - guide new users to success

- [ ] Create welcome screens (`onboarding/welcome.tsx`)
  - Swipeable carousel (3-5 screens)
  - Explain app value proposition
  - Homebase branding
  - "Get Started" button
  - **Test app runs** ✅
- [ ] Integrate Baby Step selector into onboarding
  - "Which Baby Step are you on?" screen
  - Visual step cards
  - Brief description per step
  - **Test app runs** ✅
- [ ] Create initial budget wizard (`onboarding/budget-wizard.tsx`)
  - Step 1: Enter monthly income
  - Step 2: Quick category amounts (top 5-7 categories)
  - Step 3: Review and confirm
  - Creates first budget automatically
  - **Test app runs** ✅
- [ ] Add account setup to onboarding
  - "Add your first account" screen
  - Skip option (can add later)
  - **Test app runs** ✅
- [ ] Onboarding completion state
  - Save `has_completed_onboarding` to user doc
  - Only show once per user
  - "Reset onboarding" option in settings (for testing)
  - **Test app runs** ✅
- [ ] Guard in app entry point
  - Check onboarding status after auth
  - Redirect to onboarding if not complete
  - **Test app runs** ✅

**Exit Criteria**: New users guided through setup, understand app basics

---

### 6.6: Error Handling & Edge Cases (5-6 hours)

**Why This Matters**: Production apps must handle errors gracefully

**Partially Complete:**
- ✅ Loading states exist on most screens
- ✅ Empty states exist on list screens
- ✅ Basic error messages exist
- ❌ Need systematic offline error handling
- ❌ Need sync conflict resolution

**Remaining Work:**

- [ ] Audit all screens for consistent error handling
  - Create checklist of all screens
  - Verify loading states
  - Verify empty states
  - Verify error messages
  - **Test app runs** ✅
- [ ] Offline error handling
  - Show "Offline" banner when no connection
  - Queue operations for sync
  - Show sync status indicator
  - Test all CRUD operations offline
  - **Test app runs** ✅
- [ ] Sync conflict resolution
  - Detect conflicts (server version changed)
  - Strategy: Last write wins with warning
  - Optional: Show conflict resolution UI
  - **Test app runs** ✅
- [ ] Form validation consistency
  - Audit all forms
  - Consistent error message styling
  - Field-level validation
  - Form-level validation
  - **Test app runs** ✅
- [ ] Network error recovery
  - Retry failed requests
  - Exponential backoff
  - Max retry limits
  - User notification of failures
  - **Test app runs** ✅
- [ ] Edge case testing
  - Test with 0 accounts
  - Test with 0 transactions
  - Test with 100+ categories
  - Test with 1000+ transactions
  - Test month boundaries (Dec 31 → Jan 1)
  - Test leap years
  - **Test app runs** ✅

**Exit Criteria**: App handles errors gracefully, no crashes in production scenarios

---

### 6.7: Testing (10-12 hours)

**Why This Matters**: Tests prevent regressions and give confidence in changes

**Current State:** No tests exist

- [ ] Setup testing infrastructure
  - Install jest, @testing-library/react-native
  - Configure test setup files
  - Add test scripts to package.json
  - **Test setup works** ✅
- [ ] Unit tests for entities
  - Budget calculations (calculateTotalExpenses, isZeroBasedBudget)
  - Debt snowball ordering
  - Transaction category allocation
  - Currency formatting
  - Date utilities
  - **All entity tests pass** ✅
- [ ] Unit tests for use cases
  - CreateTransactionUseCase
  - GetCurrentBudgetUseCase
  - ValidateZeroBasedBudgetUseCase
  - CreateBudgetUseCase
  - GetDebtSnowballUseCase
  - **All use case tests pass** ✅
- [ ] Integration tests for repositories
  - Mock Firestore
  - Test CRUD operations
  - Test query filtering
  - Test error handling
  - **All repository tests pass** ✅
- [ ] Integration tests for Firebase
  - Use Firebase emulator
  - Test auth flow
  - Test Firestore operations
  - Test Storage operations
  - **All Firebase tests pass** ✅
- [ ] Component tests
  - Test critical UI components
  - Button states
  - Form validation
  - Currency input formatting
  - **All component tests pass** ✅
- [ ] E2E tests for critical flows (optional - use Detox)
  - Login → Create Household → Add Account → Add Transaction
  - Create Budget → Add Category → Allocate Amount → Verify Zero-Based
  - Add Debt → Make Payment → Verify Snowball Order
  - **All E2E tests pass** ✅
- [ ] Offline scenario tests
  - Add transaction offline
  - Edit budget offline
  - Delete account offline
  - Verify sync when online
  - **Offline tests pass** ✅
- [ ] Setup CI/CD testing
  - Run tests on pull requests
  - Block merge if tests fail
  - **CI pipeline configured** ✅

**Exit Criteria**: Critical flows covered by tests, CI pipeline running

**Time Breakdown:**
- Setup: 1 hour
- Entity tests: 2 hours
- Use case tests: 2 hours
- Repository tests: 3 hours
- Component tests: 2 hours
- E2E tests: 2-3 hours (optional)
- Offline tests: 1 hour
- CI setup: 1 hour

---

### 6.8: Performance Optimization (4-5 hours)

**Why This Matters**: App must stay fast with large datasets

**Current State:** No optimization done, no performance testing

- [ ] Profile app with large datasets
  - Create test data (1000+ transactions, 50+ categories, 20+ accounts)
  - Measure render times
  - Identify slow queries
  - Use React DevTools Profiler
  - **Identify bottlenecks** ✅
- [ ] Optimize Firestore queries
  - Add indexes where needed (check console warnings)
  - Use query cursors for pagination
  - Limit initial query results
  - Use `startAfter` for pagination
  - **Queries optimized** ✅
- [ ] Add pagination to transaction list
  - Load 50 transactions at a time
  - "Load more" button or infinite scroll
  - Cache loaded pages
  - **Pagination works** ✅
- [ ] Optimize images
  - Compress receipt photos before upload (< 1MB each)
  - Use thumbnails for list views
  - Lazy load images
  - Use `expo-image` caching
  - **Images optimized** ✅
- [ ] Reduce app bundle size
  - Analyze bundle with `npx react-native-bundle-visualizer`
  - Remove unused dependencies
  - Use Hermes engine (already enabled)
  - Enable ProGuard for Android
  - **Bundle size reduced** ✅
- [ ] Add memoization
  - Memoize expensive calculations
  - Use React.memo for components
  - Use useMemo for derived state
  - Use useCallback for callbacks
  - **Unnecessary re-renders eliminated** ✅
- [ ] Database optimization
  - Add indexes if using SQLite
  - Batch Firestore writes
  - Use transactions for atomic operations
  - **Database optimized** ✅
- [ ] Test with real user data volume
  - 2+ years of transactions
  - 50+ categories
  - 10+ accounts
  - Multiple budgets
  - **Performance acceptable** ✅

**Exit Criteria**: App loads quickly, scrolling smooth, no lag with 1000+ transactions

**Target Performance:**
- Transaction list loads in < 1 second
- Budget screen loads in < 500ms
- Smooth 60 FPS scrolling
- APK size < 30MB

---

### 6.9: Production Build & Deployment (3-4 hours)

**Why This Matters**: Must be production-ready before release

**Partially Complete:**
- ✅ Local APK build script (`local-build.ps1`)
- ✅ EAS build workflow configured (`eas-build.yml`)
- ✅ GitHub release automation (`release.yml`)
- ❌ iOS build not tested
- ❌ Production Firebase config not documented

**Remaining Work:**

- [ ] Production Firebase setup
  - Create separate Firebase project for production
  - Document production API keys (in 1Password or similar)
  - Create `.env.production` file
  - Add production config to `.gitignore`
  - Document setup steps in `docs/guides/deployment.md`
  - **Production Firebase configured** ✅
- [ ] Android release build
  - Test local release APK (`local-build.ps1`)
  - Verify APK size (< 30MB target)
  - Test on multiple devices (physical + emulator)
  - Verify offline functionality
  - Verify Firebase works
  - **Release APK verified** ✅
- [ ] iOS build (if deploying to iOS)
  - Setup Apple Developer account
  - Configure iOS signing
  - Test iOS build with EAS
  - Test on iPhone/iPad
  - **iOS build verified** ✅
- [ ] App store assets
  - Screenshots (6+ per platform)
  - App icon (multiple sizes)
  - Feature graphic
  - Privacy policy
  - Terms of service
  - **Assets ready** ✅
- [ ] Version management
  - Document versioning strategy (semantic versioning)
  - Update version in `app.json`
  - Create changelog
  - Tag releases in git
  - **Version 1.0.0 ready** ✅
- [ ] Beta testing
  - Distribute to beta testers (TestFlight, Firebase App Distribution)
  - Collect feedback
  - Fix critical bugs
  - **Beta testing complete** ✅
- [ ] Production deployment
  - Submit to Google Play Store
  - Submit to Apple App Store (if iOS)
  - Monitor crash reports
  - Monitor user feedback
  - **App published** ✅

**Exit Criteria**: App published to stores, production Firebase working

**Production Checklist:**
- [ ] All sensitive data encrypted
- [ ] API keys secured
- [ ] Firebase security rules reviewed
- [ ] Privacy policy complete
- [ ] Crash reporting enabled (Firebase Crashlytics)
- [ ] Analytics enabled (Firebase Analytics)
- [ ] Update mechanism tested
- [ ] Rollback plan documented

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

## Phase 7: Missing Critical Features 🚧

**Status**: NOT STARTED

These features are essential for a complete budgeting app but are not yet implemented.

### 7.1: Date Picker Component (1-2 hours)

**Why This Matters**: Users need to select dates for transactions, budgets, goals

- [ ] Research date picker libraries
  - Options: `react-native-date-picker`, `@react-native-community/datetimepicker`, `expo-datetime-picker`
  - Choose based on cross-platform support
  - Install chosen library
  - **Test app runs** ✅
- [ ] Create reusable DatePicker component
  - Support iOS and Android native pickers
  - Format date display
  - Validate date ranges
  - **Test app runs** ✅
- [ ] Integrate into transaction forms
  - Replace manual date entry
  - Default to today
  - **Test app runs** ✅
- [ ] Integrate into budget forms
  - Select budget month
  - **Test app runs** ✅
- [ ] Integrate into goal forms
  - Select target date
  - **Test app runs** ✅

**Exit Criteria**: Date selection works across all forms

---

### 7.2: Split Transactions (2-3 hours)

**Why This Matters**: Single transactions often span multiple categories (e.g., shopping at Costco)

- [ ] Update Transaction entity
  - Add `splits` array field
  - Each split: { category_id, amount, memo }
  - Validate: sum of splits = transaction amount
  - **Test app runs** ✅
- [ ] Update TransactionRepository
  - Support split transactions in Firestore
  - Query by parent transaction
  - **Test app runs** ✅
- [ ] Update transaction form UI
  - "Split this transaction" toggle
  - Add/remove split rows
  - Category picker per split
  - Amount input per split
  - Show remaining to allocate
  - **Test app runs** ✅
- [ ] Update transaction list display
  - Show split indicator icon
  - Expand to show splits on tap
  - **Test app runs** ✅
- [ ] Update budget calculations
  - Count split amounts toward categories
  - **Test app runs** ✅
- [ ] Update reports
  - Include splits in category totals
  - **Test app runs** ✅

**Exit Criteria**: Can split transactions across multiple categories

---

### 7.3: Account Transfers (1-2 hours)

**Why This Matters**: Moving money between accounts shouldn't count as income/expense

- [ ] Create Transfer entity
  - id, from_account_id, to_account_id, amount, date, memo, household_id
  - **Test app runs** ✅
- [ ] Create TransferRepository
  - Save as two linked transactions (one in, one out)
  - Mark as transfer type
  - **Test app runs** ✅
- [ ] Create Add Transfer screen (`transfers/add.tsx`)
  - From account picker
  - To account picker
  - Amount input
  - Date picker
  - Memo (optional)
  - **Test app runs** ✅
- [ ] Update transaction list
  - Show transfers with special icon
  - Show "Transfer from X to Y"
  - Don't include in budget calculations
  - **Test app runs** ✅
- [ ] Update account balance calculations
  - Include transfers
  - **Test app runs** ✅
- [ ] Navigation from accounts list
  - "Transfer" button
  - **Test app runs** ✅

**Exit Criteria**: Can transfer money between accounts without affecting budget

---

### 7.4: Recurring Transactions (3-4 hours)

**Why This Matters**: Many transactions repeat monthly (rent, utilities, subscriptions)

- [ ] Create RecurringTransaction entity
  - id, name, amount, category_id, account_id, frequency (monthly, weekly, etc.), start_date, end_date, last_created_date, household_id
  - **Test app runs** ✅
- [ ] Create RecurringTransactionRepository
  - CRUD operations
  - Query by household
  - **Test app runs** ✅
- [ ] Create Recurring Transactions screen (`recurring/index.tsx`)
  - List all recurring transactions
  - Group by frequency
  - Show next occurrence date
  - **Test app runs** ✅
- [ ] Create Add/Edit Recurring screen (`recurring/add.tsx`, `recurring/edit.tsx`)
  - Name, amount, category, account
  - Frequency picker (monthly, weekly, biweekly, yearly)
  - Start date, optional end date
  - **Test app runs** ✅
- [ ] Create background job to generate transactions
  - Check for due recurring transactions on app launch
  - Create actual transactions from recurring rules
  - Update last_created_date
  - Notify user of created transactions
  - **Test app runs** ✅
- [ ] Add "Skip this month" option
  - Don't create transaction for this occurrence
  - **Test app runs** ✅
- [ ] Navigation from More/Settings tab
  - **Test app runs** ✅

**Exit Criteria**: Recurring transactions automatically created

---

### 7.5: Budget Templates (2-3 hours)

**Why This Matters**: Users shouldn't manually recreate budgets every month

- [ ] Create BudgetTemplate entity
  - id, name, category_allocations (array), household_id
  - **Test app runs** ✅
- [ ] Create BudgetTemplateRepository
  - CRUD operations
  - **Test app runs** ✅
- [ ] Add "Save as Template" to budget screen
  - Button in budget header
  - Name the template
  - **Test app runs** ✅
- [ ] Add "Create from Template" option
  - Show template picker when creating new budget
  - Pre-fill categories and amounts
  - Allow editing before saving
  - **Test app runs** ✅
- [ ] Create "Copy Previous Month" feature
  - Quick action to duplicate last month's budget
  - **Test app runs** ✅
- [ ] Template management screen (`templates/index.tsx`)
  - List saved templates
  - Edit/delete templates
  - **Test app runs** ✅
- [ ] Navigation from budget screen or More tab
  - **Test app runs** ✅

**Exit Criteria**: Can save and reuse budget templates

---

### 7.6: Export & Backup Data (2-3 hours)

**Why This Matters**: Users need data portability and backup

- [ ] Create CSV export utility
  - Export transactions
  - Export budgets
  - Export accounts
  - Export debts
  - Format: standard CSV for Excel/Google Sheets
  - **Test app runs** ✅
- [ ] Create JSON export for full backup
  - All user data in single JSON file
  - Include metadata (export date, version)
  - **Test app runs** ✅
- [ ] Add Export screen (`settings/export.tsx`)
  - Choose data type (transactions, budgets, all)
  - Choose format (CSV, JSON)
  - Date range filter
  - Generate file
  - Share via system share sheet
  - **Test app runs** ✅
- [ ] Add import functionality (optional)
  - Import transactions from CSV
  - Map columns to fields
  - Validate and preview
  - **Test app runs** ✅
- [ ] Cloud backup option (future phase)
  - Automatic backup to user's cloud storage
  - Restore from backup
  - **Test app runs** ✅
- [ ] Navigation from More/Settings tab
  - **Test app runs** ✅

**Exit Criteria**: Can export all data to CSV/JSON

---

### 7.7: Search & Filters (2-3 hours)

**Why This Matters**: Finding specific transactions in large datasets

- [ ] Add search bar to transactions list
  - Search by memo/payee
  - Debounce search input
  - **Test app runs** ✅
- [ ] Add filter options
  - Filter by category
  - Filter by account
  - Filter by date range
  - Filter by amount range
  - **Test app runs** ✅
- [ ] Create filter UI
  - Filter sheet/modal
  - Apply multiple filters
  - Show active filter count
  - Clear filters button
  - **Test app runs** ✅
- [ ] Add sort options
  - Sort by date (newest/oldest)
  - Sort by amount (high/low)
  - Sort by payee (A-Z)
  - **Test app runs** ✅
- [ ] Save filter presets (optional)
  - "Last month"
  - "This category"
  - "Large expenses (>$100)"
  - **Test app runs** ✅

**Exit Criteria**: Can search and filter transactions effectively

---

### 7.8: Notifications & Reminders (2-3 hours)

**Why This Matters**: Remind users to budget, pay bills, log transactions

**Partially Complete:**
- ✅ Expo Notifications installed
- ❌ No scheduled notifications implemented

- [ ] Setup push notification permissions
  - Request permission on first launch
  - Handle permission denied state
  - **Test app runs** ✅
- [ ] Budget reminder notifications
  - "Time to create next month's budget" (e.g., 25th of month)
  - User configurable time
  - **Test app runs** ✅
- [ ] Bill due reminders
  - Link to recurring transactions
  - Notify X days before due date
  - **Test app runs** ✅
- [ ] Goal progress notifications
  - "You're 50% to your vacation goal!"
  - Weekly progress updates (optional)
  - **Test app runs** ✅
- [ ] Overspending alerts
  - "You've exceeded your Dining Out budget"
  - Real-time or end-of-day
  - **Test app runs** ✅
- [ ] Create notification settings screen
  - Toggle each notification type
  - Set reminder times
  - **Test app runs** ✅
- [ ] Navigation from More/Settings tab
  - **Test app runs** ✅

**Exit Criteria**: Users receive timely reminders and alerts

---

### 7.9: Multi-Currency Support (3-4 hours)

**Why This Matters**: Some households use multiple currencies

**Partially Complete:**
- ✅ Currency stored in household settings
- ✅ `formatCurrency` utility supports multiple currencies
- ❌ No currency conversion
- ❌ No multi-currency accounts

- [ ] Add currency field to Account entity
  - Allow accounts in different currencies
  - Default to household currency
  - **Test app runs** ✅
- [ ] Currency conversion API
  - Integrate with exchange rate API (e.g., exchangerate-api.io)
  - Cache rates locally (update daily)
  - **Test app runs** ✅
- [ ] Display converted amounts
  - Show account balance in both currencies
  - Show total net worth in household currency
  - **Test app runs** ✅
- [ ] Handle transactions in foreign currency
  - Record original currency and amount
  - Store converted amount
  - Show both in transaction details
  - **Test app runs** ✅
- [ ] Currency picker in account form
  - List of common currencies
  - Search functionality
  - **Test app runs** ✅
- [ ] Reports in household currency
  - Convert all amounts for charts
  - Note: "Converted to USD at X rate"
  - **Test app runs** ✅

**Exit Criteria**: Can manage accounts in multiple currencies

---

### 7.10: Budgeting for Irregular Income (2-3 hours)

**Why This Matters**: Freelancers and commission-based workers have variable income

- [ ] Add income type to budget
  - Toggle: "Regular" vs "Irregular"
  - **Test app runs** ✅
- [ ] Implement holding buffer strategy
  - Create "Income Holding" virtual category
  - All income goes to buffer first
  - Allocate to budget from buffer
  - **Test app runs** ✅
- [ ] Create "Release Income" flow
  - Button to allocate buffer to budget
  - Show available amount in buffer
  - Choose amount to release
  - **Test app runs** ✅
- [ ] Adjust budget calculations
  - Don't count income automatically
  - Only count released amounts
  - **Test app runs** ✅
- [ ] Add guide/tutorial for irregular income
  - Explain the strategy
  - Show in onboarding or help section
  - **Test app runs** ✅

**Exit Criteria**: Can manage budget with irregular income

---

### 7.11: Home Screen Widgets (3-4 hours)

**Why This Matters**: Quick access to add transactions without opening the app

**Technical Note**: React Native widgets are complex and may require native code

- [ ] Research widget solutions
  - Options: `react-native-widget-extension`, custom native modules
  - Evaluate feasibility (iOS vs Android support)
  - **Test app runs** ✅
- [ ] Create "Quick Add Transaction" widget
  - Show input fields on home screen
  - Amount, category, memo
  - Save directly to Firestore
  - **Test app runs** ✅
- [ ] Create "Budget Summary" widget
  - Show remaining to budget
  - Show top 3 categories
  - Tap to open app
  - **Test app runs** ✅
- [ ] Create "Net Worth" widget
  - Show total across all accounts
  - Show trend (up/down)
  - **Test app runs** ✅
- [ ] Widget configuration screen
  - Choose widget type
  - Customize display options
  - **Test app runs** ✅
- [ ] Handle widget updates
  - Update when data changes
  - Background sync
  - **Test app runs** ✅

**Exit Criteria**: Can add transactions from home screen widget

**Note**: Widgets may be deferred to post-MVP due to complexity

---

### 7.12: Biometric Authentication (1-2 hours)

**Why This Matters**: Faster, more secure login

- [ ] Research biometric libraries
  - Options: `expo-local-authentication`, `react-native-biometrics`
  - Check platform support (Face ID, Touch ID, fingerprint)
  - Install chosen library
  - **Test app runs** ✅
- [ ] Add biometric enrollment
  - "Enable Face ID / Touch ID" toggle in settings
  - Check if device supports biometrics
  - Store preference in user settings
  - **Test app runs** ✅
- [ ] Implement biometric login flow
  - Show biometric prompt on app launch
  - Fallback to email/password if biometric fails
  - Skip biometric if not enrolled
  - **Test app runs** ✅
- [ ] Add "Lock app when inactive" option
  - Require biometric after X minutes
  - User configurable timeout
  - **Test app runs** ✅
- [ ] Handle biometric changes
  - Re-prompt enrollment if biometric data changes
  - Disable biometric if device no longer supports it
  - **Test app runs** ✅

**Exit Criteria**: Can log in with Face ID/Touch ID/fingerprint

---

### 7.13: Bulk Transaction Operations (2-3 hours)

**Why This Matters**: Managing many transactions at once

- [ ] Add bulk selection mode to transaction list
  - Checkbox on each transaction
  - "Select all" option
  - Show count of selected
  - **Test app runs** ✅
- [ ] Bulk delete functionality
  - Confirm before deleting
  - Show count to delete
  - Atomic operation (all or nothing)
  - **Test app runs** ✅
- [ ] Bulk categorize
  - Select multiple transactions
  - Change category for all
  - Update budget calculations
  - **Test app runs** ✅
- [ ] Bulk mark as business expense
  - Toggle business flag for all selected
  - **Test app runs** ✅
- [ ] Bulk export
  - Export selected transactions only
  - CSV format
  - **Test app runs** ✅
- [ ] Undo bulk operations
  - Store previous state
  - "Undo" button for 5 seconds
  - **Test app runs** ✅

**Exit Criteria**: Can perform bulk operations on transactions

---

### 7.14: Receipt OCR (Optical Character Recognition) (4-5 hours)

**Why This Matters**: Automatically extract amount, date, merchant from receipts

**Technical Note**: OCR requires cloud API or ML Kit

- [ ] Research OCR solutions
  - Options: Firebase ML Kit, Google Cloud Vision API, AWS Textract, Tesseract.js
  - Compare accuracy vs cost
  - Choose solution
  - **Test app runs** ✅
- [ ] Integrate OCR API
  - Setup API credentials
  - Create OCR service utility
  - Handle API errors
  - **Test app runs** ✅
- [ ] Process receipt photos
  - Extract text from image
  - Parse total amount
  - Parse merchant name
  - Parse date
  - Parse line items (optional)
  - **Test app runs** ✅
- [ ] Pre-fill transaction form
  - When receipt photo added, run OCR
  - Fill amount, payee, date fields
  - Show "Auto-filled from receipt" indicator
  - Allow user to edit/confirm
  - **Test app runs** ✅
- [ ] Handle OCR errors
  - Show manual entry form if OCR fails
  - Let user correct OCR results
  - Log accuracy for improvements
  - **Test app runs** ✅
- [ ] OCR confidence indicator
  - Show confidence level (high/medium/low)
  - Highlight fields that need review
  - **Test app runs** ✅

**Exit Criteria**: Receipt photos automatically pre-fill transaction details

**Cost Considerations:**
- Firebase ML Kit: Free tier available, limited
- Google Cloud Vision: ~$1.50 per 1000 images
- Consider on-device ML for privacy/cost

---

## 🚀 Current Status

**You are here**: Phase 6.3 - Sinking Funds

**What's Complete**:
- ✅ Phase 0-5: All infrastructure, domain, data, Firebase, theme, components, navigation, MVP features
- ✅ Phase 5.1-5.9: Authentication, Households, Baby Steps, Accounts, Budgets, Transactions, Category Tracking, Debt Snowball, Dashboard
- ✅ Phase 6.0-6.2: Household Management, Business Expense Tracking, Receipt Photos (full implementation)
- ✅ Phase 6.2.5: Recent Bug Fixes & Improvements (auth flow, currency formatting, UI spacing, budget calculations, local build, Firestore optimization)
- ✅ UI component library with premium design standards
- ✅ Firebase tested and working (offline + online)
- ✅ Multi-currency support
- ✅ Theme system (light/dark mode)
- ✅ Household switcher and theme toggle on all screens
- ✅ Receipt photo capture and storage

**Next step**: Phase 6.3 - Sinking Funds (create Goals screen, track progress toward goals)

**Remaining Phases**:
- Phase 6.3: Sinking Funds
- Phase 6.4: Reports & Analytics
- Phase 6.5: Onboarding Flow
- Phase 6.6: Error Handling & Edge Cases (partially complete)
- Phase 6.7: Testing (not started)
- Phase 6.8: Performance Optimization (not started)
- Phase 6.9: Production Build & Deployment (partially complete)

**Newly Identified Missing Features** (Phase 7):
- 7.1: Date Picker Component ✅ (you confirmed needed)
- 7.2: Split Transactions ✅ (you confirmed needed)
- 7.3: Account Transfers ✅ (you confirmed needed)
- 7.4: Recurring Transactions ✅ (you confirmed needed)
- 7.5: Budget Templates ✅ (you confirmed needed)
- 7.6: Export & Backup Data ✅ (you confirmed needed)
- 7.7: Search & Filters ✅ (you confirmed needed)
- 7.8: Notifications & Reminders ✅ (you confirmed needed)
- 7.9: Multi-Currency Support (enhanced)
- 7.10: Budgeting for Irregular Income
- 7.11: Home Screen Widgets ✅ (you confirmed needed)
- 7.12: Biometric Authentication ✅ (you confirmed needed)
- 7.13: Bulk Transaction Operations ✅ (you confirmed needed)
- 7.14: Receipt OCR ✅ (you confirmed needed)

**To verify app works**:
```powershell
cd C:\Project\Accounting\src
npm run android
```

---

**Remember**: MVP features are complete! Now polishing and adding production-ready features. The app is functional but needs features like sinking funds, reports, onboarding, and the critical features listed in Phase 7 to be truly complete. 📸

