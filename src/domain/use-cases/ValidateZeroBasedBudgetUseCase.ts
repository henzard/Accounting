// Use Case: Validate Zero-Based Budget
// Checks if a budget follows Dave Ramsey's zero-based budgeting principle

import { calculateRemainingToBudget, isZeroBasedBudget } from '@/domain/entities';
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
    const difference = calculateRemainingToBudget(budget);
    const zeroBased = isZeroBasedBudget(budget);
    const message = zeroBased
      ? 'Budget is zero-based. Every dollar has a job.'
      : difference > 0
      ? 'You still have money left to assign.'
      : 'Your planned spending exceeds planned income.';
    
    // Add suggested action based on difference
    let suggestedAction: string | undefined;
    
    if (difference > 0) {
      suggestedAction = 'Allocate the extra money to a category or savings goal';
    } else if (difference < 0) {
      suggestedAction = 'Reduce expenses or increase planned income';
    }
    
    return {
      isZeroBased: zeroBased,
      difference,
      message,
      suggestedAction,
    };
  }
}

