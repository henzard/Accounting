// Firestore Implementation of IGoalRepository

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
import { Goal } from '@/domain/entities/Goal';
import { IGoalRepository } from '@/domain/repositories/IGoalRepository';
import { db } from '@/infrastructure/firebase';

export class FirestoreGoalRepository implements IGoalRepository {
  private readonly COLLECTION = 'goals';

  async getGoalById(goalId: string): Promise<Goal | null> {
    try {
      const docRef = doc(db, this.COLLECTION, goalId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToGoal(docSnap.data());
    } catch (error) {
      console.error('Error getting goal:', error);
      throw error;
    }
  }

  async getGoalsByHousehold(householdId: string): Promise<Goal[]> {
    try {
      // Simple query: Only filter by household_id
      // Sort in memory to avoid composite index
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId)
      );

      const querySnapshot = await getDocs(q);
      
      // Sort by target_date and name in memory
      const goals = querySnapshot.docs.map(doc => this.firestoreToGoal(doc.data()));
      return goals.sort((a, b) => {
        // Goals with target dates come first, sorted by date
        if (a.target_date && b.target_date) {
          return a.target_date.getTime() - b.target_date.getTime();
        }
        if (a.target_date) return -1;
        if (b.target_date) return 1;
        // Otherwise sort by name
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  }

  async getActiveGoals(householdId: string): Promise<Goal[]> {
    try {
      // Query for active (non-archived) goals
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        where('is_archived', '==', false)
      );

      const querySnapshot = await getDocs(q);
      
      // Sort in memory
      const goals = querySnapshot.docs.map(doc => this.firestoreToGoal(doc.data()));
      return goals.sort((a, b) => {
        if (a.target_date && b.target_date) {
          return a.target_date.getTime() - b.target_date.getTime();
        }
        if (a.target_date) return -1;
        if (b.target_date) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error getting active goals:', error);
      throw error;
    }
  }

  async createGoal(goal: Goal): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, goal.id);
      const firestoreData = this.goalToFirestore(goal);

      await setDoc(docRef, firestoreData);
      console.log(`✅ Goal ${goal.id} created`);
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, goalId);
      
      // Convert dates if present
      const firestoreUpdates: any = { ...updates };
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }
      if (updates.target_date) {
        firestoreUpdates.target_date = Timestamp.fromDate(updates.target_date);
      }
      if (updates.completed_at) {
        firestoreUpdates.completed_at = Timestamp.fromDate(updates.completed_at);
      }
      
      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ Goal ${goalId} updated`);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  async updateGoalProgress(goalId: string, newAmount: number): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, goalId);
      
      const updates: any = {
        current_amount: newAmount,
        updated_at: Timestamp.now(),
      };
      
      // Check if goal is now complete
      const goalDoc = await getDoc(docRef);
      if (goalDoc.exists()) {
        const goal = this.firestoreToGoal(goalDoc.data());
        if (newAmount >= goal.target_amount && !goal.completed_at) {
          updates.completed_at = Timestamp.now();
        }
      }
      
      await updateDoc(docRef, updates);
      console.log(`✅ Goal ${goalId} progress updated to ${newAmount}`);
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async archiveGoal(goalId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, goalId);
      
      await updateDoc(docRef, {
        is_archived: true,
        updated_at: Timestamp.now(),
      });
      
      console.log(`✅ Goal ${goalId} archived`);
    } catch (error) {
      console.error('Error archiving goal:', error);
      throw error;
    }
  }

  async getGoalsByCategory(categoryId: string): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('linked_category_id', '==', categoryId),
        where('is_archived', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.firestoreToGoal(doc.data()));
    } catch (error) {
      console.error('Error getting goals by category:', error);
      throw error;
    }
  }

  // Helper: Convert Firestore document to Goal entity
  private firestoreToGoal(data: any): Goal {
    return {
      id: data.id,
      household_id: data.household_id,
      name: data.name,
      target_amount: data.target_amount,
      current_amount: data.current_amount,
      target_date: data.target_date?.toDate(),
      created_at: data.created_at?.toDate() || new Date(),
      updated_at: data.updated_at?.toDate() || new Date(),
      completed_at: data.completed_at?.toDate(),
      linked_category_id: data.linked_category_id,
      color: data.color,
      icon: data.icon,
      is_archived: data.is_archived || false,
    };
  }

  // Helper: Convert Goal entity to Firestore document
  private goalToFirestore(goal: Goal): any {
    return {
      id: goal.id,
      household_id: goal.household_id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date ? Timestamp.fromDate(goal.target_date) : null,
      created_at: Timestamp.fromDate(goal.created_at),
      updated_at: Timestamp.fromDate(goal.updated_at),
      completed_at: goal.completed_at ? Timestamp.fromDate(goal.completed_at) : null,
      linked_category_id: goal.linked_category_id || null,
      color: goal.color || null,
      icon: goal.icon || null,
      is_archived: goal.is_archived,
    };
  }
}
