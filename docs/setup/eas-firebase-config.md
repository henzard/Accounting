# Firebase Configuration for EAS Builds

## Problem

The Firebase config file (`src/infrastructure/firebase/config.ts`) is in `.gitignore` and not available during EAS builds, causing build failures.

## Solution

The config now uses environment variables for EAS builds, with fallback to local values for development.

**Important**: EAS secrets are automatically available as environment variables during builds. You do NOT need to define them in `eas.json`. Just set them as secrets via `eas secret:create` or the Expo dashboard.

## Setup Steps

### 1. Set EAS Secrets

Set the Firebase configuration as EAS secrets for the production environment:

```bash
cd src

# Set Firebase config as EAS secrets
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "AIzaSyCTJOF9xUSSPBa1SOB9UY87iU0eyEasVho" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "dave-ramsey-budget-project.firebaseapp.com" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "dave-ramsey-budget-project" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "dave-ramsey-budget-project.firebasestorage.app" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "125752059516" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:125752059516:web:7df831fe080751044a4bf9" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID --value "G-TCCXPZLKT8" --type string
```

**Or set them via Expo Dashboard:**
1. Go to: https://expo.dev/accounts/henzardkruger/projects/Accounting/secrets
2. Click "Create Secret" for each variable
3. Use the values from `src/infrastructure/firebase/config.ts`

### 2. Verify Secrets

```bash
cd src
eas secret:list
```

You should see all 7 Firebase environment variables listed.

### 3. Test Build

After setting secrets, the EAS build should work:

```bash
cd src
eas build --platform android --profile production
```

## How It Works

1. **During EAS Builds**: 
   - Environment variables (set as EAS secrets) are used
   - Config is generated from `EXPO_PUBLIC_*` variables

2. **During Local Development**:
   - Falls back to hardcoded values in `config.ts`
   - Or you can create a local `.env` file with `EXPO_PUBLIC_*` variables

## Environment Variables

All Firebase config values use the `EXPO_PUBLIC_` prefix so they're available in the client bundle:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Security Note

These values are **public** (they're in the client bundle), so using `EXPO_PUBLIC_` prefix is correct. Firebase security is handled via Firebase Security Rules, not by hiding these values.

## Troubleshooting

### Build Still Fails

1. **Check secrets are set**:
   ```bash
   eas secret:list
   ```

2. **Verify secret names match exactly** (case-sensitive):
   - Must start with `EXPO_PUBLIC_`
   - Must match the variable names in `config.ts`

3. **Check build logs**:
   - Look for "Unable to resolve module ./config" error
   - Should be resolved after setting secrets

### Local Development Issues

- If you want to use environment variables locally, create a `.env` file in `src/`:
  ```
  EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCTJOF9xUSSPBa1SOB9UY87iU0eyEasVho
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=dave-ramsey-budget-project.firebaseapp.com
  ...
  ```
- Or just use the fallback values in `config.ts` (already configured)

## References

- [EAS Environment Variables](https://docs.expo.dev/build-reference/variables/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
