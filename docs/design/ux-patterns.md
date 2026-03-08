# UX Design Patterns - Homebase Budget

**Standard UX patterns established as of Phase 5.5.2 (Category Management)**

These patterns should be consistently applied across all screens in the app.

---

## Core Principles

1. **Minimize scrolling** - Use collapsible sections
2. **Fast discovery** - Provide search/filter for long lists
3. **Visual clarity** - Use icons and colors, not just text
4. **Helpful guidance** - Show empty states with clear next actions
5. **Efficient actions** - Bulk operations for repetitive tasks
6. **Status awareness** - Show what's active/used/important

---

## Pattern 1: Search/Filter Bar

**Use When**: List has 10+ items

**Implementation**:
```tsx
<View style={styles.searchContainer}>
  <TextInput
    value={searchQuery}
    onChangeText={setSearchQuery}
    placeholder="🔍 Search..."
    style={styles.searchInput}
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Text>✕</Text>
    </TouchableOpacity>
  )}
</View>
```

**Styles**:
```tsx
searchContainer: {
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  flexDirection: 'row',
  alignItems: 'center',
},
searchInput: {
  flex: 1,
  fontSize: 16,
  paddingVertical: 8,
},
```

---

## Pattern 2: Collapsible Groups

**Use When**: Content is naturally grouped (categories, time periods, types)

**Implementation**:
```tsx
// State
const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

// Toggle function
function toggleSection(sectionId: string) {
  setCollapsedSections(prev => {
    const newSet = new Set(prev);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    return newSet;
  });
}

// Render
<TouchableOpacity onPress={() => toggleSection(id)}>
  <View style={styles.sectionHeader}>
    <Text>{title}</Text>
    <Text style={styles.collapseIcon}>
      {collapsed ? '▶' : '▼'}
    </Text>
  </View>
</TouchableOpacity>
{!collapsed && (
  <View>{/* Section content */}</View>
)}
```

---

## Pattern 3: Icon Buttons

**Use Instead Of**: Text-only action buttons

**Standard Icons**:
- ✏️ Edit
- 🗑️ Delete
- ➕ Add
- ✅ Confirm/Complete
- ✕ Cancel/Close
- ⚙️ Settings
- 🔍 Search
- 📊 View Details
- 📋 Copy

**Implementation**:
```tsx
<TouchableOpacity 
  onPress={handleEdit}
  style={styles.iconButton}
>
  <Text style={{ fontSize: 20 }}>✏️</Text>
</TouchableOpacity>
```

**Styles**:
```tsx
iconButton: {
  padding: 8,
},
```

**Accessibility**: Always provide `accessibilityLabel` for screen readers

---

## Pattern 4: Empty States

**Always Include**:
1. **Icon** (large emoji or illustration)
2. **Title** (what's empty)
3. **Description** (why it's empty or what to do)
4. **Action Buttons** (clear next steps)

**Implementation**:
```tsx
{items.length === 0 && (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>📋</Text>
    <Text style={styles.emptyTitle}>No Items Yet</Text>
    <Text style={styles.emptyDescription}>
      Get started by adding your first item.
    </Text>
    <PrimaryButton
      title="+ Add Item"
      onPress={handleAdd}
      style={{ marginTop: 24 }}
    />
  </View>
)}
```

**Styles**:
```tsx
emptyState: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 32,
  paddingVertical: 64,
},
emptyIcon: {
  fontSize: 64,
  marginBottom: 16,
},
emptyTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 8,
  textAlign: 'center',
},
emptyDescription: {
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 20,
},
```

**Variations**:
- Empty initial state (no data ever)
- Empty search results (data exists but filtered out)
- Empty temporary state (loading completed but no data)

---

## Pattern 5: Count Badges

**Use When**: Showing quantity in groups or sections

**Implementation**:
```tsx
<Text style={styles.sectionTitle}>
  Housing 
  <Text style={styles.countBadge}> (12)</Text>
</Text>
```

**Styles**:
```tsx
countBadge: {
  fontSize: 14,
  color: theme.text.tertiary,
  marginLeft: 8,
},
```

---

## Pattern 6: Status/Usage Indicators

**Use When**: Items have states (active, used, complete, etc.)

**Types**:
- **Dot indicator**: `● Active`
- **Badge**: Small colored pill with text
- **Icon**: ✅ ⚠️ ❌

**Implementation**:
```tsx
{isActive && (
  <View style={[styles.statusBadge, { 
    backgroundColor: theme.status.success + '20' 
  }]}>
    <Text style={[styles.statusText, { 
      color: theme.status.success 
    }]}>
      ● Active
    </Text>
  </View>
)}
```

**Styles**:
```tsx
statusBadge: {
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 12,
},
statusText: {
  fontSize: 11,
  fontWeight: '600',
},
```

**Color Meanings**:
- Green: Active, Success, Complete
- Yellow/Amber: Warning, Pending, In Progress
- Red: Error, Inactive, Overdue
- Blue: Info, Default, Neutral

---

## Pattern 7: Bulk Selection Mode

**Use When**: Users might want to act on multiple items (delete, move, archive)

**State**:
```tsx
const [selectionMode, setSelectionMode] = useState(false);
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
```

**Functions**:
```tsx
function toggleSelection(itemId: string) {
  setSelectedItems(prev => {
    const newSet = new Set(prev);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    return newSet;
  });
}

function selectAll() {
  setSelectedItems(new Set(items.map(i => i.id)));
}

function deselectAll() {
  setSelectedItems(new Set());
}
```

**UI Elements**:
1. "Select" button to enter mode
2. Bulk action bar at top (Select All, Deselect All, Action buttons)
3. Checkboxes on each item
4. Selected items highlighted
5. "Done" button to exit mode

**Bulk Action Bar**:
```tsx
{selectionMode && (
  <View style={styles.bulkActionsBar}>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity onPress={selectAll}>
        <Text>Select All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={deselectAll}>
        <Text>Deselect All</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity 
      onPress={handleBulkAction}
      disabled={selectedItems.size === 0}
    >
      <Text>Action ({selectedItems.size})</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## Pattern 8: Visual Hierarchy

**Size Scale** (from most to least important):
```tsx
heading1: { fontSize: 24, fontWeight: 'bold' }     // Page title
heading2: { fontSize: 20, fontWeight: 'bold' }     // Section title
heading3: { fontSize: 18, fontWeight: '600' }      // Subsection
body:     { fontSize: 16, fontWeight: '400' }      // Normal text
caption:  { fontSize: 12, fontWeight: '400' }      // Helper text
```

**Color Hierarchy** (from most to least prominent):
1. Primary text: `theme.text.primary` (dark/light based on theme)
2. Secondary text: `theme.text.secondary` (medium emphasis)
3. Tertiary text: `theme.text.tertiary` (low emphasis, hints)

**Spacing Scale**:
```tsx
SPACING = {
  1: 4,   // Tiny
  2: 8,   // Small
  3: 12,  // Medium-small
  4: 16,  // Medium (default)
  6: 24,  // Large
  8: 32,  // Extra large
}
```

---

## Pattern 9: Consistent Spacing

**Card/Section Padding**: `16px` (SPACING[4])  
**Between Sections**: `24px` (SPACING[6])  
**Between Elements**: `8px` or `12px` (SPACING[2] or SPACING[3])  
**Screen Margins**: `16px` horizontal

---

## Pattern 10: Loading States

**Spinner + Text**:
```tsx
<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color={theme.interactive.primary} />
  <Text style={styles.loadingText}>Loading...</Text>
</View>
```

**Skeleton Screens**: Consider for complex layouts

---

## Implementation Checklist

When creating a new list/management screen:

- [ ] Search bar (if 10+ items expected)
- [ ] Collapsible groups (if naturally grouped)
- [ ] Icon buttons (not text-only)
- [ ] Empty state (with helpful guidance)
- [ ] Count badges (on group headers)
- [ ] Status indicators (if items have states)
- [ ] Bulk selection (if bulk actions make sense)
- [ ] Consistent spacing (SPACING constants)
- [ ] Loading state (spinner + text)
- [ ] Error states (with retry actions)

---

## Examples

**Reference Implementation**: `src/app/budget/manage-categories.tsx`

This screen demonstrates all 7 core patterns:
1. ✅ Search/Filter Bar
2. ✅ Collapsible Groups
3. ✅ Icon Buttons
4. ✅ Empty States
5. ✅ Count Badges
6. ✅ Usage Indicators
7. ✅ Bulk Selection Mode

---

## Future Patterns to Consider

- **Swipe actions** (swipe to delete/edit)
- **Modal forms** (full-screen modals for add/edit)
- **Infinite scroll** (for very long lists)
- **Pull to refresh** (for data that updates)
- **Filters/Sort** (dropdown for advanced filtering)

---

**Last Updated**: Phase 5.5.2 (December 2025)  
**Status**: Active Standard  
**Review**: After every 3 new screens implemented

