// Budget Entity - Homebase Budget (Dave Ramsey Zero-Based Budgeting)
// A monthly budget where every dollar is assigned a job (income - expenses = 0)

export interface Budget {
  // Identity
  id: string;
  household_id: string;
  
  // Time period
  month: number; // 1-12 (for reference/display, actual period may differ)
  year: number;
  period_start: Date; // Actual start date of budget period
  period_end: Date; // Actual end date of budget period
  
  // Income
  planned_income: number; // In cents
  
  // Categories (envelope budgeting)
  categories: BudgetCategory[];
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface BudgetCategory {
  // Identity
  id: string; // UUID for this specific budget line item
  category_id: string; // Reference to master category definition
  
  // Category info (denormalized for performance)
  name: string;
  group: CategoryGroup; // Income, Savings, Housing, etc.
  icon?: string;
  
  // Budget amounts (in cents)
  planned_amount: number; // How much you plan to spend
  actual_amount: number; // How much you've actually spent (calculated from transactions)
  
  // Tracking
  is_funded: boolean; // Has this category been fully funded?
  sort_order: number; // Display order within group
}

// Dave Ramsey's budget category groups
export type CategoryGroup =
  | 'INCOME' // Paychecks, side hustles
  | 'GIVING' // Tithing, charity
  | 'SAVING' // Emergency fund, sinking funds
  | 'HOUSING' // Rent/mortgage, utilities, maintenance
  | 'TRANSPORTATION' // Car payment, gas, insurance, maintenance
  | 'FOOD' // Groceries, restaurants
  | 'PERSONAL' // Clothing, hair, entertainment, misc
  | 'INSURANCE' // Life, health (not auto/home)
  | 'DEBT' // Credit cards, student loans (Dave wants these gone!)
  | 'LIFESTYLE'; // Phone, internet, subscriptions

// Factory function to create a new Budget
export function createBudget(params: {
  id: string;
  household_id: string;
  month: number;
  year: number;
  period_start?: Date;
  period_end?: Date;
  planned_income?: number;
  categories?: BudgetCategory[];
}): Budget {
  // Default to calendar month if not specified
  const defaultPeriodStart = new Date(params.year, params.month - 1, 1);
  const defaultPeriodEnd = new Date(params.year, params.month, 0, 23, 59, 59, 999);

  return {
    id: params.id,
    household_id: params.household_id,
    month: params.month,
    year: params.year,
    period_start: params.period_start || defaultPeriodStart,
    period_end: params.period_end || defaultPeriodEnd,
    planned_income: params.planned_income || 0,
    categories: params.categories || [],
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// Factory function to create a new BudgetCategory
export function createBudgetCategory(params: {
  id: string;
  category_id: string;
  name: string;
  group: CategoryGroup;
  icon?: string;
  planned_amount?: number;
  actual_amount?: number;
  is_funded?: boolean;
  sort_order?: number;
}): BudgetCategory {
  return {
    id: params.id,
    category_id: params.category_id,
    name: params.name,
    group: params.group,
    icon: params.icon,
    planned_amount: params.planned_amount || 0,
    actual_amount: params.actual_amount || 0,
    is_funded: params.is_funded || false,
    sort_order: params.sort_order || 0,
  };
}

// Helper: Calculate total planned expenses
export function calculateTotalPlannedExpenses(budget: Budget): number {
  return budget.categories
    .filter((cat) => cat.group !== 'INCOME') // Don't count income categories
    .reduce((sum, cat) => sum + cat.planned_amount, 0);
}

// Helper: Calculate total actual expenses
export function calculateTotalActualExpenses(budget: Budget): number {
  return budget.categories
    .filter((cat) => cat.group !== 'INCOME')
    .reduce((sum, cat) => sum + cat.actual_amount, 0);
}

// Helper: Calculate remaining to budget (zero-based goal)
export function calculateRemainingToBudget(budget: Budget): number {
  const totalPlanned = calculateTotalPlannedExpenses(budget);
  return budget.planned_income - totalPlanned;
}

// Helper: Is budget zero-based? (every dollar assigned)
export function isZeroBasedBudget(budget: Budget): boolean {
  return calculateRemainingToBudget(budget) === 0;
}

// Helper: Get budget month name
export function getBudgetMonthName(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Calculate budget period dates based on custom start day
 * 
 * @param month - Month (1-12) for reference
 * @param year - Year for reference
 * @param budgetPeriodStartDay - Day of month when budget starts (1-31, default 1)
 * @returns { period_start, period_end } - Date range for this budget period
 * 
 * Examples:
 * - budgetPeriodStartDay = 1 → Calendar month (Jan 1 - Jan 31)
 * - budgetPeriodStartDay = 15 → Mid-month (Jan 15 - Feb 14)
 * - budgetPeriodStartDay = 20 → Custom (Jan 20 - Feb 19)
 */
export function calculateBudgetPeriod(
  month: number,
  year: number,
  budgetPeriodStartDay: number = 1
): { period_start: Date; period_end: Date } {
  // Default: Calendar month (1st to last day)
  if (budgetPeriodStartDay === 1) {
    const period_start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const period_end = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month
    return { period_start, period_end };
  }

  // Custom period: Start on specific day of this month, end day before that in next month
  const period_start = new Date(year, month - 1, budgetPeriodStartDay, 0, 0, 0, 0);
  
  // End date is day before start day in next month
  // Example: Start = Jan 20 → End = Feb 19
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const period_end = new Date(nextYear, nextMonth - 1, budgetPeriodStartDay - 1, 23, 59, 59, 999);
  
  return { period_start, period_end };
}
