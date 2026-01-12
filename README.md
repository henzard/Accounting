# 💰 Dave Ramsey Budgeting App

> **A mobile-first, offline-capable budgeting application following Dave Ramsey's proven financial principles**

[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-green)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 What Is This?

A **mobile budgeting app** that helps you take control of your finances using **Dave Ramsey's 7 Baby Steps** system. Built with **React Native (Expo)** and **Firebase** for seamless offline-first functionality.

### Why This App?

- ✅ **Works offline** - Add transactions anywhere, syncs when connected
- ✅ **Zero-based budgeting** - Every dollar has a job
- ✅ **Debt snowball tracking** - Pay off debts strategically
- ✅ **Envelope system** - Digital cash envelopes for categories
- ✅ **Shared households** - Couples manage finances together
- ✅ **Business expense tracking** - Track reimbursables separately

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Android Studio + Android Emulator ([Setup Guide](https://docs.expo.dev/get-started/set-up-your-environment/))
- Firebase account ([Get Started](https://console.firebase.google.com/))
- Git ([Download](https://git-scm.com/))

### Installation

```powershell
# 1. Clone the repository
git clone https://github.com/henzard/Accounting.git
cd Accounting

# 2. Install dependencies
cd src
npm install

# 3. Configure Firebase (see setup guide below)
# Copy src/env.example to src/.env
# Fill in your Firebase credentials

# 4. Run the app
npm run android  # For Android
npm run ios      # For iOS (Mac only)
npm run web      # For web browser
```

---

## 🔧 Firebase Setup (Required)

This app requires Firebase for data storage and authentication.

**Quick Setup** (5 minutes):

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project

2. **Enable Services**
   - Firestore Database (production mode)
   - Authentication (Email/Password + Google)
   - Storage (for receipt photos)

3. **Get Configuration**
   - Add Web app to your project
   - Copy the `firebaseConfig` object

4. **Configure App**
   ```powershell
   # Copy template
   cd src
   copy env.example .env
   
   # Edit .env with your Firebase credentials
   # (Use your favorite text editor)
   ```

**Detailed Guide**: See [`src/infrastructure/firebase/README.md`](src/infrastructure/firebase/README.md)

---

## 📚 Documentation

### 📖 Start Here
- **[START-HERE.md](docs/START-HERE.md)** - Complete project guide
- **[PROJECT-BRIEF.md](docs/PROJECT-BRIEF.md)** - App features & requirements
- **[MASTER-TODO.md](MASTER-TODO.md)** - Development roadmap

### 🏗️ Architecture
- **[Data Model](docs/architecture/data-model.md)** - Firestore schema
- **[Dave Ramsey System](docs/architecture/dave-ramsey-system.md)** - Business logic
- **[Business Expenses](docs/architecture/business-expenses.md)** - Reimbursement workflow

### 📋 Architecture Decision Records (ADRs)
- **[ADR 001](docs/architecture/decisions/001-firebase-over-sqlite.md)** - Why Firebase?
- **[ADR 002](docs/architecture/decisions/002-offline-first-strategy.md)** - Offline approach
- **[ADR 003](docs/architecture/decisions/003-append-only-transactions.md)** - Financial integrity

### 🎨 Design & UI
- **[Premium UI Standards](.cursor/rules/37-premium-ui-standards.mdc)** - Design system rules
- **[Color Theme](docs/design/color-theme.md)** - "Polished Luxury" light & "Midnight Precision" dark
- **[Typography Pairing](docs/design/typography-pairing.md)** - Font recommendations
- **[Component Tiers](docs/design/component-tiers-guide.md)** - Enforced component hierarchy
- **[Typography Migration](docs/migration/typography-migration.md)** - Migration guide

### 🔒 Security
- **[Firebase Setup](docs/setup/firebase-setup.md)** - Secure configuration
- **[Security Rules](.cursor/rules/12-security-rules.mdc)** - Public repo guidelines

---

## 🏛️ Architecture

This project follows **Clean Architecture** principles:

```
src/
├── domain/              # Business logic (framework-independent)
│   ├── entities/        # User, Transaction, Budget, etc.
│   ├── repositories/    # Interfaces (contracts)
│   └── use-cases/       # Business rules
├── data/                # Data layer (implements repositories)
│   └── repositories/    # Firestore implementations
├── presentation/        # UI layer
│   ├── components/      # Reusable components
│   └── screens/         # Feature screens
├── infrastructure/      # External services
│   └── firebase/        # Firebase configuration
└── shared/              # Utilities, constants, types
```

**Benefits**:
- ✅ Testable business logic
- ✅ Framework-independent domain
- ✅ Easy to swap data sources
- ✅ Clear separation of concerns

---

## 💡 Key Features

### Dave Ramsey's 7 Baby Steps
Track your progress through the proven financial plan:
1. $1,000 Emergency Fund
2. Pay Off All Debt (Except House)
3. 3-6 Months Emergency Fund
4. Invest 15% for Retirement
5. College Fund for Kids
6. Pay Off Home Early
7. Build Wealth & Give

### Zero-Based Budgeting
- **Every dollar has a job** before the month begins
- Income - Expenses = $0
- Plan spending, track actuals
- Copy budgets month-to-month

### Debt Snowball
- List debts smallest to largest
- Pay minimums on all
- Attack smallest with intensity
- Roll payments to next debt
- **Psychological wins** drive motivation

### Envelope System (Digital)
- Allocate money to categories
- Track spending per envelope
- Visual progress bars
- Alerts when overspending

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native (Expo) |
| **Language** | TypeScript |
| **Backend** | Firebase/Firestore |
| **Database** | Firestore (offline-first) |
| **Authentication** | Firebase Auth |
| **Storage** | Firebase Storage |
| **State Management** | MobX |
| **Forms** | React Hook Form + Yup |
| **Navigation** | Expo Router (file-based) |
| **Testing** | Jest + Expo Testing Library |

---

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **Android** | ✅ Primary | Fully supported |
| **iOS** | 🔄 Planned | Expo makes this easy |
| **Web** | 🔄 Future | PWA possible |

---

## 🧪 Testing

### Test the App

```powershell
# Run on Android emulator
cd src
npm run android
```

### Test Firebase Connection

The app includes a built-in Firebase test screen:

1. Open the app
2. Tap **"Firebase Test"** from home screen
3. Test write, read, and offline capabilities
4. Verify sync works

---

## 📐 Development Workflow

### AI-Driven Development

This project uses **AI Driver Leader** principles:

- **You drive** (strategic decisions)
- **AI implements** (tactical execution)
- **Small increments** with frequent testing
- See: [`PROMPT-GUIDE.md`](PROMPT-GUIDE.md)

### Making Changes

1. Check [`MASTER-TODO.md`](MASTER-TODO.md) for current phase
2. Read relevant docs in `docs/`
3. Follow rules in `.cursor/rules/`
4. Test after every change: `npm run android`
5. Commit when phase complete

---

## 🔐 Security (Public Repository)

⚠️ **This is a PUBLIC repository.**

**NEVER commit**:
- ❌ `.env` files (real credentials)
- ❌ `google-services.json`
- ❌ API keys or secrets
- ❌ Log files
- ❌ Personal information

**DO commit**:
- ✅ `.env.example` (templates with placeholders)
- ✅ Code with `YOUR_API_KEY_HERE` placeholders
- ✅ Documentation
- ✅ Tests

See: [Security Rules](.cursor/rules/12-security-rules.mdc)

---

## 📊 Project Status

### Current Phase: **Phase 3.4** - Test Firebase Connection

**What's Complete**:
- ✅ Clean Architecture foundation
- ✅ Domain entities (7 entities)
- ✅ Repository interfaces (6 repositories)
- ✅ Use cases (5 core use cases)
- ✅ Firestore implementations (6 repositories)
- ✅ Firebase configuration
- ✅ TypeScript path aliases
- ✅ Offline persistence enabled

**Next Up**:
- 🔄 Test Firebase connection
- ⏳ Build UI components (theme system)
- ⏳ Create authentication flow
- ⏳ Build transaction entry screen
- ⏳ Implement budgeting UI

**Progress**: ~30% to MVP

---

## 🤝 Contributing

### Development Environment

**OS**: Windows 10/11  
**Shell**: PowerShell  
**IDE**: Cursor / VS Code

### Coding Standards

- **TypeScript strict mode** - No `any` types
- **Clean Architecture** - Respect layer boundaries
- **Premium UI Standards** - 8pt grid, 8 text styles max, component tiers
- **Test after changes** - Run `npm run android` frequently
- **Path aliases** - Use `@/domain`, `@/data`, etc.
- **Conventional commits** - `feat:`, `fix:`, `docs:`, etc.

See: [`.cursor/rules/`](.cursor/rules/) for complete guidelines

### Design Standards

This app follows **Premium UI/UX Standards** for a luxury, expensive feel:

- **8pt Grid System** - Strict spacing (4, 8, 12, 16, 20, 24, 32, 40, 48 only)
- **Typography** - Maximum 8 text styles, semibold headlines, 1.4× body line height
- **Colors** - Neutrals dominate (85-95%), no pure black/white, gold accent (1-3%)
- **Component Tiers** - Enforced variants (AppText, Surface, Button)
- **Motion** - Micro-animations only (150-220ms), no bouncy transitions

See: [Premium UI Standards](.cursor/rules/37-premium-ui-standards.mdc) for complete rules

---

## 📖 Learning Resources

### Dave Ramsey's System
- [The Total Money Makeover](https://www.ramseysolutions.com/store/product/the-total-money-makeover) (Book)
- [Baby Steps](https://www.ramseysolutions.com/dave-ramsey-7-baby-steps) (Official Guide)
- [EveryDollar App](https://www.everydollar.com/) (Official app - inspiration)

### Technical Resources
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 🐛 Troubleshooting

### App Won't Build?

```powershell
# Clean and rebuild
cd src
npm run android
```

### Firebase Not Working?

1. Check `src/infrastructure/firebase/config.ts` exists
2. Verify Firebase project has Firestore enabled
3. Use Firebase test screen to diagnose
4. See: `src/infrastructure/firebase/README.md`

### Emulator Issues?

```powershell
# Check emulator status
adb devices

# Restart Metro bundler
npm start -- --clear
```

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Dave Ramsey** - For the financial principles that inspired this app
- **Clean Architecture** - Uncle Bob's architectural pattern
- **Expo Team** - For making React Native development accessible
- **Firebase** - For offline-first capabilities

---

## 📞 Support

- **Documentation**: See [`docs/START-HERE.md`](docs/START-HERE.md)
- **Issues**: [GitHub Issues](https://github.com/henzard/Accounting/issues)
- **Discussions**: [GitHub Discussions](https://github.com/henzard/Accounting/discussions)

---

<p align="center">
  <strong>Built with ❤️ using Expo, Firebase, and Clean Architecture</strong>
</p>

<p align="center">
  <em>"Tell your money where to go instead of wondering where it went." - Dave Ramsey</em>
</p>

