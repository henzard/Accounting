// Firebase Initialization
// This file initializes Firebase services with offline persistence enabled

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Initialize Firebase App immediately
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize services
export const db = getFirestore(app);
console.log('✅ Firestore initialized');

export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

export const storage = getStorage(app);
console.log('✅ Firebase Storage initialized');

// Enable offline persistence (async, but don't block initialization)
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('⚠️ Multiple tabs open, persistence could not be enabled.');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence.
      console.warn('⚠️ Browser does not support offline persistence.');
    } else {
      console.error('❌ Firestore persistence error:', err);
    }
  });

// Export app for reference
export { app };

