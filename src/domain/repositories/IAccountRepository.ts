// Repository Interface: Account
// Defines contract for account data access

import { Account } from '@/domain/entities';

export interface IAccountRepository {
  // Get all accounts for a household
  getAccountsByHousehold(householdId: string): Promise<Account[]>;
  
  // Get account by ID
  getAccountById(accountId: string): Promise<Account | null>;
  
  // Create new account
  createAccount(account: Account): Promise<void>;
  
  // Update account
  updateAccount(accountId: string, updates: Partial<Account>): Promise<void>;
  
  // Update account balance
  updateBalance(accountId: string, newBalance: number): Promise<void>;
  
  // Archive account (soft delete)
  archiveAccount(accountId: string): Promise<void>;
  
  // Get active accounts only
  getActiveAccounts(householdId: string): Promise<Account[]>;
}

