// Domain Entity: Goal (Sinking Fund)
// Represents a savings goal for irregular expenses (Christmas, car repairs, vacation)

export type GoalStatus = 
  | 'ON_TRACK'    // Progress is on schedule
  | 'AHEAD'       // Ahead of schedule
  | 'BEHIND'      // Behind schedule
  | 'COMPLETED'   // Goal reached
  | 'ACTIVE';     // Active but no target date

export interface Goal {
  // Identity
  id: string;
  household_id: string;
  name: string;
  
  // Amounts (stored in cents)
  target_amount: number;
  current_amount: number;
  
  // Timeline
  target_date?: Date; // Optional target date
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  
  // Linked budget category (optional)
  linked_category_id?: string; // Auto-updates when transactions hit this category
  
  // Display
  color?: string;
  icon?: string;
  
  // Settings
  is_archived: boolean;
}

// Factory function to create a new Goal
export function createGoal(params: {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: Date;
  linked_category_id?: string;
  color?: string;
  icon?: string;
}): Goal {
  return {
    id: params.id,
    household_id: params.household_id,
    name: params.name,
    target_amount: params.target_amount,
    current_amount: params.current_amount || 0,
    target_date: params.target_date,
    linked_category_id: params.linked_category_id,
    color: params.color,
    icon: params.icon,
    is_archived: false,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// Helper: Calculate goal progress percentage
export function calculateGoalProgress(goal: Goal): number {
  if (goal.target_amount === 0) return 0;
  const progress = (goal.current_amount / goal.target_amount) * 100;
  return Math.min(Math.round(progress), 100);
}

// Helper: Calculate remaining amount
export function calculateRemainingAmount(goal: Goal): number {
  return Math.max(goal.target_amount - goal.current_amount, 0);
}

// Helper: Calculate days remaining until target date
export function calculateDaysRemaining(goal: Goal): number | null {
  if (!goal.target_date) return null;
  
  const now = new Date();
  const target = new Date(goal.target_date);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Helper: Determine goal status
export function getGoalStatus(goal: Goal): GoalStatus {
  // Check if completed
  if (goal.current_amount >= goal.target_amount) {
    return 'COMPLETED';
  }
  
  // If no target date, just mark as active
  if (!goal.target_date) {
    return 'ACTIVE';
  }
  
  const daysRemaining = calculateDaysRemaining(goal);
  if (daysRemaining === null) return 'ACTIVE';
  
  // Calculate expected progress based on time
  const now = new Date();
  const created = new Date(goal.created_at);
  const target = new Date(goal.target_date);
  
  const totalDuration = target.getTime() - created.getTime();
  const elapsedDuration = now.getTime() - created.getTime();
  
  if (totalDuration <= 0) return 'ACTIVE';
  
  const expectedProgress = (elapsedDuration / totalDuration) * 100;
  const actualProgress = calculateGoalProgress(goal);
  
  // Give 5% buffer for "on track"
  if (actualProgress >= expectedProgress - 5 && actualProgress <= expectedProgress + 5) {
    return 'ON_TRACK';
  } else if (actualProgress > expectedProgress + 5) {
    return 'AHEAD';
  } else {
    return 'BEHIND';
  }
}

// Helper: Check if goal is complete
export function isGoalComplete(goal: Goal): boolean {
  return goal.current_amount >= goal.target_amount;
}

// Helper: Format goal for display
export function getGoalDisplayInfo(goal: Goal) {
  const progress = calculateGoalProgress(goal);
  const remaining = calculateRemainingAmount(goal);
  const daysRemaining = calculateDaysRemaining(goal);
  const status = getGoalStatus(goal);
  
  return {
    progress,
    remaining,
    daysRemaining,
    status,
    isComplete: isGoalComplete(goal),
  };
}
