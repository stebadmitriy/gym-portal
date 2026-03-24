# Program Customization & Builder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the user to swap any exercise in the A/B program with alternatives from the same muscle group, and build a completely custom A/B program from the exercise library.

**Architecture:** Add a `customProgram` object (saved to localStorage) that overrides the default EXERCISES array when present. A SwapExerciseSheet component handles single-exercise replacement. A ProgramBuilderPage lets the user drag (tap) exercises from the library into A/B slots with real-time muscle balance feedback.

**Tech Stack:** React 18, TypeScript, Zustand, Framer Motion, Tailwind CSS, localStorage

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/types/index.ts` | Modify | Add `CustomProgram` type |
| `src/lib/storage.ts` | Modify | Add `getCustomProgram` / `setCustomProgram` / `clearCustomProgram` |
| `src/lib/exercises.ts` | Modify | Add `getExercisesForWorkout(slot, customProgram?)` that respects overrides |
| `src/lib/exerciseLibrary.ts` | Modify | Add `getAlternativesForMuscleGroup(muscleGroup, excludeIds)` helper |
| `src/stores/programStore.ts` | Modify | Add `customProgram` state + `swapExercise()` + `setCustomProgram()` + `clearCustomProgram()` |
| `src/components/SwapExerciseSheet.tsx` | Create | Bottom sheet showing same-muscle-group alternatives |
| `src/pages/ProgramBuilderPage.tsx` | Create | Full A/B program builder with library + balance |
| `src/pages/ExercisesPage.tsx` | Modify | Add swap button on in-program cards |
| `src/components/BottomNav.tsx` | No change | ProgramBuilder accessed from ExercisesPage |

---

## Task 1: Add `CustomProgram` type and storage helpers

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/storage.ts`

- [ ] **Step 1: Add type to `src/types/index.ts`**

```typescript
export interface CustomProgram {
  A: string[]  // ordered list of exercise IDs for Workout A
  B: string[]  // ordered list of exercise IDs for Workout B
  createdAt: string
}
```

- [ ] **Step 2: Add storage helpers to `src/lib/storage.ts`**

```typescript
const CUSTOM_PROGRAM_KEY = 'gym_custom_program'

export function getCustomProgram(): CustomProgram | null {
  try {
    const raw = localStorage.getItem(CUSTOM_PROGRAM_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setCustomProgram(program: CustomProgram): void {
  localStorage.setItem(CUSTOM_PROGRAM_KEY, JSON.stringify(program))
}

export function clearCustomProgram(): void {
  localStorage.removeItem(CUSTOM_PROGRAM_KEY)
}
```

- [ ] **Step 3: Commit**
```bash
git add src/types/index.ts src/lib/storage.ts
git commit -m "feat: add CustomProgram type and storage helpers"
```

---

## Task 2: Update `exercises.ts` to respect custom program

**Files:**
- Modify: `src/lib/exercises.ts`

- [ ] **Step 1: Add `getExercisesForWorkout()` function**

Import `CustomProgram` from types and `EXERCISE_LIBRARY` from exerciseLibrary.

```typescript
import { CustomProgram } from '../types'
import { EXERCISE_LIBRARY } from './exerciseLibrary'

export function getExercisesForWorkout(
  slot: 'A' | 'B',
  customProgram: CustomProgram | null
): Exercise[] {
  if (!customProgram) {
    // Return default program
    return EXERCISES.filter(ex => ex.workout_slot === slot)
      .sort((a, b) => a.exercise_order - b.exercise_order)
  }

  const ids = customProgram[slot]
  return ids.map((id, index) => {
    // First check default exercises
    const defaultEx = EXERCISES.find(ex => ex.id === id)
    if (defaultEx) return { ...defaultEx, exercise_order: index + 1, workout_slot: slot }

    // Fall back to library exercise
    const libEx = EXERCISE_LIBRARY.find(ex => ex.id === id)
    if (libEx) {
      return {
        id: libEx.id,
        name_ru: libEx.name_ru,
        name_en: libEx.name_en,
        muscle_primary: libEx.muscle_group,
        muscle_emoji: libEx.muscle_emoji,
        is_compound: libEx.is_compound,
        increment_kg: 2.5,
        tempo: '3-1-1',
        workout_slot: slot,
        exercise_order: index + 1,
        sets: 3,
        reps: '10-12',
        tips_ru: libEx.tips_ru,
        instagramUrl: libEx.primaryVideo.url,
        alternatives: libEx.altVideos.map(v => v.url),
      } as Exercise
    }
    return null
  }).filter(Boolean) as Exercise[]
}
```

- [ ] **Step 2: Keep `getExercisesByWorkout()` (existing function) unchanged** — it's used by workout generation. Update callers of it in WorkoutPage and HomePage to use the new function when custom program exists.

- [ ] **Step 3: Commit**
```bash
git add src/lib/exercises.ts
git commit -m "feat: getExercisesForWorkout respects custom program overrides"
```

---

## Task 3: Add custom program state to `programStore`

**Files:**
- Modify: `src/stores/programStore.ts`

- [ ] **Step 1: Add to store interface**
```typescript
customProgram: CustomProgram | null
swapExercise: (slot: 'A' | 'B', oldId: string, newId: string) => void
saveCustomProgram: (program: CustomProgram) => void
clearCustomProgram: () => void
```

- [ ] **Step 2: Implement in store**
```typescript
customProgram: getCustomProgram(),

swapExercise: (slot, oldId, newId) => {
  const { customProgram } = get()
  // Start from current program (custom or default)
  const defaultIds = {
    A: EXERCISES.filter(e => e.workout_slot === 'A')
               .sort((a,b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
    B: EXERCISES.filter(e => e.workout_slot === 'B')
               .sort((a,b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
  }
  const base = customProgram ?? { A: defaultIds.A, B: defaultIds.B, createdAt: new Date().toISOString() }
  const updated: CustomProgram = {
    ...base,
    [slot]: base[slot].map(id => id === oldId ? newId : id),
    createdAt: base.createdAt,
  }
  setCustomProgram(updated)
  set({ customProgram: updated })
},

saveCustomProgram: (program) => {
  setCustomProgram(program)
  set({ customProgram: program })
},

clearCustomProgram: () => {
  clearCustomProgramStorage()
  set({ customProgram: null })
},
```

- [ ] **Step 3: Load customProgram in `loadAll()`**
```typescript
// In loadAll():
const customProgram = getCustomProgram()
set({ ..., customProgram })
```

- [ ] **Step 4: Commit**
```bash
git add src/stores/programStore.ts
git commit -m "feat: add customProgram state to programStore"
```

---

## Task 4: Create `SwapExerciseSheet` component

**Files:**
- Create: `src/components/SwapExerciseSheet.tsx`

This bottom sheet shows alternative exercises for the same muscle group when user wants to swap an exercise.

- [ ] **Step 1: Create component**

```tsx
interface SwapExerciseSheetProps {
  isOpen: boolean
  onClose: () => void
  exerciseId: string        // current exercise being replaced
  slot: 'A' | 'B'
  muscleGroup: MuscleGroup  // filter alternatives by this group
}
```

Features:
- AnimatePresence + slide-up motion.div (same pattern as ExerciseModal)
- Shows all LibraryExercise items with the same muscle_group
- Current exercise highlighted (can't be selected)
- Each alternative shows: emoji, name_ru, name_en, video count, "В программе" badge if already in program
- Tap to confirm swap → calls `programStore.swapExercise(slot, exerciseId, newId)` → closes

- [ ] **Step 2: Handle body scroll lock** (same pattern as ExerciseModal)

- [ ] **Step 3: Commit**
```bash
git add src/components/SwapExerciseSheet.tsx
git commit -m "feat: SwapExerciseSheet component for exercise replacement"
```

---

## Task 5: Add swap button to `ExercisesPage`

**Files:**
- Modify: `src/pages/ExercisesPage.tsx`

- [ ] **Step 1: Add swap state**
```typescript
const [swapping, setSwapping] = useState<{ id: string; slot: 'A' | 'B'; muscleGroup: MuscleGroup } | null>(null)
```

- [ ] **Step 2: Add swap button to in-program exercise cards**

On cards where `inProgram === true`, add a small "⇄" button in the top-right corner.
Tapping it sets `swapping` state and opens SwapExerciseSheet.

- [ ] **Step 3: Add SwapExerciseSheet at bottom of page**
```tsx
<SwapExerciseSheet
  isOpen={!!swapping}
  onClose={() => setSwapping(null)}
  exerciseId={swapping?.id ?? ''}
  slot={swapping?.slot ?? 'A'}
  muscleGroup={swapping?.muscleGroup ?? 'back_width'}
/>
```

- [ ] **Step 4: Show "Сброс" button when customProgram is active**

At the top of the page, if `customProgram !== null`, show a small banner:
"📝 Используется своя программа · Сбросить →"
Tapping "Сбросить" calls `programStore.clearCustomProgram()`.

- [ ] **Step 5: Commit**
```bash
git add src/pages/ExercisesPage.tsx
git commit -m "feat: swap exercise button on in-program cards"
```

---

## Task 6: Create `ProgramBuilderPage`

**Files:**
- Create: `src/pages/ProgramBuilderPage.tsx`
- Modify: `src/App.tsx` (add route)
- Modify: Button in ExercisesPage to navigate to builder

The Program Builder lets users create a completely custom A/B program.

- [ ] **Step 1: Create page structure**

Layout:
```
Header: "Конструктор программы"
[Tabs: Тренировка A | Тренировка B]

V-Taper Balance Card (live, updates as exercises change)

[Current slot exercises — draggable list with remove buttons]
+ Добавить упражнение

[Exercise Library — filtered by muscle group]
  Each card: tap to add to current slot
```

- [ ] **Step 2: State management**
```typescript
const [draftProgram, setDraftProgram] = useState<CustomProgram>(() => {
  const custom = programStore.customProgram
  if (custom) return custom
  return {
    A: EXERCISES.filter(e => e.workout_slot === 'A').map(e => e.id),
    B: EXERCISES.filter(e => e.workout_slot === 'B').map(e => e.id),
    createdAt: new Date().toISOString(),
  }
})
const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A')
const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all')
```

- [ ] **Step 3: Live muscle balance calculation**

```typescript
const balanceForSlot = useMemo(() => {
  const ids = draftProgram[activeSlot]
  const coverage: Record<MuscleGroup, number> = {} as any
  ids.forEach(id => {
    const libEx = EXERCISE_LIBRARY.find(e => e.id === id)
    if (libEx) {
      coverage[libEx.muscle_group] = (coverage[libEx.muscle_group] || 0) + 1
    }
  })
  return coverage
}, [draftProgram, activeSlot])
```

Show as colored progress bars (same component as ExercisesPage VTaperCard).

- [ ] **Step 4: Add/remove exercises**
```typescript
const addExercise = (id: string) => {
  setDraftProgram(prev => ({
    ...prev,
    [activeSlot]: [...prev[activeSlot], id]
  }))
}
const removeExercise = (id: string) => {
  setDraftProgram(prev => ({
    ...prev,
    [activeSlot]: prev[activeSlot].filter(x => x !== id)
  }))
}
```

- [ ] **Step 5: Save button**
```typescript
const handleSave = () => {
  programStore.saveCustomProgram(draftProgram)
  navigate('/exercises')
  // Show success toast
}
```

- [ ] **Step 6: Add route in App.tsx**
```tsx
<Route path="/program-builder" element={<ProgramBuilderPage />} />
```

- [ ] **Step 7: Add "Создать программу" button in ExercisesPage header**

- [ ] **Step 8: Commit**
```bash
git add src/pages/ProgramBuilderPage.tsx src/App.tsx src/pages/ExercisesPage.tsx
git commit -m "feat: ProgramBuilderPage with live muscle balance"
```

---

## Task 7: Wire up WorkoutPage and HomePage to use custom program

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/WorkoutPage.tsx` (or `src/stores/workoutStore.ts`)

- [ ] **Step 1: In `HomePage.tsx`, replace `getExercisesByWorkout(nextWorkout)` calls with `getExercisesForWorkout(nextWorkout, customProgram)`**

Pull `customProgram` from `useProgramStore`.

- [ ] **Step 2: In `WorkoutPage.tsx` / workout initialization, use `getExercisesForWorkout()` instead of `getExercisesByWorkout()`**

- [ ] **Step 3: Commit**
```bash
git add src/pages/HomePage.tsx src/pages/WorkoutPage.tsx
git commit -m "feat: workout generation respects custom program"
```

---

## Task 8: Final build and deploy

- [ ] **Step 1: Run build**
```bash
cd D:/AI/Gym && npm run build
```
Expected: `✓ built in X.Xs` with no TypeScript errors.

- [ ] **Step 2: Fix any TS errors**

- [ ] **Step 3: Push to deploy**
```bash
git push origin main
```

---

## Key Constraints
- No drag-and-drop (YAGNI) — tap to add/remove is enough
- No multiple saved programs (YAGNI) — one custom program at a time
- Custom program persists in localStorage indefinitely until user resets
- Exercise order in custom program is insertion order (tap order)
- If exercise from library is not in default EXERCISES, use library data with sensible defaults
