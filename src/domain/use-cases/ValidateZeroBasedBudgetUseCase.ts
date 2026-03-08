// Use Case: Validate Zero-Based Budget
// Checks if a budget follows Dave Ramsey's zero-based budgeting principle

import { Budget, validateZeroBasedBudget } from '@/domain/entities';
import { IBudgetRepository } from '@/domain/repositories';

export interface ValidateZeroBasedBudgetInput {
  budget_id: string;
}

export interface ValidateZeroBasedBudgetOutput {
  isZeroBased: boolean;
  difference: number;
  message: string;
  suggestedAction?: string;
}

export class ValidateZeroBasedBudgetUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}
  
  async execute(input: ValidateZeroBasedBudgetInput): Promise<ValidateZeroBasedBudgetOutput> {
    // Get budget
    const budget = await this.budgetRepository.getBudgetById(input.budget_id);
    
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    // Validate zero-based
    const validation = validateZeroBasedBudget(budget);
    
    // Add suggested action based on difference
    let suggestedAction: string | undefined;
    
    if (validation.difference > 0) {
      suggestedAction = 'Allocate the extra money to a category or savings goal';
    } else if (validation.difference < 0) {
      suggestedAction = 'Reduce expenses or increase planned income';
    }
    
    return {
      ...validation,
      suggestedAction,
    };
  }
}

