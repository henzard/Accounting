// Firebase Initialization
// This file initializes Firebase services with offline persistence enabled

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { firebaseConfig } from './config';

// Initialize Firebase App immediately
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize services
export const db = getFirestore(app);
console.log('✅ Firestore initialized');

const createAuth = () => {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    // getReactNativePersistence exists at runtime in React Native environments,
    // but may not always be surfaced in TypeScript typings across Firebase versions.
    // Use dynamic access to keep compatibility.
    const authModule = require('firebase/auth') as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    };
    const getReactNativePersistence = authModule.getReactNativePersistence;

    if (typeof getReactNativePersistence !== 'function') {
      return getAuth(app);
    }

    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as any,
    });
  } catch (error) {
    // Auth may already be initialized during fast refresh/hot reload.
    // Fall back to getAuth() in that case.
    return getAuth(app);
  }
};

export const auth = createAuth();
console.log('✅ Firebase Auth initialized');

export const storage = getStorage(app);
console.log('✅ Firebase Storage initialized');

// Enable IndexedDB persistence on web only.
// React Native Firestore SDK handles local persistence without IndexedDB.
if (Platform.OS === 'web') {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('✅ Firestore offline persistence enabled (web)');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('⚠️ Multiple tabs open, web persistence could not be enabled.');
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence.
        console.warn('⚠️ Browser does not support offline persistence.');
      } else {
        console.error('❌ Firestore persistence error:', err);
      }
    });
} else {
  console.log('ℹ️ Firestore IndexedDB persistence skipped on native');
}

// Export app for reference
export { app };

