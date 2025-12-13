// Shared types for the application

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export type Currency = 'USD' | 'EUR' | 'GBP';

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

// Test export to verify path aliases work
export const APP_VERSION = '1.0.0';
export const PHASE = 'Phase 3 Complete - Data Layer Ready! 💾';

