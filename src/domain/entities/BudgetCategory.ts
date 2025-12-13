// Domain Entity: BudgetCategory
// Represents an envelope-style budget category

export type CategoryType =
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

export type SpendingType =
  | 'FIXED'          // Same amount every month (rent)
  | 'VARIABLE';      // Changes monthly (groceries)

export interface BudgetCategory {
  // Identity
  id: string;
  budget_id: string;
  name: string;
  
  // Classification
  group: CategoryType;
  type: SpendingType;
  
  // Budget (in cents)
  planned_amount: number;
  actual_amount: number;
  available_amount: number; // planned - actual + carried_over
  
  // Envelope Behavior
  is_cash_envelope: boolean;
  carry_over: boolean;
  carried_over_amount: number;
  
  // Sinking Fund
  is_sinking_fund: boolean;
  target_amount?: number;
  target_date?: Date;
  
  // Display
  sort_order: number;
  color?: string;
  icon?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new BudgetCategory
export function createBudgetCategory(params: {
  id: string;
  budget_id: string;
  name: string;
  group: CategoryType;
  type: SpendingType;
  planned_amount: number;
  created_by: string;
  sort_order?: number;
}): BudgetCategory {
  return {
    id: params.id,
    budget_id: params.budget_id,
    name: params.name,
    group: params.group,
    type: params.type,
    planned_amount: params.planned_amount,
    actual_amount: 0,
    available_amount: params.planned_amount,
    is_cash_envelope: false,
    carry_over: params.group === 'SINKING_FUND',
    carried_over_amount: 0,
    is_sinking_fund: params.group === 'SINKING_FUND',
    sort_order: params.sort_order || 0,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.created_by,
  };
}

// Calculate envelope balance
export function calculateEnvelopeBalance(category: BudgetCategory): {
  available: number;
  spent: number;
  percentage: number;
  status: 'good' | 'warning' | 'overspent';
} {
  const spent = category.actual_amount;
  const budget = category.planned_amount + category.carried_over_amount;
  const available = budget - spent;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  
  let status: 'good' | 'warning' | 'overspent';
  if (percentage < 75) status = 'good';
  else if (percentage < 100) status = 'warning';
  else status = 'overspent';
  
  return { available, spent, percentage, status };
}

