// Manage Categories Screen
// Add, edit, and delete custom budget categories

import React, { useState, useCallback } from 'react';
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
import { CATEGORY_GROUP_INFO, MasterCategory, getDefaultCategories } from '@/shared/constants/budget-categories';
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

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [user?.default_household_id])
  );

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

              // Step 2: Add all Dave Ramsey defaults as editable categories
              const defaults = getDefaultCategories();
              const addPromises = defaults.map(category => {
                const { id, is_default, ...categoryData } = category;
                return addDoc(collection(db, 'master_categories'), {
                  ...categoryData,
                  household_id: user.default_household_id,
                  is_default: false, // Make them editable/deletable
                });
              });
              await Promise.all(addPromises);

              Alert.alert('Success! 🎉', `Reset complete. Added ${defaults.length} Dave Ramsey categories. You can now edit or delete them.`);
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

  // Category group options for SearchableSelect
  const categoryGroupOptions: SelectOption[] = Object.entries(CATEGORY_GROUP_INFO).map(([key, info]) => ({
    value: key,
    label: `${info.icon} ${info.name}`,
  }));

  // Group categories by CategoryGroup
  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat);
    return acc;
  }, {} as Record<CategoryGroup, MasterCategory[]>);

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
          <TouchableOpacity onPress={handleResetToDefaults}>
            <Text style={[styles.resetButton, { color: theme.status.error }]}>
              Reset
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView}>
        {/* Add Category Button */}
        {!showAddForm && !editingCategory && (
          <View style={styles.section}>
            <PrimaryButton
              title="+ Add Category"
              onPress={() => setShowAddForm(true)}
              fullWidth
            />
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

        {/* Categories List (grouped) */}
        {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
          const groupInfo = CATEGORY_GROUP_INFO[groupKey as CategoryGroup];
          return (
            <View key={groupKey} style={styles.section}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupIcon}>{groupInfo.icon}</Text>
                <Text style={[styles.groupName, { color: theme.text.primary }]}>
                  {groupInfo.name}
                </Text>
                <Text style={[styles.groupCount, { color: theme.text.tertiary }]}>
                  ({groupCategories.length})
                </Text>
              </View>

              {groupCategories.map((category) => (
                <Card key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.categoryName, { color: theme.text.primary }]}>
                        {category.name}
                      </Text>
                      {category.is_default && (
                        <Text style={[styles.defaultBadge, { color: theme.text.tertiary }]}>
                          Dave Ramsey Default
                        </Text>
                      )}
                    </View>
                    {!category.is_default && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleStartEdit(category)}
                          style={styles.editButton}
                        >
                          <Text style={[styles.editButtonText, { color: theme.interactive.primary }]}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteCategory(category.id, category.name)}
                          style={styles.deleteButton}
                        >
                          <Text style={[styles.deleteButtonText, { color: theme.status.error }]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Card>
              ))}
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
});

