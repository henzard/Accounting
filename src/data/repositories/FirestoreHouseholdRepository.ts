// Firestore Implementation of IHouseholdRepository

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { Household } from '@/domain/entities';
import { IHouseholdRepository } from '@/domain/repositories';
import { getFirestoreDb } from '@/infrastructure/firebase';

export class FirestoreHouseholdRepository implements IHouseholdRepository {
  private readonly COLLECTION = 'households';

  async getHouseholdById(householdId: string): Promise<Household | null> {
    const db = getFirestoreDb();
    
    try {
      const docRef = doc(db, this.COLLECTION, householdId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToHousehold(docSnap.data());
    } catch (error) {
      console.error('Error getting household:', error);
      throw error;
    }
  }

  async createHousehold(household: Household): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.COLLECTION, household.id);
      const firestoreData = this.householdToFirestore(household);

      await setDoc(docRef, firestoreData);
      console.log(`✅ Household ${household.id} created`);
    } catch (error) {
      console.error('Error creating household:', error);
      throw error;
    }
  }

  async updateHousehold(householdId: string, updates: Partial<Household>): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.COLLECTION, householdId);
      
      // Convert dates if present
      const firestoreUpdates: any = { ...updates };
      if (updates.baby_step_started_at) {
        firestoreUpdates.baby_step_started_at = Timestamp.fromDate(updates.baby_step_started_at);
      }
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }

      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ Household ${householdId} updated`);
    } catch (error) {
      console.error('Error updating household:', error);
      throw error;
    }
  }

  async updateBabyStep(householdId: string, babyStep: number): Promise<void> {
    await this.updateHousehold(householdId, {
      current_baby_step: babyStep,
      baby_step_started_at: new Date(),
      updated_at: new Date(),
    });
    
    console.log(`🎉 Household ${householdId} advanced to Baby Step ${babyStep}!`);
  }

  async addMember(householdId: string, userId: string): Promise<void> {
    const household = await this.getHouseholdById(householdId);
    
    if (!household) {
      throw new Error('Household not found');
    }

    if (household.member_ids.includes(userId)) {
      console.log(`User ${userId} already a member of household ${householdId}`);
      return;
    }

    const updatedMembers = [...household.member_ids, userId];
    
    await this.updateHousehold(householdId, {
      member_ids: updatedMembers,
      updated_at: new Date(),
    });
    
    console.log(`✅ User ${userId} added to household ${householdId}`);
  }

  async removeMember(householdId: string, userId: string): Promise<void> {
    const household = await this.getHouseholdById(householdId);
    
    if (!household) {
      throw new Error('Household not found');
    }

    if (household.owner_id === userId) {
      throw new Error('Cannot remove the owner from the household');
    }

    const updatedMembers = household.member_ids.filter(id => id !== userId);
    
    await this.updateHousehold(householdId, {
      member_ids: updatedMembers,
      updated_at: new Date(),
    });
    
    console.log(`✅ User ${userId} removed from household ${householdId}`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private firestoreToHousehold(data: any): Household {
    return {
      id: data.id,
      name: data.name,
      owner_id: data.owner_id,
      member_ids: data.member_ids || [],
      timezone: data.timezone,
      currency: data.currency,
      current_baby_step: data.current_baby_step,
      baby_step_started_at: data.baby_step_started_at 
        ? (data.baby_step_started_at instanceof Timestamp ? data.baby_step_started_at.toDate() : new Date(data.baby_step_started_at))
        : undefined,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      created_by: data.created_by,
    };
  }

  private householdToFirestore(household: Household): any {
    return {
      id: household.id,
      name: household.name,
      owner_id: household.owner_id,
      member_ids: household.member_ids,
      timezone: household.timezone,
      currency: household.currency,
      current_baby_step: household.current_baby_step,
      baby_step_started_at: household.baby_step_started_at 
        ? Timestamp.fromDate(household.baby_step_started_at) 
        : null,
      created_at: Timestamp.fromDate(household.created_at),
      updated_at: Timestamp.fromDate(household.updated_at),
      created_by: household.created_by,
    };
  }
}

