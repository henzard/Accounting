# React Native Project Rules

**Version**: 1.0  
**Last Updated**: December 2024  
**Origin**: Evolved from WeighsoftAnimalWeigherV2 project

---

## 🎯 Purpose

This `.cursor/rules/` directory contains **generic, portable rules** for React Native development following Clean Architecture principles. These rules are designed to travel with you from project to project, growing and improving over time.

---

## 📚 What's in the Rules?

### Generic Best Practices (Keep These!)
- ✅ Clean Architecture patterns
- ✅ Coding standards
- ✅ Testing approaches
- ✅ Security guidelines
- ✅ Performance patterns
- ✅ React Native best practices
- ✅ TypeScript patterns
- ✅ Database design principles
- ✅ Error handling patterns
- ✅ Documentation standards

### NOT in the Rules (Put These in `docs/`)
- ❌ Your app's name
- ❌ Your domain entities (User, Transaction, Product, etc.)
- ❌ Your business logic
- ❌ Your API endpoints
- ❌ Your database schema (actual tables for THIS app)
- ❌ Your brand colors
- ❌ Your app-specific workflows

---

## 🚀 How to Use These Rules

### When Starting a NEW Project

1. **Copy this entire `.cursor/` folder** to your new project
2. **Create project-specific docs**:
   ```
   docs/
   ├── PROJECT-BRIEF.md          # What your app does
   ├── architecture/
   │   ├── data-model.md         # YOUR database schema
   │   ├── business-rules.md     # YOUR business logic
   │   └── decisions/            # YOUR architectural decisions
   └── setup/
       └── DEVELOPMENT-SETUP.md  # YOUR setup instructions
   ```
3. **Update examples** in rules if you find generic improvements
4. **The rules evolve**, but stay generic

### When Working on an EXISTING Project

1. **Read `docs/PROJECT-BRIEF.md` first** to understand THIS app
2. **Check `docs/architecture/data-model.md`** for THIS app's entities
3. **Follow the generic rules** for HOW to code
4. **Follow the docs** for WHAT to code

---

## 📁 Rule Organization

### Core Rules (01-11)
- `01-project-overview.mdc` - Structure and golden rules
- `02-clean-architecture.mdc` - Layer separation
- `03-coding-standards.mdc` - Code style
- `04-testing-standards.mdc` - Testing approaches
- `05-database-sqlite.mdc` - SQLite implementation
- `06-workflow-rules.mdc` - Development workflow
- `07-react-native-rules.mdc` - RN-specific patterns
- `08-documentation-rules.mdc` - Workflow documentation
- `09-error-handling.mdc` - Error patterns
- `10-dependency-injection.mdc` - DI patterns
- `11-ai-assistant-rules.mdc` - AI coding guidelines

### Specialized Rules (12-35)
- `12-security-rules.mdc` - Security best practices
- `13-null-safety-rules.mdc` - Type safety
- `14-logging-standards.mdc` - Logging patterns
- `15-data-sharing-export.mdc` - Data export
- `16-linting-formatting.mdc` - Code formatting
- `17-environment-config.mdc` - Environment variables
- `18-state-management.mdc` - State patterns
- `19-accessibility-rules.mdc` - A11y guidelines
- `20-asset-management.mdc` - Asset handling
- `21-performance-rules.mdc` - Performance optimization
- `22-api-message-standards.mdc` - API communication
- `23-database-rules.mdc` - Database design (comprehensive)
- `24-race-conditions.mdc` - Concurrency patterns
- `25-theming-design-system.mdc` - Theme system
- `26-platform-specific-code.mdc` - iOS/Android differences
- `27-web-specific-rules.mdc` - Web platform
- `28-internationalization.mdc` - i18n/l10n
- `29-form-management.mdc` - Form validation
- `30-animation-guidelines.mdc` - Animation patterns
- `31-push-notifications.mdc` - Notification handling
- `32-ui-component-patterns.mdc` - UI patterns
- `33-documentation-standards.mdc` - Doc structure
- `34-data-verification.mdc` - Verification before coding
- `35-windows-environment.mdc` - Windows/PowerShell

---

## 🎨 Examples in Rules Are Generic

All code examples use generic entities:
- `User` instead of specific domain objects
- `Transaction` as a general data entity
- `Item` as a generic resource

**Why?** So the patterns are clear without being tied to any specific business domain.

---

## 🔧 Customizing for Your Project

### Brand Colors (Rule 25)

The theming rule uses generic Material Design colors. To customize:

1. Create `docs/design/brand-colors.md` with YOUR colors
2. Update `src/shared/constants/colors.ts` in your project
3. The theming *pattern* stays the same, colors change

### Database Schema (Rules 05 & 23)

The rules show *how* to design databases. For YOUR schema:

1. Document in `docs/architecture/data-model.md`
2. Follow the patterns (primary keys, timestamps, indexes)
3. Use YOUR entities (not the examples)

### Business Logic (Rule 11)

The rules explain *where* logic goes (domain layer). For YOUR logic:

1. Document in `docs/architecture/business-rules.md`
2. Follow clean architecture principles
3. Keep domain layer pure (no external dependencies)

---

## 📖 AI Assistant Integration

The AI assistant will:
1. **Read these rules** for HOW to code
2. **Read your docs** for WHAT to build
3. **Verify structure** before assuming (Rule 34)
4. **Follow your project's** specific requirements

The `AI-QUICK-REFERENCE.md` provides a quick cheat sheet for AI assistants working on your project.

---

## 🔄 Rule Evolution

### When to Update Rules

✅ **Update when you discover**:
- Better generic patterns
- Clearer ways to explain concepts
- Universal best practices
- Security improvements

❌ **Don't add to rules**:
- Your app-specific logic
- Your business requirements
- Your API endpoints
- Your database schema

### Version Control

- ✅ Commit rule changes when they improve generic patterns
- ✅ Share rules across your projects
- ✅ Contribute improvements back to your template
- ❌ Don't version control project-specific content in rules

---

## 📦 Portability Checklist

Before copying rules to a new project, verify:

- [ ] No hardcoded app names
- [ ] No specific business domain references
- [ ] Examples use generic entities (User, Item, Transaction)
- [ ] Brand colors are marked as "customize in your project"
- [ ] Database examples are generic patterns, not actual schema
- [ ] All "project-specific" content is clearly marked

---

## 🌟 Best Practices

### For Developers

1. **Read rules once** when joining a project
2. **Refer to rules** when unclear on patterns
3. **Suggest improvements** to generic patterns
4. **Keep rules clean** - no project-specific content

### For AI Assistants

1. **Read rules** for coding standards
2. **Read docs/** for project specifics
3. **Verify before assuming** (Rule 34)
4. **Follow patterns** consistently

### For Project Leads

1. **Maintain docs/** with project-specific content
2. **Keep rules generic** for reuse
3. **Version rules separately** from project code
4. **Share rule improvements** across projects

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong: Putting Project-Specific Content in Rules

```
# DON'T DO THIS in rules:
## Our App's Entities
- Animal (id, species, weight)
- WeightRecord (id, animalId, weight)
```

### ✅ Right: Keep Rules Generic

```
# DO THIS in rules:
## Entity Pattern
- Use descriptive names
- Include id, created_at, updated_at
- Document YOUR entities in docs/architecture/data-model.md
```

---

## 📚 Required Project Documentation

When using these rules, you MUST create:

### Minimum Documentation

1. **docs/PROJECT-BRIEF.md** - App purpose, features, requirements
2. **docs/architecture/data-model.md** - Your database schema
3. **todo.md** - Current tasks (Rule 01 requires this)
4. **README.md** - Project intro and setup

### Recommended Documentation

- `docs/architecture/business-rules.md` - Your business logic
- `docs/architecture/user-flows.md` - User workflows
- `docs/architecture/decisions/` - ADRs (Architecture Decision Records)
- `docs/setup/DEVELOPMENT-SETUP.md` - Dev environment setup
- `docs/design/brand-colors.md` - Your brand guidelines

---

## 🎓 Learning Path

### For New Developers

1. Read `01-project-overview.mdc` - Understand structure
2. Read `02-clean-architecture.mdc` - Understand layers
3. Read `docs/PROJECT-BRIEF.md` - Understand THIS app
4. Read `AI-QUICK-REFERENCE.md` - Quick patterns
5. Refer to specific rules as needed

### For AI Assistants

1. Check `AI-QUICK-REFERENCE.md` first
2. Verify structure with `list_dir` and `read_file` (Rule 34)
3. Read project docs in `docs/` for specifics
4. Follow patterns from rules consistently

---

## 💡 Philosophy

> **Rules are generic patterns. Docs are specific implementations.**

Think of it like:
- **Rules** = Design patterns book (portable)
- **Docs** = Your app's specification (project-specific)

Both are essential, but they serve different purposes.

---

## 🤝 Contributing Improvements

Found a better generic pattern? Discovered a clearer way to explain a concept?

1. Update the rule file
2. Ensure it stays generic
3. Test across multiple projects
4. Share with your team

Good rules get better over time through use and refinement.

---

## ⚡ Quick Start

**New to these rules?**

```bash
# 1. Read this README (you're doing it!)
# 2. Check the quick reference
cat .cursor/AI-QUICK-REFERENCE.md

# 3. Read your project's brief
cat docs/PROJECT-BRIEF.md

# 4. Start coding with confidence!
```

**Starting a new project?**

```bash
# 1. Copy .cursor/ folder to new project
cp -r old-project/.cursor new-project/.cursor

# 2. Create project docs
mkdir -p new-project/docs/{architecture,setup,design}

# 3. Write PROJECT-BRIEF.md for new app

# 4. Follow the rules, document the specifics
```

---

## 📞 Questions?

- **"Where do I put my database schema?"** → `docs/architecture/data-model.md`
- **"Where do I document my API?"** → `docs/architecture/api-design.md`
- **"Where are the coding standards?"** → `.cursor/rules/03-coding-standards.mdc`
- **"Where are my app's requirements?"** → `docs/PROJECT-BRIEF.md`
- **"Can I modify the rules?"** → Yes! Improve generic patterns, not add specific content

---

## 🎯 Success Metrics

You're using these rules well when:

- ✅ New developers onboard faster (read rules once, understand patterns)
- ✅ Code is consistent across the project
- ✅ AI assistants generate correct code first time
- ✅ You can port rules to new projects easily
- ✅ Project-specific docs explain WHAT, rules explain HOW

---

**Remember**: These rules are your evolving knowledge base. Keep them sharp, keep them generic, and they'll serve you across all your React Native projects! 🚀

