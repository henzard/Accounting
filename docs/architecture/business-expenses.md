# Business Expense Reimbursement System

**Purpose**: Track business expenses paid with personal funds and manage reimbursement claims  
**Users**: Professionals who expense work purchases on personal cards  
**Last Updated**: December 11, 2024

---

## 🎯 Problem Statement

Many professionals face:
1. **Mixed expenses** - Personal and business purchases on same card
2. **Receipt chaos** - Paper receipts lost or disorganized
3. **Delayed reimbursement** - Forgot to submit expenses
4. **Cash flow impact** - Personal money tied up in business expenses
5. **Budget confusion** - Business spending looks like overspending

---

## 💡 Solution Overview

### Core Features
1. **Tag transactions** as business expenses at time of entry
2. **Attach receipt photos** immediately
3. **Group into claims** at end of period
4. **Track claim status** through to payment
5. **Separate from personal budget** analysis

---

## 📊 Data Model

### Transaction Fields

```typescript
interface Transaction {
  // ... standard fields ...
  
  // Business Expense Fields
  is_business: boolean;
  reimbursement_type: 'NONE' | 'REIMBURSABLE' | 'BUSINESS_OWNED';
  reimbursement_target?: string;  // "Employer: ACME Corp"
  reimbursement_claim_id?: string; // Linked claim (null until claimed)
  
  // Receipt
  has_receipt: boolean;
  receipt_count: number;
}
```

### Reimbursement Types

```typescript
enum ReimbursementType {
  NONE = 'NONE',                   // Personal expense
  REIMBURSABLE = 'REIMBURSABLE',   // Will be reimbursed
  BUSINESS_OWNED = 'BUSINESS_OWNED' // Own business, tax deduction
}
```

**Examples**:
- `REIMBURSABLE`: Employee buys flight on personal card, employer reimburses
- `BUSINESS_OWNED`: Freelancer buys supplies for own business, tracks for taxes

### Reimbursement Claim

```typescript
interface ReimbursementClaim {
  id: string;
  household_id: string;
  
  // Details
  name: string;                    // "March 2024 ACME Expenses"
  target: string;                  // "Employer: ACME Corp"
  period_start: Timestamp;
  period_end: Timestamp;
  
  // Amounts
  total_amount: number;            // Sum of included expenses (cents)
  paid_amount: number;             // Amount received (cents)
  
  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'PARTIALLY_PAID' | 'REJECTED';
  
  // Linked Data
  transaction_ids: string[];       // All included transactions
  paid_transaction_id?: string;    // Income transaction when paid
  
  // Dates
  submitted_at?: Timestamp;
  approved_at?: Timestamp;
  paid_at?: Timestamp;
  
  // Notes
  notes?: string;
  rejection_reason?: string;
  
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}
```

---

## 🔄 User Workflows

### Workflow 1: Record Business Expense

```
┌─────────────────────────────────────┐
│ 1. Make Purchase                    │
│    User buys work flight: R4,000    │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Record Transaction               │
│    - Date: Today                    │
│    - Amount: R4,000                 │
│    - Account: Personal Card         │
│    - Payee: "British Airways"       │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. Mark as Business                 │
│    ☑ Business expense               │
│    Type: REIMBURSABLE               │
│    Target: "Employer: ACME"         │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 4. Allocate to Category             │
│    Category: Travel                 │
│    Amount: R4,000                   │
│                                     │
│    Note: Creates separate envelope  │
│    for "Work - Reimbursable" so     │
│    doesn't affect personal budget   │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 5. Attach Receipt                   │
│    📷 Take photo                    │
│    or                               │
│    📁 Select from gallery           │
│                                     │
│    Stored: Firebase Storage         │
│    Status: Uploaded ✓               │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ ✅ Complete                         │
│    Transaction saved offline        │
│    Syncs when online                │
│    Available for claiming           │
└─────────────────────────────────────┘
```

### Workflow 2: Create & Submit Claim

```
┌─────────────────────────────────────┐
│ 1. End of Period                    │
│    March 31st - time to submit      │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Go to Reimbursements Screen      │
│    → "ACME Corp"                    │
│    → "New Claim"                    │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. Select Period                    │
│    Period: Mar 1 - Mar 31, 2024     │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 4. Review Unclaimed Expenses        │
│    App shows all transactions:      │
│    ☑ Mar 3  - Flight      R4,000    │
│    ☑ Mar 12 - Hotel       R1,200    │
│    ☑ Mar 15 - Meals       R   450   │
│    ☑ Mar 20 - Uber        R   180   │
│    ☐ Mar 25 - Groceries   R   500   │
│        (personal, not business)     │
│                                     │
│    Total Selected: R5,830           │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 5. Review Receipts                  │
│    All selected items have photos   │
│    ✓ 4 receipts attached            │
│    ⚠ 0 missing receipts             │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 6. Create Claim                     │
│    Name: "March 2024 ACME"          │
│    Target: "ACME Corp"              │
│    Amount: R5,830                   │
│    Status: DRAFT                    │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 7. Export (Future Feature)          │
│    [ ] Email PDF                    │
│    [ ] Export to expense system     │
│    [ ] Print report                 │
│                                     │
│    For now: Manually submit         │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 8. Mark as Submitted                │
│    Status: DRAFT → SUBMITTED        │
│    Submitted date: Mar 31, 2024     │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ ✅ Claim Submitted                  │
│    Now tracked in "Outstanding"     │
│    Waiting for employer payment     │
└─────────────────────────────────────┘
```

### Workflow 3: Receive Reimbursement

```
┌─────────────────────────────────────┐
│ 1. Employer Pays                    │
│    R5,830 deposited to bank         │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Record Income Transaction        │
│    Date: Apr 15, 2024               │
│    Amount: R5,830                   │
│    Account: Bank Account            │
│    Payee: "ACME Corp - Reimbursement"│
│    Type: INCOME                     │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. Link to Claim                    │
│    "Link to expense claim?"         │
│    → Select: "March 2024 ACME"      │
│                                     │
│    App automatically:               │
│    - Sets claim.paid_transaction_id │
│    - Sets claim.status = PAID       │
│    - Sets claim.paid_at = now       │
│    - Sets claim.paid_amount         │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ ✅ Reimbursement Complete           │
│    Claim closed                     │
│    Money back in your account       │
│    Outstanding balance: R0          │
└─────────────────────────────────────┘
```

---

## 💻 Implementation

### Tag Transaction as Business

```typescript
async function tagTransactionAsBusiness(
  transactionId: string,
  reimbursementType: ReimbursementType,
  reimbursementTarget: string
): Promise<void> {
  await updateTransaction(transactionId, {
    is_business: true,
    reimbursement_type: reimbursementType,
    reimbursement_target: reimbursementTarget,
  });
}
```

### Get Unclaimed Expenses

```typescript
async function getUnclaimedExpenses(
  householdId: string,
  reimbursementTarget: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<Transaction[]> {
  let q = query(
    collection(db, `households/${householdId}/transactions`),
    where('is_business', '==', true),
    where('reimbursement_type', '==', 'REIMBURSABLE'),
    where('reimbursement_target', '==', reimbursementTarget),
    where('reimbursement_claim_id', '==', null), // Not yet claimed
    orderBy('date', 'desc')
  );
  
  if (periodStart) {
    q = query(q, where('date', '>=', Timestamp.fromDate(periodStart)));
  }
  
  if (periodEnd) {
    q = query(q, where('date', '<=', Timestamp.fromDate(periodEnd)));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => mapToTransaction(doc));
}
```

### Create Claim

```typescript
async function createReimbursementClaim(
  householdId: string,
  name: string,
  target: string,
  transactionIds: string[],
  periodStart: Date,
  periodEnd: Date
): Promise<ReimbursementClaim> {
  // 1. Calculate total
  const transactions = await getTransactionsByIds(transactionIds);
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // 2. Create claim
  const claim: ReimbursementClaim = {
    id: uuid(),
    household_id: householdId,
    name,
    target,
    period_start: Timestamp.fromDate(periodStart),
    period_end: Timestamp.fromDate(periodEnd),
    total_amount: totalAmount,
    paid_amount: 0,
    status: 'DRAFT',
    transaction_ids: transactionIds,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    created_by: getCurrentUserId(),
  };
  
  // 3. Save claim
  await setDoc(
    doc(db, `households/${householdId}/reimbursement_claims/${claim.id}`),
    claim
  );
  
  // 4. Update transactions with claim_id
  const batch = writeBatch(db);
  for (const txId of transactionIds) {
    const txRef = doc(db, `households/${householdId}/transactions/${txId}`);
    batch.update(txRef, { reimbursement_claim_id: claim.id });
  }
  await batch.commit();
  
  return claim;
}
```

### Mark Claim as Paid

```typescript
async function markClaimAsPaid(
  claimId: string,
  paidTransactionId: string,
  paidAmount: number
): Promise<void> {
  await updateDoc(
    doc(db, `households/${householdId}/reimbursement_claims/${claimId}`),
    {
      status: 'PAID',
      paid_transaction_id: paidTransactionId,
      paid_amount: paidAmount,
      paid_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }
  );
}
```

### Calculate Outstanding Reimbursables

```typescript
async function calculateOutstandingReimbursables(
  householdId: string
): Promise<{
  total: number;
  by_target: Record<string, number>;
  claims: ReimbursementClaim[];
}> {
  // Get all non-paid claims
  const q = query(
    collection(db, `households/${householdId}/reimbursement_claims`),
    where('status', 'in', ['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_PAID'])
  );
  
  const snapshot = await getDocs(q);
  const claims = snapshot.docs.map(doc => mapToClaim(doc));
  
  // Calculate totals
  const total = claims.reduce((sum, c) => sum + (c.total_amount - c.paid_amount), 0);
  
  const byTarget: Record<string, number> = {};
  for (const claim of claims) {
    const outstanding = claim.total_amount - claim.paid_amount;
    byTarget[claim.target] = (byTarget[claim.target] || 0) + outstanding;
  }
  
  return { total, by_target: byTarget, claims };
}
```

---

## 📊 Budget Integration

### Separate Business Envelope

Business expenses should NOT affect personal budget analysis.

**Implementation**:
```typescript
// Create special "Work - Reimbursable" category
async function ensureBusinessExpenseCategory(budgetId: string): Promise<string> {
  const existingCategory = await findCategory(budgetId, 'Work - Reimbursable');
  
  if (existingCategory) {
    return existingCategory.id;
  }
  
  // Create new category
  const category: BudgetCategory = {
    id: uuid(),
    budget_id: budgetId,
    name: 'Work - Reimbursable',
    group: 'PERSONAL',
    type: 'VARIABLE',
    planned_amount: 0, // No budget needed (will be reimbursed)
    is_cash_envelope: false,
    // ... other fields
  };
  
  await saveCategory(category);
  return category.id;
}

// Allocate business expense
async function allocateBusinessExpense(
  transaction: Transaction,
  amount: number
): Promise<void> {
  const budget = await getCurrentBudget(transaction.household_id);
  const categoryId = await ensureBusinessExpenseCategory(budget.id);
  
  await createAllocation({
    transaction_id: transaction.id,
    category_id: categoryId,
    amount: amount,
  });
}
```

### Budget Reports with Business Expense Toggle

```typescript
interface BudgetReport {
  total_income: number;
  total_expenses: number;
  total_expenses_excluding_business: number; // Toggle for "pure" spending
  by_category: CategorySpending[];
}

async function generateBudgetReport(
  budgetId: string,
  excludeBusinessExpenses: boolean = false
): Promise<BudgetReport> {
  const categories = await getCategories(budgetId);
  
  let totalExpenses = 0;
  let totalExcludingBusiness = 0;
  
  for (const category of categories) {
    totalExpenses += category.actual_amount;
    
    if (category.name !== 'Work - Reimbursable') {
      totalExcludingBusiness += category.actual_amount;
    }
  }
  
  return {
    // ... report data
    total_expenses: excludeBusinessExpenses ? totalExcludingBusiness : totalExpenses,
  };
}
```

---

## 🎨 UI Components

### Transaction Entry Screen

```
┌────────────────────────────────────┐
│ Add Transaction                    │
├────────────────────────────────────┤
│                                    │
│ Amount:        $ [4,000.00]        │
│ Date:          [Mar 3, 2024]       │
│ Account:       [Personal Card ▾]   │
│ Payee:         [British Airways]   │
│                                    │
│ Category:      [Travel        ▾]   │
│                                    │
│ ☑ Business Expense                │
│   Type:        [Reimbursable  ▾]   │
│   From:        [ACME Corp     ▾]   │
│                                    │
│ 📷 Add Receipt                     │
│                                    │
│ Notes:         [Work conference]   │
│                                    │
│         [Cancel]     [Save]        │
└────────────────────────────────────┘
```

### Reimbursements Dashboard

```
┌────────────────────────────────────┐
│ Reimbursements                     │
├────────────────────────────────────┤
│                                    │
│ Outstanding: R5,830                │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ACME Corp              R5,830  │ │
│ │ 1 claim submitted              │ │
│ │ [View Details]                 │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Client XYZ             R1,200  │ │
│ │ 3 unclaimed expenses           │ │
│ │ [Create Claim]                 │ │
│ └────────────────────────────────┘ │
│                                    │
│ Recent Claims                      │
│ ─────────────────────────          │
│ ✓ Feb 2024 ACME      Paid R4,200  │
│ ✓ Jan 2024 ACME      Paid R3,850  │
│                                    │
└────────────────────────────────────┘
```

### Claim Details Screen

```
┌────────────────────────────────────┐
│ March 2024 ACME Corp               │
├────────────────────────────────────┤
│                                    │
│ Status: SUBMITTED                  │
│ Total:  R5,830                     │
│                                    │
│ Expenses (4 items)                 │
│ ─────────────────────────          │
│ Mar 3  │ Flight     │ R4,000  📷   │
│ Mar 12 │ Hotel      │ R1,200  📷   │
│ Mar 15 │ Meals      │ R  450  📷   │
│ Mar 20 │ Uber       │ R  180  📷   │
│                                    │
│ Submitted: Mar 31, 2024            │
│                                    │
│ Actions                            │
│ ─────────────────────────          │
│ [Mark as Paid]                     │
│ [Export Report] (future)           │
│ [Edit Claim]                       │
│                                    │
└────────────────────────────────────┘
```

---

## ⚠️ Edge Cases

### 1. Split Transaction (Part Business)

**Scenario**: Grocery store - buy personal groceries + business snacks

```typescript
// R500 total: R300 personal, R200 business
const transaction = {
  id: uuid(),
  amount: 50000, // R500
  payee: 'Woolworths',
  // ...
};

// Split allocations
const allocations = [
  {
    id: uuid(),
    transaction_id: transaction.id,
    category_id: groceriesCategoryId,
    amount: 30000, // R300 personal
    // No business flags
  },
  {
    id: uuid(),
    transaction_id: transaction.id,
    category_id: businessCategoryId,
    amount: 20000, // R200 business
    // This allocation is business expense
  },
];

// Mark TRANSACTION as partially business
await updateTransaction(transaction.id, {
  is_business: true, // Has some business component
});

// Or: Track business at allocation level only
```

**Decision**: Keep it simple - either entire transaction is business or not. Use notes to clarify if needed.

### 2. Receipt Missing

**Scenario**: User forgets to take photo

**Solution**:
- Allow creating transaction without receipt
- Flag in claim as "Missing receipt"
- User can add later
- Employer may request or deny

```typescript
function validateClaimCompleteness(claim: ReimbursementClaim): ValidationResult {
  const missingReceipts = [];
  
  for (const txId of claim.transaction_ids) {
    const tx = await getTransaction(txId);
    if (!tx.has_receipt) {
      missingReceipts.push(tx);
    }
  }
  
  return {
    complete: missingReceipts.length === 0,
    warnings: missingReceipts.length > 0 
      ? [`${missingReceipts.length} expenses missing receipts`]
      : [],
  };
}
```

### 3. Partial Payment

**Scenario**: Employer pays only part of claim (denied one expense)

**Solution**:
```typescript
await updateClaim(claimId, {
  status: 'PARTIALLY_PAID',
  paid_amount: 4800, // Out of 5830 total
  paid_transaction_id: incomeTransactionId,
  notes: 'Denied hotel expense (R1,030)',
});

// Outstanding remains R1,030
```

### 4. Currency Mismatch

**Scenario**: Business trip abroad - expenses in different currency

**Solution** (V1): Keep it simple - convert to home currency when entering transaction
**Future**: Multi-currency support

### 5. Late Entry Tracking

**Scenario**: User forgets to log expense until month later

```typescript
interface Transaction {
  date: Timestamp;           // Mar 3 (actual date)
  captured_at: Timestamp;    // Apr 15 (when entered)
  capture_delay_days: 43;    // Calculated
}

// Flag late entries
if (transaction.capture_delay_days > 30) {
  showWarning('This expense is over 30 days old. Some employers have claim deadlines.');
}
```

---

## 📈 Reports & Analytics

### Outstanding by Employer

```typescript
interface OutstandingReport {
  employer: string;
  draft_claims: number;
  submitted_claims: number;
  total_outstanding: number;
  oldest_expense_date: Date;
}

async function getOutstandingReport(
  householdId: string
): Promise<OutstandingReport[]> {
  // Group by reimbursement_target
  // Calculate totals
  // Sort by amount desc
}
```

### Reimbursement History

```typescript
interface ReimbursementHistory {
  month: string;
  employer: string;
  claimed: number;
  received: number;
  avg_turnaround_days: number;
}

async function getReimbursementHistory(
  householdId: string,
  months: number = 12
): Promise<ReimbursementHistory[]> {
  // Get paid claims from last N months
  // Calculate metrics
  // Show trends
}
```

---

## 🚀 Future Enhancements

### V2 Features
- [ ] PDF export of claims
- [ ] Email claim directly to employer
- [ ] Integration with expense systems (SAP, Concur)
- [ ] OCR for receipt data extraction
- [ ] Mileage tracking
- [ ] Per diem calculations
- [ ] Tax-deductible expense tracking (for business owners)

### V3 Features
- [ ] Multi-currency support
- [ ] Corporate card integration
- [ ] Approval workflows (for managers)
- [ ] Expense policy compliance checks

---

## ✅ Summary

Business expense reimbursement adds significant value:

1. **Unified tracking** - Personal + business in one app
2. **Receipt management** - Never lose a receipt again
3. **Cash flow visibility** - Know how much employer owes
4. **Budget accuracy** - Separate business from personal spending
5. **Tax ready** - Track for deductions (future)

**Implementation complexity**: Medium  
**User value**: High  
**Priority**: Must Have for target users

---

**Next**: See `docs/architecture/decisions/` for architectural decision records.

