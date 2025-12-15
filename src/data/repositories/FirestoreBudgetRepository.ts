// Firestore Budget Repository Implementation
// Handles budget persistence in Firebase Firestore

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
import { Budget, BudgetCategory, createBudget, createBudgetCategory } from '@/domain/entities';
import { IBudgetRepository } from '@/domain/repositories';
import { db } from '@/infrastructure/firebase';

export class FirestoreBudgetRepository implements IBudgetRepository {
  private readonly COLLECTION = 'budgets';

  async createBudget(budget: Budget): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, budget.id);
      const firestoreData = this.budgetToFirestore(budget);
      
      await setDoc(docRef, firestoreData);
      
      console.log('✅ Budget created:', budget.id);
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async getBudgetById(budgetId: string): Promise<Budget | null> {
    try {
      const docRef = doc(db, this.COLLECTION, budgetId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToBudget(docSnap.data());
    } catch (error) {
      console.error('Error getting budget:', error);
      throw error;
    }
  }

  async getBudgetByMonth(householdId: string, month: number, year: number): Promise<Budget | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        where('month', '==', month),
        where('year', '==', year)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // Should only be one budget per month per household
      const docSnap = querySnapshot.docs[0];
      return this.firestoreToBudget(docSnap.data());
    } catch (error) {
      console.error('Error getting budget by month:', error);
      throw error;
    }
  }

  async getBudgetsByHousehold(householdId: string): Promise<Budget[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId)
      );

      const querySnapshot = await getDocs(q);
      
      const budgets = querySnapshot.docs.map(doc => this.firestoreToBudget(doc.data()));
      
      // Sort by year desc, month desc (most recent first)
      return budgets.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }

  async getBudgetsByYear(householdId: string, year: number): Promise<Budget[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('household_id', '==', householdId),
        where('year', '==', year)
      );

      const querySnapshot = await getDocs(q);
      
      const budgets = querySnapshot.docs.map(doc => this.firestoreToBudget(doc.data()));
      
      // Sort by month desc (most recent first)
      return budgets.sort((a, b) => b.month - a.month);
    } catch (error) {
      console.error('Error getting budgets by year:', error);
      throw error;
    }
  }

  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, budgetId);
      
      const firestoreUpdates: Record<string, any> = {};
      
      if (updates.planned_income !== undefined) {
        firestoreUpdates.planned_income = updates.planned_income;
      }
      
      if (updates.categories !== undefined) {
        firestoreUpdates.categories = updates.categories.map(cat => ({
          id: cat.id,
          category_id: cat.category_id,
          name: cat.name,
          group: cat.group,
          icon: cat.icon || null,
          planned_amount: cat.planned_amount,
          actual_amount: cat.actual_amount,
          is_funded: cat.is_funded,
          sort_order: cat.sort_order,
        }));
      }
      
      firestoreUpdates.updated_at = Timestamp.now();
      
      await updateDoc(docRef, firestoreUpdates);
      
      console.log('✅ Budget updated:', budgetId);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async updateCategoryPlannedAmount(budgetId: string, categoryId: string, amount: number): Promise<void> {
    try {
      const budget = await this.getBudgetById(budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      const categoryIndex = budget.categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) {
        throw new Error('Category not found in budget');
      }

      budget.categories[categoryIndex].planned_amount = amount;
      
      await this.updateBudget(budgetId, { categories: budget.categories });
      
      console.log('✅ Category planned amount updated:', categoryId, amount);
    } catch (error) {
      console.error('Error updating category planned amount:', error);
      throw error;
    }
  }

  async updateCategoryActualAmount(budgetId: string, categoryId: string, amount: number): Promise<void> {
    try {
      const budget = await this.getBudgetById(budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      const categoryIndex = budget.categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) {
        throw new Error('Category not found in budget');
      }

      budget.categories[categoryIndex].actual_amount = amount;
      
      await this.updateBudget(budgetId, { categories: budget.categories });
      
      console.log('✅ Category actual amount updated:', categoryId, amount);
    } catch (error) {
      console.error('Error updating category actual amount:', error);
      throw error;
    }
  }

  async deleteBudget(budgetId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, budgetId);
      await deleteDoc(docRef);
      
      console.log('✅ Budget deleted:', budgetId);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  async copyBudgetToNextMonth(budgetId: string): Promise<Budget> {
    try {
      const sourceBudget = await this.getBudgetById(budgetId);
      if (!sourceBudget) {
        throw new Error('Source budget not found');
      }

      // Calculate next month
      let nextMonth = sourceBudget.month + 1;
      let nextYear = sourceBudget.year;
      
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      // Check if budget for next month already exists
      const existingBudget = await this.getBudgetByMonth(
        sourceBudget.household_id,
        nextMonth,
        nextYear
      );
      
      if (existingBudget) {
        throw new Error('Budget for next month already exists');
      }

      // Create new budget with same categories but zeroed actual amounts
      const newBudget = createBudget({
        id: `${sourceBudget.household_id}_${nextYear}_${nextMonth}`,
        household_id: sourceBudget.household_id,
        month: nextMonth,
        year: nextYear,
        planned_income: sourceBudget.planned_income,
        categories: sourceBudget.categories.map(cat => ({
          ...cat,
          actual_amount: 0, // Reset actuals for new month
          is_funded: false,
        })),
      });

      await this.createBudget(newBudget);
      
      console.log('✅ Budget copied to next month:', newBudget.id);
      return newBudget;
    } catch (error) {
      console.error('Error copying budget:', error);
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private firestoreToBudget(data: any): Budget {
    return createBudget({
      id: data.id,
      household_id: data.household_id,
      month: data.month,
      year: data.year,
      planned_income: data.planned_income || 0,
      categories: (data.categories || []).map((cat: any) => this.firestoreToBudgetCategory(cat)),
    });
  }

  private firestoreToBudgetCategory(data: any): BudgetCategory {
    return createBudgetCategory({
      id: data.id,
      category_id: data.category_id,
      name: data.name,
      group: data.group,
      icon: data.icon || undefined,
      planned_amount: data.planned_amount || 0,
      actual_amount: data.actual_amount || 0,
      is_funded: data.is_funded || false,
      sort_order: data.sort_order || 0,
    });
  }

  private budgetToFirestore(budget: Budget): any {
    return {
      id: budget.id,
      household_id: budget.household_id,
      month: budget.month,
      year: budget.year,
      planned_income: budget.planned_income,
      categories: budget.categories.map(cat => ({
        id: cat.id,
        category_id: cat.category_id,
        name: cat.name,
        group: cat.group,
        icon: cat.icon || null,
        planned_amount: cat.planned_amount,
        actual_amount: cat.actual_amount,
        is_funded: cat.is_funded,
        sort_order: cat.sort_order,
      })),
      created_at: Timestamp.fromDate(budget.created_at),
      updated_at: Timestamp.fromDate(budget.updated_at),
    };
  }
}
