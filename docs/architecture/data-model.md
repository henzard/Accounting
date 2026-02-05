# Data Model: Firestore Schema

**Database**: Firebase/Firestore (NoSQL)  
**Strategy**: Offline-first with real-time sync  
**ID Strategy**: UUID (client-generated)  
**Last Updated**: December 11, 2024

---

## 🎯 Design Principles

1. **Offline-First**: All IDs are UUIDs generated on client
2. **Denormalization**: Duplicate data for read performance
3. **Subcollections**: Use for one-to-many relationships
4. **Flat Documents**: Avoid deep nesting
5. **Audit Trail**: Track created_at, updated_at, created_by_device

---

## 📊 Collection Structure Overview

```
firestore/
├── users/{userId}
├── households/{householdId}
│   ├── members/{userId} [subcollection]
│   ├── accounts/{accountId} [subcollection]
│   ├── budgets/{budgetId} [subcollection]
│   │   └── categories/{categoryId} [subcollection]
│   ├── transactions/{txId} [subcollection]
│   │   ├── allocations/{allocationId} [subcollection]
│   │   └── receipts/{receiptId} [subcollection]
│   ├── debts/{debtId} [subcollection]
│   ├── goals/{goalId} [subcollection]
│   └── reimbursement_claims/{claimId} [subcollection]
```

---

## 👤 Users Collection

**Path**: `/users/{userId}`  
**Purpose**: User authentication and profile data

```typescript
interface User {
  // Identity
  id: string;                    // UUID (Firebase Auth UID)
  email: string;
  name: string;
  phone?: string;
  
  // Household membership
  household_ids: string[];       // Array of household IDs user belongs to
  default_household_id?: string; // Primary household
  
  // Preferences
  timezone: string;              // e.g., "America/New_York"
  currency: string;              // e.g., "USD"
  locale: string;                // e.g., "en-US"
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  last_login_at?: Timestamp;
}
```

**Indexes**:
- `email` (automatic - unique in Auth)
- `household_ids` (composite with other queries)

---

## 🏠 Households Collection

**Path**: `/households/{householdId}`  
**Purpose**: Shared financial workspace for couples/families

```typescript
interface Household {
  // Identity
  id: string;                    // UUID
  name: string;                  // "Smith Family"
  
  // Membership
  owner_id: string;              // User who created household
  member_ids: string[];          // All members (including owner)
  
  // Settings
  timezone: string;              // Single timezone for all dates
  currency: string;              // Primary currency
  
  // Dave Ramsey Setup
  current_baby_step: number;     // 1-7
  baby_step_started_at?: Timestamp;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;            // User ID
}
```

**Subcollections**:
- `members/` - Member details
- `accounts/` - Bank accounts, cards
- `budgets/` - Monthly budgets
- `transactions/` - All transactions
- `debts/` - Debt tracking
- `goals/` - Savings goals
- `reimbursement_claims/` - Business expense claims

---

## 👥 Household Members Subcollection

**Path**: `/households/{householdId}/members/{userId}`  
**Purpose**: Member-specific settings within household

```typescript
interface HouseholdMember {
  user_id: string;               // References users/{userId}
  role: 'owner' | 'member';
  
  // Denormalized for display
  email: string;
  name: string;
  
  // Permissions (all members have full access for now)
  can_edit: boolean;             // true
  can_view: boolean;             // true
  
  // Metadata
  joined_at: Timestamp;
  invited_by?: string;           // User ID
}
```

---

## 💳 Accounts Subcollection

**Path**: `/households/{householdId}/accounts/{accountId}`  
**Purpose**: Bank accounts, cards, cash

```typescript
type AccountType = 
  | 'BANK'           // Checking account
  | 'SAVINGS'        // Savings account
  | 'CREDIT_CARD'    // Credit card
  | 'CASH'           // Physical cash
  | 'LOAN'           // Loan account
  | 'INVESTMENT';    // Investment account (future)

interface Account {
  // Identity
  id: string;                    // UUID
  name: string;                  // "Chase Checking", "Cash Wallet"
  type: AccountType;
  
  // Balance
  balance: number;               // Current balance (in cents)
  currency: string;              // "USD"
  
  // Settings
  is_in_budget: boolean;         // Include in budget tracking
  is_active: boolean;            // Active vs archived
  
  // Display
  color?: string;                // Hex color for UI
  icon?: string;                 // Icon name
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}
```

**Business Rules**:
- Balance stored in minor units (cents) to avoid floating-point issues
- Credit cards typically have negative balance
- Cash accounts always positive

---

## 📅 Budgets Subcollection

**Path**: `/households/{householdId}/budgets/{budgetId}`  
**Purpose**: Monthly zero-based budgets

```typescript
interface Budget {
  // Identity
  id: string;                    // UUID
  household_id: string;
  
  // Period
  month: number;                 // 1-12
  year: number;                  // 2024
  period_start: Timestamp;       // First day of month (household timezone)
  period_end: Timestamp;         // Last day of month
  
  // Income
  planned_income: number;        // Total planned income (cents)
  actual_income: number;         // Calculated from transactions (cents)
  
  // Expenses
  planned_expenses: number;      // Sum of all category plans (cents)
  actual_expenses: number;       // Calculated from transactions (cents)
  
  // Zero-Based Check
  is_zero_based: boolean;        // planned_income === planned_expenses
  difference: number;            // planned_income - planned_expenses
  
  // Status
  status: 'draft' | 'active' | 'closed';
  closed_at?: Timestamp;
  closed_by?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
  copied_from_budget_id?: string; // If copied from previous month
}
```

**Indexes**:
- Composite: `household_id` + `year` + `month`
- Sort: `period_start DESC`

---

## 📦 Budget Categories Subcollection

**Path**: `/households/{householdId}/budgets/{budgetId}/categories/{categoryId}`  
**Purpose**: Envelope-style budget categories

```typescript
type CategoryType =
  | 'GIVING'         // Charitable giving
  | 'SAVING'         // Savings goals
  | 'HOUSING'        // Rent, mortgage, utilities
  | 'FOOD'           // Groceries, restaurants
  | 'TRANSPORTATION' // Car, gas, insurance
  | 'PERSONAL'       // Clothing, phone, etc.
  | 'LIFESTYLE'      // Entertainment, hobbies
  | 'HEALTH'         // Insurance, medical
  | 'DEBT_PAYMENT'   // Debt payments
  | 'SINKING_FUND';  // Long-term savings

type SpendingType =
  | 'FIXED'          // Same amount every month (rent)
  | 'VARIABLE';      // Changes monthly (groceries)

interface BudgetCategory {
  // Identity
  id: string;                    // UUID
  budget_id: string;
  name: string;                  // "Groceries", "Gas", "Giving"
  
  // Classification
  group: CategoryType;
  type: SpendingType;
  
  // Budget
  planned_amount: number;        // Planned for month (cents)
  actual_amount: number;         // Calculated from allocations (cents)
  available_amount: number;      // planned - actual (cents)
  
  // Envelope Behavior
  is_cash_envelope: boolean;     // Strict envelope mode
  carry_over: boolean;           // Roll unused to next month
  carried_over_amount: number;   // From previous month (cents)
  
  // Sinking Fund
  is_sinking_fund: boolean;
  target_amount?: number;        // Long-term goal (cents)
  target_date?: Timestamp;       // Goal date
  
  // Display
  sort_order: number;
  color?: string;
  icon?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}
```

**Calculations**:
```typescript
available_amount = planned_amount + carried_over_amount - actual_amount
```

---

## 💸 Transactions Subcollection

**Path**: `/households/{householdId}/transactions/{txId}`  
**Purpose**: All financial transactions

```typescript
type TransactionType =
  | 'EXPENSE'        // Money out
  | 'INCOME'         // Money in
  | 'TRANSFER';      // Between accounts

interface Transaction {
  // Identity
  id: string;                    // UUID (offline-friendly)
  household_id: string;
  
  // Transaction Details
  type: TransactionType;
  date: Timestamp;               // When transaction occurred
  amount: number;                // Amount in cents (always positive)
  currency: string;              // "USD"
  
  // Parties
  account_id: string;            // Which account
  payee?: string;                // Who you paid (expenses)
  payer?: string;                // Who paid you (income)
  
  // Transfer (if type === 'TRANSFER')
  to_account_id?: string;        // Transfer destination
  
  // Details
  notes?: string;
  reference?: string;            // Check number, confirmation #
  
  // Status
  status: 'pending' | 'cleared' | 'reconciled';
  reconciled_at?: Timestamp;
  reconciled_by?: string;
  
  // Business Expenses
  is_business: boolean;
  reimbursement_type?: 'NONE' | 'REIMBURSABLE' | 'BUSINESS_OWNED';
  reimbursement_target?: string; // "Employer: ACME"
  reimbursement_claim_id?: string; // Linked claim
  
  // Receipt
  has_receipt: boolean;
  receipt_count: number;
  
  // Late Entry Tracking
  captured_at: Timestamp;        // When entered in app
  capture_delay_days: number;    // date - captured_at
  
  // Sync Debugging
  created_by_device: string;     // Device UUID
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;            // User ID
}
```

**Indexes**:
- Composite: `household_id` + `date DESC`
- Composite: `household_id` + `account_id` + `date DESC`
- Composite: `household_id` + `is_business` + `reimbursement_claim_id`

---

## 🏷️ Transaction Allocations Subcollection

**Path**: `/households/{householdId}/transactions/{txId}/allocations/{allocationId}`  
**Purpose**: Split transactions across multiple categories

```typescript
interface TransactionAllocation {
  // Identity
  id: string;                    // UUID
  transaction_id: string;
  
  // Allocation
  budget_id: string;
  category_id: string;
  amount: number;                // Portion of transaction (cents)
  
  // Denormalized for queries
  category_name: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

**Business Rules**:
- Sum of allocations MUST equal transaction amount
- One transaction can have multiple allocations
- Each allocation links to ONE category

**Example**:
```typescript
// Transaction: $127.50 at grocery store
Transaction: { id: "tx-123", amount: 12750 }
Allocations:
  - { category_id: "cat-groceries", amount: 10000 } // $100
  - { category_id: "cat-household", amount: 2750 }  // $27.50
```

---

## 📸 Transaction Receipts Subcollection

**Path**: `/households/{householdId}/transactions/{txId}/receipts/{receiptId}`  
**Purpose**: Receipt photo management

```typescript
interface TransactionReceipt {
  // Identity
  id: string;                    // UUID
  transaction_id: string;
  
  // Image
  storage_path: string;          // Firebase Storage path
  url?: string;                  // Signed download URL (temporary)
  thumbnail_url?: string;        // Small preview
  
  // Metadata
  file_name: string;
  file_size: number;             // Bytes
  mime_type: string;             // "image/jpeg"
  
  // Upload Status
  upload_status: 'pending' | 'uploading' | 'completed' | 'failed';
  uploaded_at?: Timestamp;
  
  // Metadata
  created_at: Timestamp;
  created_by: string;
}
```

**Storage Structure**:
```
firebase-storage/
└── households/
    └── {householdId}/
        └── receipts/
            └── {receiptId}.jpg
```

---

## 💳 Debts Subcollection

**Path**: `/households/{householdId}/debts/{debtId}`  
**Purpose**: Debt Snowball tracking

```typescript
type DebtType =
  | 'CREDIT_CARD'
  | 'PERSONAL_LOAN'
  | 'STUDENT_LOAN'
  | 'CAR_LOAN'
  | 'MEDICAL'
  | 'MORTGAGE'
  | 'OTHER';

interface Debt {
  // Identity
  id: string;                    // UUID
  household_id: string;
  name: string;                  // "Chase Visa", "Student Loan"
  type: DebtType;
  
  // Linked Account (optional)
  account_id?: string;
  
  // Balance
  original_balance: number;      // Starting balance (cents)
  current_balance: number;       // Current balance (cents)
  
  // Payment
  minimum_payment: number;       // Monthly minimum (cents)
  interest_rate: number;         // Annual percentage (5.5 = 5.5%)
  
  // Snowball
  snowball_order: number;        // Order in payoff (1=first, 2=second...)
  is_focus_debt: boolean;        // Current target for extra payments
  is_mortgage: boolean;          // Exclude from Baby Step 2
  
  // Status
  status: 'active' | 'paid_off';
  paid_off_at?: Timestamp;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}
```

**Business Rules**:
- Snowball order based on balance (smallest first)
- Only one debt can be `is_focus_debt = true` at a time
- Mortgage excluded from Baby Step 2 calculations

---

## 🎯 Goals Subcollection

**Path**: `/households/{householdId}/goals/{goalId}`  
**Purpose**: Savings goals and Baby Step tracking

```typescript
type GoalType =
  | 'STARTER_EMERGENCY_FUND'     // Baby Step 1: $1,000
  | 'FULL_EMERGENCY_FUND'        // Baby Step 3: 3-6 months
  | 'RETIREMENT'                 // Baby Step 4: 15%
  | 'COLLEGE'                    // Baby Step 5
  | 'MORTGAGE_PAYOFF'            // Baby Step 6
  | 'WEALTH_BUILDING'            // Baby Step 7
  | 'SINKING_FUND'               // Custom savings
  | 'CUSTOM';                    // Other

interface Goal {
  // Identity
  id: string;                    // UUID
  household_id: string;
  name: string;
  type: GoalType;
  
  // Target
  target_amount: number;         // Goal amount (cents)
  current_amount: number;        // Current progress (cents)
  target_date?: Timestamp;       // Optional deadline
  
  // Baby Step
  baby_step?: number;            // 1-7 (if related to Baby Step)
  
  // Linked Account
  account_id?: string;           // Where money is saved
  
  // Progress
  progress_percentage: number;   // current / target * 100
  monthly_contribution?: number; // Planned monthly (cents)
  
  // Status
  status: 'active' | 'completed' | 'paused';
  completed_at?: Timestamp;
  
  // Priority
  priority: number;              // Lower = higher priority
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}
```

**Baby Step Goals**:
1. Starter Emergency Fund: $1,000
2. (Debt Snowball - tracked separately)
3. Full Emergency Fund: 3-6 months expenses
4. Retirement: 15% of income
5. College Fund: per child
6. Mortgage Payoff: home balance
7. Wealth Building: no fixed target

---

## 🧾 Reimbursement Claims Subcollection

**Path**: `/households/{householdId}/reimbursement_claims/{claimId}`  
**Purpose**: Business expense reimbursement tracking

```typescript
type ClaimStatus =
  | 'DRAFT'          // Being prepared
  | 'SUBMITTED'      // Sent to employer
  | 'APPROVED'       // Approved by employer
  | 'PAID'           // Reimbursement received
  | 'PARTIALLY_PAID' // Part paid
  | 'REJECTED';      // Denied

interface ReimbursementClaim {
  // Identity
  id: string;                    // UUID
  household_id: string;
  
  // Claim Details
  name: string;                  // "March 2024 ACME Expenses"
  target: string;                // "Employer: ACME Corp"
  period_start: Timestamp;
  period_end: Timestamp;
  
  // Amounts
  total_amount: number;          // Sum of all expenses (cents)
  paid_amount: number;           // Amount received (cents)
  
  // Status
  status: ClaimStatus;
  
  // Linked Transactions
  transaction_ids: string[];     // All included transactions
  paid_transaction_id?: string;  // Income transaction when paid
  
  // Submission
  submitted_at?: Timestamp;
  submitted_by?: string;
  approved_at?: Timestamp;
  paid_at?: Timestamp;
  
  // Notes
  notes?: string;
  rejection_reason?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}
```

**Business Rules**:
- Claim groups multiple business transactions
- Transactions marked with `reimbursement_claim_id`
- When PAID, create income transaction
- Track approval/payment separately

---

## 🔍 Common Queries

### Get Current Month Budget
```typescript
const q = query(
  collection(db, `households/${householdId}/budgets`),
  where('year', '==', currentYear),
  where('month', '==', currentMonth),
  limit(1)
);
```

### Get Recent Transactions
```typescript
const q = query(
  collection(db, `households/${householdId}/transactions`),
  orderBy('date', 'desc'),
  limit(50)
);
```

### Get Debts in Snowball Order
```typescript
const q = query(
  collection(db, `households/${householdId}/debts`),
  where('status', '==', 'active'),
  orderBy('snowball_order', 'asc')
);
```

### Get Unclaimed Business Expenses
```typescript
const q = query(
  collection(db, `households/${householdId}/transactions`),
  where('is_business', '==', true),
  where('reimbursement_type', '==', 'REIMBURSABLE'),
  where('reimbursement_claim_id', '==', null)
);
```

---

## 📐 Data Integrity Rules

### Timestamps
- All timestamps in household timezone
- Store as Firestore Timestamp
- Use `serverTimestamp()` for created_at/updated_at

### Amounts
- Store in minor units (cents) as integers
- Never use floating point for money
- Calculate in cents, display with currency formatter

### UUIDs
- Generate on client: `uuid()` from `uuid` package
- Enables offline-first writes
- Consistent format across all documents

### Denormalization
- Store `category_name` in allocations (for display)
- Store `user_name` in transactions (for audit)
- Acceptable trade-off for read performance

### Soft Deletes
- Never hard delete financial data
- Use `status: 'deleted'` or `is_active: false`
- Maintain audit trail

---

## 🔒 Security Notes

All security rules documented in: `docs/security/firestore-security-rules.md`

Key principles:
- Users can only access households they're members of
- All household members have equal permissions
- No data visible to unauthenticated users
- Validate data types and required fields

---

## 🚀 Migration Strategy

### From SQLite (if needed)
1. Export SQLite to JSON
2. Transform to Firestore structure
3. Batch write to Firestore (500 docs/batch)
4. Verify data integrity
5. Update client to use Firestore

### Schema Evolution
- Add `schema_version` to household
- Handle old versions gracefully
- Migrate on app startup if needed
- Never break offline users

---

**Next**: See `docs/architecture/dave-ramsey-system.md` for business logic details.

