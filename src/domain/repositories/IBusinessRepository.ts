// Repository Interface: Business
// Defines contract for business data access

import { Business } from '@/domain/entities';

export interface IBusinessRepository {
  // Get all businesses for a household
  getBusinessesByHousehold(householdId: string): Promise<Business[]>;
  
  // Get business by ID
  getBusinessById(businessId: string): Promise<Business | null>;
  
  // Create new business
  createBusiness(business: Business): Promise<void>;
  
  // Update business
  updateBusiness(businessId: string, updates: Partial<Business>): Promise<void>;
  
  // Delete business
  deleteBusiness(businessId: string): Promise<void>;
}
