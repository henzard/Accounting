// Use Case: Create Goal
// Business logic for creating a new savings goal

import { v4 as uuid } from 'uuid';
import { Goal, createGoal } from '@/domain/entities/Goal';
import { IGoalRepository } from '@/domain/repositories/IGoalRepository';

export interface CreateGoalInput {
  household_id: string;
  name: string;
  target_amount: number; // In cents
  target_date?: Date;
  linked_category_id?: string;
  color?: string;
  icon?: string;
}

export class CreateGoalUseCase {
  constructor(private goalRepository: IGoalRepository) {}
  
  async execute(input: CreateGoalInput): Promise<Goal> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Goal name is required');
    }
    
    if (input.target_amount <= 0) {
      throw new Error('Goal target amount must be greater than zero');
    }
    
    if (!input.household_id) {
      throw new Error('Household ID is required');
    }
    
    // Validate target date if provided
    if (input.target_date && input.target_date < new Date()) {
      throw new Error('Target date must be in the future');
    }
    
    // Create goal entity
    const goal = createGoal({
      id: uuid(),
      household_id: input.household_id,
      name: input.name.trim(),
      target_amount: input.target_amount,
      current_amount: 0,
      target_date: input.target_date,
      linked_category_id: input.linked_category_id,
      color: input.color,
      icon: input.icon,
    });
    
    // Save to repository
    await this.goalRepository.createGoal(goal);
    
    return goal;
  }
}
