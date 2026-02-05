// Authentication Context - Homebase Budget
// Manages user authentication state with Firebase Auth

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '@/infrastructure/firebase';
import { doc, setDoc, serverTimestamp, getDoc, getDocFromServer, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { User, createUser } from '@/domain/entities';

interface AuthContextValue {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email || 'Not logged in');
      
      // IMPORTANT: Set loading true at start of EVERY auth state change
      // This prevents race conditions where tabs layout checks user before fetch completes
      setLoading(true);
      
      if (firebaseUser) {
        // User is signed in, fetch their data from Firestore
        try {
          console.log('📡 Fetching user data from Firestore server...');
          let userDoc = await getDocFromServer(doc(db, 'users', firebaseUser.uid));
          // Retry if not found (handles signup race + eventual consistency on RN)
          if (!userDoc.exists()) {
            console.log('⏳ User doc not found, retrying in 600ms...');
            await new Promise((r) => setTimeout(r, 600));
            userDoc = await getDocFromServer(doc(db, 'users', firebaseUser.uid));
          }
          if (!userDoc.exists()) {
            console.log('⏳ User doc still not found, retrying in 1200ms...');
            await new Promise((r) => setTimeout(r, 1200));
            userDoc = await getDocFromServer(doc(db, 'users', firebaseUser.uid));
          }

          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if user is actually in any households (source of truth: household.member_ids)
            // This fixes the case where user was added to household but user document wasn't updated
            console.log('🔍 Checking for households where user is a member...');
            const householdsQuery = query(
              collection(db, 'households'),
              where('member_ids', 'array-contains', firebaseUser.uid)
            );
            const householdsSnapshot = await getDocs(householdsQuery);
            const actualHouseholdIds = householdsSnapshot.docs.map(doc => doc.id);
            
            // If user is in households but user document doesn't reflect this, update it
            const userHouseholdIds = userData.household_ids || [];
            const needsUpdate = actualHouseholdIds.length > 0 && 
              (actualHouseholdIds.length !== userHouseholdIds.length ||
               !actualHouseholdIds.every(id => userHouseholdIds.includes(id)) ||
               (!userData.default_household_id && actualHouseholdIds.length > 0));
            
            if (needsUpdate) {
              console.log(`🔄 User is in ${actualHouseholdIds.length} household(s) but user document is out of sync. Updating...`);
              
              const updates: any = {
                household_ids: actualHouseholdIds,
                updated_at: serverTimestamp(),
              };
              
              // Set default household if not set
              if (!userData.default_household_id && actualHouseholdIds.length > 0) {
                updates.default_household_id = actualHouseholdIds[0];
                console.log(`✅ Setting default household to: ${actualHouseholdIds[0]}`);
              }
              
              await updateDoc(doc(db, 'users', firebaseUser.uid), updates);
              
              // Reload user data after update
              const updatedUserDoc = await getDocFromServer(doc(db, 'users', firebaseUser.uid));
              const updatedUserData = updatedUserDoc.data();
              
              const appUser = createUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: updatedUserData.name,
                phone: updatedUserData.phone,
                household_ids: updatedUserData.household_ids || [],
                default_household_id: updatedUserData.default_household_id,
                timezone: updatedUserData.timezone || 'UTC',
                currency: updatedUserData.currency || 'USD',
                locale: updatedUserData.locale || 'en-US',
                created_at: updatedUserData.created_at?.toDate() || new Date(),
                updated_at: updatedUserData.updated_at?.toDate() || new Date(),
                last_login_at: new Date(),
              });
              
              setUser(appUser);
              console.log('✅ User loaded and synced:', appUser.email, '| Household:', appUser.default_household_id ? 'Yes' : 'No');
              setFirebaseUser(firebaseUser);
            } else {
              // User document is in sync, use it as-is
              const appUser = createUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData.name,
                phone: userData.phone,
                household_ids: userData.household_ids || [],
                default_household_id: userData.default_household_id,
                timezone: userData.timezone || 'UTC',
                currency: userData.currency || 'USD',
                locale: userData.locale || 'en-US',
                created_at: userData.created_at?.toDate() || new Date(),
                updated_at: userData.updated_at?.toDate() || new Date(),
                last_login_at: new Date(),
              });
              
              setUser(appUser);
              console.log('✅ User loaded:', appUser.email, '| Household:', appUser.default_household_id ? 'Yes' : 'No');
              setFirebaseUser(firebaseUser);
            }
          } else {
            // Firebase Auth user exists but no Firestore document (signup was incomplete)
            // Create a minimal user document now
            console.warn('⚠️ User document not found in Firestore after retries');
            console.log('🔧 Creating user document for existing Firebase Auth user...');
            
            try {
              const minimalUserData: any = {
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                phone: null,
                household_ids: [],
                default_household_id: null,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                currency: 'USD',
                locale: Intl.DateTimeFormat().resolvedOptions().locale || 'en-US',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                last_login_at: serverTimestamp(),
              };
              
              await setDoc(doc(db, 'users', firebaseUser.uid), minimalUserData);
              console.log('✅ Created minimal user document');
              
              // Now create the app user object
              const appUser = createUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: minimalUserData.name,
                phone: null,
                household_ids: [],
                default_household_id: undefined,
                timezone: minimalUserData.timezone,
                currency: minimalUserData.currency,
                locale: minimalUserData.locale,
                created_at: new Date(),
                updated_at: new Date(),
                last_login_at: new Date(),
              });
              
              setUser(appUser);
              setFirebaseUser(firebaseUser);
              console.log('✅ User loaded with new document:', appUser.email);
            } catch (createError) {
              console.error('❌ Failed to create user document:', createError);
              setUser(null);
              setFirebaseUser(null);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setUser(null);
          setFirebaseUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
        setFirebaseUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      console.log('📝 Creating account for:', email);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase user created:', firebaseUser.uid);
      
      // Check if user document already exists (from being added to household before signup)
      console.log('🔍 Checking if user document already exists...');
      const existingUserDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let existingHouseholdIds: string[] = [];
      let existingDefaultHouseholdId: string | undefined = undefined;
      
      if (existingUserDoc.exists()) {
        // User document already exists - preserve household associations
        const existingData = existingUserDoc.data();
        existingHouseholdIds = existingData.household_ids || [];
        existingDefaultHouseholdId = existingData.default_household_id;
        console.log(`📋 Found existing user document with ${existingHouseholdIds.length} household(s)`);
      } else {
        // New user - check if they were added to any households by email before signing up
        console.log('🔍 Checking for households where user was added by email...');
        const emailLowercase = email.toLowerCase();
        
        try {
          // Strategy: Find households where a member user has this email
          // This handles the case where user was added to household before signing up
          const householdsSnapshot = await getDocs(collection(db, 'households'));
          
          const householdsToAdd: string[] = [];
          
          for (const householdDoc of householdsSnapshot.docs) {
            const householdData = householdDoc.data();
            const memberIds = householdData.member_ids || [];
            
            // Check each member to see if their email matches
            for (const memberId of memberIds) {
              try {
                const memberUserDoc = await getDoc(doc(db, 'users', memberId));
                if (memberUserDoc.exists()) {
                  const memberData = memberUserDoc.data();
                  const memberEmail = (memberData.email || '').toLowerCase();
                  
                  if (memberEmail === emailLowercase && memberId !== firebaseUser.uid) {
                    // Found a household where a member with this email exists
                    // This means the user was added to this household before signing up
                    householdsToAdd.push(householdDoc.id);
                    console.log(`✅ Found household ${householdDoc.id} where user was previously added`);
                    break; // Found match for this household, move to next
                  }
                }
              } catch (error) {
                // Skip if we can't load member user
                console.warn(`⚠️ Could not load member ${memberId}:`, error);
              }
            }
          }
          
          if (householdsToAdd.length > 0) {
            existingHouseholdIds = householdsToAdd;
            existingDefaultHouseholdId = householdsToAdd[0]; // Set first as default
            console.log(`📋 Found ${householdsToAdd.length} household(s) user should be added to`);
          }
        } catch (error) {
          console.warn('⚠️ Could not check for existing household associations:', error);
          // Continue with signup even if check fails
        }
      }
      
      // Create or update user document in Firestore
      // Use merge: true to preserve existing household_ids if document already exists
      const userData: any = {
        email: firebaseUser.email || email,
        name: name,
        phone: null,
        household_ids: existingHouseholdIds.length > 0 ? existingHouseholdIds : [],
        default_household_id: existingDefaultHouseholdId || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        currency: 'USD',
        locale: Intl.DateTimeFormat().resolvedOptions().locale || 'en-US',
        updated_at: serverTimestamp(),
        last_login_at: serverTimestamp(),
      };
      
      // Only set created_at if document doesn't exist
      if (!existingUserDoc.exists()) {
        userData.created_at = serverTimestamp();
      }
      
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        userData,
        { merge: true } // Preserve existing fields like household_ids if document exists
      );
      
      console.log('✅ User document created in Firestore');
      
      // If we found existing household associations, we need to update the households' member_ids
      // to use the new Firebase Auth UID instead of any old user ID
      if (existingHouseholdIds.length > 0) {
        console.log('🔄 Updating household member_ids with new user ID...');
        const { FirestoreHouseholdRepository } = await import('@/data/repositories/FirestoreHouseholdRepository');
        const householdRepo = new FirestoreHouseholdRepository();
        
        // For each household, ensure this user's ID is in member_ids
        for (const householdId of existingHouseholdIds) {
          try {
            await householdRepo.addMember(householdId, firebaseUser.uid);
            console.log(`✅ Added user ${firebaseUser.uid} to household ${householdId}`);
          } catch (error) {
            console.warn(`⚠️ Could not add user to household ${householdId}:`, error);
            // Continue with other households
          }
        }
      }

      // Set user state immediately so the app sees the new user (avoids race with auth listener
      // which may run before setDoc is visible, causing redirect to login)
      const appUser = createUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name,
        phone: null,
        household_ids: existingHouseholdIds.length > 0 ? existingHouseholdIds : [],
        default_household_id: existingDefaultHouseholdId ?? undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        currency: 'USD',
        locale: Intl.DateTimeFormat().resolvedOptions().locale || 'en-US',
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: new Date(),
      });
      setUser(appUser);
      setFirebaseUser(firebaseUser);
      setLoading(false); // Signal that auth is complete so tabs layout stops showing loading
      console.log('✅ Account created successfully, user state set immediately');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔓 Signing in:', email);
      
      await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Signed in successfully');
      
      // NOTE: Removed last_login_at update here - it was racing with onAuthStateChanged
      // and corrupting the Firestore memory cache on React Native.
      // The auth state listener will handle loading user data.
      // last_login_at can be updated later if needed.
      
      // Give auth listener time to fetch user doc (wait for loading to complete)
      // This prevents the login screen from immediately redirecting to login if auth listener is slow
      const maxWait = 3000; // 3 seconds max
      const startTime = Date.now();
      while (loading && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error(error.message || 'Failed to sign in');
      }
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Signing out...');
      await firebaseSignOut(auth);
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async (): Promise<void> => {
    if (!auth.currentUser) {
      console.warn('⚠️ Cannot refresh user: not authenticated');
      return;
    }

    try {
      console.log('🔄 Refreshing user data from server...');
      const userDoc = await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const appUser = createUser({
          id: auth.currentUser.uid,
          email: auth.currentUser.email || '',
          name: userData.name,
          phone: userData.phone,
          household_ids: userData.household_ids || [],
          default_household_id: userData.default_household_id,
          timezone: userData.timezone || 'UTC',
          currency: userData.currency || 'USD',
          locale: userData.locale || 'en-US',
          created_at: userData.created_at?.toDate() || new Date(),
          updated_at: userData.updated_at?.toDate() || new Date(),
          last_login_at: new Date(),
        });
        
        setUser(appUser);
        console.log('✅ User data refreshed');
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };

  // Update user state locally (KISS: don't wait for Firestore)
  const updateUserLocally = (updates: Partial<User>): void => {
    if (!user) {
      console.warn('⚠️ Cannot update user: not authenticated');
      return;
    }

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date(),
    };

    console.log('🔄 Updating user locally:', updates);
    setUser(updatedUser);
  };

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    updateUserLocally,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication
 * 
 * @example
 * const { user, signIn, signOut } = useAuth();
 * 
 * if (user) {
 *   return <Text>Welcome, {user.name}!</Text>;
 * }
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

