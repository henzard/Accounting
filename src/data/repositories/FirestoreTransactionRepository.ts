// Firestore Implementation of ITransactionRepository
// Handles offline-first transaction storage with Firebase sync

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
  limit,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { Transaction } from '@/domain/entities';
import { ITransactionRepository } from '@/domain/repositories';
import { db } from '@/infrastructure/firebase';

/**
 * Firestore Transaction Repository
 * 
 * Collection: households/{householdId}/transactions/{transactionId}
 * 
 * Offline-first: All operations work offline and sync when online
 */
export class FirestoreTransactionRepository implements ITransactionRepository {
  private readonly COLLECTION = 'transactions';

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return this.getTransaction(transactionId);
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    
    try {
      // Note: We need householdId to construct the path
      // For now, query the root collection (we'll optimize this later)
      const docRef = doc(db, this.COLLECTION, transactionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToTransaction(docSnap.data());
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transactions with filters
   * Works offline - returns cached data if no connection
   */
  async getTransactions(filters: {
    household_id: string;
    account_id?: string;
    type?: string;
    start_date?: Date;
    end_date?: Date;
    is_business?: boolean;
    limit?: number;
  }): Promise<Transaction[]> {
    try {
      const constraints = [
        where('household_id', '==', filters.household_id),
      ];

      if (filters.account_id) {
        constraints.push(where('account_id', '==', filters.account_id));
      }

      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters.is_business !== undefined) {
        constraints.push(where('is_business', '==', filters.is_business));
      }

      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(collection(db, this.COLLECTION), ...constraints);

      const querySnapshot = await getDocs(q);
      
      let transactions = querySnapshot.docs.map(doc => 
        this.firestoreToTransaction(doc.data())
      );

      // Filter by date range in memory (to avoid composite index)
      if (filters.start_date) {
        transactions = transactions.filter(t => t.date >= filters.start_date!);
      }
      if (filters.end_date) {
        transactions = transactions.filter(t => t.date <= filters.end_date!);
      }

      // Sort in-memory by date (desc)
      return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a household
   * Works offline - returns cached data if no connection
   */
  async getTransactionsByHousehold(
    householdId: string,
    limitCount: number = 100
  ): Promise<Transaction[]> {
    return this.getTransactions({
      household_id: householdId,
      limit: limitCount,
    });
  }

  /**
   * Get recent transactions for a household
   */
  async getRecentTransactions(householdId: string, limitCount: number): Promise<Transaction[]> {
    return this.getTransactions({
      household_id: householdId,
      limit: limitCount,
    });
  }

  /**
   * Get transactions for a budget period (month/year)
   */
  async getTransactionsByBudgetPeriod(
    householdId: string,
    month: number,
    year: number
  ): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.getTransactions({
      household_id: householdId,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get unclaimed business expenses for a household
   */
  async getUnclaimedBusinessExpenses(householdId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        where('is_business', '==', true),
        where('reimbursement_claim_id', '==', null)
      );

      const querySnapshot = await getDocs(q);
      
      const transactions = querySnapshot.docs.map(doc => 
        this.firestoreToTransaction(doc.data())
      );

      // Sort by date (desc)
      return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error getting unclaimed business expenses:', error);
      throw error;
    }
  }

  /**
   * Create a new transaction
   * Works offline - queues for sync when online
   */
  async createTransaction(transaction: Transaction): Promise<void> {

    try {
      const docRef = doc(db, this.COLLECTION, transaction.id);
      const firestoreData = this.transactionToFirestore(transaction);

      // setDoc works offline - will sync when online
      await setDoc(docRef, firestoreData);
      
      console.log(`✅ Transaction ${transaction.id} saved (will sync when online)`);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update an existing transaction
   * Works offline - queues for sync when online
   */
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, transactionId);
      
      // Convert partial updates to Firestore format
      const firestoreUpdates: any = {
        updated_at: Timestamp.now(),
      };

      // Convert specific fields that need Timestamp conversion
      if (updates.date) {
        firestoreUpdates.date = Timestamp.fromDate(updates.date);
      }
      if (updates.cleared_date) {
        firestoreUpdates.cleared_date = Timestamp.fromDate(updates.cleared_date);
      }
      if (updates.reconciled_at) {
        firestoreUpdates.reconciled_at = Timestamp.fromDate(updates.reconciled_at);
      }
      if (updates.captured_at) {
        firestoreUpdates.captured_at = Timestamp.fromDate(updates.captured_at);
      }

      // Copy other fields directly
      Object.keys(updates).forEach(key => {
        if (!['date', 'cleared_date', 'reconciled_at', 'captured_at', 'updated_at', 'created_at'].includes(key)) {
          firestoreUpdates[key] = (updates as any)[key];
        }
      });

      await updateDoc(docRef, firestoreUpdates);
      
      console.log(`✅ Transaction ${transactionId} updated (will sync when online)`);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Delete a transaction
   * Works offline - queues for sync when online
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, transactionId);
      await deleteDoc(docRef);
      
      console.log(`✅ Transaction ${transactionId} deleted (will sync when online)`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time transaction updates
   * Updates automatically when online
   */
  subscribeToTransactions(
    householdId: string,
    callback: (transactions: Transaction[]) => void
  ): Unsubscribe {

    // Note: Removed orderBy to avoid composite index requirement
    // Sorting in-memory instead
    const q = query(
      collection(db, this.COLLECTION),
      where('household_id', '==', householdId)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc =>
        this.firestoreToTransaction(doc.data())
      );
      
      // Sort in-memory by date (desc)
      const sortedTransactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      callback(sortedTransactions);
    }, (error) => {
      console.error('Error in transaction subscription:', error);
    });
  }

  /**
   * Mark transaction as cleared
   */
  async markTransactionCleared(transactionId: string, clearedDate?: Date): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, transactionId);
      
      await updateDoc(docRef, {
        status: 'cleared',
        cleared_date: clearedDate ? Timestamp.fromDate(clearedDate) : Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      
      console.log(`✅ Transaction ${transactionId} marked as cleared`);
    } catch (error) {
      console.error('Error marking transaction as cleared:', error);
      throw error;
    }
  }

  /**
   * Mark transaction as pending (uncleared)
   */
  async markTransactionPending(transactionId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, transactionId);
      
      await updateDoc(docRef, {
        status: 'pending',
        cleared_date: null,
        updated_at: Timestamp.now(),
      });
      
      console.log(`✅ Transaction ${transactionId} marked as pending`);
    } catch (error) {
      console.error('Error marking transaction as pending:', error);
      throw error;
    }
  }

  /**
   * Get uncleared transactions for an account
   */
  async getUnclearedTransactions(accountId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('account_id', '==', accountId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      
      const transactions = querySnapshot.docs.map(doc => 
        this.firestoreToTransaction(doc.data())
      );

      // Sort by date (oldest first for reconciliation)
      return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error getting uncleared transactions:', error);
      throw error;
    }
  }

  /**
   * Get cleared transactions for an account
   */
  async getClearedTransactions(accountId: string): Promise<Transaction[]> {
    try {
      // Query for both 'cleared' and 'reconciled' status
      const q = query(
        collection(db, this.COLLECTION),
        where('account_id', '==', accountId),
        where('status', 'in', ['cleared', 'reconciled'])
      );

      const querySnapshot = await getDocs(q);
      
      const transactions = querySnapshot.docs.map(doc => 
        this.firestoreToTransaction(doc.data())
      );

      // Sort by date (desc)
      return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error getting cleared transactions:', error);
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS: Firestore ↔ Domain Entity
  // ============================================

  /**
   * Convert Firestore document to Transaction entity
   */
  private firestoreToTransaction(data: any): Transaction {
    return {
      id: data.id,
      household_id: data.household_id,
      type: data.type,
      date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
      amount: data.amount,
      currency: data.currency,
      account_id: data.account_id,
      payee: data.payee,
      payer: data.payer,
      category_id: data.category_id,
      to_account_id: data.to_account_id,
      notes: data.notes,
      reference: data.reference,
      status: data.status,
      cleared_date: data.cleared_date 
        ? (data.cleared_date instanceof Timestamp ? data.cleared_date.toDate() : new Date(data.cleared_date))
        : undefined,
      reconciled_at: data.reconciled_at 
        ? (data.reconciled_at instanceof Timestamp ? data.reconciled_at.toDate() : new Date(data.reconciled_at))
        : undefined,
      reconciled_by: data.reconciled_by,
      is_business: data.is_business,
      business_id: data.business_id,
      reimbursement_type: data.reimbursement_type,
      reimbursement_target: data.reimbursement_target,
      reimbursement_claim_id: data.reimbursement_claim_id,
      has_receipt: data.has_receipt,
      receipt_count: data.receipt_count,
      receipt_urls: data.receipt_urls || undefined,
      captured_at: data.captured_at instanceof Timestamp ? data.captured_at.toDate() : new Date(data.captured_at),
      capture_delay_days: data.capture_delay_days,
      created_by_device: data.created_by_device,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      created_by: data.created_by,
    };
  }

  /**
   * Convert Transaction entity to Firestore document
   */
  private transactionToFirestore(transaction: Transaction): any {
    return {
      id: transaction.id,
      household_id: transaction.household_id,
      type: transaction.type,
      date: Timestamp.fromDate(transaction.date),
      amount: transaction.amount,
      currency: transaction.currency,
      account_id: transaction.account_id,
      payee: transaction.payee || null,
      payer: transaction.payer || null,
      category_id: transaction.category_id || null,
      to_account_id: transaction.to_account_id || null,
      notes: transaction.notes || null,
      reference: transaction.reference || null,
      status: transaction.status,
      cleared_date: transaction.cleared_date 
        ? Timestamp.fromDate(transaction.cleared_date) 
        : null,
      reconciled_at: transaction.reconciled_at 
        ? Timestamp.fromDate(transaction.reconciled_at) 
        : null,
      reconciled_by: transaction.reconciled_by || null,
      is_business: transaction.is_business,
      business_id: transaction.business_id || null,
      reimbursement_type: transaction.reimbursement_type || null,
      reimbursement_target: transaction.reimbursement_target || null,
      reimbursement_claim_id: transaction.reimbursement_claim_id || null,
      has_receipt: transaction.has_receipt,
      receipt_count: transaction.receipt_count,
      receipt_urls: transaction.receipt_urls || null,
      captured_at: Timestamp.fromDate(transaction.captured_at),
      capture_delay_days: transaction.capture_delay_days,
      created_by_device: transaction.created_by_device,
      created_at: Timestamp.fromDate(transaction.created_at),
      updated_at: Timestamp.fromDate(transaction.updated_at),
      created_by: transaction.created_by,
    };
  }
}

