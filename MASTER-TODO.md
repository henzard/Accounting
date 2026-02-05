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
- [x] **Test app runs**, photos work

**Exit Criteria**: Can attach and view receipt photos on transactions ✅ VERIFIED  
**Status**: COMPLETE

**What was built:**
- `expo-image-picker` package installed
- `receipt-upload.ts` utility for image selection, camera capture, and Firebase Storage upload
- Receipt photo capture/selection UI in transaction add screen
- Receipt display with thumbnail grid and full-screen modal in transaction detail screen
- `receipt_urls` field added to Transaction entity
- Firestore repository updated to handle receipt URLs
- Multiple receipt support (can add multiple photos per transaction)

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

**You are here**: Phase 6.3 - Sinking Funds

**What's Complete**:
- ✅ Phase 0-5: All infrastructure, domain, data, Firebase, theme, components, navigation, MVP features
- ✅ Phase 5.1-5.9: Authentication, Households, Baby Steps, Accounts, Budgets, Transactions, Category Tracking, Debt Snowball, Dashboard
- ✅ Phase 6.0-6.2: Household Management, Business Expense Tracking, Receipt Photos
- ✅ UI component library with premium design standards
- ✅ Firebase tested and working (offline + online)
- ✅ Multi-currency support
- ✅ Theme system (light/dark mode)
- ✅ Household switcher and theme toggle on all screens
- ✅ Receipt photo capture and storage

**Next step**: Phase 6.3 - Sinking Funds (create Goals screen, track progress toward goals)

**To verify app works**:
```powershell
cd C:\Project\Accounting\src
npm run android
```

---

**Remember**: MVP features are complete! Now polishing and adding production-ready features. 📸

