// Domain Entity: Budget
// Represents a monthly zero-based budget

export type BudgetStatus = 'draft' | 'active' | 'closed';

export interface Budget {
  // Identity
  id: string;
  household_id: string;
  
  // Period
  month: number; // 1-12
  year: number;
  period_start: Date;
  period_end: Date;
  
  // Income (in cents)
  planned_income: number;
  actual_income: number;
  
  // Expenses (in cents)
  planned_expenses: number;
  actual_expenses: number;
  
  // Zero-Based Check
  is_zero_based: boolean;
  difference: number; // planned_income - planned_expenses
  
  // Status
  status: BudgetStatus;
  closed_at?: Date;
  closed_by?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
  copied_from_budget_id?: string;
}

// Factory function to create a new Budget
export function createBudget(params: {
  id: string;
  household_id: string;
  month: number;
  year: number;
  created_by: string;
  planned_income?: number;
}): Budget {
  const planned_income = params.planned_income || 0;
  
  // Calculate period dates
  const period_start = new Date(params.year, params.month - 1, 1);
  const period_end = new Date(params.year, params.month, 0, 23, 59, 59);
  
  return {
    id: params.id,
    household_id: params.household_id,
    month: params.month,
    year: params.year,
    period_start,
    period_end,
    planned_income,
    actual_income: 0,
    planned_expenses: 0,
    actual_expenses: 0,
    is_zero_based: false,
    difference: planned_income,
    status: 'draft',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.created_by,
  };
}

// Validate zero-based budget
export function validateZeroBasedBudget(budget: Budget): {
  isZeroBased: boolean;
  difference: number;
  message: string;
} {
  const difference = budget.planned_income - budget.planned_expenses;
  
  if (difference === 0) {
    return {
      isZeroBased: true,
      difference: 0,
      message: '✅ Your budget is zero-based!',
    };
  } else if (difference > 0) {
    return {
      isZeroBased: false,
      difference,
      message: `⚠️ You have $${(difference / 100).toFixed(2)} unallocated. Give every dollar a job!`,
    };
  } else {
    return {
      isZeroBased: false,
      difference,
      message: `❌ You're overspent by $${Math.abs(difference / 100).toFixed(2)}. Reduce expenses!`,
    };
  }
}

