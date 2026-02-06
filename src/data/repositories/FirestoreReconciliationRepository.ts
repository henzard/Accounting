// Data Layer: Firestore Implementation of IReconciliationRepository
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { IReconciliationRepository } from '@/domain/repositories/IReconciliationRepository';
import { Reconciliation } from '@/domain/entities/Reconciliation';

export class FirestoreReconciliationRepository implements IReconciliationRepository {
  private readonly collectionName = 'reconciliations';

  async create(reconciliation: Reconciliation): Promise<void> {
    const docRef = doc(db, this.collectionName, reconciliation.id);
    await setDoc(docRef, this.reconciliationToFirestore(reconciliation));
  }

  async update(reconciliation: Reconciliation): Promise<void> {
    const docRef = doc(db, this.collectionName, reconciliation.id);
    await setDoc(docRef, this.reconciliationToFirestore(reconciliation), { merge: true });
  }

  async getById(reconciliationId: string): Promise<Reconciliation | null> {
    const docRef = doc(db, this.collectionName, reconciliationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.firestoreToReconciliation(docSnap.data());
  }

  async getByAccount(accountId: string): Promise<Reconciliation[]> {
    const q = query(
      collection(db, this.collectionName),
      where('account_id', '==', accountId),
      orderBy('statement_date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.firestoreToReconciliation(doc.data()));
  }

  async getMostRecent(accountId: string): Promise<Reconciliation | null> {
    const q = query(
      collection(db, this.collectionName),
      where('account_id', '==', accountId),
      where('status', '==', 'completed'),
      orderBy('reconciled_date', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    return this.firestoreToReconciliation(querySnapshot.docs[0].data());
  }

  async getInProgress(householdId: string): Promise<Reconciliation[]> {
    // Query without orderBy to avoid needing composite index
    const q = query(
      collection(db, this.collectionName),
      where('household_id', '==', householdId),
      where('status', '==', 'in_progress')
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => this.firestoreToReconciliation(doc.data()));
    
    // Sort in memory
    return results.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async delete(reconciliationId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, reconciliationId);
    await deleteDoc(docRef);
  }

  // HELPER METHODS: Firestore ↔ Domain Entity

  private firestoreToReconciliation(data: any): Reconciliation {
    return {
      id: data.id,
      household_id: data.household_id,
      account_id: data.account_id,
      statement_date: data.statement_date instanceof Timestamp
        ? data.statement_date.toDate()
        : new Date(data.statement_date),
      statement_balance: data.statement_balance,
      status: data.status,
      reconciled_date: data.reconciled_date
        ? (data.reconciled_date instanceof Timestamp
            ? data.reconciled_date.toDate()
            : new Date(data.reconciled_date))
        : undefined,
      reconciled_by: data.reconciled_by,
      difference: data.difference,
      cleared_transaction_count: data.cleared_transaction_count,
      created_at: data.created_at instanceof Timestamp
        ? data.created_at.toDate()
        : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp
        ? data.updated_at.toDate()
        : new Date(data.updated_at),
      created_by: data.created_by,
    };
  }

  private reconciliationToFirestore(reconciliation: Reconciliation): any {
    return {
      id: reconciliation.id,
      household_id: reconciliation.household_id,
      account_id: reconciliation.account_id,
      statement_date: Timestamp.fromDate(reconciliation.statement_date),
      statement_balance: reconciliation.statement_balance,
      status: reconciliation.status,
      reconciled_date: reconciliation.reconciled_date
        ? Timestamp.fromDate(reconciliation.reconciled_date)
        : null,
      reconciled_by: reconciliation.reconciled_by || null,
      difference: reconciliation.difference,
      cleared_transaction_count: reconciliation.cleared_transaction_count,
      created_at: Timestamp.fromDate(reconciliation.created_at),
      updated_at: Timestamp.fromDate(reconciliation.updated_at),
      created_by: reconciliation.created_by,
    };
  }
}
