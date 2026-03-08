// Repository Interface: Household
// Defines contract for household data access

import { Household, BabyStep } from '@/domain/entities';

export interface IHouseholdRepository {
  // Get household by ID
  getHouseholdById(householdId: string): Promise<Household | null>;
  
  // Get all households for a user
  getHouseholdsForUser(userId: string): Promise<Household[]>;
  
  // Create new household
  createHousehold(household: Household): Promise<void>;
  
  // Update household
  updateHousehold(householdId: string, updates: Partial<Household>): Promise<void>;
  
  // Update Baby Step
  updateBabyStep(householdId: string, babyStep: BabyStep): Promise<void>;
  
  // Add member to household
  addMember(householdId: string, userId: string): Promise<void>;
  
  // Remove member from household
  removeMember(householdId: string, userId: string): Promise<void>;
}

