// Firestore Implementation of IAccountRepository

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { Account } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { db } from '@/infrastructure/firebase';

export class FirestoreAccountRepository implements IAccountRepository {
  private readonly COLLECTION = 'accounts';

  async getAccountById(accountId: string): Promise<Account | null> {
    try {
      const docRef = doc(db, this.COLLECTION, accountId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToAccount(docSnap.data());
    } catch (error) {
      console.error('Error getting account:', error);
      throw error;
    }
  }

  async getAccountsByHousehold(householdId: string): Promise<Account[]> {
    try {
      // Simplified query: Only filter by household_id and is_active
      // Remove orderBy to avoid needing a composite index
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        where('is_active', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      // Sort in memory instead of using Firestore orderBy
      const accounts = querySnapshot.docs.map(doc => this.firestoreToAccount(doc.data()));
      return accounts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  async getBudgetAccounts(householdId: string): Promise<Account[]> {
    try {
      // Simplified query: Only filter by household_id, is_in_budget, and is_active
      // Remove orderBy to avoid needing a composite index
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        where('is_in_budget', '==', true),
        where('is_active', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      // Sort in memory instead of using Firestore orderBy
      const accounts = querySnapshot.docs.map(doc => this.firestoreToAccount(doc.data()));
      return accounts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting budget accounts:', error);
      throw error;
    }
  }

  async createAccount(account: Account): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, account.id);
      const firestoreData = this.accountToFirestore(account);

      await setDoc(docRef, firestoreData);
      console.log(`✅ Account ${account.id} created`);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async updateAccount(accountId: string, updates: Partial<Account>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, accountId);
      
      // Convert dates if present
      const firestoreUpdates: any = { ...updates };
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }

      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ Account ${accountId} updated`);
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    await this.updateAccount(accountId, {
      balance: newBalance,
      updated_at: new Date(),
    });
    
    console.log(`✅ Account ${accountId} balance updated to ${newBalance / 100}`);
  }

  async archiveAccount(accountId: string): Promise<void> {
    await this.updateAccount(accountId, {
      is_active: false,
      updated_at: new Date(),
    });
    
    console.log(`✅ Account ${accountId} archived`);
  }

  async deleteAccount(accountId: string): Promise<void> {
    // Soft delete by archiving
    await this.archiveAccount(accountId);
  }

  async getActiveAccounts(householdId: string): Promise<Account[]> {
    // Same as getAccountsByHousehold since it already filters by is_active
    return this.getAccountsByHousehold(householdId);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private firestoreToAccount(data: any): Account {
    return {
      id: data.id,
      household_id: data.household_id,
      name: data.name,
      type: data.type,
      balance: data.balance,
      currency: data.currency,
      is_in_budget: data.is_in_budget,
      is_active: data.is_active,
      color: data.color,
      icon: data.icon,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      created_by: data.created_by,
    };
  }

  private accountToFirestore(account: Account): any {
    return {
      id: account.id,
      household_id: account.household_id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      is_in_budget: account.is_in_budget,
      is_active: account.is_active,
      color: account.color || null,
      icon: account.icon || null,
      created_at: Timestamp.fromDate(account.created_at),
      updated_at: Timestamp.fromDate(account.updated_at),
      created_by: account.created_by,
    };
  }
}

