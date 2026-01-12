// Repository Interface: ReimbursementClaim
// Defines contract for reimbursement claim data access

import { ReimbursementClaim } from '@/domain/entities';

export interface IReimbursementClaimRepository {
  // Get all claims for a household
  getClaimsByHousehold(householdId: string): Promise<ReimbursementClaim[]>;
  
  // Get claims by business
  getClaimsByBusiness(householdId: string, businessId: string): Promise<ReimbursementClaim[]>;
  
  // Get claim by ID
  getClaimById(claimId: string): Promise<ReimbursementClaim | null>;
  
  // Create new claim
  createClaim(claim: ReimbursementClaim): Promise<void>;
  
  // Update claim
  updateClaim(claimId: string, updates: Partial<ReimbursementClaim>): Promise<void>;
  
  // Delete claim
  deleteClaim(claimId: string): Promise<void>;
  
  // Calculate total amount from transactions
  calculateClaimTotal(transactionIds: string[]): Promise<number>;
}
