// Use Case: Create Budget
// Creates a new monthly budget, optionally copying from previous month

import { v4 as uuid } from 'uuid';
import { Budget, createBudget } from '@/domain/entities';
import { IBudgetRepository } from '@/domain/repositories';

export interface CreateBudgetInput {
  household_id: string;
  month: number; // 1-12
  year: number;
  planned_income?: number;
  copy_from_previous?: boolean;
  created_by: string;
}

export class CreateBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}
  
  async execute(input: CreateBudgetInput): Promise<Budget> {
    // Validate input
    if (!input.household_id) {
      throw new Error('Household ID is required');
    }
    
    if (input.month < 1 || input.month > 12) {
      throw new Error('Month must be between 1 and 12');
    }
    
    if (input.year < 2000 || input.year > 2100) {
      throw new Error('Invalid year');
    }
    
    // Check if budget already exists for this period
    const existing = await this.budgetRepository.getBudgetByMonth(
      input.household_id,
      input.month,
      input.year
    );
    
    if (existing) {
      throw new Error('Budget already exists for this period');
    }
    
    // Optionally copy categories from previous month
    let copiedCategories: Budget['categories'] = [];
    if (input.copy_from_previous) {
      const prevMonth = input.month === 1 ? 12 : input.month - 1;
      const prevYear = input.month === 1 ? input.year - 1 : input.year;
      
      const previousBudget = await this.budgetRepository.getBudgetByMonth(
        input.household_id,
        prevMonth,
        prevYear
      );
      
      if (previousBudget) {
        copiedCategories = previousBudget.categories.map((category) => ({
          ...category,
          id: uuid(),
          actual_amount: 0,
          is_funded: false,
        }));
      }
    }

    // Create new budget
    const budget = createBudget({
      id: uuid(),
      household_id: input.household_id,
      month: input.month,
      year: input.year,
      planned_income: input.planned_income ?? 0,
      categories: copiedCategories,
    });
    
    // Save budget
    await this.budgetRepository.createBudget(budget);
    
    return budget;
  }
}

