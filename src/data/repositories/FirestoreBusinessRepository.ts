// Firestore Repository: Business
// Implements IBusinessRepository using Firestore

import { IBusinessRepository } from '@/domain/repositories/IBusinessRepository';
import { Business } from '@/domain/entities';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

export class FirestoreBusinessRepository implements IBusinessRepository {
  private readonly COLLECTION = 'businesses';

  async getBusinessesByHousehold(householdId: string): Promise<Business[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('household_id', '==', householdId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.firestoreToBusiness(doc.id, doc.data()));
  }

  async getBusinessById(businessId: string): Promise<Business | null> {
    const docRef = doc(db, this.COLLECTION, businessId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.firestoreToBusiness(docSnap.id, docSnap.data());
  }

  async createBusiness(business: Business): Promise<void> {
    const docRef = doc(db, this.COLLECTION, business.id);
    await setDoc(docRef, this.businessToFirestore(business));
  }

  async updateBusiness(businessId: string, updates: Partial<Business>): Promise<void> {
    const docRef = doc(db, this.COLLECTION, businessId);
    const firestoreData: any = {};

    if (updates.name !== undefined) firestoreData.name = updates.name;
    if (updates.type !== undefined) firestoreData.type = updates.type;
    if (updates.contact_email !== undefined) firestoreData.contact_email = updates.contact_email || null;
    if (updates.contact_phone !== undefined) firestoreData.contact_phone = updates.contact_phone || null;
    if (updates.default_reimbursement_type !== undefined) firestoreData.default_reimbursement_type = updates.default_reimbursement_type;
    if (updates.updated_at !== undefined) firestoreData.updated_at = Timestamp.fromDate(updates.updated_at);

    await setDoc(docRef, firestoreData, { merge: true });
  }

  async deleteBusiness(businessId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, businessId);
    await deleteDoc(docRef);
  }

  private firestoreToBusiness(id: string, data: any): Business {
    return {
      id,
      household_id: data.household_id,
      name: data.name,
      type: data.type,
      contact_email: data.contact_email || undefined,
      contact_phone: data.contact_phone || undefined,
      default_reimbursement_type: data.default_reimbursement_type || 'REIMBURSABLE',
      created_at: data.created_at?.toDate() || new Date(),
      updated_at: data.updated_at?.toDate() || new Date(),
      created_by: data.created_by,
    };
  }

  private businessToFirestore(business: Business): any {
    return {
      id: business.id,
      household_id: business.household_id,
      name: business.name,
      type: business.type,
      contact_email: business.contact_email || null,
      contact_phone: business.contact_phone || null,
      default_reimbursement_type: business.default_reimbursement_type,
      created_at: Timestamp.fromDate(business.created_at),
      updated_at: Timestamp.fromDate(business.updated_at),
      created_by: business.created_by,
    };
  }
}
