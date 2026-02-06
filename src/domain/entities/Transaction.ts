// Domain Entity: Transaction
// Represents all financial transactions

export type TransactionType =
  | 'EXPENSE'        // Money out
  | 'INCOME'         // Money in
  | 'TRANSFER';      // Between accounts

export type TransactionStatus = 'pending' | 'cleared' | 'reconciled';

export type ReimbursementType = 'NONE' | 'REIMBURSABLE' | 'BUSINESS_OWNED';

export interface Transaction {
  // Identity (UUID for offline-first)
  id: string;
  household_id: string;
  
  // Transaction Details
  type: TransactionType;
  date: Date;
  amount: number; // Amount in cents (always positive)
  currency: string;
  
  // Parties
  account_id: string;
  payee?: string;
  payer?: string;
  
  // Budget Category Allocation
  category_id?: string; // Link to budget category for budget tracking
  
  // Transfer (if type === 'TRANSFER')
  to_account_id?: string;
  
  // Details
  notes?: string;
  reference?: string;
  
  // Status
  status: TransactionStatus;
  cleared_date?: Date; // When this transaction cleared at the bank
  reconciled_at?: Date;
  reconciled_by?: string;
  
  // Business Expenses
  is_business: boolean;
  business_id?: string; // Reference to Business entity (for multi-business support)
  reimbursement_type?: ReimbursementType;
  reimbursement_target?: string; // Denormalized: "Employer: ACME Corp" (derived from business_id or manual)
  reimbursement_claim_id?: string;
  
  // Receipt
  has_receipt: boolean;
  receipt_count: number;
  receipt_urls?: string[]; // Firebase Storage URLs for receipt photos
  
  // Late Entry Tracking
  captured_at: Date;
  capture_delay_days: number;
  
  // Sync Debugging
  created_by_device: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new Transaction
export function createTransaction(params: {
  id: string;
  household_id: string;
  type: TransactionType;
  date: Date;
  amount: number;
  account_id: string;
  created_by: string;
  created_by_device: string;
  payee?: string;
  notes?: string;
  category_id?: string;
}): Transaction {
  const now = new Date();
  const captureDelay = Math.floor(
    (now.getTime() - params.date.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    id: params.id,
    household_id: params.household_id,
    type: params.type,
    date: params.date,
    amount: params.amount,
    currency: 'USD',
    account_id: params.account_id,
    payee: params.payee,
    category_id: params.category_id,
    notes: params.notes,
    status: 'pending',
    is_business: false,
    has_receipt: false,
    receipt_count: 0,
    captured_at: now,
    capture_delay_days: captureDelay,
    created_by_device: params.created_by_device,
    created_at: now,
    updated_at: now,
    created_by: params.created_by,
  };
}

// Helper: Check if transaction is cleared
export function isTransactionCleared(transaction: Transaction): boolean {
  return transaction.status === 'cleared' || transaction.status === 'reconciled';
}

// Helper: Check if transaction is reconciled
export function isTransactionReconciled(transaction: Transaction): boolean {
  return transaction.status === 'reconciled';
}

// Helper: Mark transaction as cleared
export function markTransactionCleared(transaction: Transaction, clearedDate?: Date): Transaction {
  return {
    ...transaction,
    status: 'cleared',
    cleared_date: clearedDate || new Date(),
    updated_at: new Date(),
  };
}

// Helper: Mark transaction as pending (uncleared)
export function markTransactionPending(transaction: Transaction): Transaction {
  return {
    ...transaction,
    status: 'pending',
    cleared_date: undefined,
    updated_at: new Date(),
  };
}

// Helper: Calculate cleared balance for an account
export function calculateClearedBalance(transactions: Transaction[]): number {
  return transactions
    .filter(t => isTransactionCleared(t))
    .reduce((sum, t) => {
      if (t.type === 'INCOME') {
        return sum + t.amount;
      } else if (t.type === 'EXPENSE') {
        return sum - t.amount;
      } else if (t.type === 'TRANSFER') {
        // Handle transfers based on account perspective
        // This should be refined based on whether it's the source or destination account
        return sum;
      }
      return sum;
    }, 0);
}

