// Repository Interface: Transaction
// Defines the transaction access contract used by the app

import { Transaction } from '@/domain/entities';

export interface ITransactionRepository {
  // Read
  getTransactionsByHousehold(householdId: string, limitCount?: number): Promise<Transaction[]>;
  getTransaction(transactionId: string): Promise<Transaction | null>;
  getTransactionById(transactionId: string): Promise<Transaction | null>;

  // Write
  createTransaction(transaction: Transaction): Promise<void>;
  updateTransaction(transaction: Transaction): Promise<void>;
  deleteTransaction(transactionId: string): Promise<void>;

  // Realtime
  subscribeToTransactions(
    householdId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void;
}

