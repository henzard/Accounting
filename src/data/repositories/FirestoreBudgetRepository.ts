// Firestore Implementation of IBudgetRepository

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
import { Budget, BudgetCategory } from '@/domain/entities';
import { IBudgetRepository } from '@/domain/repositories';
import { getFirestoreDb } from '@/infrastructure/firebase';

export class FirestoreBudgetRepository implements IBudgetRepository {
  private readonly BUDGETS_COLLECTION = 'budgets';
  private readonly CATEGORIES_COLLECTION = 'budget_categories';

  // ============================================
  // BUDGET METHODS
  // ============================================

  async getBudgetById(budgetId: string): Promise<Budget | null> {
    const db = getFirestoreDb();
    
    try {
      const docRef = doc(db, this.BUDGETS_COLLECTION, budgetId);
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

  async getBudgetsByHousehold(householdId: string, year?: number): Promise<Budget[]> {
    const db = getFirestoreDb();

    try {
      let q = query(
        collection(db, this.BUDGETS_COLLECTION),
        where('household_id', '==', householdId),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
      );

      if (year) {
        q = query(
          collection(db, this.BUDGETS_COLLECTION),
          where('household_id', '==', householdId),
          where('year', '==', year),
          orderBy('month', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.firestoreToBudget(doc.data()));
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }

  async getCurrentMonthBudget(householdId: string): Promise<Budget | null> {
    const now = new Date();
    return this.getBudgetByPeriod(householdId, now.getMonth() + 1, now.getFullYear());
  }

  async getBudgetByPeriod(
    householdId: string,
    month: number,
    year: number
  ): Promise<Budget | null> {
    const db = getFirestoreDb();

    try {
      const q = query(
        collection(db, this.BUDGETS_COLLECTION),
        where('household_id', '==', householdId),
        where('month', '==', month),
        where('year', '==', year)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return this.firestoreToBudget(querySnapshot.docs[0].data());
    } catch (error) {
      console.error('Error getting budget by period:', error);
      throw error;
    }
  }

  async createBudget(budget: Budget): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.BUDGETS_COLLECTION, budget.id);
      const firestoreData = this.budgetToFirestore(budget);

      await setDoc(docRef, firestoreData);
      console.log(`✅ Budget ${budget.id} created`);
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.BUDGETS_COLLECTION, budgetId);
      
      // Convert dates to Timestamps
      const firestoreUpdates: any = { ...updates };
      if (updates.period_start) {
        firestoreUpdates.period_start = Timestamp.fromDate(updates.period_start);
      }
      if (updates.period_end) {
        firestoreUpdates.period_end = Timestamp.fromDate(updates.period_end);
      }
      if (updates.closed_at) {
        firestoreUpdates.closed_at = Timestamp.fromDate(updates.closed_at);
      }
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }

      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ Budget ${budgetId} updated`);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // ============================================
  // CATEGORY METHODS
  // ============================================

  async getCategoryById(categoryId: string): Promise<BudgetCategory | null> {
    const db = getFirestoreDb();
    
    try {
      const docRef = doc(db, this.CATEGORIES_COLLECTION, categoryId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.firestoreToCategory(docSnap.data());
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  async getCategoriesByBudget(budgetId: string): Promise<BudgetCategory[]> {
    const db = getFirestoreDb();

    try {
      const q = query(
        collection(db, this.CATEGORIES_COLLECTION),
        where('budget_id', '==', budgetId),
        orderBy('sort_order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.firestoreToCategory(doc.data()));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async createCategory(category: BudgetCategory): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.CATEGORIES_COLLECTION, category.id);
      const firestoreData = this.categoryToFirestore(category);

      await setDoc(docRef, firestoreData);
      console.log(`✅ Category ${category.id} created`);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, updates: Partial<BudgetCategory>): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.CATEGORIES_COLLECTION, categoryId);
      
      // Convert dates if present
      const firestoreUpdates: any = { ...updates };
      if (updates.target_date) {
        firestoreUpdates.target_date = Timestamp.fromDate(updates.target_date);
      }
      if (updates.updated_at) {
        firestoreUpdates.updated_at = Timestamp.fromDate(updates.updated_at);
      }

      await updateDoc(docRef, firestoreUpdates);
      console.log(`✅ Category ${categoryId} updated`);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const db = getFirestoreDb();

    try {
      const docRef = doc(db, this.CATEGORIES_COLLECTION, categoryId);
      await deleteDoc(docRef);
      console.log(`✅ Category ${categoryId} deleted`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private firestoreToBudget(data: any): Budget {
    return {
      id: data.id,
      household_id: data.household_id,
      month: data.month,
      year: data.year,
      period_start: data.period_start instanceof Timestamp ? data.period_start.toDate() : new Date(data.period_start),
      period_end: data.period_end instanceof Timestamp ? data.period_end.toDate() : new Date(data.period_end),
      planned_income: data.planned_income,
      actual_income: data.actual_income,
      planned_expenses: data.planned_expenses,
      actual_expenses: data.actual_expenses,
      is_zero_based: data.is_zero_based,
      difference: data.difference,
      status: data.status,
      closed_at: data.closed_at ? (data.closed_at instanceof Timestamp ? data.closed_at.toDate() : new Date(data.closed_at)) : undefined,
      closed_by: data.closed_by,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      created_by: data.created_by,
      copied_from_budget_id: data.copied_from_budget_id,
    };
  }

  private budgetToFirestore(budget: Budget): any {
    return {
      id: budget.id,
      household_id: budget.household_id,
      month: budget.month,
      year: budget.year,
      period_start: Timestamp.fromDate(budget.period_start),
      period_end: Timestamp.fromDate(budget.period_end),
      planned_income: budget.planned_income,
      actual_income: budget.actual_income,
      planned_expenses: budget.planned_expenses,
      actual_expenses: budget.actual_expenses,
      is_zero_based: budget.is_zero_based,
      difference: budget.difference,
      status: budget.status,
      closed_at: budget.closed_at ? Timestamp.fromDate(budget.closed_at) : null,
      closed_by: budget.closed_by || null,
      created_at: Timestamp.fromDate(budget.created_at),
      updated_at: Timestamp.fromDate(budget.updated_at),
      created_by: budget.created_by,
      copied_from_budget_id: budget.copied_from_budget_id || null,
    };
  }

  private firestoreToCategory(data: any): BudgetCategory {
    return {
      id: data.id,
      budget_id: data.budget_id,
      household_id: data.household_id,
      name: data.name,
      group: data.group,
      type: data.type,
      planned_amount: data.planned_amount,
      actual_amount: data.actual_amount,
      available_amount: data.available_amount,
      is_cash_envelope: data.is_cash_envelope,
      carry_over: data.carry_over,
      carried_over_amount: data.carried_over_amount,
      is_sinking_fund: data.is_sinking_fund,
      target_amount: data.target_amount,
      target_date: data.target_date ? (data.target_date instanceof Timestamp ? data.target_date.toDate() : new Date(data.target_date)) : undefined,
      sort_order: data.sort_order,
      color: data.color,
      icon: data.icon,
      created_at: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(data.created_at),
      updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate() : new Date(data.updated_at),
      created_by: data.created_by,
    };
  }

  private categoryToFirestore(category: BudgetCategory): any {
    return {
      id: category.id,
      budget_id: category.budget_id,
      household_id: category.household_id,
      name: category.name,
      group: category.group,
      type: category.type,
      planned_amount: category.planned_amount,
      actual_amount: category.actual_amount,
      available_amount: category.available_amount,
      is_cash_envelope: category.is_cash_envelope,
      carry_over: category.carry_over,
      carried_over_amount: category.carried_over_amount,
      is_sinking_fund: category.is_sinking_fund,
      target_amount: category.target_amount || null,
      target_date: category.target_date ? Timestamp.fromDate(category.target_date) : null,
      sort_order: category.sort_order,
      color: category.color || null,
      icon: category.icon || null,
      created_at: Timestamp.fromDate(category.created_at),
      updated_at: Timestamp.fromDate(category.updated_at),
      created_by: category.created_by,
    };
  }
}

