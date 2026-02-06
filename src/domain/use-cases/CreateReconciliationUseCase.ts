// Use Case: Create a new reconciliation session
import { IReconciliationRepository } from '../repositories/IReconciliationRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { IAccountRepository } from '../repositories/IAccountRepository';
import {
  createReconciliation,
  updateReconciliationDifference,
  Reconciliation,
} from '../entities/Reconciliation';
import { calculateClearedBalance } from '../entities/Transaction';

export interface CreateReconciliationParams {
  account_id: string;
  household_id: string;
  statement_date: Date;
  statement_balance: number; // In cents
  created_by: string;
}

export class CreateReconciliationUseCase {
  constructor(
    private reconciliationRepository: IReconciliationRepository,
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(params: CreateReconciliationParams): Promise<Reconciliation> {
    // 1. Validate account exists
    const account = await this.accountRepository.getAccountById(params.account_id);
    if (!account) {
      throw new Error('Account not found');
    }

    // 2. Check for existing in-progress reconciliation for this account
    const inProgressReconciliations = await this.reconciliationRepository.getInProgress(params.household_id);
    const existingForAccount = inProgressReconciliations.find(r => r.account_id === params.account_id);
    
    if (existingForAccount) {
      throw new Error('An in-progress reconciliation already exists for this account. Please complete or cancel it first.');
    }

    // 3. Create reconciliation entity
    const reconciliationId = `reconciliation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    let reconciliation = createReconciliation({
      id: reconciliationId,
      household_id: params.household_id,
      account_id: params.account_id,
      statement_date: params.statement_date,
      statement_balance: params.statement_balance,
      created_by: params.created_by,
    });

    // 4. Calculate current cleared balance
    const allTransactions = await this.transactionRepository.getTransactions({
      household_id: params.household_id,
      account_id: params.account_id,
    });
    const clearedBalance = calculateClearedBalance(allTransactions);

    // 5. Update reconciliation with difference
    reconciliation = updateReconciliationDifference(reconciliation, clearedBalance);

    // 6. Save to repository
    await this.reconciliationRepository.create(reconciliation);

    return reconciliation;
  }
}
