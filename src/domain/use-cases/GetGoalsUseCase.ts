// Use Case: Get Goals
// Business logic for retrieving goals for a household

import { Goal } from '@/domain/entities/Goal';
import { IGoalRepository } from '@/domain/repositories/IGoalRepository';

export interface GetGoalsInput {
  household_id: string;
  include_archived?: boolean;
}

export class GetGoalsUseCase {
  constructor(private goalRepository: IGoalRepository) {}
  
  async execute(input: GetGoalsInput): Promise<Goal[]> {
    // Validate input
    if (!input.household_id) {
      throw new Error('Household ID is required');
    }
    
    // Get goals based on filter
    if (input.include_archived) {
      return await this.goalRepository.getGoalsByHousehold(input.household_id);
    } else {
      return await this.goalRepository.getActiveGoals(input.household_id);
    }
  }
}
