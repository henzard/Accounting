# Project Brief: Dave Ramsey Budgeting App

**Project Type**: Mobile Accounting/Budgeting Application  
**Platform**: React Native (iOS & Android)  
**Target Users**: Individuals and couples following Dave Ramsey's financial system  
**Last Updated**: December 11, 2024

---

## 🎯 Project Vision

Create an **offline-first mobile budgeting app** that implements Dave Ramsey's proven financial system, enabling users to take control of their money through:
- Zero-based budgeting
- Envelope system for spending control
- Baby Steps financial plan
- Debt Snowball method
- Multi-device sync with minimal infrastructure

---

## 💡 Core Problem Statement

People struggle with:
1. **Budgeting inconsistency** - Traditional apps are too complex or don't follow a proven system
2. **Offline limitations** - Need to record transactions even without internet
3. **Lack of accountability** - No clear path forward with their finances
4. **Multi-device chaos** - Couples can't easily share budgets across phones
5. **Business expense tracking** - Mixing personal and reimbursable expenses

---

## 🎯 Solution Overview

A mobile app that:
- ✅ **Follows Dave Ramsey's proven system** - Baby Steps, zero-based budgeting, envelope method
- ✅ **Works offline-first** - Record transactions anytime, sync when online
- ✅ **Syncs across devices** - Couples share one household budget automatically
- ✅ **Minimal infrastructure** - Firebase/Firestore (no custom backend to maintain)
- ✅ **Tracks business expenses** - Separate reimbursable expenses with receipt photos
- ✅ **Simple & focused** - Does one thing exceptionally well

---

## 👥 Target Users

### Primary User
**Dave Ramsey follower** (25-55 years old)
- Already familiar with Baby Steps
- Wants to implement zero-based budgeting
- Using cash envelopes or EveryDollar
- Needs offline capability (poor connectivity, prefer offline)
- May have spouse/partner sharing finances

### Secondary User
**Business professional** (30-50 years old)
- Needs to track business expenses for reimbursement
- Uses personal card for work expenses
- Submits monthly expense claims
- Needs receipt photo management

---

## 🏗️ Architecture Decisions

### Technology Stack
- **Frontend**: React Native (cross-platform mobile)
- **Backend**: Firebase/Firestore (managed BaaS)
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage (receipt photos)
- **Database**: Firestore (NoSQL, offline-first)
- **Local Cache**: Firestore offline persistence

### Key Architectural Choices
1. **Offline-First** - All operations work offline, sync when online
2. **UUID-based IDs** - Client-generated for offline writes
3. **Firebase over SQLite** - Real-time sync, no custom backend
4. **Clean Architecture** - Separation of concerns, testable
5. **Append-only transactions** - Financial integrity, audit trail

See: `docs/architecture/decisions/` for detailed ADRs

---

## 📊 Core Features

### 1. Dave Ramsey Baby Steps Tracker
**Priority**: Must Have  
**Complexity**: Medium

- Display current Baby Step (1-7)
- Show progress toward step goals
- Visual progress bars
- Suggest where extra money should go
- Celebrate completed steps

**Baby Steps**:
1. Save $1,000 emergency fund
2. Pay off debt (debt snowball)
3. Save 3-6 months expenses
4. Invest 15% for retirement
5. Save for kids' college
6. Pay off home early
7. Build wealth & give

### 2. Zero-Based Monthly Budget
**Priority**: Must Have  
**Complexity**: High

- Create/edit monthly budget
- Enforce: Income - Expenses = $0
- Plan all income categories
- Plan all expense categories
- Visual indicator when zero-based achieved
- Copy previous month as template

**Business Rules**:
- Must allocate every dollar
- Fresh budget each month
- Warn if not zero-based (but allow it)

### 3. Envelope System (Categories)
**Priority**: Must Have  
**Complexity**: Medium

- Budget categories as digital "envelopes"
- Track planned vs actual spending
- Show available balance per envelope
- Warn when envelope empty
- Support cash envelope mode (strict limits)

**Category Types**:
- Fixed (Rent, Insurance)
- Variable (Groceries, Gas)
- Sinking Funds (Christmas, Car Repairs)
- Debt Payments
- Saving
- Giving

### 4. Transaction Management
**Priority**: Must Have  
**Complexity**: Medium

- Add/edit transactions
- Allocate to one or multiple envelopes
- Support split transactions
- Mark cleared/pending
- Add notes
- Attach receipt photo
- Track capture delay (late entry tracking)

**Fields**:
- UUID (offline-friendly)
- Date (when transaction occurred)
- Amount
- Payee
- Account (which bank/card/cash)
- Category allocations
- Receipt photo
- Captured_at (when entered in app)
- Device ID (for sync debugging)

### 5. Debt Snowball
**Priority**: Must Have  
**Complexity**: Medium

- List all debts
- Order by balance (smallest → largest)
- Track minimum payments
- Show "snowball" extra payment
- Highlight current focus debt
- Show payoff projection
- Celebrate debt payoffs

**Debt Types**:
- Credit Card
- Personal Loan
- Student Loan
- Car Loan
- Other (exclude mortgage from Baby Step 2)

### 6. Accounts
**Priority**: Must Have  
**Complexity**: Low

- Bank accounts
- Credit cards
- Cash
- Savings accounts
- Track balances
- Link to transactions

### 7. Sinking Funds
**Priority**: Should Have  
**Complexity**: Medium

- Long-term savings goals
- Target amount & date
- Monthly funding amount
- Progress tracking
- Roll over unused amounts

**Examples**:
- Christmas ($1,200 by Dec)
- Car Insurance ($800 by June)
- Car Replacement ($10,000 in 3 years)
- Home Repairs ($2,000 emergency)

### 8. Business Expense Reimbursement
**Priority**: Must Have  
**Complexity**: Medium

- Mark transactions as business expense
- Tag reimbursement type (REIMBURSABLE, BUSINESS_OWNED)
- Tag reimbursement target (employer/client name)
- Group expenses into claims
- Track claim status (DRAFT, SUBMITTED, PAID)
- Attach receipt photos
- Link reimbursement payment to claim
- Show outstanding reimbursables

**Workflow**:
1. Tag transaction as business expense
2. Attach receipt photo
3. Create claim at end of period
4. Submit claim to employer
5. Mark as PAID when reimbursed

### 9. Multi-Device Sync
**Priority**: Must Have  
**Complexity**: Low (Firebase handles it)

- Real-time sync across devices
- Household sharing (couples)
- Conflict resolution (last-write-wins acceptable)
- Show sync status
- Work offline for months

### 10. Household Management
**Priority**: Must Have  
**Complexity**: Low

- Shared household data
- Multiple users per household
- All members have full access
- Transparent finances (Dave Ramsey philosophy)
- Single household timezone

---

## 🚫 Out of Scope (V1)

### Not Building
- ❌ Bank import/sync (Plaid integration)
- ❌ Investment tracking
- ❌ Bill reminders
- ❌ Credit score monitoring
- ❌ Tax preparation
- ❌ Financial advisor chat
- ❌ Social features
- ❌ Multiple currencies (future)
- ❌ Complex permissions (all household members equal)

### Maybe Later (V2)
- Bank account linking
- Automated transaction import
- Bill due date reminders
- Investment account tracking
- Multi-currency support
- Financial reports/insights
- Export to tax software

---

## 📱 User Journeys

### Journey 1: New User Setup
1. Download app
2. Create account (email/password or Google)
3. Create household
4. Select current Baby Step
5. Set up first month budget
6. Add bank accounts
7. Add debts (if any)
8. Start tracking transactions

### Journey 2: Monthly Budgeting
1. Open app at start of month
2. Copy last month's budget
3. Adjust for this month's income
4. Adjust category amounts
5. Ensure zero-based (income = expenses)
6. Save budget
7. Start month

### Journey 3: Recording Transaction
1. Make purchase (grocery store)
2. Open app (even if offline)
3. Add transaction
   - Date: today
   - Amount: $127.50
   - Payee: "Woolworths"
   - Account: "Credit Card"
   - Category: "Groceries" ($100) + "Household" ($27.50)
4. Optionally: Photo of receipt
5. Save
6. App syncs when online

### Journey 4: Business Expense Claim
1. Buy work flight on personal card (R4,000)
2. Record transaction:
   - Mark as REIMBURSABLE
   - Employer: "ACME Corp"
   - Category: Travel
   - Photo: receipt
3. At end of month:
   - Go to "Reimbursements"
   - Create new claim
   - Select unclaimed expenses
   - App generates claim (R12,500 total)
4. Submit to employer (future: export PDF)
5. When paid:
   - Record income transaction
   - Link to claim
   - Mark PAID

### Journey 5: Debt Snowball
1. Add all debts to app
2. App orders smallest → largest
3. App shows current focus debt
4. Make minimum payments on all
5. Put extra toward focus debt
6. When focus debt paid off:
   - Mark as paid
   - Celebrate! 🎉
   - App shifts to next debt
7. Repeat until debt-free

---

## 💰 Business Model

### Free Tier (V1)
- Single household
- Unlimited transactions
- Unlimited categories
- Unlimited debts
- All core features
- Firebase free tier limits

### Future Monetization Ideas
- Premium ($5/month):
  - Multiple households
  - Bank import
  - Advanced reports
  - Priority support
- One-time purchases:
  - Dave Ramsey premium content
  - Financial courses

---

## 🎨 Design Principles

### 1. Simple > Complex
- One main action per screen
- Clear visual hierarchy
- Minimal taps to common actions

### 2. Dave Ramsey Philosophy First
- Zero-based budgeting enforced gently
- Baby Steps progress always visible
- Envelope concept clear and intuitive
- Debt snowball order automatic

### 3. Offline-First UX
- No "offline" errors
- Show sync status subtly
- Optimistic UI updates
- Clear when data not synced

### 4. Trust & Transparency
- No hidden features
- Your data is yours (export anytime)
- Household data fully shared
- No tricks or dark patterns

---

## 📊 Success Metrics

### User Metrics
- **Activation**: User creates first budget
- **Engagement**: Transactions added per week
- **Retention**: 30-day active users
- **Completion**: Baby Step progression

### Business Metrics
- **Growth**: New signups per week
- **Quality**: Budget zero-based rate
- **Satisfaction**: App store ratings

### Technical Metrics
- **Performance**: Transaction entry < 3 taps
- **Reliability**: Offline success rate > 99%
- **Sync**: Conflict rate < 0.1%

---

## 🚀 Launch Strategy

### Phase 1: MVP (3 months)
- Core budgeting
- Transactions
- Baby Steps tracker
- Debt snowball
- Offline-first
- 2-device sync

### Phase 2: Polish (1 month)
- Business expenses
- Receipt photos
- Sinking funds
- Reports

### Phase 3: Beta (1 month)
- TestFlight/Beta testing
- Bug fixes
- Performance optimization
- User feedback

### Phase 4: Launch
- App Store submission
- Marketing
- Dave Ramsey community outreach

---

## 📚 References

- [Dave Ramsey Baby Steps](https://www.ramseysolutions.com/dave-ramsey-7-baby-steps)
- [Zero-Based Budgeting](https://www.ramseysolutions.com/budgeting/what-is-a-zero-based-budget)
- [EveryDollar App](https://www.everydollar.com/) (competitor analysis)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)

---

## 📝 Notes

- Keep it simple: Dave Ramsey's system is powerful because it's simple
- Offline-first: Many users prefer not being "always connected"
- Household sharing: Money conversations are crucial for couples
- No feature creep: Focus on doing budgeting exceptionally well
- Trust: Financial apps require the highest level of user trust

---

**Next Steps**: See `docs/architecture/` for technical specifications and data models.

