// Budget Entity - Homebase Budget (Dave Ramsey Zero-Based Budgeting)
// A monthly budget where every dollar is assigned a job (income - expenses = 0)

export interface Budget {
  // Identity
  id: string;
  household_id: string;
  
  // Time period
  month: number; // 1-12
  year: number;
  
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
  planned_income?: number;
  categories?: BudgetCategory[];
}): Budget {
  return {
    id: params.id,
    household_id: params.household_id,
    month: params.month,
    year: params.year,
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
