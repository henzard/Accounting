// Domain Entity: Account
// Represents a bank account, credit card, or cash

export type AccountType = 
  | 'BANK'           // Checking account
  | 'SAVINGS'        // Savings account
  | 'CREDIT_CARD'    // Credit card
  | 'CASH'           // Physical cash
  | 'LOAN'           // Loan account
  | 'INVESTMENT';    // Investment account (future)

export interface Account {
  // Identity
  id: string;
  household_id: string;
  name: string;
  type: AccountType;
  
  // Balance (stored in cents to avoid floating-point issues)
  balance: number;
  currency: string;
  
  // Settings
  is_in_budget: boolean;
  is_active: boolean;
  
  // Display
  color?: string;
  icon?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new Account
export function createAccount(params: {
  id: string;
  household_id: string;
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  created_by: string;
}): Account {
  return {
    id: params.id,
    household_id: params.household_id,
    name: params.name,
    type: params.type,
    balance: params.balance || 0,
    currency: params.currency || 'USD',
    is_in_budget: true,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.created_by,
  };
}

// Helper functions for money calculations
export function formatAccountBalance(balance: number): string {
  return (balance / 100).toFixed(2);
}

export function centsToAmount(cents: number): number {
  return cents / 100;
}

export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

