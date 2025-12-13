// Use Case: Get Current Budget
// Retrieves the budget for the current month

import { Budget } from '@/domain/entities';
import { IBudgetRepository } from '@/domain/repositories';

export interface GetCurrentBudgetInput {
  household_id: string;
}

export class GetCurrentBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}
  
  async execute(input: GetCurrentBudgetInput): Promise<Budget | null> {
    // Validate input
    if (!input.household_id) {
      throw new Error('Household ID is required');
    }
    
    // Get current month budget
    const budget = await this.budgetRepository.getCurrentMonthBudget(
      input.household_id
    );
    
    return budget;
  }
}

