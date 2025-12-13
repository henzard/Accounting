# Firebase Setup Guide

## Quick Start

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: "Dave Ramsey Budget" (or your choice)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Required Services

#### Enable Firestore Database
1. In Firebase Console → Build → Firestore Database
2. Click "Create database"
3. Start in **production mode**
4. Choose location (e.g., us-central)

#### Enable Authentication
1. In Firebase Console → Build → Authentication
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Enable "Google" sign-in (optional)

#### Enable Storage
1. In Firebase Console → Build → Storage
2. Click "Get started"
3. Start in **production mode**
4. Use default bucket

### 3. Get Your Config

1. In Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click Web icon (</>) to add web app
4. Register app name: "Dave Ramsey Budget Web"
5. **Copy the config object** (firebaseConfig)

### 4. Add Config to App

**Option A: Using config.ts (Recommended)**

1. Copy `config.example.ts` to `config.ts`:
   ```bash
   cp config.example.ts config.ts
   ```

2. Replace the placeholder values with your actual config:
   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456",
   };
   ```

3. ✅ `config.ts` is .gitignored - your secrets are safe!

**Option B: Using .env**

1. Copy `env.example` to `.env` in project root
2. Add your Firebase values
3. ✅ `.env` is .gitignored

### 5. Set Up Security Rules

See `docs/setup/firebase-setup.md` for detailed security rules.

---

## Status

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Authentication enabled  
- [ ] Storage enabled
- [ ] Config added to app
- [ ] Security rules configured

---

## Security Reminders

⚠️ **NEVER commit**:
- `config.ts` - Contains API keys
- `.env` - Contains secrets
- `google-services.json` - Android config
- `GoogleService-Info.plist` - iOS config

✅ **Safe to commit**:
- `config.example.ts` - Example only
- `env.example` - Example only
- This README

---

## Testing Firebase Connection

Once configured, test with:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized!', app.name);
```

---

**Next**: See `docs/setup/firebase-setup.md` for complete setup guide with security rules.

