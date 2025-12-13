# Source Pattern Update Summary

**Date**: December 12, 2025  
**Status**: ✅ Complete

---

## Change Made

Renamed `Accounting/` folder to `src/` to follow user's preferred structure.

```
Before:
C:\Project\Accounting\
├── .cursor/
├── docs/
└── Accounting/         # Expo project
    ├── app/
    ├── assets/
    └── package.json

After:
C:\Project\Accounting\
├── .cursor/
├── docs/
└── src/                # Expo project (renamed)
    ├── app/
    ├── assets/
    └── package.json
```

---

## Final Structure

```
C:\Project\Accounting\
├── .cursor/                # Project rules
├── docs/                   # Documentation
├── src/                    # Expo project (mobile app)
│   ├── app/                # Expo Router screens
│   ├── domain/             # Clean Architecture: Business logic (to be added)
│   ├── data/               # Clean Architecture: Data layer (to be added)
│   ├── presentation/       # Clean Architecture: UI components (to be added)
│   ├── infrastructure/     # Clean Architecture: External services (to be added)
│   ├── assets/             # Images, fonts
│   ├── constants/          # Constants
│   ├── hooks/              # React hooks
│   ├── node_modules/       # Dependencies
│   ├── package.json        # npm configuration
│   ├── tsconfig.json       # TypeScript config
│   ├── app.json            # Expo config
│   └── metro.config.js     # Metro bundler config
├── todo.md                 # Task tracking
└── .gitignore              # Git ignore rules
```

---

## Rules Updated

### 1. `.cursor/rules/00-expo-setup.mdc`
- ✅ Updated "Create New Project" to show rename step
- ✅ Updated "First Run" to cd into `src/`
- ✅ Updated "Project Structure" to show `src/` pattern
- ✅ Updated "Key Expo Commands" to always `cd src/` first

### 2. `.cursor/rules/01-project-overview.mdc`
- ✅ Updated "Project Structure" to show `src/` as Expo project root
- ✅ Shown Clean Architecture folders inside `src/`

### 3. `.cursor/rules/02-expo-workflow.mdc`
- ✅ Updated "Daily Development" commands to cd into `src/`
- ✅ Merged "File Structure (Current)" and "File Structure (After Adding Clean Architecture)" into one
- ✅ Updated "Path Aliases" to reflect paths from `src/tsconfig.json`
- ✅ Updated "What to Commit" section
- ✅ Updated "Quick Command Reference" to show `cd src/` first

---

## How to Run Commands

**IMPORTANT**: All npm/expo commands must be run from the `src/` directory:

```powershell
# Always cd first
cd C:\Project\Accounting\src

# Then run commands
npm start
npm run android
npm run web
npx expo install expo-sqlite
```

---

## Benefits of This Structure

### 1. Clean Separation ✅
- Rules and docs at root
- Mobile app contained in `src/`
- Clear boundary between project management and code

### 2. Future Extensibility ✅
Easy to add other components later:
```
C:\Project\Accounting\
├── .cursor/
├── docs/
├── src/          # Mobile app
├── backend/      # Future: API server
├── web/          # Future: Web version
└── admin/        # Future: Admin panel
```

### 3. Consistent Pattern ✅
- Many monorepos use similar pattern
- `src/` clearly indicates source code
- Familiar to developers

---

## Next Steps

1. **Test that app still works**:
   ```powershell
   cd C:\Project\Accounting\src
   npm run android
   ```

2. **Add Clean Architecture folders** inside `src/`:
   ```
   src/
   ├── domain/
   ├── data/
   ├── presentation/
   └── infrastructure/
   ```

3. **Update `src/tsconfig.json`** with path aliases:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/domain/*": ["./domain/*"],
         "@/data/*": ["./data/*"],
         "@/presentation/*": ["./presentation/*"],
         "@/infrastructure/*": ["./infrastructure/*"]
       }
     }
   }
   ```

4. **Install dependencies**:
   ```powershell
   cd src
   npm install firebase
   npx expo install expo-sqlite
   npx expo install expo-secure-store
   ```

---

## AI Assistant Reminders

When working on this project:

1. ✅ **Always mention cd step** in commands:
   ```powershell
   cd C:\Project\Accounting\src
   npm start
   ```

2. ✅ **Path aliases are relative to src/**:
   ```typescript
   // In src/app/(tabs)/index.tsx
   import { User } from '@/domain/entities/User';  // Refers to src/domain/
   ```

3. ✅ **Clean Architecture folders go inside src/**:
   ```
   src/domain/      NOT  domain/
   src/data/        NOT  data/
   ```

4. ✅ **package.json is in src/**:
   - Dependencies: `src/package.json`
   - Install: `cd src && npm install`

---

## Documentation References

- **Setup**: `.cursor/rules/00-expo-setup.mdc`
- **Workflow**: `.cursor/rules/02-expo-workflow.mdc`
- **Project Overview**: `.cursor/rules/01-project-overview.mdc`
- **Architecture**: `docs/architecture/data-model.md`

---

**Status**: ✅ Rules updated to match `src/` pattern. Ready to continue development.

