// Budget Repository Interface
// Defines contract for budget data access

import { Budget } from '@/domain/entities/Budget';

export interface IBudgetRepository {
  // Create
  createBudget(budget: Budget): Promise<void>;
  
  // Read
  getBudgetById(budgetId: string): Promise<Budget | null>;
  getBudgetByMonth(householdId: string, month: number, year: number): Promise<Budget | null>;
  getBudgetsByHousehold(householdId: string): Promise<Budget[]>;
  getBudgetsByYear(householdId: string, year: number): Promise<Budget[]>;
  
  // Update
  updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void>;
  updateCategoryPlannedAmount(budgetId: string, categoryId: string, amount: number): Promise<void>;
  updateCategoryActualAmount(budgetId: string, categoryId: string, amount: number): Promise<void>;
  
  // Delete
  deleteBudget(budgetId: string): Promise<void>;
  
  // Utility
  copyBudgetToNextMonth(budgetId: string): Promise<Budget>;
}
