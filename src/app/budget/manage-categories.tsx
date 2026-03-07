// Manage Categories Screen
// Add, edit, and delete custom budget categories

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { ScreenHeader, Card, PrimaryButton, OutlineButton, SearchableSelect, ScreenWrapper, AppText, Input, ConfirmationModal } from '@/presentation/components';
import { CategoryGroup } from '@/domain/entities/Budget';
import { CATEGORY_GROUP_INFO, MasterCategory, getDefaultCategories, DEFAULT_BUDGET_CATEGORIES } from '@/shared/constants/budget-categories';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SelectOption } from '@/shared/types';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export default function ManageCategoriesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState<CategoryGroup>('LIFESTYLE');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryGroup, setEditCategoryGroup] = useState<CategoryGroup>('LIFESTYLE');
  const [editCategoryIcon, setEditCategoryIcon] = useState('📦');
  
  // UX Enhancement State
  const [collapsedGroups, setCollapsedGroups] = useState<Set<CategoryGroup>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryUsage, setCategoryUsage] = useState<Map<string, boolean>>(new Map());
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [user?.default_household_id])
  );

  // Load category usage when categories change
  useEffect(() => {
    if (categories.length > 0) {
      loadCategoryUsage();
    }
  }, [categories.length]);

  async function loadCategories() {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      // Load custom categories from Firestore
      const categoriesQuery = query(
        collection(db, 'master_categories'),
        where('household_id', '==', user.default_household_id)
      );
      const snapshot = await getDocs(categoriesQuery);

      if (snapshot.empty) {
        // No custom categories - use defaults
        setCategories(getDefaultCategories());
      } else {
        const customCategories: MasterCategory[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<MasterCategory, 'id'>,
        }));
        setCategories(customCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showAlert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDefaults() {
    console.log('🔵 handleSeedDefaults: START');
    
    if (!user?.default_household_id) {
      console.log('❌ No household ID, returning early');
      return;
    }

    console.log('🔵 Setting saving to true...');
    setSaving(true);
    try {
      console.log('🔵 Getting default categories...');
      const defaults = getDefaultCategories();
      console.log('🔵 Default categories count:', defaults.length);
      
      let seededCount = 0;

      console.log('🔵 Starting to add categories to Firestore...');
      for (const category of defaults) {
        const { id, ...categoryData } = category;
        console.log(`🔵 Adding category ${seededCount + 1}:`, categoryData.name);
        await addDoc(collection(db, 'master_categories'), {
          ...categoryData,
          household_id: user.default_household_id,
          is_default: true,
        });
        seededCount++;
        console.log(`✅ Added category ${seededCount}/${defaults.length}`);
      }

      console.log(`✅ Seeded ${seededCount} default categories`);
      console.log('🔵 Loading categories...');
      await loadCategories();
      console.log('🔵 Categories loaded, showing success message...');
      setSuccessMessage(`Added ${seededCount} default categories. You can now delete the ones you don't need.`);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('❌ Error seeding defaults:', error);
      setSuccessMessage('Failed to seed default categories');
      setShowSuccessMessage(true);
    } finally {
      console.log('🔵 Setting saving to false...');
      setSaving(false);
      setShowSeedConfirm(false);
      console.log('🔵 handleSeedDefaults: END');
    }
  }

  async function handleAddCategory() {
    if (!user?.default_household_id) return;
    if (!newCategoryName.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      const newCategory: Omit<MasterCategory, 'id'> = {
        name: newCategoryName.trim(),
        group: newCategoryGroup,
        icon: newCategoryIcon,
        is_default: false,
        household_id: user.default_household_id,
        sort_order: categories.length,
        description: '',
      };

      await addDoc(collection(db, 'master_categories'), newCategory);

      showAlert('Success! 🎉', 'Category added');
      setNewCategoryName('');
      setNewCategoryIcon('📦');
      setShowAddForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('Error', 'Failed to add category');
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit(category: MasterCategory) {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryGroup(category.group);
    setEditCategoryIcon(category.icon || '📦');
    setShowAddForm(false); // Close add form if open
  }

  async function handleSaveEdit() {
    if (!editingCategory) return;
    if (!editCategoryName.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        name: editCategoryName.trim(),
        group: editCategoryGroup,
        icon: editCategoryIcon,
      };

      await updateDoc(doc(db, 'master_categories', editingCategory.id), updates);

      showAlert('Success! 🎉', 'Category updated');
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      showAlert('Error', 'Failed to update category');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditingCategory(null);
  }

  async function handleDeleteCategory(categoryId: string, categoryName: string) {
    const confirmed = await showConfirm(
      'Delete Category?',
      `Are you sure you want to delete "${categoryName}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'master_categories', categoryId));
      showAlert('Success', 'Category deleted');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showAlert('Error', 'Failed to delete category');
    }
  }

  async function handleResetToDefaults() {
    const confirmed = await showConfirm(
      'Reset to Defaults?',
      'This will delete all your custom categories and load all Dave Ramsey defaults (which you can then edit or delete). This cannot be undone.'
    );

    if (!confirmed || !user?.default_household_id) return;

    try {
      // Step 1: Delete all custom categories
      const categoriesQuery = query(
        collection(db, 'master_categories'),
        where('household_id', '==', user.default_household_id)
      );
      const snapshot = await getDocs(categoriesQuery);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Step 2: Add ALL Dave Ramsey defaults as editable categories
      const defaults = DEFAULT_BUDGET_CATEGORIES; // Use ALL categories, not just is_default: true
      const addPromises = defaults.map(category => {
        const { id, is_default, ...categoryData } = category;
        return addDoc(collection(db, 'master_categories'), {
          ...categoryData,
          household_id: user.default_household_id,
          is_default: false, // Make them editable/deletable
        });
      });
      await Promise.all(addPromises);

      showAlert('Success! 🎉', `Reset complete. Added all ${defaults.length} Dave Ramsey categories (including debt payments, car payment, life insurance). You can now edit or delete them.`);
      loadCategories();
    } catch (error) {
      console.error('Error resetting categories:', error);
      showAlert('Error', 'Failed to reset categories');
    }
  }

  // ============================================
  // UX ENHANCEMENT FUNCTIONS
  // ============================================

  // 1. Toggle group collapse
  function toggleGroupCollapse(group: CategoryGroup) {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  }

  // 2. Filter categories by search query
  function filterCategories(cats: MasterCategory[]): MasterCategory[] {
    if (!searchQuery.trim()) return cats;
    const query = searchQuery.toLowerCase();
    return cats.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      cat.group.toLowerCase().includes(query)
    );
  }

  // 8. Load category usage from current budget
  async function loadCategoryUsage() {
    if (!user?.default_household_id) return;
    
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Query current month's budget
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('household_id', '==', user.default_household_id),
        where('month', '==', currentMonth),
        where('year', '==', currentYear)
      );
      
      const snapshot = await getDocs(budgetsQuery);
      if (!snapshot.empty) {
        const budgetData = snapshot.docs[0].data();
        const usedCategoryIds = new Set(
          (budgetData.categories || []).map((c: any) => c.category_id)
        );
        
        const usageMap = new Map<string, boolean>();
        categories.forEach(cat => {
          usageMap.set(cat.id, usedCategoryIds.has(cat.id));
        });
        setCategoryUsage(usageMap);
      }
    } catch (error) {
      console.error('Error loading category usage:', error);
    }
  }

  // 9. Bulk selection handlers
  function toggleSelection(categoryId: string) {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }

  function selectAll() {
    const allIds = categories.filter(c => !c.is_default).map(c => c.id);
    setSelectedCategories(new Set(allIds));
  }

  function deselectAll() {
    setSelectedCategories(new Set());
  }

  async function handleBulkDelete() {
    if (selectedCategories.size === 0) return;
    
    const confirmed = await showConfirm(
      'Delete Selected Categories?',
      `Delete ${selectedCategories.size} categories? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const deletePromises = Array.from(selectedCategories).map(id =>
        deleteDoc(doc(db, 'master_categories', id))
      );
      await Promise.all(deletePromises);
      
      showAlert('Success', `Deleted ${selectedCategories.size} categories`);
      setSelectionMode(false);
      setSelectedCategories(new Set());
      loadCategories();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showAlert('Error', 'Failed to delete categories');
    }
  }

  // Category group options for SearchableSelect
  const categoryGroupOptions: SelectOption[] = Object.entries(CATEGORY_GROUP_INFO).map(([key, info]) => ({
    value: key,
    label: `${info.icon} ${info.name}`,
  }));

  // Filter and group categories
  const filteredCategories = filterCategories(categories);
  const groupedCategories = filteredCategories.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat);
    return acc;
  }, {} as Record<CategoryGroup, MasterCategory[]>);
  
  // Check if we have any categories
  const hasCategories = categories.length > 0;
  const hasFilteredCategories = filteredCategories.length > 0;

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Manage Categories" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={{ color: theme.text.secondary, marginTop: SPACING[4] }}>
            Loading categories...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Manage Categories"
        showBack={true}
        rightAction={
          selectionMode ? (
            <TouchableOpacity onPress={() => {
              setSelectionMode(false);
              setSelectedCategories(new Set());
            }}>
              <AppText variant="body" style={{ color: theme.interactive.primary }}>
                Done
              </AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResetToDefaults}>
              <AppText variant="body" style={{ color: theme.status.error }}>
                Reset
              </AppText>
            </TouchableOpacity>
          )
        }
      />

      {/* 2. SEARCH BAR */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.default }]}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Search categories..."
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <AppText variant="body" style={{ color: theme.text.secondary }}>✕</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* 9. BULK ACTIONS BAR (when in selection mode) */}
      {selectionMode && (
        <View style={[styles.bulkActionsBar, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.default }]}>
          <View style={{ flexDirection: 'row', gap: SPACING[3] }}>
            <TouchableOpacity onPress={selectAll}>
              <AppText variant="bodyEmphasis" style={{ color: theme.interactive.primary }}>Select All</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAll}>
              <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>Deselect All</AppText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={handleBulkDelete} 
            disabled={selectedCategories.size === 0}
            style={{ opacity: selectedCategories.size === 0 ? 0.5 : 1 }}
          >
            <AppText variant="bodyEmphasis" style={{ color: theme.status.error }}>
              Delete ({selectedCategories.size})
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* ACTION BUTTONS */}
        {!showAddForm && !editingCategory && !selectionMode && hasCategories && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', gap: SPACING[3], marginBottom: SPACING[3] }}>
              <PrimaryButton
                title="+ Add Category"
                onPress={() => setShowAddForm(true)}
                style={{ flex: 1 }}
              />
              <OutlineButton
                title="Select"
                onPress={() => setSelectionMode(true)}
                style={{ flex: 1 }}
              />
            </View>
            
            {/* Seed Defaults Button - Only show if some categories exist */}
            <OutlineButton
              title="📦 Seed All Defaults"
              onPress={() => setShowSeedConfirm(true)}
              disabled={saving}
              fullWidth
              size="md"
            />
          </View>
        )}

        {/* Add Category Form */}
        {showAddForm && (
          <Card style={styles.addForm}>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[4] }}>
              Add New Category
            </AppText>

            <Input
              label="Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="e.g., Streaming Services"
            />

            <View style={{ marginTop: SPACING[4] }}>
              <SearchableSelect
                label="Group"
                options={categoryGroupOptions}
                value={newCategoryGroup}
                onSelect={(value) => setNewCategoryGroup(value as CategoryGroup)}
                placeholder="Select category group"
              />
            </View>

            <View style={{ marginTop: SPACING[4] }}>
              <Input
                label="Icon (emoji)"
                value={newCategoryIcon}
                onChangeText={setNewCategoryIcon}
                placeholder="📦"
                maxLength={2}
              />
            </View>

            <View style={styles.formButtons}>
              <OutlineButton
                title="Cancel"
                onPress={() => {
                  setShowAddForm(false);
                  setNewCategoryName('');
                  setNewCategoryIcon('📦');
                }}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Add"
                onPress={handleAddCategory}
                loading={saving}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        {/* Edit Category Form */}
        {editingCategory && (
          <Card style={styles.addForm}>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[4] }}>
              Edit Category
            </AppText>

            <Input
              label="Name"
              value={editCategoryName}
              onChangeText={setEditCategoryName}
              placeholder="e.g., Streaming Services"
            />

            <View style={{ marginTop: SPACING[4] }}>
              <SearchableSelect
                label="Group"
                options={categoryGroupOptions}
                value={editCategoryGroup}
                onSelect={(value) => setEditCategoryGroup(value as CategoryGroup)}
                placeholder="Select category group"
              />
            </View>

            <View style={{ marginTop: SPACING[4] }}>
              <Input
                label="Icon (emoji)"
                value={editCategoryIcon}
                onChangeText={setEditCategoryIcon}
                placeholder="📦"
                maxLength={2}
              />
            </View>

            <View style={styles.formButtons}>
              <OutlineButton
                title="Cancel"
                onPress={handleCancelEdit}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Save"
                onPress={handleSaveEdit}
                loading={saving}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        {/* 4. EMPTY STATE */}
        {!hasCategories && (
          <View style={styles.emptyState}>
            <AppText variant="display" style={{ color: theme.text.tertiary, marginBottom: SPACING[4] }}>📋</AppText>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[2], textAlign: 'center' }}>
              No Categories Yet
            </AppText>
            <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center', marginBottom: SPACING[6] }}>
              Get started by clicking &rdquo;Reset&rdquo; to load Dave Ramsey&apos;s recommended budget categories, or add your own custom categories.
            </AppText>
            <View style={{ marginTop: SPACING[6], width: '100%', gap: SPACING[3] }}>
              <PrimaryButton
                title="Load Dave Ramsey Categories"
                onPress={handleResetToDefaults}
                fullWidth
              />
              <OutlineButton
                title="+ Add Custom Category"
                onPress={() => setShowAddForm(true)}
                fullWidth
              />
            </View>
          </View>
        )}

        {/* SEARCH NO RESULTS */}
        {hasCategories && !hasFilteredCategories && (
          <View style={styles.emptyState}>
            <AppText variant="display" style={{ color: theme.text.tertiary, marginBottom: SPACING[4] }}>🔍</AppText>
            <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[2], textAlign: 'center' }}>
              No Results Found
            </AppText>
            <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }}>
              No categories match &quot;{searchQuery}&quot;. Try a different search term.
            </AppText>
          </View>
        )}

        {/* 1, 3, 5, 8, 9: CATEGORIES LIST (COLLAPSIBLE, ICONS, COUNT, USAGE, SELECTION) */}
        {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
          const groupInfo = CATEGORY_GROUP_INFO[groupKey as CategoryGroup];
          const group = groupKey as CategoryGroup;
          const isCollapsed = collapsedGroups.has(group);
          
          return (
            <View key={groupKey} style={styles.section}>
              {/* 1. COLLAPSIBLE GROUP HEADER */}
              <TouchableOpacity 
                onPress={() => toggleGroupCollapse(group)}
                style={styles.groupHeader}
                activeOpacity={0.7}
              >
                <AppText variant="h2" style={styles.groupIcon}>{groupInfo.icon}</AppText>
                <AppText variant="h3" style={{ color: theme.text.primary }}>
                  {groupInfo.name}
                </AppText>
                {/* 5. COUNT BADGE */}
                <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                  ({groupCategories.length})
                </AppText>
                {/* Collapse indicator */}
                <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                  {isCollapsed ? '▶' : '▼'}
                </AppText>
              </TouchableOpacity>

              {/* Categories (only show if not collapsed) */}
              {!isCollapsed && groupCategories.map((category) => {
                const isUsed = categoryUsage.get(category.id) || false;
                const isSelected = selectedCategories.has(category.id);
                
                return (
                  <Card key={category.id} style={[
                    styles.categoryCard,
                    isSelected && { backgroundColor: theme.interactive.primary + '15', borderColor: theme.interactive.primary }
                  ]}>
                    <View style={styles.categoryRow}>
                      {/* 9. SELECTION CHECKBOX */}
                      {selectionMode && !category.is_default && (
                        <TouchableOpacity
                          onPress={() => toggleSelection(category.id)}
                          style={[styles.checkbox, {
                            backgroundColor: isSelected ? theme.interactive.primary : 'transparent',
                            borderColor: isSelected ? theme.interactive.primary : theme.border.default,
                          }]}
                        >
                          {isSelected && <AppText variant="caption" style={{ color: 'white' }}>✓</AppText>}
                        </TouchableOpacity>
                      )}
                      
                      <AppText variant="body" style={styles.categoryIcon}>{category.icon}</AppText>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[2] }}>
                          <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                            {category.name}
                          </AppText>
                          {/* 8. USAGE INDICATOR */}
                          {isUsed && (
                            <View style={[styles.usageBadge, { backgroundColor: theme.status.success + '20' }]}>
                              <AppText variant="caption" style={{ color: theme.status.success }}>
                                ● Active
                              </AppText>
                            </View>
                          )}
                        </View>
                        {category.is_default && (
                          <AppText variant="caption" style={{ color: theme.text.tertiary, marginTop: SPACING[1] }}>
                            Dave Ramsey Default
                          </AppText>
                        )}
                      </View>
                      
                      {/* 3. ICON BUTTONS */}
                      {!category.is_default && !selectionMode && (
                        <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
                          <TouchableOpacity
                            onPress={() => handleStartEdit(category)}
                            style={styles.iconButton}
                          >
                            <AppText variant="body">✏️</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteCategory(category.id, category.name)}
                            style={styles.iconButton}
                          >
                            <AppText variant="body">🗑️</AppText>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          );
        })}

        {/* Bottom spacer */}
        <View style={{ height: SPACING[12] }} />
      </ScrollView>

      {/* Seed Confirm Modal */}
      <ConfirmationModal
        visible={showSeedConfirm}
        title="Seed Default Categories?"
        message="This will add all default Dave Ramsey categories to Firestore. You can then delete the ones you don't need. This action cannot be undone."
        onConfirm={handleSeedDefaults}
        onCancel={() => setShowSeedConfirm(false)}
        loading={saving}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Success Message Modal */}
      <ConfirmationModal
        visible={showSuccessMessage}
        title="Success!"
        message={successMessage}
        onConfirm={() => setShowSuccessMessage(false)}
        onCancel={() => setShowSuccessMessage(false)}
        variant="success"
        showCancel={false}
        confirmText="OK"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING[4],
    fontSize: 16,
  },
  resetButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[6],
  },
  addForm: {
    margin: SPACING[4],
    padding: SPACING[4],
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING[4],
  },
  label: {
    fontSize: 14,
    marginBottom: SPACING[2],
    marginTop: SPACING[3],
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING[3],
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[5],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupCount: {
    fontSize: 14,
    marginLeft: SPACING[2],
  },
  categoryCard: {
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  defaultBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // NEW UX ENHANCEMENT STYLES
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: SPACING[2],
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[16],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING[4],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  collapseIcon: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  iconButton: {
    padding: SPACING[2],
  },
  usageBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  usageText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

