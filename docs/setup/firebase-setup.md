# Firebase Setup Guide

**Time to Complete**: 30-45 minutes  
**Prerequisites**: Google account, Node.js 18+, React Native environment  
**Last Updated**: December 11, 2024

---

## 📋 Overview

This guide walks through setting up Firebase for the Dave Ramsey Budgeting App.

### What You'll Set Up
- ✅ Firebase project
- ✅ Firestore database
- ✅ Firebase Authentication
- ✅ Firebase Storage (for receipt photos)
- ✅ Security rules
- ✅ React Native Firebase SDK

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

Visit: [https://console.firebase.google.com/](https://console.firebase.google.com/)

### 1.2 Create New Project

1. Click "Add project"
2. Project name: `dave-ramsey-budget-app` (or your choice)
3. Click "Continue"

### 1.3 Google Analytics

1. Enable Google Analytics: **Yes** (recommended)
2. Analytics account: Create new or select existing
3. Click "Create project"
4. Wait ~30 seconds for project creation

---

## Step 2: Enable Firestore Database

### 2.1 Navigate to Firestore

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"

### 2.2 Security Rules

**Choose**: Start in **test mode** (we'll add proper rules later)

```
Allow read and write access (test mode):
  match /{document=**} {
    allow read, write: if request.time < timestamp.date(2025, 2, 1);
  }
```

**Note**: This is temporary! We'll replace with proper rules.

### 2.3 Firestore Location

**Choose location**: Select closest to your users

- `us-central1` - USA (Iowa)
- `us-east1` - USA (South Carolina)
- `europe-west1` - Europe (Belgium)
- `asia-southeast1` - Asia (Singapore)

**⚠️ IMPORTANT**: Can't change location after creation!

### 2.4 Enable Offline Persistence

This happens in code (we'll do this in Step 6).

---

## Step 3: Enable Authentication

### 3.1 Navigate to Authentication

1. Click "Authentication" in left sidebar
2. Click "Get started"

### 3.2 Enable Sign-In Methods

#### Email/Password (Required)
1. Click "Sign-in method" tab
2. Click "Email/Password"
3. Enable "Email/Password"
4. **Disable** "Email link (passwordless sign-in)"
5. Click "Save"

#### Google Sign-In (Optional but Recommended)
1. Click "Google"
2. Enable "Google"
3. Project support email: (select your email)
4. Click "Save"

---

## Step 4: Enable Firebase Storage

### 4.1 Navigate to Storage

1. Click "Storage" in left sidebar
2. Click "Get started"

### 4.2 Security Rules

**Choose**: Start in **test mode**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2025, 2, 1);
    }
  }
}
```

**Note**: Temporary! We'll add proper rules later.

### 4.3 Storage Location

Use same location as Firestore.

---

## Step 5: Register Mobile Apps

### 5.1 Add Android App

1. In Project Overview, click Android icon
2. Android package name: `com.daveramsey.budgetapp` (or your choice)
3. App nickname: "Dave Ramsey Budget (Android)"
4. Debug signing certificate SHA-1: (optional for now)
5. Click "Register app"

6. Download `google-services.json`
7. **Save to**: `android/app/google-services.json`

8. Follow on-screen instructions for gradle configuration

### 5.2 Add iOS App

1. In Project Overview, click iOS icon
2. iOS bundle ID: `com.daveramsey.budgetapp` (must match Android)
3. App nickname: "Dave Ramsey Budget (iOS)"
4. App Store ID: (leave blank for now)
5. Click "Register app"

6. Download `GoogleService-Info.plist`
7. **Save to**: `ios/GoogleService-Info.plist`

8. Follow on-screen instructions for Xcode configuration

---

## Step 6: Install React Native Firebase

### 6.1 Install Core Package

```powershell
npm install @react-native-firebase/app
```

### 6.2 Install Firestore

```powershell
npm install @react-native-firebase/firestore
```

### 6.3 Install Auth

```powershell
npm install @react-native-firebase/auth
```

### 6.4 Install Storage

```powershell
npm install @react-native-firebase/storage
```

### 6.5 Install UUID (for offline IDs)

```powershell
npm install uuid
npm install --save-dev @types/uuid
```

---

## Step 7: Configure React Native

### 7.1 Android Configuration

**File**: `android/build.gradle`

```gradle
buildscript {
  dependencies {
    // Add this line
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

**File**: `android/app/build.gradle`

```gradle
// Add at bottom of file
apply plugin: 'com.google.gms.google-services'
```

### 7.2 iOS Configuration

```powershell
cd ios
pod install
cd ..
```

### 7.3 Verify Installation

```powershell
npm run android
# or
npm run ios
```

App should build successfully.

---

## Step 8: Initialize Firebase in App

### 8.1 Create Firebase Config

**File**: `src/infrastructure/firebase/firebase-config.ts`

```typescript
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

// Enable offline persistence
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// Export instances
export const db = firestore();
export const authInstance = auth();
export const storageInstance = storage();

// Export helpful utilities
export { Timestamp } from '@react-native-firebase/firestore';
```

### 8.2 Test Firebase Connection

**File**: `src/infrastructure/firebase/__tests__/firebase-connection.test.ts`

```typescript
import { db, authInstance } from '../firebase-config';

describe('Firebase Connection', () => {
  it('should connect to Firestore', async () => {
    // Try to read from Firestore
    const snapshot = await db.collection('_test').limit(1).get();
    expect(snapshot).toBeDefined();
  });
  
  it('should have auth instance', () => {
    expect(authInstance).toBeDefined();
  });
});
```

Run test:
```powershell
npm test -- firebase-connection.test.ts
```

---

## Step 9: Set Up Security Rules

### 9.1 Firestore Security Rules

**In Firebase Console → Firestore → Rules**

Replace the test rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Household data accessible to members only
    match /households/{householdId} {
      allow read: if request.auth != null 
        && request.auth.uid in resource.data.member_ids;
      
      allow write: if request.auth != null 
        && request.auth.uid in resource.data.member_ids;
      
      // All subcollections inherit household permissions
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null 
          && request.auth.uid in get(/databases/$(database)/documents/households/$(householdId)).data.member_ids;
      }
    }
  }
}
```

Click "Publish".

### 9.2 Storage Security Rules

**In Firebase Console → Storage → Rules**

Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Receipts: Only household members can read/write
    match /households/{householdId}/receipts/{receiptId} {
      allow read, write: if request.auth != null
        && request.auth.uid in firestore.get(/databases/(default)/documents/households/$(householdId)).data.member_ids;
    }
  }
}
```

Click "Publish".

---

## Step 10: Create Test Data

### 10.1 Test User

In Firebase Console → Authentication → Users:
- Click "Add user"
- Email: `test@example.com`
- Password: `Test123!`
- Click "Add user"

### 10.2 Test Household

In Firebase Console → Firestore → Data:

1. Click "Start collection"
2. Collection ID: `households`
3. Document ID: (auto-ID)
4. Fields:
   - `name` (string): "Test Family"
   - `owner_id` (string): (paste user UID from Auth)
   - `member_ids` (array): [paste user UID]
   - `timezone` (string): "America/New_York"
   - `currency` (string): "USD"
   - `current_baby_step` (number): 1
   - `created_at` (timestamp): (now)
   - `updated_at` (timestamp): (now)

5. Click "Save"

---

## Step 11: Test End-to-End

### 11.1 Sign In Test

```typescript
import { authInstance } from '@/infrastructure/firebase/firebase-config';

async function testSignIn() {
  try {
    const userCredential = await authInstance.signInWithEmailAndPassword(
      'test@example.com',
      'Test123!'
    );
    
    console.log('Signed in:', userCredential.user.uid);
    return true;
  } catch (error) {
    console.error('Sign in failed:', error);
    return false;
  }
}
```

### 11.2 Firestore Read Test

```typescript
import { db } from '@/infrastructure/firebase/firebase-config';

async function testFirestoreRead() {
  try {
    const snapshot = await db.collection('households').limit(1).get();
    
    if (!snapshot.empty) {
      console.log('Household:', snapshot.docs[0].data());
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Read failed:', error);
    return false;
  }
}
```

### 11.3 Offline Test

```typescript
import { db } from '@/infrastructure/firebase/firebase-config';
import { v4 as uuid } from 'uuid';

async function testOfflineWrite() {
  try {
    // Disable network (simulate offline)
    await db.disableNetwork();
    
    // Try to write
    const testDoc = {
      id: uuid(),
      test: 'offline write',
      timestamp: new Date(),
    };
    
    await db.collection('_test').doc(testDoc.id).set(testDoc);
    console.log('Offline write succeeded');
    
    // Re-enable network
    await db.enableNetwork();
    console.log('Sync completed');
    
    return true;
  } catch (error) {
    console.error('Offline test failed:', error);
    await db.enableNetwork(); // Re-enable on error
    return false;
  }
}
```

---

## Step 12: Environment Variables

### 12.1 Create .env File

**File**: `.env`

```bash
# Firebase
FIREBASE_PROJECT_ID=dave-ramsey-budget-app
FIREBASE_STORAGE_BUCKET=dave-ramsey-budget-app.appspot.com

# App
APP_NAME=Dave Ramsey Budget
APP_VERSION=1.0.0
```

### 12.2 Add to .gitignore

**File**: `.gitignore`

```
# Environment
.env
.env.local
.env.production

# Firebase
google-services.json
GoogleService-Info.plist
```

---

## Step 13: Create Indexes

Some queries require composite indexes.

### 13.1 Common Indexes Needed

In Firebase Console → Firestore → Indexes:

**Index 1: Transactions by household and date**
- Collection: `households/{householdId}/transactions`
- Fields:
  - `household_id` (Ascending)
  - `date` (Descending)

**Index 2: Business expenses**
- Collection: `households/{householdId}/transactions`
- Fields:
  - `household_id` (Ascending)
  - `is_business` (Ascending)
  - `reimbursement_claim_id` (Ascending)

**Index 3: Budget categories**
- Collection: `households/{householdId}/budgets/{budgetId}/categories`
- Fields:
  - `budget_id` (Ascending)
  - `group` (Ascending)
  - `sort_order` (Ascending)

**Note**: Firebase will prompt you to create indexes when you run queries that need them. You can create them on-demand.

---

## Troubleshooting

### Issue: "Default app has not been initialized"

**Solution**:
```typescript
// Make sure firebase-config is imported before use
import '@/infrastructure/firebase/firebase-config';
```

### Issue: "com.google.gms requires at least 4.3.8"

**Solution**:
Update `android/build.gradle`:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

### Issue: Offline persistence not working

**Solution**:
```typescript
// Must enable before any Firestore operations
firestore().settings({
  persistence: true,
});
```

### Issue: Permission denied on read/write

**Solution**:
1. Check security rules
2. Verify user is authenticated
3. Verify user is in household member_ids

---

## Next Steps

1. ✅ Firebase configured and tested
2. → Implement authentication flow (`docs/features/authentication.md`)
3. → Create data repositories (`docs/architecture/data-model.md`)
4. → Build UI components (`docs/setup/COMPONENT-LIBRARY.md`)

---

## Helpful Commands

```powershell
# Rebuild Android
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
cd ..

# Rebuild iOS
cd ios
rm -rf Pods
pod install
cd ..

# Clear React Native cache
npm start -- --reset-cache

# Firebase CLI (optional)
npm install -g firebase-tools
firebase login
firebase projects:list
```

---

## Security Checklist

Before going to production:

- [ ] Replace test mode security rules with production rules
- [ ] Enable App Check (prevents abuse)
- [ ] Set up budget alerts in Firebase
- [ ] Configure backup/export (Firestore → Cloud Storage)
- [ ] Review and test all security rules
- [ ] Remove test users/data
- [ ] Enable 2FA on Firebase account
- [ ] Restrict API keys (if using web)

---

## Cost Monitoring

Set up budget alerts:

1. Firebase Console → Usage and billing
2. Click "Details & settings"
3. Click "Set budget alerts"
4. Set alerts at:
   - $10/month (warning)
   - $50/month (alert)
   - $100/month (critical)

---

**Congratulations! Firebase is now set up and ready to use.** 🎉

**Next**: See `docs/START-HERE.md` for overall project guidance.

