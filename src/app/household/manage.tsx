// Manage Households Screen - Homebase Budget
// View, switch, edit, and delete households

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { ScreenHeader, Card, PrimaryButton, OutlineButton, ScreenWrapper, AppText, Input } from '@/presentation/components';
import { Household } from '@/domain/entities';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export default function ManageHouseholdsScreen() {
  const { theme } = useTheme();
  const { user, updateUserLocally } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loadHouseholds = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Query households where user is a member (source of truth: member_ids)
      // This ensures we get all households the user belongs to, even if user.household_ids is out of sync
      const householdsQuery = query(
        collection(db, 'households'),
        where('member_ids', 'array-contains', user.id)
      );
      
      const householdsSnapshot = await getDocs(householdsQuery);
      
      const householdDocs = householdsSnapshot.docs.map((householdDoc) => {
        const data = householdDoc.data();
        return {
          id: householdDoc.id,
          name: data.name,
          owner_id: data.owner_id,
          member_ids: data.member_ids || [],
          timezone: data.timezone || 'UTC',
          currency: data.currency || 'USD',
          current_baby_step: data.current_baby_step || 1,
          budget_period_start_day: data.budget_period_start_day || 1,
          baby_step_started_at: data.baby_step_started_at?.toDate(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date(),
          created_by: data.created_by || data.owner_id,
        } as Household;
      });

      setHouseholds(householdDocs);
      
      console.log(`✅ Loaded ${householdDocs.length} households for user ${user.id}`);
      console.log('Households:', householdDocs.map(h => ({ id: h.id, name: h.name, members: h.member_ids.length })));
    } catch (error) {
      console.error('Error loading households:', error);
      showAlert('Error', 'Failed to load households');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadHouseholds();
    }, [loadHouseholds])
  );

  const handleSwitchDefault = async (householdId: string) => {
    if (!user) return;

    showConfirm(
      'Switch Default Household?',
      'This will make this household your default. All new data will be added to this household.',
      async () => {
        try {
          await setDoc(
            doc(db, 'users', user.id),
            {
              default_household_id: householdId,
              updated_at: serverTimestamp(),
            },
            { merge: true }
          );

          updateUserLocally({
            default_household_id: householdId,
          });

          showAlert('Success', 'Default household switched');
          loadHouseholds();
        } catch (error) {
          console.error('Error switching default household:', error);
          showAlert('Error', 'Failed to switch default household');
        }
      }
    );
  };

  const handleDeleteHousehold = async (household: Household) => {
    if (!user) return;

    // Prevent deleting if it's the only household
    if (user.household_ids.length === 1) {
      showAlert(
        'Cannot Delete',
        'You must have at least one household. Please create another household first before deleting this one.'
      );
      return;
    }

    // Prevent deleting if user is not the owner
    if (household.owner_id !== user.id) {
      showAlert('Cannot Delete', 'Only the household owner can delete this household.');
      return;
    }

    showConfirm(
      'Delete Household?',
      `Are you sure you want to delete "${household.name}"? This will permanently delete all budgets, transactions, accounts, and debts associated with this household. This action cannot be undone.`,
      async () => {
        try {
          // Remove household ID from user's household_ids
          const updatedHouseholdIds = user.household_ids.filter(id => id !== household.id);
          
          // If this was the default, set a new default
          let newDefaultId = user.default_household_id;
          if (user.default_household_id === household.id) {
            newDefaultId = updatedHouseholdIds[0] || undefined;
          }

          // Update user document
          await setDoc(
            doc(db, 'users', user.id),
            {
              household_ids: updatedHouseholdIds,
              default_household_id: newDefaultId,
              updated_at: serverTimestamp(),
            },
            { merge: true }
          );

          // Delete household document (this will cascade delete subcollections in Firestore rules)
          await deleteDoc(doc(db, 'households', household.id));

          // Update local user state
          updateUserLocally({
            household_ids: updatedHouseholdIds,
            default_household_id: newDefaultId,
          });

          showAlert('Success', 'Household deleted successfully');
          loadHouseholds();

          // If we deleted the default and have no households left, redirect to create
          if (updatedHouseholdIds.length === 0) {
            router.replace('/household/create');
          }
        } catch (error) {
          console.error('Error deleting household:', error);
          showAlert('Error', 'Failed to delete household');
        }
      }
    );
  };

  const handleStartEdit = (household: Household) => {
    setEditingId(household.id);
    setEditName(household.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (householdId: string) => {
    if (!editName.trim()) {
      showAlert('Error', 'Household name cannot be empty');
      return;
    }

    try {
      await setDoc(
        doc(db, 'households', householdId),
        {
          name: editName.trim(),
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      showAlert('Success', 'Household name updated');
      setEditingId(null);
      setEditName('');
      loadHouseholds();
    } catch (error) {
      console.error('Error updating household:', error);
      showAlert('Error', 'Failed to update household name');
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Manage Households" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={{ color: theme.text.secondary, marginTop: SPACING[4] }}>
            Loading households...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader title="Manage Households" showBack={true} />

      <ScrollView style={styles.scrollView}>
        {/* Summary */}
        <Card style={styles.summaryCard}>
          <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
            You have {households.length} {households.length === 1 ? 'household' : 'households'}
          </AppText>
        </Card>

        {/* Households List */}
        {households.map((household) => {
          const isDefault = user?.default_household_id === household.id;
          const isOwner = household.owner_id === user?.id;
          const isEditing = editingId === household.id;

          return (
            <Card key={household.id} style={styles.householdCard}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <Input
                    label="Household name"
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Household name"
                    autoFocus
                  />
                  <View style={styles.editButtons}>
                    <OutlineButton
                      title="Cancel"
                      onPress={handleCancelEdit}
                      style={{ flex: 1, marginRight: SPACING[2] }}
                      size="md"
                    />
                    <PrimaryButton
                      title="Save"
                      onPress={() => handleSaveEdit(household.id)}
                      style={{ flex: 1 }}
                      size="md"
                    />
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.householdHeader}>
                    <View style={styles.householdInfo}>
                      <View style={styles.householdTitleRow}>
                        <AppText variant="h3" style={{ color: theme.text.primary, marginRight: SPACING[2] }}>
                          {household.name}
                        </AppText>
                        {isDefault && (
                          <View style={[styles.defaultBadge, { backgroundColor: theme.interactive.primary }]}>
                            <AppText variant="overline" style={{ color: theme.text.inverse }}>
                              DEFAULT
                            </AppText>
                          </View>
                        )}
                      </View>
                      <AppText variant="caption" style={{ color: theme.text.secondary }}>
                        {isOwner ? 'Owner' : 'Member'} • {household.currency} • Baby Step {household.current_baby_step}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    {!isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSwitchDefault(household.id)}
                        style={[styles.actionButton, { backgroundColor: theme.interactive.primary }]}
                      >
                        <AppText variant="bodyEmphasis" style={{ color: theme.text.inverse }}>
                          Set as Default
                        </AppText>
                      </TouchableOpacity>
                    )}
                    
                    {isOwner && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleStartEdit(household)}
                          style={[styles.actionButton, { backgroundColor: theme.background.secondary, borderColor: theme.border.default }]}
                        >
                          <AppText variant="bodyEmphasis" style={{ color: theme.text.primary }}>
                            Edit Name
                          </AppText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleDeleteHousehold(household)}
                          style={[styles.actionButton, { backgroundColor: theme.status.errorBackground }]}
                        >
                          <AppText variant="bodyEmphasis" style={{ color: theme.status.error }}>
                            Delete
                          </AppText>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </>
              )}
            </Card>
          );
        })}

        {/* Empty State */}
        {households.length === 0 && (
          <Card style={styles.emptyCard}>
            <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center', marginBottom: SPACING[4] }}>
              No households found. Create your first household to get started!
            </AppText>
            <TouchableOpacity
              onPress={() => router.push('/household/create')}
              style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
            >
              <AppText variant="bodyEmphasis" style={{ color: theme.text.inverse }}>
                Create Household
              </AppText>
            </TouchableOpacity>
          </Card>
        )}

        {/* Create New Household */}
        <Card style={styles.createCard}>
          <TouchableOpacity
            onPress={() => router.push('/household/create')}
            style={[styles.createButton, { backgroundColor: theme.background.secondary, borderColor: theme.border.default }]}
          >
            <AppText variant="bodyEmphasis" style={{ color: theme.interactive.primary }}>
              + Create New Household
            </AppText>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[8],
  },
  summaryCard: {
    margin: SPACING[4],
    marginBottom: SPACING[2],
  },
  householdCard: {
    margin: SPACING[4],
    marginBottom: SPACING[2],
  },
  householdHeader: {
    marginBottom: SPACING[3],
  },
  householdInfo: {
    flex: 1,
  },
  householdTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  defaultBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    marginRight: SPACING[2],
    marginBottom: SPACING[2],
  },
  editContainer: {
    marginTop: SPACING[2],
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: SPACING[3],
  },
  emptyCard: {
    margin: SPACING[4],
    padding: SPACING[8],
    alignItems: 'center',
  },
  createCard: {
    margin: SPACING[4],
    marginTop: SPACING[2],
  },
  createButton: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[6],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
});
