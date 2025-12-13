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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, createUser } from '@/domain/entities';

interface AuthContextValue {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
      
      if (firebaseUser) {
        // User is signed in, fetch their data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
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
            setFirebaseUser(firebaseUser);
          } else {
            console.warn('⚠️ User document not found in Firestore');
            setUser(null);
            setFirebaseUser(null);
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
      
      // Create user document in Firestore
      const newUser = createUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: name,
        household_ids: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        currency: 'USD',
        locale: navigator.language || 'en-US',
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone || null,
        household_ids: newUser.household_ids,
        default_household_id: newUser.default_household_id || null,
        timezone: newUser.timezone,
        currency: newUser.currency,
        locale: newUser.locale,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        last_login_at: serverTimestamp(),
      });
      
      console.log('✅ User document created in Firestore');
      
      // Auth state listener will update the user state
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
      
      // Update last login time
      if (auth.currentUser) {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { last_login_at: serverTimestamp() },
          { merge: true }
        );
      }
      
      // Auth state listener will update the user state
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

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    signUp,
    signIn,
    signOut,
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

