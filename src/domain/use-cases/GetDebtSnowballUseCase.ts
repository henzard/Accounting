// Use Case: Get Debt Snowball
// Retrieves debts in snowball order with payoff calculations

import { Debt, calculateDebtSnowball, calculatePayoffMonths } from '@/domain/entities';
import { IDebtRepository } from '@/domain/repositories';

export interface DebtPayoffPlan {
  debts: Debt[];
  focus_debt_id?: string;
  total_debt: number;
  total_minimum_payments: number;
  debt_free_date?: Date;
}

export class GetDebtSnowballUseCase {
  constructor(private debtRepository: IDebtRepository) {}
  
  async execute(household_id: string): Promise<DebtPayoffPlan> {
    // Validate input
    if (!household_id) {
      throw new Error('Household ID is required');
    }
    
    // Get all active debts
    const allDebts = await this.debtRepository.getActiveDebts(household_id);
    
    if (allDebts.length === 0) {
      return {
        debts: [],
        total_debt: 0,
        total_minimum_payments: 0,
      };
    }
    
    // Calculate snowball order
    const orderedDebts = calculateDebtSnowball(allDebts);
    
    // Calculate totals
    const total_debt = orderedDebts.reduce((sum, d) => sum + d.current_balance, 0);
    const total_minimum_payments = orderedDebts.reduce((sum, d) => sum + d.minimum_payment, 0);
    
    // Get focus debt
    const focus_debt = orderedDebts.find(d => d.is_focus_debt);
    
    // Calculate debt-free date (simplified - assumes no extra payments)
    let debt_free_date: Date | undefined;
    if (orderedDebts.length > 0) {
      const totalMonths = orderedDebts.reduce((months, debt) => {
        return months + calculatePayoffMonths(
          debt.current_balance,
          debt.minimum_payment,
          debt.interest_rate
        );
      }, 0);
      
      debt_free_date = new Date();
      debt_free_date.setMonth(debt_free_date.getMonth() + totalMonths);
    }
    
    return {
      debts: orderedDebts,
      focus_debt_id: focus_debt?.id,
      total_debt,
      total_minimum_payments,
      debt_free_date,
    };
  }
}

