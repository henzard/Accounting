// Repository Interface: User
// Defines contract for user data access

import { User } from '@/domain/entities';

export interface IUserRepository {
  // Get current authenticated user
  getCurrentUser(): Promise<User | null>;
  
  // Get user by ID
  getUserById(userId: string): Promise<User | null>;
  
  // Update user profile
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  
  // Create new user
  createUser(user: User): Promise<void>;
  
  // Add household to user's household list
  addHouseholdToUser(userId: string, householdId: string): Promise<void>;
}

