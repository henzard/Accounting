// HouseholdSwitcherButton Component - Homebase Budget
// Button to switch between households with dropdown modal

import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Household } from '@/domain/entities';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { useRouter } from 'expo-router';

interface HouseholdSwitcherButtonProps {
  size?: number;
  testID?: string;
}

export const HouseholdSwitcherButton: React.FC<HouseholdSwitcherButtonProps> = ({
  size = 20,
  testID,
}) => {
  const { theme } = useTheme();
  const { user, updateUserLocally } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const loadHouseholds = useCallback(async () => {
    if (!user?.household_ids || user.household_ids.length === 0) {
      setHouseholds([]);
      return;
    }

    try {
      setLoading(true);
      
      const householdDocs = await Promise.all(
        user.household_ids.map(async (householdId) => {
          try {
            const householdDoc = await getDoc(doc(db, 'households', householdId));
            
            if (householdDoc.exists()) {
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
                created_at: data.created_at?.toDate() || new Date(),
                updated_at: data.updated_at?.toDate() || new Date(),
                created_by: data.created_by || data.owner_id,
              } as Household;
            }
          } catch (error) {
            console.error(`Error loading household ${householdId}:`, error);
          }
          return null;
        })
      );

      const validHouseholds = householdDocs.filter((h): h is Household => h !== null);
      setHouseholds(validHouseholds);
    } catch (error) {
      console.error('Error loading households:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.household_ids]);

  const handleOpenModal = () => {
    setModalVisible(true);
    loadHouseholds();
  };

  const handleSwitchHousehold = async (householdId: string) => {
    if (!user || user.default_household_id === householdId) {
      setModalVisible(false);
      return;
    }

    try {
      setSwitching(householdId);
      
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

      setModalVisible(false);
    } catch (error) {
      console.error('Error switching household:', error);
    } finally {
      setSwitching(null);
    }
  };

  const currentHousehold = households.find(h => h.id === user?.default_household_id);

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenModal}
        style={[
          styles.button,
          {
            backgroundColor: theme.surface.default,
            borderColor: theme.border.default,
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        testID={testID}
      >
        <IconSymbol
          name="house.fill"
          size={size}
          color={theme.text.primary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface.raised }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                Switch Household
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: theme.text.secondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.interactive.primary} />
                <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
                  Loading households...
                </Text>
              </View>
            ) : households.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  No households found
                </Text>
              </View>
            ) : (
              <FlatList
                data={households}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isCurrent = user?.default_household_id === item.id;
                  const isSwitching = switching === item.id;

                  return (
                    <TouchableOpacity
                      onPress={() => handleSwitchHousehold(item.id)}
                      disabled={isCurrent || isSwitching}
                      style={[
                        styles.householdItem,
                        {
                          backgroundColor: isCurrent
                            ? theme.interactive.primary
                            : theme.background.secondary,
                          borderColor: theme.border.default,
                        },
                      ]}
                    >
                      <View style={styles.householdItemContent}>
                        <Text
                          style={[
                            styles.householdName,
                            {
                              color: isCurrent ? theme.text.inverse : theme.text.primary,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                        {isCurrent && (
                          <Text
                            style={[
                              styles.currentBadge,
                              { color: theme.text.inverse },
                            ]}
                          >
                            Current
                          </Text>
                        )}
                      </View>
                      {isSwitching && (
                        <ActivityIndicator
                          size="small"
                          color={isCurrent ? theme.text.inverse : theme.interactive.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 8 }} />
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                nestedScrollEnabled={true}
                scrollEnabled={households.length > 3}
              />
            )}

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                router.push('/household/manage');
              }}
              style={[styles.manageButton, { borderTopColor: theme.border.default }]}
            >
              <Text style={[styles.manageButtonText, { color: theme.interactive.primary }]}>
                Manage Households →
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  list: {
    maxHeight: 400,
    minHeight: 100,
  },
  listContent: {
    padding: 16,
  },
  householdItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  householdItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  householdName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  currentBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  manageButton: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
