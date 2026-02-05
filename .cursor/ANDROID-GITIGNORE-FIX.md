# Android .gitignore Best Practices

**Date**: December 13, 2024  
**Issue**: Gradle wrapper files were incorrectly added to .gitignore  
**Status**: ✅ Fixed

---

## 🎯 The Problem

The `.gitignore` initially blocked:
- ❌ `android/gradle/` (entire directory)
- ❌ `android/gradlew` (wrapper script for Unix/Linux)
- ❌ `android/gradlew.bat` (wrapper script for Windows)

**Why this was wrong**:
- These files are part of the **Gradle Wrapper**
- They should be **committed to version control**
- They allow developers to build without pre-installing Gradle
- The project's own rules (rules/35-windows-environment.mdc) document using `.\gradlew.bat`

---

## ✅ The Solution

### Files to TRACK (Commit to Git)

```
android/
├── gradlew              ✅ Track (Unix wrapper script)
├── gradlew.bat          ✅ Track (Windows wrapper script)
└── gradle/
    └── wrapper/
        ├── gradle-wrapper.jar        ✅ Track (wrapper JAR)
        └── gradle-wrapper.properties ✅ Track (wrapper config)
```

### Files to IGNORE (Do NOT commit)

```
android/
├── build/               ❌ Ignore (build artifacts)
├── app/build/           ❌ Ignore (app build artifacts)
├── .gradle/             ❌ Ignore (Gradle cache)
├── local.properties     ❌ Ignore (local SDK paths)
├── *.apk                ❌ Ignore (built APKs)
└── *.aab                ❌ Ignore (built bundles)
```

---

## 📝 Correct .gitignore Entries

```gitignore
# Android
android/app/build/
android/build/
android/.gradle/
*.apk
*.aab

# NOTE: Gradle wrapper files (gradlew, gradlew.bat, gradle/) are TRACKED
# They allow developers to build without pre-installing Gradle
```

**Notice what's NOT in .gitignore**:
- `android/gradle/` directory (contains wrapper)
- `android/gradlew` script
- `android/gradlew.bat` script

---

## 🔍 Why the Gradle Wrapper Matters

### Purpose
The Gradle Wrapper ensures:
1. **Consistent builds** - Everyone uses the same Gradle version
2. **No manual installation** - Gradle downloads automatically on first build
3. **Version control** - The exact Gradle version is tracked in the repo

### How It Works
```powershell
# User runs build (no Gradle installed)
cd android
.\gradlew.bat assembleDebug

# Wrapper checks gradle-wrapper.properties
# Downloads the correct Gradle version if needed
# Runs the build with that version
```

### What Each File Does
| File | Purpose |
|------|---------|
| `gradlew` | Wrapper script for Unix/Linux/macOS |
| `gradlew.bat` | Wrapper script for Windows |
| `gradle/wrapper/gradle-wrapper.jar` | Bootstrap code to download Gradle |
| `gradle/wrapper/gradle-wrapper.properties` | Specifies Gradle version to use |

---

## 🧪 Verification

All tests pass:

```
✅ android/gradlew               → TRACKABLE (correct)
✅ android/gradlew.bat           → TRACKABLE (correct)
✅ android/gradle/wrapper/*.jar  → TRACKABLE (correct)
✅ android/gradle/wrapper/*.properties → TRACKABLE (correct)

✅ android/build/                → IGNORED (correct)
✅ android/.gradle/              → IGNORED (correct)
✅ *.apk                         → IGNORED (correct)
✅ android/local.properties      → IGNORED (correct)
```

---

## 📚 Reference

See project rules that use gradlew:
- `.cursor/rules/35-windows-environment.mdc` - Documents `.\gradlew.bat` usage
- `.cursor/rules/06-workflow-rules.mdc` - Build verification commands
- `.cursor/rules/02-expo-workflow.mdc` - Android build workflow

---

## 🎓 Key Takeaways

1. **DO commit Gradle wrapper files** - They're meant to be tracked
2. **DO ignore build artifacts** - build/, .gradle/, *.apk
3. **DO ignore local config** - local.properties
4. **Reference**: [Gradle Wrapper Docs](https://docs.gradle.org/current/userguide/gradle_wrapper.html)

---

**Status**: ✅ Fixed and Verified  
**Impact**: Developers can now build Android app without pre-installing Gradle

