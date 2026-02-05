---
task: Complete Phase 6 - Polish & Production Features for Dave Ramsey Budgeting App
test_command: "cd src && npm run android"
---

# Task: Phase 6 - Polish & Production Features

Complete the remaining Phase 6 features to make the Dave Ramsey budgeting app production-ready. This is a React Native + Expo app using Firebase (Firestore + Auth + Storage) with TypeScript and clean architecture.

## Project Context

**What's Already Built:**
- ✅ Complete MVP (Phases 0-5): Auth, Households, Budgets, Accounts, Transactions, Debt Snowball, Dashboard
- ✅ Phase 6.0-6.2: Household Management, Business Expense Tracking, Receipt Photos
- ✅ Phase 6.2.5: Recent bug fixes (auth flow, currency formatting, UI spacing)
- ✅ Firebase integration (Auth, Firestore, Storage)
- ✅ Clean architecture (Domain, Data, Presentation, Infrastructure layers)
- ✅ Theme system (light/dark mode)
- ✅ Multi-currency support

**Architecture:**
- `src/domain/` - Entities and use cases (business logic)
- `src/data/` - Repository interfaces
- `src/infrastructure/` - Firebase implementations
- `src/presentation/` - React Native components and screens
- `src/app/` - Expo Router screens (file-based routing)
- `src/shared/` - Utilities, theme, types

**Key Libraries:**
- Expo SDK 52
- React Native 0.76
- Firebase v10
- TypeScript
- Expo Router (file-based navigation)

## Success Criteria

### Phase 6.3: Sinking Funds (Goals) <!-- group: 1 -->

1. [ ] Create `Goal` entity in `src/domain/entities/Goal.ts` with fields: id, name, target_amount, current_amount, target_date, linked_category_id, household_id
2. [ ] Create `GoalRepository` interface in `src/data/repositories/GoalRepository.ts` with CRUD + getByHousehold methods
3. [ ] Create `FirebaseGoalRepository` in `src/infrastructure/repositories/FirebaseGoalRepository.ts` using Firestore
4. [ ] Create Goals list screen at `src/app/goals/index.tsx` showing all goals with progress bars
5. [ ] Create Add Goal screen at `src/app/goals/add.tsx` with form (name, target amount, target date, linked category)
6. [ ] Create Edit Goal screen at `src/app/goals/edit.tsx` to modify existing goals
7. [ ] Add navigation to Goals from More/Settings tab
8. [ ] Display goal progress (percentage complete, days remaining, on track status)
9. [ ] Update goal's current_amount when transactions occur in linked category
10. [ ] Add goal progress visualization component with animated progress bar
11. [ ] Test app runs and goals can be created/tracked

### Phase 6.4: Date Picker Component <!-- group: 1 -->

12. [ ] Install `expo-datetime-picker` or `@react-native-community/datetimepicker`
13. [ ] Create reusable `DatePicker` component in `src/presentation/components/DatePicker.tsx`
14. [ ] Support both iOS and Android native date pickers
15. [ ] Add date formatting and validation
16. [ ] Replace hardcoded date fields in transaction add/edit screens
17. [ ] Add date picker to budget creation (select month)
18. [ ] Add date picker to goal creation (target date)
19. [ ] Test date selection works on both platforms

### Phase 6.5: Account Transfers <!-- group: 1 -->

20. [ ] Create `Transfer` entity in `src/domain/entities/Transfer.ts` with from_account_id, to_account_id, amount, date, memo
21. [ ] Create transfer functionality that creates two linked transactions (one debit, one credit)
22. [ ] Mark transfer transactions with type flag to exclude from budget
23. [ ] Create Add Transfer screen at `src/app/transfers/add.tsx` with from/to account pickers
24. [ ] Update transaction list to show transfer icon and "Transfer from X to Y" label
25. [ ] Update account balance calculations to include transfers
26. [ ] Add "Transfer" button to accounts list screen
27. [ ] Test transfers work and don't affect budget calculations

### Phase 6.6: Recurring Transactions <!-- group: 2 -->

28. [ ] Create `RecurringTransaction` entity in `src/domain/entities/RecurringTransaction.ts` with frequency, start_date, end_date, last_created_date
29. [ ] Create `RecurringTransactionRepository` in data and infrastructure layers
30. [ ] Create Recurring Transactions list screen at `src/app/recurring/index.tsx`
31. [ ] Create Add/Edit Recurring screens at `src/app/recurring/add.tsx` and `edit.tsx`
32. [ ] Add frequency picker (monthly, weekly, biweekly, yearly)
33. [ ] Create background job/hook to check for due recurring transactions on app launch
34. [ ] Auto-create actual transactions from recurring rules when due
35. [ ] Add "Skip this month" functionality
36. [ ] Add navigation from More/Settings tab
37. [ ] Test recurring transactions are created automatically

### Phase 6.7: Budget Templates <!-- group: 2 -->

38. [ ] Create `BudgetTemplate` entity in `src/domain/entities/BudgetTemplate.ts` with name and category_allocations array
39. [ ] Create `BudgetTemplateRepository` in data and infrastructure layers
40. [ ] Add "Save as Template" button to budget screen header
41. [ ] Create template save dialog to name the template
42. [ ] Add "Create from Template" option when creating new budget
43. [ ] Show template picker and pre-fill categories/amounts from template
44. [ ] Create "Copy Previous Month" quick action button
45. [ ] Create Templates management screen at `src/app/templates/index.tsx` to edit/delete templates
46. [ ] Test templates can be saved and reused

### Phase 6.8: Search & Filters <!-- group: 2 -->

47. [ ] Add search bar to transaction list screen with debounced search by memo/payee
48. [ ] Create filter UI component (modal/sheet) for transactions
49. [ ] Add filter by category with category picker
50. [ ] Add filter by account with account picker
51. [ ] Add filter by date range with date pickers
52. [ ] Add filter by amount range with min/max inputs
53. [ ] Add sort options (date newest/oldest, amount high/low, payee A-Z)
54. [ ] Show active filter count badge on filter button
55. [ ] Add "Clear filters" button
56. [ ] Test search and filters work correctly

### Phase 6.9: Export Data <!-- group: 2 -->

57. [ ] Create CSV export utility in `src/shared/utils/export.ts` for transactions
58. [ ] Add CSV export for budgets, accounts, and debts
59. [ ] Format CSV for Excel/Google Sheets compatibility
60. [ ] Create JSON export for full backup (all user data)
61. [ ] Create Export screen at `src/app/settings/export.tsx` with data type and format choosers
62. [ ] Add date range filter for exports
63. [ ] Integrate system share sheet to save/share exported files
64. [ ] Add navigation from More/Settings tab
65. [ ] Test exports generate correct files

### Phase 6.10: Reports & Analytics <!-- group: 3 -->

66. [ ] Research and install charting library (react-native-chart-kit or victory-native)
67. [ ] Create Reports screen at `src/app/reports/index.tsx` with tab navigation
68. [ ] Add month/date range selector component
69. [ ] Create spending by category pie chart or bar chart
70. [ ] Add drill-down on category tap
71. [ ] Create income vs expenses line chart over time
72. [ ] Add trend lines and highlight overspending months
73. [ ] Create debt payoff projection chart based on snowball payments
74. [ ] Show debt-free date calculation
75. [ ] Add spending trends (compare to previous month, year-over-year)
76. [ ] Add navigation from More/Settings tab
77. [ ] Test all charts display correctly with real data

### Phase 6.11: Onboarding Flow <!-- group: 3 -->

78. [ ] Create welcome screen at `src/app/onboarding/welcome.tsx` with swipeable carousel
79. [ ] Add 3-5 onboarding slides explaining app value proposition and Homebase branding
80. [ ] Integrate Baby Step selector into onboarding with visual step cards
81. [ ] Create budget wizard at `src/app/onboarding/budget-wizard.tsx` with 3 steps (income, top categories, review)
82. [ ] Add account setup to onboarding with skip option
83. [ ] Save `has_completed_onboarding` flag to user document in Firestore
84. [ ] Add onboarding guard in app entry point to redirect if not complete
85. [ ] Add "Reset onboarding" option in settings for testing
86. [ ] Test new users are guided through onboarding

### Phase 6.12: Biometric Authentication <!-- group: 3 -->

87. [ ] Install `expo-local-authentication` library
88. [ ] Check device biometric support (Face ID, Touch ID, fingerprint)
89. [ ] Add "Enable Biometric Login" toggle in settings screen
90. [ ] Store biometric preference in user settings
91. [ ] Implement biometric prompt on app launch
92. [ ] Add fallback to email/password if biometric fails
93. [ ] Add "Lock app when inactive" option with configurable timeout
94. [ ] Handle biometric changes (re-prompt if data changes)
95. [ ] Test biometric login works on both iOS and Android

### Phase 6.13: Notifications & Reminders <!-- group: 3 -->

96. [ ] Setup push notification permissions request
97. [ ] Create budget reminder notification ("Time to create next month's budget")
98. [ ] Schedule reminder for 25th of each month (configurable)
99. [ ] Add bill due reminders linked to recurring transactions
100. [ ] Add goal progress notifications ("You're 50% to your vacation goal!")
101. [ ] Add overspending alerts ("You've exceeded your Dining Out budget")
102. [ ] Create notification settings screen at `src/app/settings/notifications.tsx`
103. [ ] Add toggles for each notification type
104. [ ] Test notifications trigger correctly

### Phase 6.14: Error Handling & Edge Cases <!-- group: 4 -->

105. [ ] Audit all screens for consistent loading states
106. [ ] Audit all screens for empty states with helpful messages
107. [ ] Add offline detection banner showing "Offline" when no connection
108. [ ] Implement sync conflict resolution strategy (last write wins with warning)
109. [ ] Add consistent form validation across all forms
110. [ ] Add network error recovery with retry and exponential backoff
111. [ ] Test with 0 accounts, 0 transactions, 100+ categories scenarios
112. [ ] Test with 1000+ transactions for performance
113. [ ] Test month boundaries (Dec 31 → Jan 1 transitions)
114. [ ] Test app doesn't crash in any production scenario

### Phase 6.15: Performance Optimization <!-- group: 4 -->

115. [ ] Create test data generator (1000+ transactions, 50+ categories)
116. [ ] Profile app with React DevTools Profiler to identify bottlenecks
117. [ ] Add Firestore indexes where needed (check console for warnings)
118. [ ] Add pagination to transaction list (50 at a time with "Load more")
119. [ ] Compress receipt photos before upload (< 1MB each)
120. [ ] Use thumbnails for receipt image list views
121. [ ] Add memoization with React.memo, useMemo, useCallback where needed
122. [ ] Batch Firestore writes where possible
123. [ ] Test app loads quickly and scrolling is smooth with large datasets

### Phase 6.16: Production Build <!-- group: 5 -->

124. [ ] Document production Firebase setup in `docs/guides/deployment.md`
125. [ ] Test local release APK with `local-build.ps1` script
126. [ ] Verify APK size is < 30MB
127. [ ] Test APK on multiple Android devices and emulators
128. [ ] Verify offline functionality works in release build
129. [ ] Verify Firebase works in release build
130. [ ] Update version in `app.json` to 1.0.0
131. [ ] Create changelog in `CHANGELOG.md`
132. [ ] Review Firebase security rules
133. [ ] Verify all sensitive data is secured
134. [ ] Test crash reporting (Firebase Crashlytics)
135. [ ] Verify production build is ready for distribution

## Technical Guidelines

### Clean Architecture Rules
- Keep business logic in `domain/` layer (entities, use cases)
- Repository interfaces in `data/`, implementations in `infrastructure/`
- UI in `presentation/`, screens in `app/`
- Follow existing patterns in the codebase

### Firebase Best Practices
- Use `getDoc` for single documents, `getDocs` for queries
- Always handle loading and error states
- Use Firestore offline persistence (already enabled)
- Filter in-memory when possible to avoid composite indexes
- Batch writes when creating related documents

### Currency Handling
- All amounts stored in cents (multiply by 100)
- Use `formatCurrency` utility from `src/shared/utils/currency.ts`
- NEVER divide by 100 before calling `formatCurrency` (it handles this)

### React Native Best Practices
- Use `ScreenWrapper` for consistent screen layout
- Use `ScreenHeader` for consistent headers
- Safe area insets are handled by components
- Use theme colors from `useTheme()` hook
- Test on both iOS and Android when UI changes are made

### Testing Protocol
After each feature:
1. Run `cd src && npm run android` to verify app still works
2. Test the new feature works correctly
3. Test existing features still work (no regressions)
4. Commit your work with descriptive message

### Code Quality
- Use TypeScript types (no `any`)
- Follow existing code style
- Add JSDoc comments for complex functions
- Handle all error cases
- Show user-friendly error messages

## Context Files

**Read these for architecture understanding:**
- `MASTER-TODO.md` - Full project roadmap
- `src/domain/entities/*.ts` - See entity patterns
- `src/infrastructure/repositories/*.ts` - See Firebase patterns
- `src/app/budget/index.tsx` - Example screen with complex logic
- `src/shared/utils/currency.ts` - Currency formatting

**Read these rules before making changes:**
- `.cursor/rules/02-clean-architecture.mdc` - Architecture patterns
- `.cursor/rules/03-coding-standards.mdc` - Code style
- `.cursor/rules/09-error-handling.mdc` - Error handling patterns
- `.cursor/rules/07-react-native-rules.mdc` - React Native best practices
- `.cursor/rules/23-database-rules.mdc` - Firestore patterns

## Ralph Instructions

1. **Work incrementally** - Complete criteria in order, one at a time
2. **Commit frequently** - After each criterion or logical unit, commit with: `git add -A && git commit -m 'ralph: [criterion #] - description'`
3. **Update progress** - Mark completed criteria as [x] in this file
4. **Test continuously** - Run `cd src && npm run android` after changes
5. **Read rules** - Check `.cursor/rules/` before major changes
6. **Follow patterns** - Match existing code style and architecture
7. **Handle errors** - Always add loading/error states to new screens
8. **When all [x]** - Output: `<ralph>COMPLETE</ralph>`
9. **If stuck 3x** - Output: `<ralph>GUTTER</ralph>` and explain issue
10. **Context warning** - If approaching token limit, wrap up current work and commit

## Priority Notes

- **Group 1-2** are the highest priority (Sinking Funds, Date Picker, Transfers, Recurring, Templates, Search, Export)
- **Group 3** adds polish (Reports, Onboarding, Biometric, Notifications)
- **Group 4** ensures quality (Error Handling, Performance)
- **Group 5** prepares for launch (Production Build)

Work through groups sequentially. Each group's tasks can be done in any order within the group.

---

**Remember**: This is a production app with real users. Write production-quality code with proper error handling, loading states, and user-friendly messages. Follow the existing patterns in the codebase.
