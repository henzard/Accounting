# AI Quick Reference - React Native Project

**Purpose**: Single-page cheat sheet for AI assistants  
**Last Updated**: December 2024

---

## 🎯 Before Writing Any Code

### 1. Verify First (Rule 34)
```bash
# Check structure exists
list_dir("src/")

# Read project-specific docs
read_file("docs/PROJECT-BRIEF.md")
read_file("docs/architecture/data-model.md")

# Search for patterns
grep("<term>", path="src/")
```

### 2. Check todo.md (Rule 01)
```bash
read_file("todo.md")
```

### 3. Understand layer (Rule 02)
- Domain: Business logic, NO external deps
- Data: Implements domain interfaces
- Presentation: Uses domain only

---

## 📁 File Naming (Rule 03)

| Type | Format | Example |
|------|--------|---------|
| Files | kebab-case.ts | `user-repository.ts` |
| Components | PascalCase.tsx | `UserCard.tsx` |
| Interfaces | IPascalCase | `IUserRepository` |
| Tests | filename.test.ts | `user.test.ts` |

---

## 📦 Import Order (Rule 11)

```typescript
// 1. React/React Native
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { observer } from 'mobx-react-lite';

// 3. Domain layer (@/domain)
import { User } from '@/domain/entities/user';

// 4. Other internal imports
import { container } from '@/infrastructure/di/container';

// 5. Relative imports
import { styles } from './styles';
```

---

## 🗄️ Database Quick Facts

### Find Schema
```bash
# Read project-specific schema
read_file("docs/architecture/data-model.md")
```

### Typical Structure
```typescript
// Example entities (your app will differ)
users, transactions, items, sessions, etc.
```

---

## 🏗️ Common Patterns

### Error Handling (Rule 09)
```typescript
// Use Result<T, E> pattern
import { Result } from '@/shared/utils/result';

function doSomething(): Result<Data, Error> {
  try {
    return Result.ok(data);
  } catch (error) {
    return Result.failure(new DomainError('Failed'));
  }
}
```

### Repository Pattern (Rule 02)
```typescript
// Domain: Interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
}

// Data: Implementation
export class UserRepositoryImpl implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Database implementation
  }
}
```

### ViewModel Pattern (Rule 18)
```typescript
export class UserListViewModel {
  @observable users: User[] = [];
  @observable loading = false;
  @observable error: string | null = null;

  @action
  async loadUsers() {
    this.loading = true;
    // Load data
    this.loading = false;
  }
}
```

---

## ✅ Quick Checks

Before committing code:
- [ ] Tests written (Rule 04)
- [ ] TypeScript strict mode (Rule 03)
- [ ] No `any` types (Rule 13)
- [ ] testID added to UI (Rule 07)
- [ ] Docs updated (Rule 08/33)
- [ ] APK builds (Rule 01)

---

## 🎨 Theme Usage (Rule 25)

```typescript
import { useTheme } from '@/infrastructure/theme/theme-context';

export const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background.primary }}>
      <Text style={{ color: theme.text.primary }}>
        Hello
      </Text>
    </View>
  );
};
```

---

## 🧪 Testing Patterns (Rule 04)

### Unit Test
```typescript
describe('User', () => {
  it('should create valid user', () => {
    const user = new User({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    });
    
    expect(user.email).toBe('john@example.com');
  });
});
```

### E2E Test
```typescript
test('can add new user', async ({ page }) => {
  await page.goto('/users');
  await page.click('[data-testid="add-user-button"]');
  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.click('[data-testid="save-button"]');
  
  await expect(page.locator('text=John Doe')).toBeVisible();
});
```

---

## 🚨 Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| Import data in domain | Use dependency injection |
| Use `any` type | Use proper TypeScript types |
| Forget loading/error states | Always handle both |
| Skip tests | Write tests alongside code |
| Assume file structure | Use list_dir to verify |
| Guess table names | Read data-model.md |

---

## 📝 When Adding Features

### New Entity
1. Create `src/domain/entities/<name>.ts`
2. Create `src/domain/repositories/i-<name>-repository.ts`
3. Create `src/data/repositories/<name>-repository-impl.ts`
4. Add tests at each step
5. Update docs/architecture/data-model.md

### New Screen
1. Create `src/presentation/screens/<name>.screen.tsx`
2. Create `src/presentation/viewmodels/<name>.viewmodel.ts`
3. Add navigation types
4. Add to navigator
5. Add testID attributes
6. Create E2E test

### New Component
1. Check docs for component specs (if exists)
2. Create in `src/presentation/components/<name>.tsx`
3. Use theme via useTheme()
4. Add testID
5. Write unit test
6. Export from index.ts

---

## 🔍 Finding Things

```bash
# Find all entities
glob_file_search("**/entities/*.ts")

# Find where User is used
grep("User", path="src/")

# Understand a feature
codebase_search("How does authentication work?")

# Check database schema
read_file("docs/architecture/data-model.md")

# Find component exports
grep("export.*Component", path="src/presentation/components/")
```

---

## 📚 Key Documents

| Doc | When to Read |
|-----|--------------|
| PROJECT-BRIEF.md | Before starting any work |
| data-model.md | Before database work |
| architecture/*.md | To understand system design |
| docs/setup/ | For development setup |

---

## 🚀 Common Tasks

### Task: Add validation
1. Create validator in `src/domain/validators/`
2. Return `Result<T, ValidationError>`
3. Write tests
4. Use in use case

### Task: Add API endpoint
1. Check docs/architecture/api-design.md
2. Create in `src/infrastructure/api/`
3. Add request/response types
4. Add tests with mock data

### Task: Add permission check
1. Read docs/security/permissions.md (if exists)
2. Implement in use case
3. Test all roles

---

## 🔧 When Things Break

### Build fails
```bash
# Check TypeScript
npm run type-check

# Check linting
npm run lint

# Check tests
npm test
```

### Database errors
```bash
# Verify schema
read_file("docs/architecture/data-model.md")

# Check migrations
list_dir("src/infrastructure/database/migrations/")
```

### Import errors
```bash
# Check if file exists
list_dir("src/domain/entities/")

# Verify export
grep("export.*User", path="src/domain/entities/user.ts")

# Check path alias
read_file("tsconfig.json")
```

---

## 💡 Pro Tips

1. **Always verify before assuming** (Rule 34)
2. **Read PROJECT-BRIEF.md first** for app context
3. **Read data-model.md** before database work
4. **Use Result<T, E>** instead of throwing errors
5. **Add testID** to everything for E2E tests
6. **Update todo.md** after completing tasks

---

## 🎨 Theme Quick Reference

```typescript
// Standard usage (customize colors in your project)
theme.background.primary    // White (light) / Dark (dark)
theme.background.secondary  // Light gray (light) / Dark gray (dark)
theme.text.primary          // Dark (light) / White (dark)
theme.text.secondary        // Gray (light) / Light gray (dark)
theme.interactive.primary   // Your brand color
theme.border.default        // Border color
theme.status.success        // Green
theme.status.error          // Red
theme.status.warning        // Amber

// Spacing
SPACING[0]  // 0px
SPACING[1]  // 4px
SPACING[2]  // 8px
SPACING[4]  // 16px
SPACING[6]  // 24px

// Border Radius
BORDER_RADIUS.sm   // 4px
BORDER_RADIUS.md   // 8px
BORDER_RADIUS.lg   // 12px
```

---

## 📖 Project-Specific Info

**Always check these docs for THIS project**:
- `docs/PROJECT-BRIEF.md` - What this app does
- `docs/architecture/data-model.md` - Database schema
- `docs/architecture/business-rules.md` - Business logic
- `docs/architecture/user-flows.md` - User workflows

**Don't assume** entities, workflows, or business rules.  
**Always verify** by reading the project docs first.

---

**Remember**: Trust the system, verify the data, follow the patterns! 🚀
