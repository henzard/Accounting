# Prompt Guide: AI-Driven Development

**Based on "AI Driver Leader" principles by Geoff Woods**

> **Leadership Effectiveness = Human Judgment × AI Leverage × Cultural Adoption**

**Core Principle**: You lead with strategic questions, AI implements with tactical execution.  
Better questions beat better models. You retain judgment, AI provides leverage.

**Include this in complex prompts to keep us both on track**

---

## 📖 AI Driver Leader Framework

| Capability | Our Implementation |
|------------|-------------------|
| **1. Question Quality** | Ask "what" (strategic), not "how" (tactical) |
| **2. Leverage Over Automation** | Multiply impact (features), not just save time (tasks) |
| **3. Speed of Learning** | Test after every change → fast feedback loops |
| **4. Signal Extraction** | Verify outputs, ignore impressive but irrelevant |
| **5. Cultural Enablement** | Rules/docs = shared language, normalize experimentation |

**Pattern**: Intent → AI Exploration → Your Judgment → Decision → Feedback → Learning

---

## 🎯 For You (The Driver)

### Ask Strategic Questions
✅ **DO**: "Implement Phase 1.2"  
❌ **DON'T**: "Create a folder called domain then create another..."

✅ **DO**: "Add transaction entry feature"  
❌ **DON'T**: "Write a function that takes a parameter x and does y then z..."

✅ **DO**: "Fix the authentication flow"  
❌ **DON'T**: "Change line 47 to use const instead of let"

### Effective Prompts
- **High-level goals** → Let AI figure out implementation
- **Point to rules/docs** → "Check rules first", "@docs"
- **Verify behavior** → "Test this works", "Does this follow rules?"
- **Strategic decisions** → You decide architecture, not AI

### When to Intervene
- ⚠️ AI making architectural decisions → "Stop. Check rules."
- ⚠️ AI going off track → "What phase are we on?"
- ⚠️ AI breaking patterns → "Verify this follows existing code"
- ⚠️ AI moving too fast → "Test after each step"

---

## 🤖 For Me (The AI)

### Before ANY Response
1. □ Check `MASTER-TODO.md` - What phase?
2. □ Check `.cursor/rules/` - What rules apply?
3. □ Check `docs/` - Any relevant architecture?
4. □ Verify existing code - Don't assume!

### My Boundaries
❌ **NEVER**: Make architectural decisions without rules/docs
❌ **NEVER**: Create 10+ files without testing between
❌ **NEVER**: Assume structure - always verify first
❌ **NEVER**: Ignore established patterns
❌ **NEVER**: Skip testing checkpoints

✅ **ALWAYS**: Reference which rule/doc I'm following
✅ **ALWAYS**: State my plan before executing
✅ **ALWAYS**: Test after changes
✅ **ALWAYS**: Update MASTER-TODO.md progress

### Decision Framework
```
User asks: "Add feature X"

My response:
1. "Checking MASTER-TODO.md... this is Phase 2.3"
2. "Checking rules... Clean Architecture requires..."
3. "Checking docs... data-model.md shows..."
4. "My plan: Create entity → interface → use case"
5. "Proceeding..."
6. [Do work]
7. "Testing... npm run android"
8. "✅ Phase 2.3 complete. Moving to 2.4?"
```

### Red Flags (Stop & Ask)
- 🚩 User asking me to violate rules
- 🚩 Unclear which phase this belongs to
- 🚩 No documentation for this feature
- 🚩 Architectural decision needed
- 🚩 Breaking existing patterns

---

## 🤝 Partnership Protocol

### User's Role (Strategic)
- Set direction and priorities
- Make architectural decisions
- Approve major changes
- Keep AI aligned with vision

### AI's Role (Tactical)
- Follow MASTER-TODO.md roadmap
- Implement according to rules/docs
- Test frequently
- Surface issues/questions

### Checkpoint Pattern
```
User: "Build authentication"
AI: "Checking rules... Phase 5.1. Plan: [X,Y,Z]. Proceed?"
User: "Yes" / "No, do [alternative]"
AI: [Implements]
AI: "Testing... ✅ Works. Next: Phase 5.2?"
```

---

## 🚨 Emergency Commands

| Command | Meaning |
|---------|---------|
| **"Stop"** | Pause, don't proceed |
| **"Rules check"** | Re-read rules before continuing |
| **"Verify"** | Check what actually exists |
| **"Explain"** | State reasoning with rule references |
| **"Reset"** | Go back to last working state |
| **"What phase?"** | Where are we in MASTER-TODO.md? |

---

## 📋 Quick Checklist

**Before Complex Work**:
```
□ Read MASTER-TODO.md (what phase?)
□ Read relevant .cursor/rules/ files
□ Read relevant docs/ files
□ Verify existing code/structure
□ State plan with rule references
□ Get user approval for major changes
□ Implement in small increments
□ Test after each increment
□ Update todos when complete
```

---

## 💡 Success Pattern

```
User: Strategic goal
  ↓
AI: Check rules/docs
  ↓
AI: State plan
  ↓
User: Approve/adjust
  ↓
AI: Implement incrementally
  ↓
AI: Test frequently
  ↓
AI: Report completion
  ↓
User: Next goal
```

---

## 🎨 UX Standards (Phase 5.5.2+)

**Reference**: `docs/design/ux-patterns.md` and `.cursor/rules/34-ux-standards.mdc`

### The 7 Standard Patterns

Every list/management screen MUST include:

1. **Search/Filter Bar** (if 10+ items)
2. **Collapsible Groups** (if content is grouped)
3. **Icon Buttons** (✏️🗑️ not "Edit" "Delete")
4. **Empty States** (always with helpful guidance)
5. **Count Badges** (on group headers)
6. **Status Indicators** (if items have states)
7. **Bulk Selection Mode** (if bulk actions make sense)

### Reference Implementation

**See**: `src/app/budget/manage-categories.tsx` - Perfect example of all 7 patterns

### AI Checklist for New Screens

Before marking a list screen complete:

- [ ] Has search (if needed)
- [ ] Has collapsible groups (if grouped)
- [ ] Uses icon buttons
- [ ] Has empty state
- [ ] Has count badges
- [ ] Has status indicators (if applicable)
- [ ] Has bulk selection (if applicable)
- [ ] Uses SPACING constants
- [ ] Has loading state
- [ ] Has error states

### User Prompt Shortcuts

```
"Apply standard UX patterns" 
  → AI adds search, collapsible, icons, empty state, etc.

"Make this consistent with category management"
  → AI copies patterns from manage-categories.tsx

"Follow UX standards"
  → AI checks docs/design/ux-patterns.md and applies
```

---

**Include `@PROMPT-GUIDE.md` in your message when you want me to be extra careful about following this pattern.**

