# Release Notes

## v1.0.1 - 2026-02-06

### 🐛 Bug Fixes

#### Android Alert Context Issue
- Fixed "Tried to show an alert while not attached to an Activity" error on Android
- Replaced native `Alert.alert` with state-based modal components for seed categories confirmation
- Improved modal styling with proper elevation, shadow, and layout
- Added success message modal to avoid Activity context timing issues

### 🔧 Technical Improvements

#### Category Management UX
- Enhanced seed categories modal with better styling and user feedback
- Added loading states during category seeding process
- Improved error handling for category operations
- Added comprehensive logging for debugging category operations

#### Code Quality
- Moved audit documentation to proper location (`docs/issues/`)
- Cleaned up root folder per documentation standards
- Organized temporary files into appropriate directories
- Improved code organization and maintainability

---

# Release Notes - v1.0.0

## 🎉 Major Release: Complete MVP Features + Receipt Management

This release completes all MVP features (Phases 5.1-5.9) and adds receipt photo management (Phase 6.2), along with critical bug fixes and UX improvements.

---

## ✨ New Features

### 📊 Budget Management (Phase 5.5)
- **Complete budget creation UI** with month navigation
- **Category management screen** with full CRUD operations
- **Load Dave Ramsey default categories** with one-click reset
- **Custom pay period support** (period start/end dates)
- **Household settings screen** for budget period configuration
- **Zero-based budget calculation** and validation
- **UX improvements**: search, bulk operations, empty states, collapsible groups

### 💸 Transaction Entry (Phase 5.6)
- **Full transaction CRUD** (Create, Read, Update, Delete)
- **Budget integration**: Transactions automatically update category actual amounts
- **Smart budget updates**: Handles category changes and deletions correctly
- **Date grouping** in transaction list (Today, Yesterday, This Week, etc.)
- **Search and filter** functionality
- **Multi-currency support**
- **Offline-first** with real-time sync when online

### 📈 Category Tracking (Phase 5.7)
- **Category list screen** showing planned vs actual amounts
- **Progress bars** for each category
- **Color coding**: Green (good), Yellow (warning), Red (overspent)
- **Collapsible category groups**
- **Search functionality**

### ⛓️ Debt Snowball (Phase 5.8)
- **Debt list screen** with snowball ordering (smallest balance first)
- **Add debt screen** with all required fields
- **Focus debt highlighting**
- **Payoff projections**
- **Mark debt as paid off** with celebration animation
- **Automatic roll to next debt** when one is paid off

### 🏠 Dashboard/Home Screen (Phase 5.9)
- **Financial overview dashboard** with:
  - Current Baby Step progress
  - Current month budget status (planned income, expenses, remaining)
  - Recent transactions (last 5)
  - Debt snowball progress (if in Baby Step 2)
- **Quick actions**: Add Transaction, View Budget
- **Household switcher** and **theme toggle** in header
- **Pull-to-refresh** functionality

### 👥 Household Management (Phase 6.0)
- **Manage Households screen** with full CRUD
- **List all households** user belongs to
- **Switch default household**
- **Edit household name**
- **Delete household** (with safety checks)
- **Household members management**:
  - Add members by email
  - Remove members
  - Owner-only permissions
- **Household switcher button** in all headers
- **Theme toggle button** in all headers

### 💼 Business Expense Tracking (Phase 6.1)
- **Business entity** with multi-business support
- **Mark transactions as business expenses**
- **Select business/employer** for transactions
- **Reimbursement type** selection (Reimbursable, Business Owned)
- **Reimbursement claims** system:
  - Create claims from unclaimed expenses
  - View claim details
  - Track claim status
- **Business management screen** with CRUD operations

### 📷 Receipt Photo Management (Phase 6.2)
- **Upload receipt photos** when adding/editing transactions
- **Take photos with camera** or choose from gallery
- **View receipts** in transaction detail screen
- **Full-screen receipt viewer** modal
- **Delete receipts** from Firebase Storage
- **Firebase Storage integration** with CORS support
- **Graceful error handling** if upload fails

---

## 🐛 Bug Fixes

### Critical Fixes
- ✅ Fixed Firestore composite index requirement in `getBudgetByMonth` query (dashboard loading error)
- ✅ Fixed household duplication issue
- ✅ Fixed claims detail infinite loop
- ✅ Fixed undefined `reimbursement_type` Firestore error
- ✅ Fixed async/await issue in household members screen
- ✅ Fixed receipt modal close functionality
- ✅ Fixed dashboard loading error on mobile

### UI/UX Fixes
- ✅ Fixed missing tab bar icons for Transactions and More tabs
- ✅ Fixed SearchableSelect filter issues
- ✅ Fixed budget screen TypeScript errors
- ✅ Fixed zero-based budget calculation
- ✅ Fixed immutable state updates in budget save
- ✅ Fixed missing `getMasterCategoriesByHousehold` method
- ✅ Fixed TextInput `onSelect` prop issue

---

## 🎨 UX Improvements

### Standard UX Patterns Established
- **Search/Filter Bar**: Real-time filtering across list screens
- **Collapsible Groups**: Reduce scrolling with expandable sections
- **Icon Buttons**: Visual actions over text
- **Empty States**: Helpful guidance when no data
- **Count Badges**: Quick overview of items
- **Status Indicators**: Visual state representation
- **Bulk Selection Mode**: Efficient multi-item actions

### Premium UI Standards
- **8pt grid system** for consistent spacing
- **Typography system** with 8 text styles max
- **Color system** with 85-95% neutrals, 3-10% primary, 1-3% accent
- **Consistent border radius** scale
- **Button heights** 48-52px
- **Touch targets** minimum 44×44px
- **Micro-animations** (150-220ms)

---

## 📚 Documentation

### New Documentation
- ✅ Firebase Storage setup guide (`docs/setup/firebase-storage-setup.md`)
- ✅ Firebase Storage security rules (`docs/security/firebase-storage-rules.md`)
- ✅ UX patterns guide (`docs/design/ux-patterns.md`)
- ✅ Premium UI standards (`.cursor/rules/37-premium-ui-standards.mdc`)
- ✅ Web alert compatibility rules (`.cursor/rules/35-web-alert-compatibility.mdc`)
- ✅ ADR 005: MVP budget simplifications (`docs/architecture/decisions/005-mvp-simplifications.md`)

### Updated Documentation
- ✅ MASTER-TODO.md with all phase completions
- ✅ Project status documentation
- ✅ Component tiers guide
- ✅ Typography pairing guide

---

## 🔧 Technical Improvements

### Code Quality
- ✅ Refactored `showConfirm` to return Promise for better async handling
- ✅ Improved error handling for receipt uploads (graceful fallback)
- ✅ Optimized Firestore queries to avoid composite index requirements
- ✅ Added receipt deletion utility functions
- ✅ Cross-platform alert utilities (`showAlert`, `showConfirm`)

### Architecture
- ✅ Clean Architecture maintained throughout
- ✅ Domain-driven design patterns
- ✅ Repository pattern for data access
- ✅ Offline-first strategy with Firestore

### Dependencies
- ✅ Added `expo-image-picker` for receipt photos
- ✅ Added `expo-image` for optimized image display

---

## 📦 Build Information

- **Version**: 1.0.0
- **EAS Build**: Android preview build completed
- **Platform Support**: Android, iOS, Web
- **Firebase**: Firestore + Storage integration

---

## 🚀 What's Next

- Phase 6.3: Additional polish and testing
- Production build preparation
- App store submission preparation

---

## 📝 Commit Summary

This release includes **33 commits** covering:
- Budget creation and management features
- Transaction entry and tracking
- Category management
- Debt snowball functionality
- Dashboard implementation
- Household management
- Business expense tracking
- Receipt photo management
- Critical bug fixes
- UX improvements
- Documentation updates

---

## 🙏 Thank You

Thank you for using the Dave Ramsey Budgeting App! This release represents a major milestone with all core MVP features complete.

For issues or feature requests, please open an issue on GitHub.
