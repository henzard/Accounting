// Manage Categories Screen
// Add, edit, and delete custom budget categories

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, PrimaryButton, OutlineButton, SearchableSelect } from '@/presentation/components';
import { CategoryGroup } from '@/domain/entities/Budget';
import { CATEGORY_GROUP_INFO, MasterCategory, getDefaultCategories, DEFAULT_BUDGET_CATEGORIES } from '@/shared/constants/budget-categories';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SelectOption } from '@/shared/types';

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
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!user?.default_household_id) return;
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Category name is required');
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

      Alert.alert('Success! 🎉', 'Category added');
      setNewCategoryName('');
      setNewCategoryIcon('📦');
      setShowAddForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
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
      Alert.alert('Error', 'Category name is required');
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

      Alert.alert('Success! 🎉', 'Category updated');
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditingCategory(null);
  }

  async function handleDeleteCategory(categoryId: string, categoryName: string) {
    Alert.alert(
      'Delete Category?',
      `Are you sure you want to delete "${categoryName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'master_categories', categoryId));
              Alert.alert('Success', 'Category deleted');
              loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  }

  function handleResetToDefaults() {
    Alert.alert(
      'Reset to Defaults?',
      'This will delete all your custom categories and load all Dave Ramsey defaults (which you can then edit or delete). This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            if (!user?.default_household_id) return;
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

              Alert.alert('Success! 🎉', `Reset complete. Added all ${defaults.length} Dave Ramsey categories (including debt payments, car payment, life insurance). You can now edit or delete them.`);
              loadCategories();
            } catch (error) {
              console.error('Error resetting categories:', error);
              Alert.alert('Error', 'Failed to reset categories');
            }
          },
        },
      ]
    );
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
    
    Alert.alert(
      'Delete Selected Categories?',
      `Delete ${selectedCategories.size} categories? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const deletePromises = Array.from(selectedCategories).map(id =>
                deleteDoc(doc(db, 'master_categories', id))
              );
              await Promise.all(deletePromises);
              
              Alert.alert('Success', `Deleted ${selectedCategories.size} categories`);
              setSelectionMode(false);
              setSelectedCategories(new Set());
              loadCategories();
            } catch (error) {
              console.error('Error bulk deleting:', error);
              Alert.alert('Error', 'Failed to delete categories');
            }
          },
        },
      ]
    );
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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ScreenHeader title="Manage Categories" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Loading categories...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScreenHeader
        title="Manage Categories"
        showBack={true}
        rightAction={
          selectionMode ? (
            <TouchableOpacity onPress={() => {
              setSelectionMode(false);
              setSelectedCategories(new Set());
            }}>
              <Text style={[styles.resetButton, { color: theme.interactive.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResetToDefaults}>
              <Text style={[styles.resetButton, { color: theme.status.error }]}>
                Reset
              </Text>
            </TouchableOpacity>
          )
        }
      />

      {/* 2. SEARCH BAR */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.default }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text.primary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Search categories..."
          placeholderTextColor={theme.text.tertiary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={{ color: theme.text.secondary, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 9. BULK ACTIONS BAR (when in selection mode) */}
      {selectionMode && (
        <View style={[styles.bulkActionsBar, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.default }]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={selectAll}>
              <Text style={{ color: theme.interactive.primary, fontWeight: '600' }}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAll}>
              <Text style={{ color: theme.text.secondary, fontWeight: '600' }}>Deselect All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={handleBulkDelete} 
            disabled={selectedCategories.size === 0}
            style={{ opacity: selectedCategories.size === 0 ? 0.5 : 1 }}
          >
            <Text style={{ color: theme.status.error, fontWeight: '600' }}>
              Delete ({selectedCategories.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* ACTION BUTTONS */}
        {!showAddForm && !editingCategory && !selectionMode && hasCategories && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
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
          </View>
        )}

        {/* Add Category Form */}
        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={[styles.formTitle, { color: theme.text.primary }]}>
              Add New Category
            </Text>

            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Name
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                borderColor: theme.border.default,
              }]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="e.g., Streaming Services"
              placeholderTextColor={theme.text.tertiary}
            />

            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Group
            </Text>
            <SearchableSelect
              label="Category Group"
              options={categoryGroupOptions}
              value={newCategoryGroup}
              onSelect={(value) => setNewCategoryGroup(value as CategoryGroup)}
              placeholder="Select category group"
            />

            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Icon (emoji)
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                borderColor: theme.border.default,
              }]}
              value={newCategoryIcon}
              onChangeText={setNewCategoryIcon}
              placeholder="📦"
              placeholderTextColor={theme.text.tertiary}
              maxLength={2}
            />

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
            <Text style={[styles.formTitle, { color: theme.text.primary }]}>
              Edit Category
            </Text>

            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Name
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                borderColor: theme.border.default,
              }]}
              value={editCategoryName}
              onChangeText={setEditCategoryName}
              placeholder="e.g., Streaming Services"
              placeholderTextColor={theme.text.tertiary}
            />

            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Group
            </Text>
            <SearchableSelect
              label="Category Group"
              options={categoryGroupOptions}
              value={editCategoryGroup}
              onSelect={(value) => setEditCategoryGroup(value as CategoryGroup)}
              placeholder="Select category group"
            />

            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Icon (emoji)
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                borderColor: theme.border.default,
              }]}
              value={editCategoryIcon}
              onChangeText={setEditCategoryIcon}
              placeholder="📦"
              placeholderTextColor={theme.text.tertiary}
              maxLength={2}
            />

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
            <Text style={[styles.emptyIcon, { color: theme.text.tertiary }]}>📋</Text>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              No Categories Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.text.secondary }]}>
              Get started by clicking "Reset" to load Dave Ramsey's recommended budget categories, or add your own custom categories.
            </Text>
            <View style={{ marginTop: 24, width: '100%', gap: 12 }}>
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
            <Text style={[styles.emptyIcon, { color: theme.text.tertiary }]}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              No Results Found
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.text.secondary }]}>
              No categories match "{searchQuery}". Try a different search term.
            </Text>
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
                <Text style={styles.groupIcon}>{groupInfo.icon}</Text>
                <Text style={[styles.groupName, { color: theme.text.primary }]}>
                  {groupInfo.name}
                </Text>
                {/* 5. COUNT BADGE */}
                <Text style={[styles.groupCount, { color: theme.text.tertiary }]}>
                  ({groupCategories.length})
                </Text>
                {/* Collapse indicator */}
                <Text style={[styles.collapseIcon, { color: theme.text.tertiary }]}>
                  {isCollapsed ? '▶' : '▼'}
                </Text>
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
                          {isSelected && <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>}
                        </TouchableOpacity>
                      )}
                      
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={[styles.categoryName, { color: theme.text.primary }]}>
                            {category.name}
                          </Text>
                          {/* 8. USAGE INDICATOR */}
                          {isUsed && (
                            <View style={[styles.usageBadge, { backgroundColor: theme.status.success + '20' }]}>
                              <Text style={[styles.usageText, { color: theme.status.success }]}>
                                ● Active
                              </Text>
                            </View>
                          )}
                        </View>
                        {category.is_default && (
                          <Text style={[styles.defaultBadge, { color: theme.text.tertiary }]}>
                            Dave Ramsey Default
                          </Text>
                        )}
                      </View>
                      
                      {/* 3. ICON BUTTONS */}
                      {!category.is_default && !selectionMode && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleStartEdit(category)}
                            style={styles.iconButton}
                          >
                            <Text style={{ fontSize: 20 }}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteCategory(category.id, category.name)}
                            style={styles.iconButton}
                          >
                            <Text style={{ fontSize: 20 }}>🗑️</Text>
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
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    marginTop: 16,
    fontSize: 16,
  },
  resetButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addForm: {
    margin: 16,
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
    marginLeft: 8,
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
    padding: 8,
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconButton: {
    padding: 8,
  },
  usageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  usageText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

