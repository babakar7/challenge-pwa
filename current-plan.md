# Meal Tab UX Redesign - Post-Lock Flow

## Problem Statement
After locking Week 1 selections, users see "Review Your Selections" which is confusing because:
- They already confirmed their selections
- It's a dead-end screen with no clear next action
- They can't easily see their upcoming meals or navigate to Week 2

## User Preferences
- **Meal display:** Show actual meal names (not just "Option A/B")
- **Week navigation:** Tabs at top for switching between weeks

## Solution Overview

### New Flow

```
User enters Meals tab
    ↓
Determine accessible weeks and locked status
    ↓
Is there an UNLOCKED accessible week?
    ├─ YES → Show selection wizard for that week
    └─ NO → Show MealDashboard (all accessible weeks are locked)
```

### New Component: `MealDashboard`

Replaces the review screen for locked weeks. Shows:
1. **Week Tabs** - Horizontal tabs (Week 1 ✓, Week 2 ✓, etc.) for locked weeks only
2. **Meal Preview** - Scrollable list of 7 days with actual meal names
3. **Delivery Info** - Home delivery or pickup indicator
4. **CTA Button** - "Select Week X Meals" if next week is available

### Dashboard Wireframe

```
┌─────────────────────────────────────────┐
│  [ Week 1 ✓ ] [ Week 2 ✓ ]              │  ← Tabs for locked weeks
├─────────────────────────────────────────┤
│  Your Week 1 Meals                      │
│  Locked • Starts Monday, Jan 13         │
├─────────────────────────────────────────┤
│                                         │
│  Monday                                 │
│  ├─ Lunch: Grilled Chicken Salad        │
│  └─ Dinner: Teriyaki Salmon Bowl        │
│                                         │
│  Tuesday                                │
│  ├─ Lunch: Mediterranean Wrap           │
│  └─ Dinner: Beef Stir-fry               │
│  ... (scrollable)                       │
│                                         │
├─────────────────────────────────────────┤
│  Delivery: Home Delivery                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Select Week 3 Meals →         │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Files to Modify/Create

### 1. CREATE: `components/meals/MealDashboard.tsx`

New component with:
- Week tabs component (horizontal scroll if needed)
- Day-by-day meal list showing actual meal names
- Delivery preference display
- CTA button for next week

**Props:**
```typescript
interface MealDashboardProps {
  lockedWeeks: number[];           // Which weeks to show tabs for
  activeWeek: number;              // Currently viewed week
  onWeekChange: (week: number) => void;
  selections: Record<string, 'A' | 'B'>;
  mealOptions: MealOption[];       // To get actual meal names
  deliveryPreference: 'home' | 'pickup' | null;
  canSelectNextWeek: boolean;
  nextWeekNumber: number | null;
  onSelectNextWeek: () => void;
}
```

### 2. MODIFY: `app/(tabs)/meals.tsx`

Update the main flow logic:

```typescript
// Add new state/logic
const showDashboard = useMemo(() => {
  // Show dashboard if all accessible weeks are locked
  const unlockedAccessibleWeek = accessibleWeeks.find(
    week => !lockedWeeks.includes(week)
  );
  return !unlockedAccessibleWeek && lockedWeeks.length > 0;
}, [accessibleWeeks, lockedWeeks]);

// In renderContent():
if (showDashboard) {
  return (
    <MealDashboard
      lockedWeeks={lockedWeeks}
      activeWeek={activeWeek}
      onWeekChange={setActiveWeek}
      selections={selections}
      mealOptions={mealOptions}
      deliveryPreference={deliveryPreference}
      canSelectNextWeek={accessibleWeeks.includes(activeWeek + 1)}
      nextWeekNumber={activeWeek < 4 ? activeWeek + 1 : null}
      onSelectNextWeek={handleStartNextWeek}
    />
  );
}
```

### 3. MODIFY: `components/meals/index.ts`

Add export for new component:
```typescript
export { MealDashboard } from './MealDashboard';
```

---

## Implementation Details

### Getting Actual Meal Names

The `mealOptions` array contains meal details. To get the name for a selection:

```typescript
const getMealName = (day: number, mealType: 'lunch' | 'dinner', option: 'A' | 'B') => {
  const mealOption = mealOptions.find(
    m => m.challenge_day === day && m.meal_type === mealType
  );
  if (!mealOption) return 'Unknown';
  return option === 'A' ? mealOption.option_a_name : mealOption.option_b_name;
};
```

### Week Tabs Component

```typescript
function WeekTabs({ weeks, activeWeek, onSelect }) {
  return (
    <View style={styles.tabContainer}>
      {weeks.map(week => (
        <TouchableOpacity
          key={week}
          style={[styles.tab, activeWeek === week && styles.activeTab]}
          onPress={() => onSelect(week)}
        >
          <Text>Week {week}</Text>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### CTA Button Logic

```typescript
// Only show CTA if:
// 1. There's a next week (current < 4)
// 2. Next week is accessible (current week is locked, enabling next)
// 3. Next week is NOT already locked

const showCTA = nextWeekNumber &&
  accessibleWeeks.includes(nextWeekNumber) &&
  !lockedWeeks.includes(nextWeekNumber);
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No weeks locked | Show Week 1 intro/selection flow |
| Week 1 locked, challenge not started | Show dashboard with Week 1 + CTA for Week 2 |
| Week 1 locked, in Week 1 of challenge | Show dashboard with Week 1 + CTA for Week 2 |
| All 4 weeks locked | Show dashboard, no CTA, message "All meals selected!" |
| Viewing Week 1 but Week 3 is next to select | Show CTA "Select Week 3 Meals" |

---

## Verification Steps

1. **Lock Week 1** → Verify dashboard appears (not review screen)
2. **Check meal names** → Verify actual names shown (not Option A/B)
3. **Week tabs** → Verify tabs only show locked weeks
4. **CTA button** → Verify "Select Week 2 Meals" appears and works
5. **Tab switching** → Verify can view different locked weeks
6. **All weeks locked** → Verify no CTA, shows completion message
7. **Return to tab** → Verify dashboard persists on return
