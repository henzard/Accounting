// Use Case: Complete a reconciliation session
import { IReconciliationRepository } from '../repositories/IReconciliationRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import {
  completeReconciliation,
  isReconciliationBalanced,
  Reconciliation,
} from '../entities/Reconciliation';
import { Transaction } from '../entities/Transaction';

export interface CompleteReconciliationParams {
  reconciliation_id: string;
  user_id: string;
}

export class CompleteReconciliationUseCase {
  constructor(
    private reconciliationRepository: IReconciliationRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(params: CompleteReconciliationParams): Promise<Reconciliation> {
    // 1. Get reconciliation
    const reconciliation = await this.reconciliationRepository.getById(params.reconciliation_id);
    
    if (!reconciliation) {
      throw new Error('Reconciliation not found');
    }

    if (reconciliation.status !== 'in_progress') {
      throw new Error('Can only complete in-progress reconciliations');
    }

    // 2. Check if balanced
    if (!isReconciliationBalanced(reconciliation)) {
      throw new Error(
        `Cannot complete reconciliation with a difference of ${reconciliation.difference / 100}. ` +
        'Please resolve the difference first by marking transactions as cleared or adjusting the statement balance.'
      );
    }

    // 3. Get all cleared transactions for this account
    const clearedTransactions = await this.transactionRepository.getClearedTransactions(reconciliation.account_id);

    // 4. Mark all cleared transactions as reconciled
    await this.markTransactionsAsReconciled(
      clearedTransactions,
      reconciliation.id,
      params.user_id
    );

    // 5. Complete the reconciliation
    const completedReconciliation = completeReconciliation(
      reconciliation,
      params.user_id,
      clearedTransactions.length
    );

    await this.reconciliationRepository.update(completedReconciliation);

    return completedReconciliation;
  }

  private async markTransactionsAsReconciled(
    transactions: Transaction[],
    reconciliationId: string,
    userId: string
  ): Promise<void> {
    const updates = transactions.map((txn) => {
      return this.transactionRepository.update({
        ...txn,
        reconciled_at: new Date(),
        reconciled_by: userId,
      });
    });

    await Promise.all(updates);
  }
}
