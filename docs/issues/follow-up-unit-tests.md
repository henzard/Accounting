# GitHub Issue: test: add unit tests for new hooks, components, and use cases

> Create this as a GitHub issue at https://github.com/henzard/Accounting/issues/new

## Summary

The `feat/phase-6.3-next-features` branch introduced several new hooks, components, and use cases but no accompanying test files were added. Rule `04-testing-standards.mdc` requires 80%+ domain coverage and 70%+ data coverage.

## Test Coverage Needed

### New Hooks (highest priority)

| Hook | File | What to Test |
|---|---|---|
| `useTransactionForm` | `src/app/transactions/hooks/useTransactionForm.ts` | Form state management, validation logic, data loading with isMounted guard, receipt upload error handling, save flow with budget category update, business expense toggle |
| `useCategoryManager` | `src/app/budget/hooks/useCategoryManager.ts` | Category CRUD operations, bulk delete, seed defaults, reset to defaults, search/filter logic, group collapse, category usage loading, isMounted cleanup |

### New Components

| Component | File | What to Test |
|---|---|---|
| `CategoryFormModal` | `src/app/budget/components/CategoryFormModal.tsx` | Add mode vs edit mode rendering, form validation, group selection, save callback, cancel callback |

### Updated Components

| Component | File | What to Test |
|---|---|---|
| `DatePicker` | `src/presentation/components/DatePicker.tsx` | testID guard (undefined should not produce `undefined-picker`), label/helperText rendering |
| `ConfirmationModal` | `src/presentation/components/modals/confirmation-modal.tsx` | Confirm/cancel callbacks, overlay backdrop rendering |

### Use Cases

| Use Case | What to Test |
|---|---|
| `CreateGoalUseCase` | Validation, repository call, error propagation |
| `UpdateGoalUseCase` | Validation, repository call, error propagation |
| `AddToGoalUseCase` | Amount validation, repository call |

### Repository Extensions

| Repository | Methods to Test |
|---|---|
| `FirestoreBudgetRepository` | `createMasterCategory`, `updateMasterCategory`, `deleteMasterCategory`, `deleteMasterCategoriesByHousehold`, `bulkCreateMasterCategories` |

### Shared Utilities

| Utility | File | What to Test |
|---|---|---|
| `logger` | `src/shared/utils/logger.ts` | Log level filtering, environment-aware behavior (`__DEV__`), method signatures |

## Testing Approach

- Use Jest + React Testing Library for hooks and components
- Mock Firestore repositories at the interface boundary
- Test async flows with `act()` and proper cleanup verification
- Verify isMounted guards prevent state updates after unmount

## Labels

`testing`, `tech-debt`

## Rules Referenced

- `04-testing-standards.mdc`
