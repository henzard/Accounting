// Household Members Screen - Manage members of a household
// View, add, and remove household members

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import {
  ScreenHeader,
  Card,
  Input,
  PrimaryButton,
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreHouseholdRepository } from '@/data/repositories/FirestoreHouseholdRepository';
import { FirestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import { Household } from '@/domain/entities';
import { doc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface MemberInfo {
  userId: string;
  email: string;
  name: string;
  isOwner: boolean;
}

export default function HouseholdMembersScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const householdRepo = new FirestoreHouseholdRepository();
  const userRepo = new FirestoreUserRepository();

  const loadHouseholdAndMembers = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      showAlert('Error', 'No household selected');
      return;
    }

    try {
      setLoading(true);
      console.log('🏠 Loading household:', user.default_household_id);

      // Load household directly from Firestore (like other screens do)
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      
      if (!householdDoc.exists()) {
        console.error('❌ Household document does not exist:', user.default_household_id);
        showAlert('Error', 'Household not found');
        setLoading(false);
        return;
      }

      const data = householdDoc.data();
      const householdData: Household = {
        id: householdDoc.id,
        name: data.name,
        owner_id: data.owner_id,
        member_ids: data.member_ids || [],
        timezone: data.timezone || 'UTC',
        currency: data.currency || 'USD',
        budget_period_start_day: data.budget_period_start_day || 1,
        current_baby_step: data.current_baby_step || 1,
        baby_step_started_at: data.baby_step_started_at?.toDate(),
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
        created_by: data.created_by || data.owner_id,
      };

      console.log('✅ Household loaded:', householdData.name, 'Members:', householdData.member_ids.length);
      setHousehold(householdData);

      // Load member details
      const memberInfos: MemberInfo[] = await Promise.all(
        householdData.member_ids.map(async (memberId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                userId: memberId,
                email: userData.email || '',
                name: userData.name || 'Unknown User',
                isOwner: householdData.owner_id === memberId,
              };
            }
          } catch (error) {
            console.error(`Error loading user ${memberId}:`, error);
          }
          return {
            userId: memberId,
            email: 'Unknown',
            name: 'Unknown User',
            isOwner: householdData.owner_id === memberId,
          };
        })
      );

      setMembers(memberInfos);
    } catch (error) {
      console.error('❌ Failed to load household members:', error);
      showAlert('Error', 'Failed to load household members');
    } finally {
      setLoading(false);
    }
  }, [user?.default_household_id]);

  useFocusEffect(
    useCallback(() => {
      loadHouseholdAndMembers();
    }, [loadHouseholdAndMembers])
  );

  const handleAddMember = async () => {
    console.log('🔘 Add Member button clicked');
    console.log('📧 Email input:', emailInput);
    console.log('👤 Current user:', user?.id, user?.email);
    console.log('🏠 Household:', household?.id, household?.name);
    
    if (!emailInput.trim()) {
      console.log('❌ Validation failed: Empty email');
      showAlert('Error', 'Please enter an email address');
      return;
    }

    if (!user?.default_household_id || !household) {
      console.log('❌ Validation failed: No household');
      showAlert('Error', 'No household selected');
      return;
    }

    // Check if current user is owner
    if (household.owner_id !== user.id) {
      console.log('❌ Permission denied: Not owner. Owner:', household.owner_id, 'Current user:', user.id);
      showAlert('Permission Denied', 'Only the household owner can add members');
      return;
    }

    console.log('✅ All validations passed, proceeding to add member...');

    setAddingMember(true);
    try {
      const emailToSearch = emailInput.trim();
      const emailLowercase = emailToSearch.toLowerCase();
      console.log('🔍 Searching for user with email:', emailToSearch, '(lowercase:', emailLowercase, ')');

      // Try lowercase first (most common)
      let usersQuery = query(
        collection(db, 'users'),
        where('email', '==', emailLowercase)
      );
      
      console.log('📡 Executing Firestore query (lowercase)...');
      let userSnapshot = await getDocs(usersQuery);
      console.log('📊 Query result:', userSnapshot.size, 'users found');

      // If not found, try exact case (in case email is stored as entered)
      if (userSnapshot.empty && emailToSearch !== emailLowercase) {
        console.log('🔄 Trying exact case match...');
        usersQuery = query(
          collection(db, 'users'),
          where('email', '==', emailToSearch)
        );
        userSnapshot = await getDocs(usersQuery);
        console.log('📊 Query result (exact case):', userSnapshot.size, 'users found');
      }

      if (userSnapshot.empty) {
        console.log('❌ No user found with email:', emailToSearch);
        showAlert(
          'User Not Found',
          `No user found with email "${emailToSearch}". They need to create an account first.`
        );
        setAddingMember(false);
        return;
      }

      const targetUserDoc = userSnapshot.docs[0];
      const targetUserId = targetUserDoc.id;
      const targetUserData = targetUserDoc.data();
      console.log('✅ Found user:', targetUserData.name, '(', targetUserData.email, ')');

      // Check if user is already a member
      if (household.member_ids.includes(targetUserId)) {
        console.log('⚠️ User already a member');
        showAlert('Already a Member', 'This user is already a member of this household');
        setAddingMember(false);
        return;
      }

      console.log('➕ Adding user to household...');
      // Add user to household
      await householdRepo.addMember(household.id, targetUserId);
      console.log('✅ User added to household member_ids');

      // Add household to user's household_ids
      await userRepo.addHouseholdToUser(targetUserId, household.id);
      console.log('✅ Household added to user household_ids');

      showAlert('Success! 🎉', `Added ${targetUserData.name} to the household`);
      setEmailInput('');
      
      // Reload data
      await loadHouseholdAndMembers();
    } catch (error: any) {
      console.error('❌ Failed to add member:', error);
      console.error('Error details:', error.message, error.code);
      
      // Check for Firestore index error
      if (error.code === 'failed-precondition') {
        showAlert(
          'Index Required',
          'A Firestore index is needed for email queries. Please check the console for the index creation link.'
        );
      } else {
        showAlert('Error', `Failed to add member: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (member: MemberInfo) => {
    if (!household || !user) return;

    // Can't remove owner
    if (member.isOwner) {
      showAlert('Cannot Remove Owner', 'The household owner cannot be removed');
      return;
    }

    // Only owner can remove members
    if (household.owner_id !== user.id) {
      showAlert('Permission Denied', 'Only the household owner can remove members');
      return;
    }

    // Can't remove yourself
    if (member.userId === user.id) {
      showAlert('Cannot Remove Yourself', 'Please switch to another household first');
      return;
    }

    const confirmed = await showConfirm(
      'Remove Member?',
      `Are you sure you want to remove ${member.name} (${member.email}) from this household?`
    );

    if (!confirmed) return;

    try {
      await householdRepo.removeMember(household.id, member.userId);
      showAlert('Success', 'Member removed successfully');
      loadHouseholdAndMembers();
    } catch (error) {
      console.error('❌ Failed to remove member:', error);
      showAlert('Error', 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Household Members" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!household) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Household Members" showBack />
        <View style={styles.loadingContainer}>
          <AppText variant="body" color={theme.text.secondary}>
            Household not found
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  const isOwner = household.owner_id === user?.id;

  return (
    <ScreenWrapper>
      <ScreenHeader title="Household Members" showBack />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Add Member Section - Only for owners */}
          {isOwner && (
            <Card padding="md" style={styles.addMemberCard}>
              <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
                Add Member
              </AppText>
              <AppText variant="caption" color={theme.text.secondary} style={{ marginBottom: SPACING[3] }}>
                Enter the email address of the user you want to add. They must already have an account.
              </AppText>
              <Input
                label="Email Address"
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="user@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom: SPACING[3] }}
              />
              <PrimaryButton
                title={addingMember ? 'Adding...' : 'Add Member'}
                onPress={() => {
                  console.log('🔘 PrimaryButton onPress fired');
                  handleAddMember();
                }}
                disabled={addingMember || !emailInput.trim()}
                loading={addingMember}
                fullWidth
              />
            </Card>
          )}

          {/* Members List */}
          <Card padding="md" style={styles.membersCard}>
            <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
              Members ({members.length})
            </AppText>

            {members.map((member, index) => (
              <View key={member.userId}>
                <View style={styles.memberRow}>
                  <View style={styles.memberInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.interactive.primary }]}>
                      <AppText variant="bodyEmphasis" color={theme.text.inverse}>
                        {member.name.charAt(0).toUpperCase()}
                      </AppText>
                    </View>
                    <View style={styles.memberDetails}>
                      <AppText variant="bodyEmphasis" style={{ marginBottom: SPACING[1] }}>
                        {member.name}
                        {member.isOwner && (
                          <AppText variant="caption" color={theme.text.secondary} style={{ marginLeft: SPACING[1] }}>
                            (Owner)
                          </AppText>
                        )}
                      </AppText>
                      <AppText variant="caption" color={theme.text.secondary}>
                        {member.email}
                      </AppText>
                    </View>
                  </View>
                  {isOwner && !member.isOwner && member.userId !== user?.id && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member)}
                      style={styles.removeButton}
                    >
                      <IconSymbol name="trash" size={18} color={theme.status.error} />
                    </TouchableOpacity>
                  )}
                </View>
                {index < members.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
                )}
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING[4],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberCard: {
    marginBottom: SPACING[4],
  },
  membersCard: {
    marginBottom: SPACING[4],
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  memberDetails: {
    flex: 1,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 52, // Align with member info
  },
});
