---
task: Phase 6.3 - Sinking Funds (Goals Feature)
test_command: "cd src && npm run android"
---

# Task: Phase 6.3 - Sinking Funds (Goals Feature)

Implement the Goals/Sinking Funds feature for the Dave Ramsey budgeting app. Users need to save for irregular expenses (Christmas, car repairs, vacations).

## Success Criteria

1. [ ] Create `Goal` entity in `src/domain/entities/Goal.ts` with fields: id, name, target_amount, current_amount, target_date, household_id, category_id, created_at, updated_at
2. [ ] Create `GoalRepository` interface in `src/domain/repositories/GoalRepository.ts` with CRUD methods
3. [ ] Implement `FirebaseGoalRepository` in `src/infrastructure/firebase/FirebaseGoalRepository.ts` using Firestore
4. [ ] Create Goals List screen at `src/app/goals/index.tsx` showing all goals with progress bars
5. [ ] Create Add Goal screen at `src/app/goals/add.tsx` with name, target amount, target date, optional category link
6. [ ] Create Edit Goal screen at `src/app/goals/edit.tsx` to modify existing goals
7. [ ] Add navigation tab/link to Goals screen from More/Settings tab
8. [ ] Show progress bars on Goals list with percentage complete (current_amount / target_amount * 100)
9. [ ] Show "Days remaining" indicator calculated from target_date
10. [ ] Show status indicator: "On track" (green), "Behind" (yellow), "Achieved" (blue if current >= target)
11. [ ] When transaction is added in a category linked to a goal, update goal's current_amount automatically
12. [ ] Test app runs without crashes and goals can be created, edited, viewed, and auto-updated

## Context

### Architecture
- Follow clean architecture: Domain > Data > Presentation > Infrastructure
- Use existing patterns from Budget, Account, Transaction features
- Store goals in Firestore under `households/{household_id}/goals/{goal_id}`

### Key Files to Reference
- `src/domain/entities/Budget.ts` - Entity pattern
- `src/infrastructure/firebase/FirebaseBudgetRepository.ts` - Firestore repository pattern
- `src/app/budget/index.tsx` - List screen pattern
- `src/app/budget/add.tsx` - Add screen pattern
- `src/app/accounts/index.tsx` - Progress indicators pattern

### UI Guidelines
- Use `ScreenWrapper` and `ScreenHeader` components
- Use theme colors from `useTheme()` hook
- Currency amounts should use `formatCurrency` from `src/shared/utils/currency.ts`
- Progress bars: Use React Native's `View` with dynamic width percentage
- Follow existing button and input component patterns

### Rules to Follow
- Read `.cursor/rules/` files before starting (especially 02-clean-architecture.mdc, 03-coding-standards.mdc, 23-database-rules.mdc)
- All amounts stored in cents (integers)
- Use TypeScript with strict types (no `any`)
- Use safe navigation operators (`?.`)
- Add proper error handling with try/catch
- Commit frequently with descriptive messages
- Test the app runs after each major change

---

## Ralph Instructions

1. Work on the next incomplete criterion (marked [ ])
2. Check off completed criteria (change [ ] to [x])
3. Run tests after changes
4. Commit your changes frequently
5. When ALL criteria are [x], output: `<ralph>COMPLETE</ralph>`
6. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`
