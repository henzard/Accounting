// Firebase Initialization
// This file initializes Firebase services with offline persistence enabled

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Initialize Firebase App
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase with offline persistence
 * Call this once at app startup
 */
export async function initializeFirebase(): Promise<void> {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');

    // Initialize Firestore with unlimited cache
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });
    console.log('✅ Firestore initialized with unlimited cache');

    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db);
      console.log('✅ Firestore offline persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('⚠️ Multiple tabs open, persistence could not be enabled.');
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence.
        console.warn('⚠️ Browser does not support offline persistence.');
      } else {
        console.error('❌ Firestore persistence error:', err);
        throw err;
      }
    }

    // Initialize Auth
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');

    // Initialize Storage
    storage = getStorage(app);
    console.log('✅ Firebase Storage initialized');

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 * @throws Error if Firebase is not initialized
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

/**
 * Get Firebase Auth instance
 * @throws Error if Firebase is not initialized
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return auth;
}

/**
 * Get Firebase Storage instance
 * @throws Error if Firebase is not initialized
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return storage;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return app !== null && db !== null;
}

// Export for convenience
export { app, db, auth, storage };

