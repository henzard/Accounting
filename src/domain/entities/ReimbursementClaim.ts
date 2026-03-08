// Domain Entity: ReimbursementClaim
// Represents a claim for business expense reimbursement

export type ClaimStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'REJECTED';

export interface ReimbursementClaim {
  // Identity
  id: string;
  household_id: string;
  
  // Claim Details
  name: string; // "March 2024 ACME Expenses"
  business_id: string; // Reference to Business entity
  business_name: string; // Denormalized for display
  period_start: Date;
  period_end: Date;
  
  // Amounts
  total_amount: number; // Sum of all expenses (cents)
  paid_amount: number; // Amount received (cents)
  
  // Status
  status: ClaimStatus;
  
  // Linked Transactions
  transaction_ids: string[]; // All included transactions
  paid_transaction_id?: string; // Income transaction when paid
  
  // Submission
  submitted_at?: Date;
  submitted_by?: string;
  approved_at?: Date;
  paid_at?: Date;
  
  // Notes
  notes?: string;
  rejection_reason?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new ReimbursementClaim
export function createReimbursementClaim(params: {
  id: string;
  household_id: string;
  name: string;
  business_id: string;
  business_name: string;
  period_start: Date;
  period_end: Date;
  created_by: string;
  transaction_ids?: string[];
  notes?: string;
}): ReimbursementClaim {
  return {
    id: params.id,
    household_id: params.household_id,
    name: params.name.trim(),
    business_id: params.business_id,
    business_name: params.business_name,
    period_start: params.period_start,
    period_end: params.period_end,
    total_amount: 0, // Will be calculated from transactions
    paid_amount: 0,
    status: 'DRAFT',
    transaction_ids: params.transaction_ids || [],
    notes: params.notes,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.created_by,
  };
}
