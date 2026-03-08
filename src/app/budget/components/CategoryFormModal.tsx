// CategoryFormModal Component
// Add/edit modal for budget categories

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { AppText, Input, PrimaryButton, OutlineButton } from '@/presentation/components';
import { SearchableSelect } from '@/presentation/components';
import { CategoryGroup } from '@/domain/entities/Budget';
import { MasterCategory } from '@/shared/constants/budget-categories';
import { CATEGORY_GROUP_INFO } from '@/shared/constants/budget-categories';
import { SelectOption } from '@/shared/types';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

interface CategoryFormModalProps {
  visible: boolean;
  editingCategory: MasterCategory | null;
  saving: boolean;
  onSave: (name: string, group: CategoryGroup, icon: string) => void;
  onCancel: () => void;
}

const categoryGroupOptions: SelectOption[] = Object.entries(CATEGORY_GROUP_INFO).map(([key, info]) => ({
  value: key,
  label: `${info.icon} ${info.name}`,
}));

export function CategoryFormModal({
  visible,
  editingCategory,
  saving,
  onSave,
  onCancel,
}: CategoryFormModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [group, setGroup] = useState<CategoryGroup>('LIFESTYLE');
  const [icon, setIcon] = useState('📦');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setGroup(editingCategory.group);
      setIcon(editingCategory.icon || '📦');
    } else {
      setName('');
      setGroup('LIFESTYLE');
      setIcon('📦');
    }
  }, [editingCategory, visible]);

  const handleSave = useCallback(() => {
    onSave(name, group, icon);
  }, [name, group, icon, onSave]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[styles.overlay, { backgroundColor: theme.surface.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: theme.background.elevated }]}>
              <AppText variant="h2" style={[styles.title, { color: theme.text.primary }]}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </AppText>

              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="e.g., Streaming Services"
              />

              <View style={styles.fieldSpacing}>
                <SearchableSelect
                  label="Group"
                  options={categoryGroupOptions}
                  value={group}
                  onSelect={(value) => setGroup(value as CategoryGroup)}
                  placeholder="Select category group"
                />
              </View>

              <View style={styles.fieldSpacing}>
                <Input
                  label="Icon (emoji)"
                  value={icon}
                  onChangeText={setIcon}
                  placeholder="📦"
                  maxLength={2}
                />
              </View>

              <View style={styles.buttons}>
                <OutlineButton
                  title="Cancel"
                  onPress={onCancel}
                  style={styles.buttonItem}
                />
                <PrimaryButton
                  title={editingCategory ? 'Save' : 'Add'}
                  onPress={handleSave}
                  loading={saving}
                  style={styles.buttonItem}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING[6],
  },
  title: {
    marginBottom: SPACING[4],
  },
  fieldSpacing: {
    marginTop: SPACING[4],
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[5],
  },
  buttonItem: {
    flex: 1,
  },
});
