// Repository Interface: Debt
// Defines contract for debt data access

import { Debt, DebtStatus } from '@/domain/entities';

export interface IDebtRepository {
  // Get all debts for a household
  getDebtsByHousehold(householdId: string): Promise<Debt[]>;
  
  // Get active debts (not paid off)
  getActiveDebts(householdId: string): Promise<Debt[]>;
  
  // Get debts in snowball order
  getDebtsInSnowballOrder(householdId: string): Promise<Debt[]>;
  
  // Get focus debt (current target)
  getFocusDebt(householdId: string): Promise<Debt | null>;
  
  // Get debt by ID
  getDebtById(debtId: string): Promise<Debt | null>;
  
  // Create new debt
  createDebt(debt: Debt): Promise<void>;
  
  // Update debt
  updateDebt(debtId: string, updates: Partial<Debt>): Promise<void>;
  
  // Update debt balance
  updateDebtBalance(debtId: string, newBalance: number): Promise<void>;
  
  // Mark debt as paid off
  markDebtPaidOff(debtId: string): Promise<void>;
  
  // Recalculate snowball order for all debts
  recalculateSnowballOrder(householdId: string): Promise<void>;
}

