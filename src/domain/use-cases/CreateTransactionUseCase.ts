// Use Case: Create Transaction
// Business logic for creating a new transaction

import { v4 as uuid } from 'uuid';
import { Transaction, createTransaction, TransactionType } from '@/domain/entities';
import { ITransactionRepository } from '@/domain/repositories';

export interface CreateTransactionInput {
  household_id: string;
  type: TransactionType;
  date: Date;
  amount: number; // In cents
  account_id: string;
  payee?: string;
  notes?: string;
  created_by: string;
  created_by_device: string;
}

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}
  
  async execute(input: CreateTransactionInput): Promise<Transaction> {
    // Validate input
    if (input.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero');
    }
    
    if (!input.household_id) {
      throw new Error('Household ID is required');
    }
    
    if (!input.account_id) {
      throw new Error('Account ID is required');
    }
    
    // Create transaction entity
    const transaction = createTransaction({
      id: uuid(),
      household_id: input.household_id,
      type: input.type,
      date: input.date,
      amount: input.amount,
      account_id: input.account_id,
      payee: input.payee,
      notes: input.notes,
      created_by: input.created_by,
      created_by_device: input.created_by_device,
    });
    
    // Save to repository (works offline, syncs when online)
    await this.transactionRepository.createTransaction(transaction);
    
    return transaction;
  }
}

