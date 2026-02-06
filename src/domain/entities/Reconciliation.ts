// Domain Entity: Reconciliation
// Represents an account reconciliation session

export type ReconciliationStatus = 'in_progress' | 'completed' | 'cancelled';

export interface Reconciliation {
  // Identity
  id: string;
  household_id: string;
  account_id: string;
  
  // Reconciliation Details
  statement_date: Date; // Date on the bank statement
  statement_balance: number; // Balance shown on bank statement (in cents)
  
  // Status
  status: ReconciliationStatus;
  reconciled_date?: Date; // When reconciliation was completed
  reconciled_by?: string; // User ID who completed reconciliation
  
  // Difference Tracking
  difference: number; // Difference between cleared balance and statement balance (in cents)
  cleared_transaction_count: number; // Number of transactions marked as cleared during this reconciliation
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new Reconciliation
export function createReconciliation(params: {
  id: string;
  household_id: string;
  account_id: string;
  statement_date: Date;
  statement_balance: number;
  created_by: string;
}): Reconciliation {
  const now = new Date();
  
  return {
    id: params.id,
    household_id: params.household_id,
    account_id: params.account_id,
    statement_date: params.statement_date,
    statement_balance: params.statement_balance,
    status: 'in_progress',
    difference: 0, // Will be calculated
    cleared_transaction_count: 0,
    created_at: now,
    updated_at: now,
    created_by: params.created_by,
  };
}

// Helper: Check if reconciliation is complete (difference = 0)
export function isReconciliationBalanced(reconciliation: Reconciliation): boolean {
  return reconciliation.difference === 0;
}

// Helper: Complete a reconciliation
export function completeReconciliation(
  reconciliation: Reconciliation,
  userId: string,
  clearedTransactionCount: number
): Reconciliation {
  return {
    ...reconciliation,
    status: 'completed',
    reconciled_date: new Date(),
    reconciled_by: userId,
    cleared_transaction_count: clearedTransactionCount,
    updated_at: new Date(),
  };
}

// Helper: Cancel a reconciliation
export function cancelReconciliation(reconciliation: Reconciliation): Reconciliation {
  return {
    ...reconciliation,
    status: 'cancelled',
    updated_at: new Date(),
  };
}

// Helper: Update reconciliation difference
export function updateReconciliationDifference(
  reconciliation: Reconciliation,
  clearedBalance: number
): Reconciliation {
  return {
    ...reconciliation,
    difference: clearedBalance - reconciliation.statement_balance,
    updated_at: new Date(),
  };
}
