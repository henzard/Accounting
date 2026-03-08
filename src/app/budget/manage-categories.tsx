// Manage Categories Screen
// Add, edit, and delete custom budget categories

import React, { useState, useCallback } from 'react';
import {
  View,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import {
  ScreenHeader, Card, PrimaryButton, OutlineButton,
  ScreenWrapper, AppText, Input, ConfirmationModal,
} from '@/presentation/components';
import { CategoryGroup } from '@/domain/entities/Budget';
import { CATEGORY_GROUP_INFO, MasterCategory } from '@/shared/constants/budget-categories';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { useCategoryManager } from './hooks/useCategoryManager';
import { CategoryFormModal } from './components/CategoryFormModal';

export default function ManageCategoriesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const {
    loading, saving,
    filteredCategories, categories, categoryUsage,
    searchQuery, setSearchQuery,
    collapsedGroups, toggleGroupCollapse,
    selectionMode, setSelectionMode,
    selectedCategories, toggleSelection, selectAll, deselectAll, exitSelectionMode,
    showSeedConfirm, setShowSeedConfirm,
    showSuccessMessage, setShowSuccessMessage, successMessage,
    handleAddCategory,
    handleSaveEdit,
    handleDeleteCategory,
    handleBulkDelete,
    handleSeedDefaults,
    handleResetToDefaults,
  } = useCategoryManager();

  const [formVisible, setFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);

  const openAddForm = useCallback(() => {
    setEditingCategory(null);
    setFormVisible(true);
  }, []);

  const openEditForm = useCallback((category: MasterCategory) => {
    setEditingCategory(category);
    setFormVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setEditingCategory(null);
  }, []);

  const handleFormSave = useCallback((name: string, group: CategoryGroup, icon: string) => {
    if (editingCategory) {
      handleSaveEdit(editingCategory.id, name, group, icon).then(closeForm);
    } else {
      handleAddCategory(name, group, icon).then(closeForm);
    }
  }, [editingCategory, handleSaveEdit, handleAddCategory, closeForm]);

  const hasCategories = categories.length > 0;
  const hasFilteredCategories = filteredCategories.length > 0;

  // Build SectionList sections from filtered+grouped categories
  const sections = Object.entries(
    filteredCategories.reduce((acc, cat) => {
      if (!acc[cat.group]) acc[cat.group] = [];
      acc[cat.group].push(cat);
      return acc;
    }, {} as Record<CategoryGroup, MasterCategory[]>)
  ).map(([groupKey, data]) => ({
    groupKey: groupKey as CategoryGroup,
    data: collapsedGroups.has(groupKey as CategoryGroup) ? [] : data,
  }));

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Manage Categories" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={[styles.loadingText, { color: theme.text.secondary }]}>
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
            <TouchableOpacity onPress={exitSelectionMode}>
              <AppText variant="body" style={{ color: theme.interactive.primary }}>Done</AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResetToDefaults}>
              <AppText variant="body" style={{ color: theme.status.error }}>Reset</AppText>
            </TouchableOpacity>
          )
        }
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, {
        backgroundColor: theme.background.secondary,
        borderBottomColor: theme.border.default,
      }]}>
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

      {/* Bulk Actions Bar */}
      {selectionMode && (
        <View style={[styles.bulkActionsBar, {
          backgroundColor: theme.background.secondary,
          borderBottomColor: theme.border.default,
        }]}>
          <View style={styles.bulkSelectButtons}>
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

      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={(item) => item.id}
        staleWhileRevalidate={false}
        ListHeaderComponent={
          hasCategories && !selectionMode ? (
            <View style={styles.actionButtons}>
              <View style={styles.primaryActions}>
                <PrimaryButton
                  title="+ Add Category"
                  onPress={openAddForm}
                  style={styles.actionButtonItem}
                />
                <OutlineButton
                  title="Select"
                  onPress={() => setSelectionMode(true)}
                  style={styles.actionButtonItem}
                />
              </View>
              <OutlineButton
                title="📦 Seed All Defaults"
                onPress={() => setShowSeedConfirm(true)}
                disabled={saving}
                fullWidth
                size="md"
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !hasCategories ? (
            <View style={styles.emptyState}>
              <AppText variant="display" style={[styles.emptyIcon, { color: theme.text.tertiary }]}>📋</AppText>
              <AppText variant="h2" style={[styles.emptyTitle, { color: theme.text.primary }]}>
                No Categories Yet
              </AppText>
              <AppText variant="body" style={[styles.emptyDescription, { color: theme.text.secondary }]}>
                Get started by clicking &ldquo;Reset&rdquo; to load Dave Ramsey&apos;s recommended budget categories, or add your own custom categories.
              </AppText>
              <View style={styles.emptyActions}>
                <PrimaryButton
                  title="Load Dave Ramsey Categories"
                  onPress={handleResetToDefaults}
                  fullWidth
                />
                <OutlineButton
                  title="+ Add Custom Category"
                  onPress={openAddForm}
                  fullWidth
                />
              </View>
            </View>
          ) : hasFilteredCategories ? null : (
            <View style={styles.emptyState}>
              <AppText variant="display" style={[styles.emptyIcon, { color: theme.text.tertiary }]}>🔍</AppText>
              <AppText variant="h2" style={[styles.emptyTitle, { color: theme.text.primary }]}>
                No Results Found
              </AppText>
              <AppText variant="body" style={[styles.emptyDescription, { color: theme.text.secondary }]}>
                No categories match &quot;{searchQuery}&quot;. Try a different search term.
              </AppText>
            </View>
          )
        }
        renderSectionHeader={({ section }) => {
          const groupInfo = CATEGORY_GROUP_INFO[section.groupKey];
          const isCollapsed = collapsedGroups.has(section.groupKey);
          const allGroupCats = filteredCategories.filter(c => c.group === section.groupKey);

          return (
            <TouchableOpacity
              onPress={() => toggleGroupCollapse(section.groupKey)}
              style={[styles.groupHeader, { paddingHorizontal: SPACING[4] }]}
              activeOpacity={0.7}
            >
              <AppText variant="h2" style={styles.groupIcon}>{groupInfo.icon}</AppText>
              <AppText variant="h3" style={{ color: theme.text.primary }}>{groupInfo.name}</AppText>
              <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                ({allGroupCats.length})
              </AppText>
              <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                {isCollapsed ? '▶' : '▼'}
              </AppText>
            </TouchableOpacity>
          );
        }}
        renderItem={({ item: category }) => {
          const isUsed = categoryUsage.get(category.id) ?? false;
          const isSelected = selectedCategories.has(category.id);

          return (
            <View style={{ paddingHorizontal: SPACING[4] }}>
              <Card style={[
                styles.categoryCard,
                isSelected && {
                  backgroundColor: theme.interactive.primary + '15',
                  borderColor: theme.interactive.primary,
                },
              ]}>
                <View style={styles.categoryRow}>
                  {selectionMode && !category.is_default && (
                    <TouchableOpacity
                      onPress={() => toggleSelection(category.id)}
                      style={[styles.checkbox, {
                        backgroundColor: isSelected ? theme.interactive.primary : 'transparent',
                        borderColor: isSelected ? theme.interactive.primary : theme.border.default,
                      }]}
                    >
                      {isSelected && (
                        <AppText variant="caption" style={{ color: theme.text.inverse }}>✓</AppText>
                      )}
                    </TouchableOpacity>
                  )}

                  <AppText variant="body" style={styles.categoryIcon}>{category.icon}</AppText>
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryNameRow}>
                      <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                        {category.name}
                      </AppText>
                      {isUsed && (
                        <View style={[styles.usageBadge, { backgroundColor: theme.status.success + '20' }]}>
                          <AppText variant="caption" style={{ color: theme.status.success }}>● Active</AppText>
                        </View>
                      )}
                    </View>
                    {category.is_default && (
                      <AppText variant="caption" style={[styles.defaultLabel, { color: theme.text.tertiary }]}>
                        Dave Ramsey Default
                      </AppText>
                    )}
                  </View>

                  {!category.is_default && !selectionMode && (
                    <View style={styles.actionIcons}>
                      <TouchableOpacity
                        onPress={() => openEditForm(category)}
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
            </View>
          );
        }}
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      {/* Category Add/Edit Modal */}
      <CategoryFormModal
        visible={formVisible}
        editingCategory={editingCategory}
        saving={saving}
        onSave={handleFormSave}
        onCancel={closeForm}
      />

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING[4],
  },
  searchContainer: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  bulkSelectButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  list: {
    flex: 1,
  },
  actionButtons: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[4],
    marginBottom: SPACING[3],
  },
  primaryActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  actionButtonItem: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    backgroundColor: 'transparent',
  },
  groupIcon: {
    fontSize: 24,
  },
  categoryCard: {
    marginBottom: SPACING[2],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: SPACING[3],
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  defaultLabel: {
    marginTop: SPACING[1],
  },
  actionIcons: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  iconButton: {
    padding: SPACING[2],
  },
  usageBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[16],
  },
  emptyIcon: {
    marginBottom: SPACING[4],
  },
  emptyTitle: {
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  emptyActions: {
    width: '100%',
    gap: SPACING[3],
  },
  listFooter: {
    height: SPACING[12],
  },
});
