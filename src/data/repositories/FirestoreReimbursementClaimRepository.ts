// Firestore Repository: ReimbursementClaim
// Implements IReimbursementClaimRepository using Firestore

import { IReimbursementClaimRepository } from '@/domain/repositories/IReimbursementClaimRepository';
import { ReimbursementClaim } from '@/domain/entities';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { FirestoreTransactionRepository } from './FirestoreTransactionRepository';

export class FirestoreReimbursementClaimRepository implements IReimbursementClaimRepository {
  private readonly COLLECTION = 'reimbursement_claims';
  private transactionRepo = new FirestoreTransactionRepository();

  async getClaimsByHousehold(householdId: string): Promise<ReimbursementClaim[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('household_id', '==', householdId)
    );

    const snapshot = await getDocs(q);
    const claims = snapshot.docs.map((doc) => this.firestoreToClaim(doc.id, doc.data()));
    
    // Sort by created_at descending (newest first)
    return claims.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getClaimsByBusiness(householdId: string, businessId: string): Promise<ReimbursementClaim[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('household_id', '==', householdId),
      where('business_id', '==', businessId)
    );

    const snapshot = await getDocs(q);
    const claims = snapshot.docs.map((doc) => this.firestoreToClaim(doc.id, doc.data()));
    
    // Sort by created_at descending (newest first)
    return claims.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getClaimById(claimId: string): Promise<ReimbursementClaim | null> {
    const docRef = doc(db, this.COLLECTION, claimId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.firestoreToClaim(docSnap.id, docSnap.data());
  }

  async createClaim(claim: ReimbursementClaim): Promise<void> {
    const docRef = doc(db, this.COLLECTION, claim.id);
    await setDoc(docRef, this.claimToFirestore(claim));
  }

  async updateClaim(claimId: string, updates: Partial<ReimbursementClaim>): Promise<void> {
    const docRef = doc(db, this.COLLECTION, claimId);
    const firestoreData: any = {};

    if (updates.name !== undefined) firestoreData.name = updates.name;
    if (updates.status !== undefined) firestoreData.status = updates.status;
    if (updates.total_amount !== undefined) firestoreData.total_amount = updates.total_amount;
    if (updates.paid_amount !== undefined) firestoreData.paid_amount = updates.paid_amount;
    if (updates.transaction_ids !== undefined) firestoreData.transaction_ids = updates.transaction_ids;
    if (updates.paid_transaction_id !== undefined) firestoreData.paid_transaction_id = updates.paid_transaction_id || null;
    if (updates.submitted_at !== undefined) firestoreData.submitted_at = updates.submitted_at ? Timestamp.fromDate(updates.submitted_at) : null;
    if (updates.submitted_by !== undefined) firestoreData.submitted_by = updates.submitted_by || null;
    if (updates.approved_at !== undefined) firestoreData.approved_at = updates.approved_at ? Timestamp.fromDate(updates.approved_at) : null;
    if (updates.paid_at !== undefined) firestoreData.paid_at = updates.paid_at ? Timestamp.fromDate(updates.paid_at) : null;
    if (updates.notes !== undefined) firestoreData.notes = updates.notes || null;
    if (updates.rejection_reason !== undefined) firestoreData.rejection_reason = updates.rejection_reason || null;
    if (updates.updated_at !== undefined) firestoreData.updated_at = Timestamp.fromDate(updates.updated_at);

    await setDoc(docRef, firestoreData, { merge: true });
  }

  async deleteClaim(claimId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, claimId);
    await deleteDoc(docRef);
  }

  async calculateClaimTotal(transactionIds: string[]): Promise<number> {
    if (transactionIds.length === 0) return 0;

    // Load all transactions and sum their amounts
    const transactions = await Promise.all(
      transactionIds.map(async (txId) => {
        try {
          const tx = await this.transactionRepo.getTransactionById(txId);
          return tx?.amount || 0;
        } catch (error) {
          console.error(`Error loading transaction ${txId}:`, error);
          return 0;
        }
      })
    );

    return transactions.reduce((sum, amount) => sum + amount, 0);
  }

  private firestoreToClaim(id: string, data: any): ReimbursementClaim {
    return {
      id,
      household_id: data.household_id,
      name: data.name,
      business_id: data.business_id,
      business_name: data.business_name,
      period_start: data.period_start?.toDate() || new Date(),
      period_end: data.period_end?.toDate() || new Date(),
      total_amount: data.total_amount || 0,
      paid_amount: data.paid_amount || 0,
      status: data.status || 'DRAFT',
      transaction_ids: data.transaction_ids || [],
      paid_transaction_id: data.paid_transaction_id || undefined,
      submitted_at: data.submitted_at?.toDate() || undefined,
      submitted_by: data.submitted_by || undefined,
      approved_at: data.approved_at?.toDate() || undefined,
      paid_at: data.paid_at?.toDate() || undefined,
      notes: data.notes || undefined,
      rejection_reason: data.rejection_reason || undefined,
      created_at: data.created_at?.toDate() || new Date(),
      updated_at: data.updated_at?.toDate() || new Date(),
      created_by: data.created_by,
    };
  }

  private claimToFirestore(claim: ReimbursementClaim): any {
    return {
      id: claim.id,
      household_id: claim.household_id,
      name: claim.name,
      business_id: claim.business_id,
      business_name: claim.business_name,
      period_start: Timestamp.fromDate(claim.period_start),
      period_end: Timestamp.fromDate(claim.period_end),
      total_amount: claim.total_amount,
      paid_amount: claim.paid_amount,
      status: claim.status,
      transaction_ids: claim.transaction_ids,
      paid_transaction_id: claim.paid_transaction_id || null,
      submitted_at: claim.submitted_at ? Timestamp.fromDate(claim.submitted_at) : null,
      submitted_by: claim.submitted_by || null,
      approved_at: claim.approved_at ? Timestamp.fromDate(claim.approved_at) : null,
      paid_at: claim.paid_at ? Timestamp.fromDate(claim.paid_at) : null,
      notes: claim.notes || null,
      rejection_reason: claim.rejection_reason || null,
      created_at: Timestamp.fromDate(claim.created_at),
      updated_at: Timestamp.fromDate(claim.updated_at),
      created_by: claim.created_by,
    };
  }
}
