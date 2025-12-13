// Firestore Implementation of IUserRepository

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { User } from '@/domain/entities';
import { IUserRepository } from '@/domain/repositories';
import { getFirestoreDb } from '@/infrastructure/firebase';

export class FirestoreUserRepository implements IUserRepository {
  private readonly COLLECTION = 'users';

  async getUserById(userId: string): Promise<User | null> {
    const db = getFirestoreDb();
    
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToUser(docSnap.data());
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.getUserById(userId);
  }

  async createUser(user: User): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.COLLECTION, user.id);
      const firestoreData = this.userToFirestore(user);

      await setDoc(docRef, firestoreData);
      console.log(`✅ User ${user.id} created`);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.COLLECTION, userId);
      
      // Convert dates if present
      const firestoreUpdates: any = { ...updates };
      if (updates.last_login_at) {
        firestoreUpdates.last_login_at = Timestamp.fromDate(updates.last_login_at);
      }
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }

      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ User ${userId} updated`);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.updateUser(userId, {
      last_login_at: new Date(),
      updated_at: new Date(),
    });
  }

  async addHouseholdToUser(userId: string, householdId: string): Promise<void> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.household_ids.includes(householdId)) {
      console.log(`Household ${householdId} already added to user ${userId}`);
      return;
    }

    const updatedHouseholds = [...user.household_ids, householdId];
    
    await this.updateUser(userId, {
      household_ids: updatedHouseholds,
      // Set as default if this is the first household
      default_household_id: user.household_ids.length === 0 ? householdId : user.default_household_id,
      updated_at: new Date(),
    });
    
    console.log(`✅ Household ${householdId} added to user ${userId}`);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private firestoreToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      household_ids: data.household_ids || [],
      default_household_id: data.default_household_id,
      timezone: data.timezone,
      currency: data.currency,
      locale: data.locale,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      last_login_at: data.last_login_at 
        ? (data.last_login_at instanceof Timestamp ? data.last_login_at.toDate() : new Date(data.last_login_at))
        : undefined,
    };
  }

  private userToFirestore(user: User): any {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || null,
      household_ids: user.household_ids,
      default_household_id: user.default_household_id || null,
      timezone: user.timezone,
      currency: user.currency,
      locale: user.locale,
      created_at: Timestamp.fromDate(user.created_at),
      updated_at: Timestamp.fromDate(user.updated_at),
      last_login_at: user.last_login_at ? Timestamp.fromDate(user.last_login_at) : null,
    };
  }
}

