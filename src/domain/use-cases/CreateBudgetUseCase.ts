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
    const existing = await this.budgetRepository.getBudgetByPeriod(
      input.household_id,
      input.month,
      input.year
    );
    
    if (existing) {
      throw new Error('Budget already exists for this period');
    }
    
    // Create new budget
    const budget = createBudget({
      id: uuid(),
      household_id: input.household_id,
      month: input.month,
      year: input.year,
      planned_income: input.planned_income,
      created_by: input.created_by,
    });
    
    // Save budget
    await this.budgetRepository.createBudget(budget);
    
    // Copy categories from previous month if requested
    if (input.copy_from_previous) {
      const prevMonth = input.month === 1 ? 12 : input.month - 1;
      const prevYear = input.month === 1 ? input.year - 1 : input.year;
      
      const previousBudget = await this.budgetRepository.getBudgetByPeriod(
        input.household_id,
        prevMonth,
        prevYear
      );
      
      if (previousBudget) {
        // Copy categories logic will be in a separate use case
        budget.copied_from_budget_id = previousBudget.id;
        await this.budgetRepository.updateBudget(budget.id, {
          copied_from_budget_id: previousBudget.id,
        });
      }
    }
    
    return budget;
  }
}

