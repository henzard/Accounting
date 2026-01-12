# GitHub Releases with EAS Build

**Status**: Optional automation  
**Time to Complete**: 10-15 minutes  
**Prerequisites**: GitHub repository, Expo account, EAS CLI

---

## Overview

EAS Build can automatically create GitHub releases with your build artifacts (APK/IPA files) when you push a version tag. This is done via GitHub Actions.

---

## Setup Instructions

### Step 1: Get Your Expo Token

1. Go to [Expo Dashboard](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. Create a new access token
3. Copy the token

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo access token
6. Click **Add secret**

### Step 3: Workflow File

The workflow file is already created at `.github/workflows/eas-build-and-release.yml`. It will:

- ✅ Trigger on version tags (e.g., `v1.0.0`)
- ✅ Build Android APK and iOS IPA using EAS
- ✅ Download the build artifacts
- ✅ Create a GitHub release with the artifacts attached
- ✅ Use release notes from `docs/release-notes.md`

### Step 4: Create a Release

To trigger a release:

```bash
# 1. Update version in package.json and app.json
# 2. Commit changes
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Action will automatically:
1. Build both Android and iOS apps
2. Wait for builds to complete
3. Download the artifacts
4. Create a GitHub release with the APK and IPA attached

---

## Manual Alternative

If you prefer to create releases manually:

1. **Build with EAS**:
   ```bash
   cd src
   eas build --platform all --profile production
   ```

2. **Wait for builds to complete**, then download:
   ```bash
   eas build:download --latest --platform android
   eas build:download --latest --platform ios
   ```

3. **Create GitHub Release manually**:
   - Go to GitHub → Releases → Draft a new release
   - Tag: `v1.0.0`
   - Title: `Release v1.0.0`
   - Description: Copy from `docs/release-notes.md`
   - Upload APK and IPA files
   - Publish release

---

## Workflow Customization

The workflow file (`.github/workflows/eas-build-and-release.yml`) can be customized:

- **Change build profile**: Edit `--profile production` to `--profile preview`
- **Build only one platform**: Remove the iOS or Android build step
- **Add more artifacts**: Add additional files to the `files:` section
- **Change trigger**: Modify the `on:` section (e.g., trigger on push to `main`)

---

## Troubleshooting

### Build Fails
- Check EAS build logs in Expo dashboard
- Verify `EXPO_TOKEN` secret is correct
- Ensure EAS project is configured

### Release Not Created
- Check GitHub Actions tab for workflow errors
- Verify tag was pushed correctly
- Check workflow file syntax

### Artifacts Missing
- Ensure build completed successfully
- Check download steps in workflow
- Verify file paths are correct

---

## Notes

- **Build Time**: EAS builds typically take 10-20 minutes per platform
- **Cost**: EAS builds are free for open source projects, paid plans for private repos
- **Storage**: GitHub releases have a 2GB file size limit per file
- **APK Size**: Typically 20-50MB, well within limits
- **IPA Size**: Typically 50-100MB, well within limits

---

## References

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)
