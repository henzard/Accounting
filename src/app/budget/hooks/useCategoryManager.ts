// useCategoryManager Hook
// Encapsulates all data loading, category CRUD, bulk operations,
// and filtering logic for the Manage Categories screen.

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { logger } from '@/shared/utils/logger';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { CategoryGroup } from '@/domain/entities/Budget';
import { MasterCategory, getDefaultCategories, DEFAULT_BUDGET_CATEGORIES } from '@/shared/constants/budget-categories';

export function useCategoryManager() {
  const { user } = useAuth();
  const isMountedRef = useRef(true);

  const budgetRepo = useMemo(() => new FirestoreBudgetRepository(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<Map<string, boolean>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<CategoryGroup>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      const cats = await budgetRepo.getMasterCategoriesByHousehold(user.default_household_id);
      if (!isMountedRef.current) return;

      if (cats.length === 0) {
        setCategories(getDefaultCategories());
      } else {
        setCategories(cats);
      }
    } catch (error) {
      logger.error('Error loading categories', error);
      if (isMountedRef.current) showAlert('Error', 'Failed to load categories');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [user?.default_household_id, budgetRepo]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const loadCategoryUsage = useCallback(async () => {
    if (!user?.default_household_id || categories.length === 0) return;

    try {
      const now = new Date();
      const budget = await budgetRepo.getBudgetByMonth(
        user.default_household_id,
        now.getMonth() + 1,
        now.getFullYear()
      );

      if (!isMountedRef.current) return;

      if (budget) {
        const usedIds = new Set(budget.categories.map(c => c.category_id));
        const usageMap = new Map<string, boolean>();
        categories.forEach(cat => usageMap.set(cat.id, usedIds.has(cat.id)));
        setCategoryUsage(usageMap);
      }
    } catch (error) {
      logger.error('Error loading category usage', error);
    }
  }, [user?.default_household_id, categories, budgetRepo]);

  useEffect(() => {
    if (categories.length > 0) {
      loadCategoryUsage();
    }
  }, [categories, loadCategoryUsage]);

  // Add category
  const handleAddCategory = useCallback(async (
    name: string,
    group: CategoryGroup,
    icon: string
  ) => {
    if (!user?.default_household_id) return;
    if (!name.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      const newCategory: Omit<MasterCategory, 'id'> = {
        name: name.trim(),
        group,
        icon,
        is_default: false,
        household_id: user.default_household_id,
        sort_order: categories.length,
        description: '',
      };

      await budgetRepo.createMasterCategory(newCategory);
      showAlert('Success! 🎉', 'Category added');
      await loadCategories();
    } catch (error) {
      logger.error('Error adding category', error);
      showAlert('Error', 'Failed to add category');
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  }, [user?.default_household_id, categories.length, budgetRepo, loadCategories]);

  // Edit category
  const handleSaveEdit = useCallback(async (
    categoryId: string,
    name: string,
    group: CategoryGroup,
    icon: string
  ) => {
    if (!name.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      await budgetRepo.updateMasterCategory(categoryId, {
        name: name.trim(),
        group,
        icon,
      });

      showAlert('Success! 🎉', 'Category updated');
      await loadCategories();
    } catch (error) {
      logger.error('Error updating category', error);
      showAlert('Error', 'Failed to update category');
    } finally {
      if (isMountedRef.current) setSaving(false);
    }
  }, [budgetRepo, loadCategories]);

  // Delete single category
  const handleDeleteCategory = useCallback(async (categoryId: string, categoryName: string) => {
    const confirmed = await showConfirm(
      'Delete Category?',
      `Are you sure you want to delete "${categoryName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await budgetRepo.deleteMasterCategory(categoryId);
      showAlert('Success', 'Category deleted');
      await loadCategories();
    } catch (error) {
      logger.error('Error deleting category', error);
      showAlert('Error', 'Failed to delete category');
    }
  }, [budgetRepo, loadCategories]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedCategories.size === 0) return;

    const confirmed = await showConfirm(
      'Delete Selected Categories?',
      `Delete ${selectedCategories.size} categories? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedCategories).map(id => budgetRepo.deleteMasterCategory(id))
      );
      showAlert('Success', `Deleted ${selectedCategories.size} categories`);
      setSelectionMode(false);
      setSelectedCategories(new Set());
      await loadCategories();
    } catch (error) {
      logger.error('Error bulk deleting categories', error);
      showAlert('Error', 'Failed to delete categories');
    }
  }, [selectedCategories, budgetRepo, loadCategories]);

  // Seed defaults
  const handleSeedDefaults = useCallback(async () => {
    if (!user?.default_household_id) return;
    const householdId = user.default_household_id;

    setSaving(true);
    try {
      const defaults = getDefaultCategories();
      const categoriesWithHousehold = defaults.map(({ id: _id, ...cat }) => ({
        ...cat,
        household_id: householdId,
        is_default: true,
      }));

      await budgetRepo.bulkCreateMasterCategories(categoriesWithHousehold);

      await loadCategories();
      setSuccessMessage(`Added ${defaults.length} default categories. You can now delete the ones you don't need.`);
      setShowSuccessMessage(true);
    } catch (error) {
      logger.error('Error seeding defaults', error);
      setSuccessMessage('Failed to seed default categories');
      setShowSuccessMessage(true);
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
        setShowSeedConfirm(false);
      }
    }
  }, [user?.default_household_id, budgetRepo, loadCategories]);

  // Reset to Dave Ramsey defaults
  const handleResetToDefaults = useCallback(async () => {
    const confirmed = await showConfirm(
      'Reset to Defaults?',
      'This will delete all your custom categories and load all Dave Ramsey defaults (which you can then edit or delete). This cannot be undone.'
    );
    if (!confirmed || !user?.default_household_id) return;
    const householdId = user.default_household_id;

    try {
      await budgetRepo.deleteMasterCategoriesByHousehold(householdId);

      const categoriesWithHousehold = DEFAULT_BUDGET_CATEGORIES.map(({ id: _id, is_default: _isDefault, ...cat }) => ({
        ...cat,
        household_id: householdId,
        is_default: false,
      }));

      await budgetRepo.bulkCreateMasterCategories(categoriesWithHousehold);

      showAlert('Success! 🎉', `Reset complete. Added all ${DEFAULT_BUDGET_CATEGORIES.length} Dave Ramsey categories. You can now edit or delete them.`);
      await loadCategories();
    } catch (error) {
      logger.error('Error resetting categories', error);
      showAlert('Error', 'Failed to reset categories');
    }
  }, [user?.default_household_id, budgetRepo, loadCategories]);

  // Group collapse toggle
  const toggleGroupCollapse = useCallback((group: CategoryGroup) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  // Selection
  const toggleSelection = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedCategories(new Set(categories.filter(c => !c.is_default).map(c => c.id)));
  }, [categories]);

  const deselectAll = useCallback(() => setSelectedCategories(new Set()), []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedCategories(new Set());
  }, []);

  // Filtered categories
  const filteredCategories = useMemo((): MasterCategory[] => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(q) || cat.group.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return {
    // State
    loading, saving,
    categories, filteredCategories, categoryUsage,
    searchQuery, setSearchQuery,
    collapsedGroups, toggleGroupCollapse,
    selectionMode, setSelectionMode,
    selectedCategories, toggleSelection, selectAll, deselectAll, exitSelectionMode,
    showSeedConfirm, setShowSeedConfirm,
    showSuccessMessage, setShowSuccessMessage, successMessage,
    // Actions
    handleAddCategory,
    handleSaveEdit,
    handleDeleteCategory,
    handleBulkDelete,
    handleSeedDefaults,
    handleResetToDefaults,
  };
}
