// Repository Interface: Transaction
// Defines contract for transaction data access

import { Transaction, TransactionType } from '@/domain/entities';

export interface TransactionFilters {
  household_id: string;
  account_id?: string;
  type?: TransactionType;
  start_date?: Date;
  end_date?: Date;
  is_business?: boolean;
  limit?: number;
}

export interface ITransactionRepository {
  // Get transactions with filters
  getTransactions(filters: TransactionFilters): Promise<Transaction[]>;
  
  // Get transaction by ID
  getTransactionById(transactionId: string): Promise<Transaction | null>;
  
  // Get recent transactions
  getRecentTransactions(householdId: string, limit: number): Promise<Transaction[]>;
  
  // Create new transaction
  createTransaction(transaction: Transaction): Promise<void>;
  
  // Update transaction
  updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void>;
  
  // Delete transaction (soft delete - set status)
  deleteTransaction(transactionId: string): Promise<void>;
  
  // Get transactions for a budget period
  getTransactionsByBudgetPeriod(
    householdId: string,
    month: number,
    year: number
  ): Promise<Transaction[]>;
  
  // Get unclaimed business expenses
  getUnclaimedBusinessExpenses(householdId: string): Promise<Transaction[]>;
  
  // Listen to real-time transaction updates
  subscribeToTransactions(
    householdId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void; // Returns unsubscribe function
}

