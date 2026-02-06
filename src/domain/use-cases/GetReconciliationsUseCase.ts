// Use Case: Get reconciliations for an account
import { IReconciliationRepository } from '../repositories/IReconciliationRepository';
import { Reconciliation } from '../entities/Reconciliation';

export class GetReconciliationsUseCase {
  constructor(private reconciliationRepository: IReconciliationRepository) {}

  async execute(accountId: string): Promise<Reconciliation[]> {
    return await this.reconciliationRepository.getByAccount(accountId);
  }

  async getMostRecent(accountId: string): Promise<Reconciliation | null> {
    return await this.reconciliationRepository.getMostRecent(accountId);
  }

  async getInProgress(householdId: string): Promise<Reconciliation[]> {
    return await this.reconciliationRepository.getInProgress(householdId);
  }
}
