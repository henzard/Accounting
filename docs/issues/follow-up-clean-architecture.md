# GitHub Issue: refactor: clean architecture compliance for remaining 21 screens

> Create this as a GitHub issue at https://github.com/henzard/Accounting/issues/new

## Summary

During the PR review of `feat/phase-6.3-next-features`, five key screens were remediated to comply with clean architecture rules (`02-clean-architecture.mdc`), logging standards (`14-logging-standards.mdc`), performance rules (`21-performance-rules.mdc`), and null safety rules (`13-null-safety-rules.mdc`). However, **21 additional screen files** still contain the same class of violations and need to be addressed in a follow-up PR to avoid scope creep.

## Affected Files

The following files import directly from `firebase/firestore` in `src/app/`, violating the clean architecture boundary rule:

- `household/settings.tsx`
- `budget/index.tsx`
- `claims/add.tsx`
- `household/select.tsx`
- `(tabs)/index.tsx`
- `debts/index.tsx`
- `household/members.tsx`
- `baby-steps/select.tsx`
- `debts/add.tsx`
- `budget/categories.tsx`
- `household/manage.tsx`
- `reconcile/[id].tsx`
- `claims/index.tsx`
- `claims/[id].tsx`
- `household/create.tsx`
- `accounts/index.tsx`
- `goals/index.tsx`
- `reconcile/index.tsx`
- `(tabs)/transactions.tsx`
- `firebase-test.tsx`
- `transactions/[id].tsx`

## Violations to Address Per File

Each file needs the following remediation pattern (already applied to the 5 fixed screens as reference):

1. **Clean Architecture** — Remove direct `firebase/firestore` imports. Route data access through repository interfaces (`Firestore*Repository`) instantiated via `useMemo`.
2. **Logging** — Replace all `console.log`/`console.error` with the centralized `logger` utility at `src/shared/utils/logger.ts` (83 `console.log` calls remain across 14 files).
3. **Performance** — Add `isMounted` guards to async `useEffect` callbacks. Wrap `onPress` and other event handlers with `useCallback`. Memoize repository instances with `useMemo`.
4. **Null Safety** — Replace `user.default_household_id!` non-null assertions with explicit early-return guards and local const assignments.
5. **`any` types** — Replace `catch (error: any)` with `catch (error: unknown)` and proper narrowing. Fix `theme: any` in `transactions/[id].tsx`.

## Priority Files

| File | Lines | Severity |
|---|---|---|
| `transactions/[id].tsx` | 1,096 | High — monolithic, 25 console.logs, 3 non-null assertions, `any` usage |
| `claims/add.tsx` | 483 | High — 28 console.logs, 3 async effects without cleanup |
| `household/members.tsx` | 446 | Medium — 22 console.logs, async loading without cleanup |

## Reference

The remediation pattern is documented in the latest commit on `feat/phase-6.3-next-features`. The five already-fixed screens serve as examples:
- `goals/add.tsx`, `goals/edit.tsx` — use case wiring via `useMemo`
- `accounts/edit.tsx` — repository interface via `useMemo`
- `transactions/add.tsx` — decomposed into `useTransactionForm` hook
- `manage-categories.tsx` — decomposed into `useCategoryManager` hook + `CategoryFormModal`

## Labels

`refactor`, `tech-debt`

## Rules Referenced

- `02-clean-architecture.mdc`
- `10-dependency-injection.mdc`
- `13-null-safety-rules.mdc`
- `14-logging-standards.mdc`
- `21-performance-rules.mdc`
- `03-coding-standards.mdc` (no `any`)
