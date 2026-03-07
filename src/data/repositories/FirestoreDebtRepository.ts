// Firestore Implementation of IDebtRepository

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Debt, DebtStatus } from '@/domain/entities';
import { IDebtRepository } from '@/domain/repositories';
import { db } from '@/infrastructure/firebase';

export class FirestoreDebtRepository implements IDebtRepository {
  private readonly COLLECTION = 'debts';

  async getDebtById(debtId: string): Promise<Debt | null> {
    
    try {
      const docRef = doc(db, this.COLLECTION, debtId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToDebt(docSnap.data());
    } catch (error) {
      console.error('Error getting debt:', error);
      throw error;
    }
  }

  async getDebtsByHousehold(
    householdId: string,
    status?: DebtStatus
  ): Promise<Debt[]> {

    try {
      let q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        orderBy('snowball_order', 'asc')
      );

      if (status) {
        q = query(
          collection(db, this.COLLECTION),
          where('household_id', '==', householdId),
          where('status', '==', status),
          orderBy('snowball_order', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.firestoreToDebt(doc.data()));
    } catch (error) {
      console.error('Error getting debts:', error);
      throw error;
    }
  }

  async getActiveDebts(householdId: string): Promise<Debt[]> {
    return this.getDebtsByHousehold(householdId, 'active');
  }

  async getDebtsInSnowballOrder(householdId: string): Promise<Debt[]> {
    const debts = await this.getActiveDebts(householdId);
    
    // Sort by snowball_order (already sorted by query, but double-check)
    return debts.sort((a, b) => a.snowball_order - b.snowball_order);
  }

  async getFocusDebt(householdId: string): Promise<Debt | null> {
    const debts = await this.getDebtsInSnowballOrder(householdId);
    const explicitFocusDebt = debts.find((debt) => debt.is_focus_debt);
    return explicitFocusDebt ?? debts[0] ?? null;
  }

  async createDebt(debt: Debt): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, debt.id);
      const firestoreData = this.debtToFirestore(debt);

      await setDoc(docRef, firestoreData);
      console.log(`✅ Debt ${debt.id} created`);
    } catch (error) {
      console.error('Error creating debt:', error);
      throw error;
    }
  }

  async updateDebt(debtId: string, updates: Partial<Debt>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, debtId);
      
      // Convert dates if present
      const firestoreUpdates: any = { ...updates };
      if (updates.paid_off_at) {
        firestoreUpdates.paid_off_at = Timestamp.fromDate(updates.paid_off_at);
      }
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }

      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ Debt ${debtId} updated`);
    } catch (error) {
      console.error('Error updating debt:', error);
      throw error;
    }
  }

  async updateDebtBalance(debtId: string, newBalance: number): Promise<void> {
    await this.updateDebt(debtId, {
      current_balance: newBalance,
      updated_at: new Date(),
    });
  }

  async markDebtPaidOff(debtId: string, paidOffBy?: string): Promise<void> {
    await this.updateDebt(debtId, {
      status: 'paid_off',
      paid_off_at: new Date(),
      current_balance: 0,
      is_focus_debt: false,
      updated_at: new Date(),
    });
    
    console.log(`🎉 Debt ${debtId} marked as paid off!`);
  }

  async recalculateSnowballOrder(householdId: string): Promise<void> {
    const debts = await this.getActiveDebts(householdId);
    
    // Sort by balance (Dave Ramsey's debt snowball: smallest first)
    const sortedDebts = debts.sort((a, b) => a.current_balance - b.current_balance);
    
    // Update snowball_order for each debt
    for (let i = 0; i < sortedDebts.length; i++) {
      const debt = sortedDebts[i];
      await this.updateDebt(debt.id, {
        snowball_order: i + 1,
        is_focus_debt: i === 0, // First debt is the focus debt
        updated_at: new Date(),
      });
    }
    
    console.log(`✅ Snowball order recalculated for ${sortedDebts.length} debts`);
  }

  async deleteDebt(debtId: string): Promise<void> {
    try {
      // Soft delete: mark as inactive instead of hard delete
      await this.updateDebt(debtId, {
        status: 'paid_off',
        updated_at: new Date(),
      });
      
      console.log(`✅ Debt ${debtId} soft deleted (marked paid_off)`);
    } catch (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private firestoreToDebt(data: any): Debt {
    return {
      id: data.id,
      household_id: data.household_id,
      name: data.name,
      type: data.type,
      account_id: data.account_id,
      original_balance: data.original_balance,
      current_balance: data.current_balance,
      minimum_payment: data.minimum_payment,
      interest_rate: data.interest_rate,
      snowball_order: data.snowball_order,
      is_focus_debt: data.is_focus_debt,
      is_mortgage: data.is_mortgage,
      status: data.status,
      paid_off_at: data.paid_off_at 
        ? (data.paid_off_at instanceof Timestamp ? data.paid_off_at.toDate() : new Date(data.paid_off_at))
        : undefined,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      created_by: data.created_by,
    };
  }

  private debtToFirestore(debt: Debt): any {
    return {
      id: debt.id,
      household_id: debt.household_id,
      name: debt.name,
      type: debt.type,
      account_id: debt.account_id || null,
      original_balance: debt.original_balance,
      current_balance: debt.current_balance,
      minimum_payment: debt.minimum_payment,
      interest_rate: debt.interest_rate,
      snowball_order: debt.snowball_order,
      is_focus_debt: debt.is_focus_debt,
      is_mortgage: debt.is_mortgage,
      status: debt.status,
      paid_off_at: debt.paid_off_at ? Timestamp.fromDate(debt.paid_off_at) : null,
      created_at: Timestamp.fromDate(debt.created_at),
      updated_at: Timestamp.fromDate(debt.updated_at),
      created_by: debt.created_by,
    };
  }
}

