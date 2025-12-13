// Repository Interface: Budget
// Defines contract for budget data access

import { Budget, BudgetCategory } from '@/domain/entities';

export interface IBudgetRepository {
  // Get budget by month/year
  getBudgetByPeriod(
    householdId: string,
    month: number,
    year: number
  ): Promise<Budget | null>;
  
  // Get current month budget
  getCurrentMonthBudget(householdId: string): Promise<Budget | null>;
  
  // Get budget by ID
  getBudgetById(budgetId: string): Promise<Budget | null>;
  
  // Get all budgets for household (paginated)
  getBudgetsByHousehold(
    householdId: string,
    limit?: number
  ): Promise<Budget[]>;
  
  // Create new budget
  createBudget(budget: Budget): Promise<void>;
  
  // Update budget
  updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void>;
  
  // Copy budget from previous month
  copyBudgetFromPrevious(
    sourceBudgetId: string,
    targetMonth: number,
    targetYear: number
  ): Promise<Budget>;
  
  // Get categories for a budget
  getCategoriesForBudget(budgetId: string): Promise<BudgetCategory[]>;
  
  // Create category
  createCategory(category: BudgetCategory): Promise<void>;
  
  // Update category
  updateCategory(categoryId: string, updates: Partial<BudgetCategory>): Promise<void>;
  
  // Update category actual amount (when transaction allocated)
  updateCategoryActual(categoryId: string, amountToAdd: number): Promise<void>;
}

