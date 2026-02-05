// Firebase Configuration
// Uses environment variables for EAS builds, falls back to local values for development
// For EAS builds, set EXPO_PUBLIC_FIREBASE_* environment variables as EAS secrets
// Note: Firebase config values are public (included in client bundle), so this file can be committed

const getFirebaseConfig = () => {
  // Priority 1: Use environment variables (for EAS builds)
  if (
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
  }

  // Priority 2: Fallback to local config values (for development)
  // These values are only used if environment variables are not set
  return {
    apiKey: "AIzaSyCTJOF9xUSSPBa1SOB9UY87iU0eyEasVho",
    authDomain: "dave-ramsey-budget-project.firebaseapp.com",
    projectId: "dave-ramsey-budget-project",
    storageBucket: "dave-ramsey-budget-project.firebasestorage.app",
    messagingSenderId: "125752059516",
    appId: "1:125752059516:web:7df831fe080751044a4bf9",
    measurementId: "G-TCCXPZLKT8"
  };
};

export const firebaseConfig = getFirebaseConfig();

// Example of what it should look like (with your actual values):
// export const firebaseConfig = {
//   apiKey: "AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxxx",
//   authDomain: "dave-ramsey-budget-12345.firebaseapp.com",
//   projectId: "dave-ramsey-budget-12345",
//   storageBucket: "dave-ramsey-budget-12345.appspot.com",
//   messagingSenderId: "123456789012",
//   appId: "1:123456789012:web:abcdef1234567890abcdef",
// };

// 🔥 Next steps:
// 1. Replace the placeholder values above with your actual Firebase config
// 2. Save this file
// 3. Run: npm run android
// 4. Test Firebase connection in the app
