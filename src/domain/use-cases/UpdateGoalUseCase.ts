// Use Case: Update Goal
// Business logic for updating an existing goal

import { Goal } from '@/domain/entities/Goal';
import { IGoalRepository } from '@/domain/repositories/IGoalRepository';

export interface UpdateGoalInput {
  goal_id: string;
  name?: string;
  target_amount?: number; // In cents
  target_date?: Date | null;
  linked_category_id?: string | null;
  color?: string;
  icon?: string;
}

export class UpdateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}
  
  async execute(input: UpdateGoalInput): Promise<void> {
    // Validate input
    if (!input.goal_id) {
      throw new Error('Goal ID is required');
    }
    
    // Get existing goal
    const existingGoal = await this.goalRepository.getGoalById(input.goal_id);
    if (!existingGoal) {
      throw new Error('Goal not found');
    }
    
    // Validate updates
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error('Goal name cannot be empty');
    }
    
    if (input.target_amount !== undefined && input.target_amount <= 0) {
      throw new Error('Goal target amount must be greater than zero');
    }
    
    if (input.target_date && input.target_date < new Date()) {
      throw new Error('Target date must be in the future');
    }
    
    // Prepare updates
    const updates: Partial<Goal> = {
      updated_at: new Date(),
    };
    
    if (input.name !== undefined) {
      updates.name = input.name.trim();
    }
    if (input.target_amount !== undefined) {
      updates.target_amount = input.target_amount;
    }
    if (input.target_date !== undefined) {
      updates.target_date = input.target_date || undefined;
    }
    if (input.linked_category_id !== undefined) {
      updates.linked_category_id = input.linked_category_id || undefined;
    }
    if (input.color !== undefined) {
      updates.color = input.color;
    }
    if (input.icon !== undefined) {
      updates.icon = input.icon;
    }
    
    // Save updates
    await this.goalRepository.updateGoal(input.goal_id, updates);
  }
}
