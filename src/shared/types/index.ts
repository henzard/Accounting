// Shared types for the application

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export type Currency = 'USD' | 'EUR' | 'GBP';

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

// SelectOption for dropdowns/selects
// IMPORTANT: Define here to prevent circular dependencies
// Constants (currencies, timezones) import this, NOT from presentation layer
export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

// Test export to verify path aliases work
export const APP_VERSION = '1.0.0';
export const PHASE = 'Phase 5.3 - Baby Steps! 👶';

