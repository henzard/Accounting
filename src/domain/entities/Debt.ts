// Domain Entity: Debt
// Represents a debt for Debt Snowball tracking

export type DebtType =
  | 'CREDIT_CARD'
  | 'PERSONAL_LOAN'
  | 'STUDENT_LOAN'
  | 'CAR_LOAN'
  | 'MEDICAL'
  | 'MORTGAGE'
  | 'OTHER';

export type DebtStatus = 'active' | 'paid_off';

export interface Debt {
  // Identity
  id: string;
  household_id: string;
  name: string;
  type: DebtType;
  
  // Linked Account (optional)
  account_id?: string;
  
  // Balance (in cents)
  original_balance: number;
  current_balance: number;
  
  // Payment (in cents)
  minimum_payment: number;
  interest_rate: number; // Annual percentage (5.5 = 5.5%)
  
  // Debt Snowball
  snowball_order: number; // Order in payoff (1=first, 2=second...)
  is_focus_debt: boolean; // Current target for extra payments
  is_mortgage: boolean;   // Exclude from Baby Step 2
  
  // Status
  status: DebtStatus;
  paid_off_at?: Date;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new Debt
export function createDebt(params: {
  id: string;
  household_id: string;
  name: string;
  type: DebtType;
  current_balance: number;
  minimum_payment: number;
  interest_rate: number;
  created_by: string;
  is_mortgage?: boolean;
}): Debt {
  return {
    id: params.id,
    household_id: params.household_id,
    name: params.name,
    type: params.type,
    original_balance: params.current_balance,
    current_balance: params.current_balance,
    minimum_payment: params.minimum_payment,
    interest_rate: params.interest_rate,
    snowball_order: 0, // Will be calculated by use case
    is_focus_debt: false,
    is_mortgage: params.is_mortgage || params.type === 'MORTGAGE',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.created_by,
  };
}

// Calculate debt snowball order (smallest balance first)
export function calculateDebtSnowball(debts: Debt[]): Debt[] {
  // Filter out mortgages and paid debts
  const activeDebts = debts
    .filter(d => !d.is_mortgage && d.status === 'active')
    .sort((a, b) => a.current_balance - b.current_balance);
  
  // Assign snowball order
  activeDebts.forEach((debt, index) => {
    debt.snowball_order = index + 1;
    debt.is_focus_debt = index === 0; // First debt is focus
  });
  
  return activeDebts;
}

// Calculate payoff projection
export function calculatePayoffMonths(
  balance: number,
  monthlyPayment: number,
  interestRate: number
): number {
  if (monthlyPayment <= 0) return 999;
  if (interestRate === 0) return Math.ceil(balance / monthlyPayment);
  
  const monthlyRate = interestRate / 100 / 12;
  const months = Math.log(monthlyPayment / (monthlyPayment - balance * monthlyRate)) / 
                 Math.log(1 + monthlyRate);
  
  return Math.ceil(months);
}

