// Use Case: Add to Goal
// Business logic for adding money to a goal (manual contribution)

import { IGoalRepository } from '@/domain/repositories/IGoalRepository';

export interface AddToGoalInput {
  goal_id: string;
  amount: number; // Amount to add, in cents
}

export class AddToGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}
  
  async execute(input: AddToGoalInput): Promise<void> {
    // Validate input
    if (!input.goal_id) {
      throw new Error('Goal ID is required');
    }
    
    if (input.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    
    // Get existing goal
    const goal = await this.goalRepository.getGoalById(input.goal_id);
    if (!goal) {
      throw new Error('Goal not found');
    }
    
    if (goal.is_archived) {
      throw new Error('Cannot add to archived goal');
    }
    
    // Calculate new amount
    const newAmount = goal.current_amount + input.amount;
    
    // Update goal progress
    await this.goalRepository.updateGoalProgress(input.goal_id, newAmount);
  }
}
