// Domain Repository Interface: Reconciliation
import { Reconciliation } from '../entities/Reconciliation';

export interface IReconciliationRepository {
  // Create a new reconciliation session
  create(reconciliation: Reconciliation): Promise<void>;
  
  // Update an existing reconciliation
  update(reconciliation: Reconciliation): Promise<void>;
  
  // Get a specific reconciliation by ID
  getById(reconciliationId: string): Promise<Reconciliation | null>;
  
  // Get all reconciliations for an account (sorted by date desc)
  getByAccount(accountId: string): Promise<Reconciliation[]>;
  
  // Get the most recent reconciliation for an account
  getMostRecent(accountId: string): Promise<Reconciliation | null>;
  
  // Get all in-progress reconciliations for a household
  getInProgress(householdId: string): Promise<Reconciliation[]>;
  
  // Delete a reconciliation (use with caution)
  delete(reconciliationId: string): Promise<void>;
}
