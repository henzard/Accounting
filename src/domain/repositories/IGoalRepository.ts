// Repository Interface: Goal
// Defines contract for goal data access

import { Goal } from '@/domain/entities/Goal';

export interface IGoalRepository {
  // Get all goals for a household
  getGoalsByHousehold(householdId: string): Promise<Goal[]>;
  
  // Get active (non-archived) goals only
  getActiveGoals(householdId: string): Promise<Goal[]>;
  
  // Get goal by ID
  getGoalById(goalId: string): Promise<Goal | null>;
  
  // Create new goal
  createGoal(goal: Goal): Promise<void>;
  
  // Update goal
  updateGoal(goalId: string, updates: Partial<Goal>): Promise<void>;
  
  // Update goal progress (current_amount)
  updateGoalProgress(goalId: string, newAmount: number): Promise<void>;
  
  // Archive goal (soft delete)
  archiveGoal(goalId: string): Promise<void>;
  
  // Get goals linked to a specific category
  getGoalsByCategory(categoryId: string): Promise<Goal[]>;
}
