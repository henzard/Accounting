# EAS Workflows Setup

EAS Workflows is Expo's native CI/CD solution for React Native apps. It's simpler than GitHub Actions and designed specifically for Expo/EAS builds.

## Prerequisites

1. **EAS Project**: Your project must be synced with EAS
   ```bash
   cd src
   npx eas-cli@latest init
   ```

2. **Successful Build**: You must have run at least one successful build locally
   ```bash
   cd src
   eas build --platform android --profile production
   ```

3. **eas.json Configuration**: The production profile must have `image` field set
   ```json
   {
     "build": {
       "production": {
         "android": {
           "image": "latest"
         }
       }
     }
   }
   ```

## Setup Steps

### 1. Link GitHub Repository

1. Go to your project's GitHub settings on Expo:
   - Navigate to: https://expo.dev/accounts/henzardkruger/projects/Accounting/settings/github
   - Or: Expo Dashboard → Your Project → Settings → GitHub

2. Install Expo GitHub App:
   - Click "Install GitHub App" or "Connect Repository"
   - Follow the UI to install the Expo GitHub App
   - Select the repository: `henzard/Accounting`
   - Connect it to your Expo project

### 2. Workflow File Location

The workflow file is located at:
```
src/.eas/workflows/build-and-release.yml
```

This workflow will:
- Trigger on version tag pushes (e.g., `v1.0.0`)
- Build Android APK using production profile
- Can be manually triggered from Expo dashboard

### 3. Test the Workflow

**Option A: Push a version tag**
```bash
git tag v1.0.0
git push --tags
```

**Option B: Manual trigger**
1. Go to Expo Dashboard → Your Project → Workflows
2. Find "Build and Release" workflow
3. Click "Run workflow"

### 4. View Workflow Runs

- **Expo Dashboard**: https://expo.dev/accounts/henzardkruger/projects/Accounting/workflows
- Each run shows:
  - Build status
  - Build logs
  - Download links for artifacts

## Workflow Configuration

### Current Workflow

The workflow (`src/.eas/workflows/build-and-release.yml`) currently:
- Builds Android APK on version tag pushes
- Uses production profile
- Can be manually triggered

### Adding More Jobs

You can extend the workflow to:
- Build iOS (when ready)
- Download builds
- Submit to app stores
- Run tests
- Deploy updates

Example:
```yaml
jobs:
  build_android:
    type: build
    params:
      platform: android
      profile: production
  
  build_ios:
    type: build
    params:
      platform: ios
      profile: production
```

## Comparison: EAS Workflows vs GitHub Actions

### EAS Workflows ✅
- **Simpler**: Pre-packaged job types
- **Native**: Built for Expo/EAS
- **Faster**: Optimized cloud machines
- **Integrated**: All artifacts on expo.dev
- **Less config**: No need to manage EAS CLI in CI

### GitHub Actions
- **More control**: Full CI/CD flexibility
- **GitHub Releases**: Direct integration
- **More complex**: Need to manage EAS CLI, polling, timeouts
- **More setup**: Requires EXPO_TOKEN, jq, etc.

## Troubleshooting

### Workflow Not Triggering

1. **Check GitHub connection**:
   - Verify repo is linked in Expo settings
   - Check Expo GitHub App is installed
   - Ensure correct repository is selected

2. **Check workflow file**:
   - File must be in `src/.eas/workflows/`
   - YAML syntax must be valid
   - `on` triggers must match your needs

3. **Check permissions**:
   - Expo GitHub App needs repository access
   - Check GitHub App settings

### Build Fails

1. **Check eas.json**:
   - Production profile must have `image` field
   - Profile must exist and be valid

2. **Check build logs**:
   - View logs in Expo Dashboard
   - Look for specific error messages

3. **Test locally first**:
   ```bash
   cd src
   eas build --platform android --profile production
   ```

## Next Steps

1. **Link GitHub repository** (see Step 1 above)
2. **Test workflow** by pushing a version tag
3. **Monitor first run** in Expo Dashboard
4. **Extend workflow** as needed (iOS, submissions, etc.)

## Resources

- [EAS Workflows Documentation](https://docs.expo.dev/eas/workflows/get-started/)
- [Pre-packaged Jobs](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/)
- [Building from GitHub](https://docs.expo.dev/build/building-from-github/)
