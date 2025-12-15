How am I still not linked to a Household  LOG  🔥 Initializing Firebase...
 LOG  ✅ Firebase app initialized
 LOG  ✅ Firestore initialized
 WARN  [2025-12-14T13:26:01.820Z]  @firebase/auth: Auth (12.6.0): 
You are initializing Firebase Auth for React Native without providing
AsyncStorage. Auth state will default to memory persistence and will not
persist between sessions. In order to persist auth state, install the package
"@react-native-async-storage/async-storage" and provide it to
initializeAuth:

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
 LOG  ✅ Firebase Auth initialized
 LOG  ✅ Firebase Storage initialized
 WARN  [2025-12-14T13:26:01.836Z]  @firebase/firestore: Firestore (12.6.0): enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.
 LOG  ✅ Firestore offline persistence enabled
 LOG  🔐 Auth state changed: Not logged in
 LOG  🔒 User not authenticated, redirecting to login...
 LOG  🔓 Signing in: henzardkruger@gmail.com
 LOG  🔐 Auth state changed: henzardkruger@gmail.com
 LOG  ✅ Signed in successfully
 WARN  [2025-12-14T13:26:23.881Z]  @firebase/firestore: Firestore (12.6.0): Error using user provided cache. Falling back to memory cache: FirebaseError: [code=unimplemented]: This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.
 LOG  ✅ Login successful, navigating to app...
 LOG  🏠 No default household, redirecting to household setup...
