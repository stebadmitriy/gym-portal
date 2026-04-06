# 3-Day Full Body Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate GymPrime PWA from 2-day (A/B) split to 3-day Full Body protocol (A/B/C) with reworked HomePage, InfoPage supplements, and ExerciseModal scrub bar fix.

**Architecture:** Separate workout files per day (`src/lib/workouts/`), re-exported through `src/lib/exercises.ts`. Types extended to `'A'|'B'|'C'`. All 13 affected files updated in a logical dependency order (types → data → store → pages → components).

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Zustand, Framer Motion, localStorage

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/types/index.ts` | WorkoutType, CustomProgram, Exercise types |
| Create | `src/lib/workouts/workoutA.ts` | Workout A exercises (Mon - Ширина) |
| Create | `src/lib/workouts/workoutB.ts` | Workout B exercises (Wed - Мощь) |
| Create | `src/lib/workouts/workoutC.ts` | Workout C exercises (Fri - Детализация) |
| Create | `src/lib/workouts/index.ts` | getExercisesForWorkout(), re-exports |
| Modify | `src/lib/exercises.ts` | Become re-export from workouts/index.ts |
| Modify | `src/lib/exerciseLibrary.ts` | Add 6 new exercises (squat, military_press, rdl, bent_over_row, dips, lunges) |
| Modify | `src/lib/program.ts` | advanceProgramState: A→B→C→A |
| Modify | `src/stores/programStore.ts` | swapExercise supports C, remove todaySteps/saveSteps |
| Modify | `src/pages/HomePage.tsx` | 3 workout cards with statuses, remove steps/cycle/weight |
| Modify | `src/pages/WorkoutPage.tsx` | Accept 'C' workout type |
| Modify | `src/pages/InfoPage.tsx` | Add body weight section, update 5 supplements |
| Modify | `src/pages/ExercisesPage.tsx` | programExerciseIds includes C, alternatives fix |
| Modify | `src/components/ExerciseModal.tsx` | Clickable equipment photo, scrub bar fix, C slot badge |
| Modify | `src/pages/ProgramBuilderPage.tsx` | Slot C support |
| Modify | `src/components/SwapExerciseSheet.tsx` | Slot C support |

---

## Task 1: Extend Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update WorkoutType, CustomProgram, remove gifUrl from Exercise**

```typescript
// src/types/index.ts  — replace relevant lines:

export type WorkoutType = 'A' | 'B' | 'C'

export interface Exercise {
  id: string
  name_ru: string
  name_en?: string
  muscle_primary: string
  is_compound: boolean
  increment_kg: number
  tempo: string
  workout_slot: WorkoutType
  exercise_order: number
  tips_ru: string
  sets: number
  reps: string
  muscle_emoji: string
  instagramUrl?: string
  alternatives?: string[]
}

export interface CustomProgram {
  A: string[]
  B: string[]
  C: string[]
  createdAt: string
}

export interface ProgramState {
  total_week: number
  next_workout_type: WorkoutType
  last_workout_date?: string
}
```

- [ ] **Step 2: Build — verify no TS errors in types**

Run: `cd D:/AI/Gym && npm run build 2>&1 | head -40`

Expected: only cascade errors from files not yet updated (that's OK)

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: extend WorkoutType to A|B|C, add C slot to CustomProgram"
```

---

## Task 2: Create Workout Files

**Files:**
- Create: `src/lib/workouts/workoutA.ts`
- Create: `src/lib/workouts/workoutB.ts`
- Create: `src/lib/workouts/workoutC.ts`
- Create: `src/lib/workouts/index.ts`
- Modify: `src/lib/exercises.ts`

- [ ] **Step 1: Create workoutA.ts**

```typescript
// src/lib/workouts/workoutA.ts
import { Exercise } from '../../types'

export const EXERCISES_A: Exercise[] = [
  {
    id: 'incline_dumbbell_press',
    name_ru: 'Жим гантелей на наклонной',
    name_en: 'Incline Dumbbell Press',
    muscle_primary: 'Грудь',
    muscle_emoji: '💪',
    is_compound: true,
    increment_kg: 2,
    tempo: '3-1-2',
    workout_slot: 'A',
    exercise_order: 1,
    tips_ru: 'Угол скамьи 30–45°. Лопатки сведены и прижаты. Опускай медленно 3 сек, жми через пятки ладоней.',
    sets: 3,
    reps: '8-12',
    instagramUrl: 'https://www.instagram.com/reel/DVTlN1AEQZH/',
    alternatives: [
      'https://www.instagram.com/reel/DVd3338ASdO/',
    ],
  },
  {
    id: 'pull_ups',
    name_ru: 'Подтягивания',
    name_en: 'Pull-ups',
    muscle_primary: 'Спина',
    muscle_emoji: '🔝',
    is_compound: true,
    increment_kg: 0,
    tempo: '2-1-3',
    workout_slot: 'A',
    exercise_order: 2,
    tips_ru: 'Хват чуть шире плеч. Тяни лопатки вниз до начала движения. Полное разгибание внизу — обязательно.',
    sets: 3,
    reps: '6-12',
    instagramUrl: 'https://www.instagram.com/reel/DVYLCDoj6G5/',
    alternatives: [],
  },
  {
    id: 'cable_lateral_raise',
    name_ru: 'Разведения в кроссовере',
    name_en: 'Cable Lateral Raise',
    muscle_primary: 'Плечи',
    muscle_emoji: '🎯',
    is_compound: false,
    increment_kg: 1,
    tempo: '2-1-2',
    workout_slot: 'A',
    exercise_order: 3,
    tips_ru: 'Кабель снизу, рука слегка согнута. Веди локоть, не кисть. Стоп в точке параллели с полом — не выше.',
    sets: 3,
    reps: '12-20',
    instagramUrl: 'https://www.instagram.com/reel/DVhbejJje7f/',
    alternatives: [
      'https://www.instagram.com/reel/DVL-XDUk9cl/',
      'https://www.instagram.com/reel/DUUEdhkFNEv/',
    ],
  },
  {
    id: 'hip_thrust',
    name_ru: 'Ягодичный мост (Хип-траст)',
    name_en: 'Hip Thrust',
    muscle_primary: 'Ягодицы',
    muscle_emoji: '🍑',
    is_compound: true,
    increment_kg: 5,
    tempo: '2-1-2',
    workout_slot: 'A',
    exercise_order: 4,
    tips_ru: 'Лопатки на скамье, штанга на тазобедренных. Сожми ягодицы в верхней точке, держи 1 сек. Не перегибай поясницу.',
    sets: 3,
    reps: '10-15',
    instagramUrl: 'https://www.instagram.com/reel/DVH3cAcjdNf/',
    alternatives: [],
  },
  {
    id: 'squat',
    name_ru: 'Приседания',
    name_en: 'Squat',
    muscle_primary: 'Ноги',
    muscle_emoji: '🦵',
    is_compound: true,
    increment_kg: 2.5,
    tempo: '3-1-2',
    workout_slot: 'A',
    exercise_order: 5,
    tips_ru: 'Стопы на ширине плеч, носки чуть врозь. Спина нейтральная. Колени над носками. Садись до параллели или ниже.',
    sets: 3,
    reps: '8-12',
    instagramUrl: 'https://www.instagram.com/reel/DTqZMvSEqyD/',
    alternatives: [
      'https://www.instagram.com/reel/DUWzspwDenA/',
      'https://www.instagram.com/reel/DV_IXcCAkWT/',
    ],
  },
  {
    id: 'biceps_curl',
    name_ru: 'Сгибания на бицепс (EZ-гриф)',
    name_en: 'Biceps Curl',
    muscle_primary: 'Бицепс',
    muscle_emoji: '💪',
    is_compound: false,
    increment_kg: 1,
    tempo: '2-1-3',
    workout_slot: 'A',
    exercise_order: 6,
    tips_ru: 'Локти прижаты к телу — не двигаются. Полное разгибание внизу. Сожми бицепс наверху. Не раскачивайся.',
    sets: 3,
    reps: '10-15',
    instagramUrl: 'https://www.instagram.com/reel/DVoSXnnCVQd/',
    alternatives: [
      'https://www.instagram.com/reel/DVjPOfeCG7p/',
      'https://www.instagram.com/reel/DU0o3WbkzTA/',
    ],
  },
]
```

- [ ] **Step 2: Create workoutB.ts**

```typescript
// src/lib/workouts/workoutB.ts
import { Exercise } from '../../types'

export const EXERCISES_B: Exercise[] = [
  {
    id: 'military_press',
    name_ru: 'Жим штанги стоя (Военный жим)',
    name_en: 'Military Press',
    muscle_primary: 'Плечи',
    muscle_emoji: '🎯',
    is_compound: true,
    increment_kg: 2,
    tempo: '2-1-2',
    workout_slot: 'B',
    exercise_order: 1,
    tips_ru: 'Штанга чуть ниже подбородка в старте. Жми вертикально вверх, убирая голову с пути. Кор напряжён — не прогибай поясницу.',
    sets: 3,
    reps: '8-12',
    instagramUrl: 'https://www.instagram.com/reel/DUrWSM5jv1_/',
    alternatives: [
      'https://www.instagram.com/reel/DToqx8-kijp/',
      'https://www.instagram.com/reel/DUUEdhkFNEv/',
    ],
  },
  {
    id: 'bent_over_row',
    name_ru: 'Тяга штанги в наклоне',
    name_en: 'Bent Over Row',
    muscle_primary: 'Спина',
    muscle_emoji: '🔝',
    is_compound: true,
    increment_kg: 2.5,
    tempo: '2-1-3',
    workout_slot: 'B',
    exercise_order: 2,
    tips_ru: 'Наклон 45°, спина нейтральная. Тяни штангу к нижней части живота, локти вдоль тела. Сожми лопатки в верхней точке.',
    sets: 3,
    reps: '8-12',
    instagramUrl: 'https://www.instagram.com/reel/DT8oOXdD1zS/',
    alternatives: [
      'https://www.instagram.com/reel/DT9eB_uExMS/',
      'https://www.instagram.com/reel/DURs7ZGmM-8/',
    ],
  },
  {
    id: 'rdl',
    name_ru: 'Румынская тяга',
    name_en: 'Romanian Deadlift',
    muscle_primary: 'Ноги',
    muscle_emoji: '🦵',
    is_compound: true,
    increment_kg: 2.5,
    tempo: '3-1-2',
    workout_slot: 'B',
    exercise_order: 3,
    tips_ru: 'Штанга у голеней, спина нейтральная. Отводи таз назад, не сгибай колени сильно. Почувствуй растяжение бицепса бедра — стоп.',
    sets: 3,
    reps: '10-12',
    instagramUrl: 'https://www.instagram.com/reel/DVeTnK8kqOm/',
    alternatives: [
      'https://www.instagram.com/reel/DVY01e-gU4u/',
    ],
  },
  {
    id: 'leg_press',
    name_ru: 'Жим ногами',
    name_en: 'Leg Press',
    muscle_primary: 'Ноги',
    muscle_emoji: '🦵',
    is_compound: true,
    increment_kg: 5,
    tempo: '3-1-2',
    workout_slot: 'B',
    exercise_order: 4,
    tips_ru: 'Стопы на ширине плеч, средняя часть платформы. Опускай до 90° в колене — не ниже. Не отрывай поясницу от спинки.',
    sets: 3,
    reps: '10-15',
    instagramUrl: 'https://www.instagram.com/reel/DV4mQyviG46/',
    alternatives: [],
  },
  {
    id: 'dips',
    name_ru: 'Отжимания на брусьях',
    name_en: 'Dips',
    muscle_primary: 'Трицепс',
    muscle_emoji: '🔱',
    is_compound: true,
    increment_kg: 0,
    tempo: '2-1-2',
    workout_slot: 'B',
    exercise_order: 5,
    tips_ru: 'Держись прямо для акцента на трицепс. Опускайся до 90° в локте. Не раскачивайся. Сожми трицепс в верхней точке.',
    sets: 3,
    reps: '8-15',
    instagramUrl: 'https://www.instagram.com/reel/DVq4dqWlJih/',
    alternatives: [
      'https://www.instagram.com/reel/DUOJeV7D8dh/',
    ],
  },
  {
    id: 'triceps_pushdown',
    name_ru: 'Жим верхнего блока на трицепс',
    name_en: 'Triceps Pushdown',
    muscle_primary: 'Трицепс',
    muscle_emoji: '🔱',
    is_compound: false,
    increment_kg: 1,
    tempo: '2-1-2',
    workout_slot: 'B',
    exercise_order: 6,
    tips_ru: 'Локти прижаты к телу — не двигаются. Жми до полного разгибания. Контролируй возврат. Не используй вес тела.',
    sets: 3,
    reps: '12-15',
    instagramUrl: 'https://www.instagram.com/reel/DV16kaxDeQ1/',
    alternatives: [
      'https://www.instagram.com/reel/DVpdud0kXp4/',
      'https://www.instagram.com/reel/DVKV7KQGCB8/',
    ],
  },
]
```

- [ ] **Step 3: Create workoutC.ts**

```typescript
// src/lib/workouts/workoutC.ts
import { Exercise } from '../../types'

export const EXERCISES_C: Exercise[] = [
  {
    id: 'lat_pulldown',
    name_ru: 'Тяга верхнего блока',
    name_en: 'Lat Pulldown',
    muscle_primary: 'Спина',
    muscle_emoji: '🔝',
    is_compound: true,
    increment_kg: 2,
    tempo: '2-1-3',
    workout_slot: 'C',
    exercise_order: 1,
    tips_ru: 'Хват широкий, наклон назад 20-30°. Тяни к верхней части груди, сводя лопатки. Контролируй подъём — 3 сек.',
    sets: 3,
    reps: '10-12',
    instagramUrl: 'https://www.instagram.com/reel/DVL0JI8DXHA/',
    alternatives: [],
  },
  {
    id: 'upright_row',
    name_ru: 'Тяга штанги к подбородку',
    name_en: 'Upright Row',
    muscle_primary: 'Плечи',
    muscle_emoji: '🎯',
    is_compound: true,
    increment_kg: 1,
    tempo: '2-1-2',
    workout_slot: 'C',
    exercise_order: 2,
    tips_ru: 'Хват узкий (чуть уже плеч). Тяни локти вверх и в стороны. Стоп у уровня подбородка. Не поднимай плечи к ушам.',
    sets: 3,
    reps: '10-15',
    instagramUrl: 'https://www.instagram.com/reel/DV3wsCnjUq0/',
    alternatives: [],
  },
  {
    id: 'cable_rear_delt_fly',
    name_ru: 'Разведения для задней дельты',
    name_en: 'Cable Rear Delt Fly',
    muscle_primary: 'Плечи',
    muscle_emoji: '🎯',
    is_compound: false,
    increment_kg: 1,
    tempo: '2-1-3',
    workout_slot: 'C',
    exercise_order: 3,
    tips_ru: 'Кабели скрест-вариант или гантели, наклон вперёд. Веди локти назад и в стороны, сводя лопатки. Фокус на задней дельте.',
    sets: 3,
    reps: '15-20',
    instagramUrl: 'https://www.instagram.com/reel/DVmCMK2jdrF/',
    alternatives: [
      'https://www.instagram.com/reel/DUpUEFLjV-9/',
    ],
  },
  {
    id: 'lunges',
    name_ru: 'Выпады',
    name_en: 'Lunges',
    muscle_primary: 'Ноги',
    muscle_emoji: '🦵',
    is_compound: true,
    increment_kg: 2,
    tempo: '2-1-2',
    workout_slot: 'C',
    exercise_order: 4,
    tips_ru: 'Шаг вперёд, заднее колено почти касается пола. Переднее колено над носком. Держи корпус прямо. Чередуй ноги.',
    sets: 3,
    reps: '10-12',
    instagramUrl: 'https://www.instagram.com/reel/DVY01e-gU4u/',
    alternatives: [
      'https://www.instagram.com/reel/DVwi66liOve/',
    ],
  },
  {
    id: 'leg_raise',
    name_ru: 'Подъёмы ног в висе',
    name_en: 'Leg Raise',
    muscle_primary: 'Пресс',
    muscle_emoji: '🔥',
    is_compound: false,
    increment_kg: 0,
    tempo: '2-1-3',
    workout_slot: 'C',
    exercise_order: 5,
    tips_ru: 'Вис на турнике. Поднимай прямые ноги до горизонтали или выше. Не раскачивайся. Опускай медленно — контроль.',
    sets: 3,
    reps: '12-20',
    instagramUrl: 'https://www.instagram.com/reel/DT54PEIlKNP/',
    alternatives: [
      'https://www.instagram.com/reel/DTlxpXslKSw/',
    ],
  },
  {
    id: 'hammer_curl',
    name_ru: 'Молотковые сгибания',
    name_en: 'Hammer Curl',
    muscle_primary: 'Бицепс',
    muscle_emoji: '💪',
    is_compound: false,
    increment_kg: 1,
    tempo: '2-1-3',
    workout_slot: 'C',
    exercise_order: 6,
    tips_ru: 'Нейтральный хват (большой палец вверх). Локти у тела. Тренирует брахиалис и плечелучевую — даёт объём и толщину руки.',
    sets: 3,
    reps: '10-15',
    instagramUrl: 'https://www.instagram.com/reel/DVSR6FVgWd8/',
    alternatives: [
      'https://www.instagram.com/reel/DVjPOfeCG7p/',
    ],
  },
]
```

- [ ] **Step 4: Create workouts/index.ts**

```typescript
// src/lib/workouts/index.ts
import { Exercise, WorkoutType, CustomProgram } from '../../types'
import { EXERCISES_A } from './workoutA'
import { EXERCISES_B } from './workoutB'
import { EXERCISES_C } from './workoutC'

export { EXERCISES_A, EXERCISES_B, EXERCISES_C }

const DEFAULT_IDS_A = EXERCISES_A.map(e => e.id)
const DEFAULT_IDS_B = EXERCISES_B.map(e => e.id)
const DEFAULT_IDS_C = EXERCISES_C.map(e => e.id)

const ALL_EXERCISES: Exercise[] = [...EXERCISES_A, ...EXERCISES_B, ...EXERCISES_C]

export function getExercisesForWorkout(slot: WorkoutType, customProgram?: CustomProgram | null): Exercise[] {
  const defaults = slot === 'A' ? EXERCISES_A : slot === 'B' ? EXERCISES_B : EXERCISES_C
  const customIds = customProgram?.[slot]
  if (!customIds || customIds.length === 0) return defaults

  return customIds
    .map(id => ALL_EXERCISES.find(e => e.id === id))
    .filter((e): e is Exercise => e !== undefined)
}

export function getExercisesByWorkout(): { A: Exercise[]; B: Exercise[]; C: Exercise[] } {
  return { A: EXERCISES_A, B: EXERCISES_B, C: EXERCISES_C }
}

export const EXERCISES = ALL_EXERCISES

export { DEFAULT_IDS_A, DEFAULT_IDS_B, DEFAULT_IDS_C }
```

- [ ] **Step 5: Update src/lib/exercises.ts to re-export**

Replace entire file content:

```typescript
// src/lib/exercises.ts — re-export from workouts
export {
  EXERCISES_A,
  EXERCISES_B,
  EXERCISES_C,
  EXERCISES,
  getExercisesForWorkout,
  getExercisesByWorkout,
} from './workouts/index'
```

- [ ] **Step 6: Build — verify exercises.ts compiles**

Run: `cd D:/AI/Gym && npm run build 2>&1 | head -60`

Expected: errors only from files still referencing old shape (programStore, pages)

- [ ] **Step 7: Commit**

```bash
git add src/lib/workouts/ src/lib/exercises.ts
git commit -m "feat: create 3-day workout files A/B/C with new exercises"
```

---

## Task 3: Add 6 New Exercises to exerciseLibrary.ts

**Files:**
- Modify: `src/lib/exerciseLibrary.ts` (add entries for: squat, military_press, rdl, bent_over_row, dips, lunges)

Note: pull_ups, hip_thrust, incline_dumbbell_press may already exist — check first and skip if found.

- [ ] **Step 1: Check which exercises already exist in exerciseLibrary.ts**

Run: `grep -n "id: '" D:/AI/Gym/src/lib/exerciseLibrary.ts | grep -E "squat|military_press|rdl|bent_over_row|dips|lunges|pull_ups|hip_thrust|incline_dumbbell"`

- [ ] **Step 2: Add missing exercises to exerciseLibrary.ts**

Append new entries in the appropriate muscle group sections. Add after existing entries in the file (before the closing bracket of the exercises array):

For **squat** (Ноги section):
```typescript
{
  id: 'squat',
  name_ru: 'Приседания',
  name_en: 'Squat',
  muscle_group: 'legs_quads',
  muscle_emoji: '🦵',
  is_compound: true,
  tips_ru: 'Стопы на ширине плеч, носки чуть врозь. Спина нейтральная. Колени над носками. Садись до параллели или ниже.',
  primaryVideo: { url: 'https://www.instagram.com/reel/DTqZMvSEqyD/', title: 'The PERFECT Squat' },
  altVideos: [
    { url: 'https://www.instagram.com/reel/DUWzspwDenA/', title: 'Stop Squatting Wrong — Do This Instead' },
    { url: 'https://www.instagram.com/reel/DV_IXcCAkWT/', title: '5 Barbell Squat Variations' },
  ],
},
```

For **military_press** (Плечи section):
```typescript
{
  id: 'military_press',
  name_ru: 'Военный жим стоя',
  name_en: 'Military Press',
  muscle_group: 'shoulders_front',
  muscle_emoji: '🎯',
  is_compound: true,
  tips_ru: 'Штанга у подбородка на старте. Жми вертикально, убирая голову. Кор в напряжении. Локти чуть впереди грифа.',
  primaryVideo: { url: 'https://www.instagram.com/reel/DUrWSM5jv1_/', title: 'Perfect Your Overhead Press Form' },
  altVideos: [
    { url: 'https://www.instagram.com/reel/DToqx8-kijp/', title: 'Overhead Press Tips' },
    { url: 'https://www.instagram.com/reel/DUUEdhkFNEv/', title: 'Shoulder Press Variations' },
  ],
},
```

For **rdl** (Ноги section):
```typescript
{
  id: 'rdl',
  name_ru: 'Румынская тяга',
  name_en: 'Romanian Deadlift',
  muscle_group: 'legs_hamstrings',
  muscle_emoji: '🦵',
  is_compound: true,
  tips_ru: 'Штанга близко к голеням. Отводи таз назад — не сгибай колени сильно. Почувствуй растяжение бицепса бедра — стоп.',
  primaryVideo: { url: 'https://www.instagram.com/reel/DVeTnK8kqOm/', title: 'RDL vs Squat: Key Differences' },
  altVideos: [
    { url: 'https://www.instagram.com/reel/DVY01e-gU4u/', title: '5 Best Glute & Hamstring Exercises' },
  ],
},
```

For **bent_over_row** (Спина section):
```typescript
{
  id: 'bent_over_row',
  name_ru: 'Тяга штанги в наклоне',
  name_en: 'Bent Over Row',
  muscle_group: 'back_thickness',
  muscle_emoji: '🔝',
  is_compound: true,
  tips_ru: 'Наклон ~45°, спина нейтральная. Тяни к животу, локти вдоль тела. Сожми лопатки в верхней точке.',
  primaryVideo: { url: 'https://www.instagram.com/reel/DT8oOXdD1zS/', title: 'Barbell Row Variations Explained' },
  altVideos: [
    { url: 'https://www.instagram.com/reel/DT9eB_uExMS/', title: 'T-Bar Rows Done Right' },
    { url: 'https://www.instagram.com/reel/DURs7ZGmM-8/', title: 'Landmine Row Mistakes' },
  ],
},
```

For **dips** (Трицепсы section):
```typescript
{
  id: 'dips',
  name_ru: 'Отжимания на брусьях',
  name_en: 'Dips',
  muscle_group: 'triceps',
  muscle_emoji: '🔱',
  is_compound: true,
  tips_ru: 'Держись прямо для трицепса (наклон вперёд — акцент на грудь). Опускайся до 90° в локте. Полное разгибание наверху.',
  primaryVideo: { url: 'https://www.instagram.com/reel/DVq4dqWlJih/', title: 'Push-Up Variations: Chest, Shoulders & Triceps' },
  altVideos: [
    { url: 'https://www.instagram.com/reel/DUOJeV7D8dh/', title: '5 Smith Machine Variations for Chest & Triceps' },
  ],
},
```

For **lunges** (Ноги section):
```typescript
{
  id: 'lunges',
  name_ru: 'Выпады',
  name_en: 'Lunges',
  muscle_group: 'legs_quads',
  muscle_emoji: '🦵',
  is_compound: true,
  tips_ru: 'Шаг вперёд, заднее колено почти касается пола. Колено передней ноги над носком. Корпус прямо. Чередуй ноги.',
  primaryVideo: { url: 'https://www.instagram.com/reel/DVY01e-gU4u/', title: '5 Best Glute Exercises Including Reverse Lunge' },
  altVideos: [
    { url: 'https://www.instagram.com/reel/DVwi66liOve/', title: 'Lunge Variations for Legs' },
  ],
},
```

- [ ] **Step 3: Build to verify**

Run: `cd D:/AI/Gym && npm run build 2>&1 | grep -E "error|Error" | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/lib/exerciseLibrary.ts
git commit -m "feat: add squat, military_press, rdl, bent_over_row, dips, lunges to exercise library"
```

---

## Task 4: Update Program Logic and Store

**Files:**
- Modify: `src/lib/program.ts`
- Modify: `src/stores/programStore.ts`

- [ ] **Step 1: Fix advanceProgramState in program.ts**

Find the `advanceProgramState` function and replace the rotation logic:

```typescript
// OLD:
const nextWorkout = current.next_workout_type === 'A' ? 'B' : 'A'
if (current.next_workout_type === 'B') nextWeek = current.total_week + 1

// NEW:
const rotation: Record<WorkoutType, WorkoutType> = { A: 'B', B: 'C', C: 'A' }
const nextWorkout = rotation[current.next_workout_type]
const nextWeek = current.next_workout_type === 'C' ? current.total_week + 1 : current.total_week
```

Import `WorkoutType` if not already imported.

- [ ] **Step 2: Update programStore.ts**

2a. Remove `todaySteps` and `saveSteps` from state and actions.

2b. Update `swapExercise` to support slot C. Find the section building `defaultIds` for A and B and add C:

```typescript
// Find the swapExercise action, replace the defaultIds construction:
import { DEFAULT_IDS_A, DEFAULT_IDS_B, DEFAULT_IDS_C } from '../lib/workouts'

// Inside swapExercise:
const currentA = customProgram?.A ?? DEFAULT_IDS_A
const currentB = customProgram?.B ?? DEFAULT_IDS_B
const currentC = customProgram?.C ?? DEFAULT_IDS_C
const updated = { A: currentA, B: currentB, C: currentC, createdAt: customProgram?.createdAt ?? new Date().toISOString() }
if (slot === 'A') updated.A = currentA.map(id => id === oldId ? newId : id)
else if (slot === 'B') updated.B = currentB.map(id => id === oldId ? newId : id)
else updated.C = currentC.map(id => id === oldId ? newId : id)
```

2c. Remove any references to `todaySteps` or `saveSteps` in the store interface and implementation.

- [ ] **Step 3: Build to verify**

Run: `cd D:/AI/Gym && npm run build 2>&1 | grep -E "error TS" | head -30`

- [ ] **Step 4: Commit**

```bash
git add src/lib/program.ts src/stores/programStore.ts
git commit -m "feat: rotate A→B→C→A, add C slot to swapExercise, remove step tracking"
```

---

## Task 5: Rework HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Design:** Show 3 workout cards (A/B/C) with day labels and status icons. Active = next_workout_type. Completed = workouts this week with matching slot. Pending = future. Remove steps card, cycle progress bar, weight card, "Текущий блок" grid. Keep meal reminders and "Наука дня" tip.

- [ ] **Step 1: Replace HomePage.tsx**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { getExercisesForWorkout } from '../lib/exercises'
import { getSettings } from '../lib/storage'
import { getWorkouts } from '../lib/storage'
import { WorkoutType } from '../types'

const SCIENCE_TIPS = [
  { icon: '🧬', text: 'Ходьба после еды снижает инсулин и переключает тело в режим жиросжигания (Journal of Diabetes Care)' },
  { icon: '😴', text: 'Сон 7-9 часов увеличивает синтез белка на 30% и снижает кортизол' },
  { icon: '💧', text: 'Потеря 2% веса от обезвоживания снижает силу на 10-20%. Пей 3-4 л воды в день' },
  { icon: '🥩', text: '1.6-2.2г протеина на кг веса — научно подтверждённый оптимум для роста мышц' },
  { icon: '⏰', text: 'V-тейп формируется широчайшими и боковыми дельтами — именно эти мышцы в приоритете программы' },
  { icon: '🔥', text: 'RIR (повторения в запасе) точнее %1ПМ для управления интенсивностью у опытных атлетов' },
]

const MUSCLE_COLORS: Record<string, string> = {
  'Спина': '#6366f1', 'Грудь': '#ec4899', 'Плечи': '#f59e0b',
  'Бицепс': '#10b981', 'Трицепс': '#14b8a6', 'Ноги': '#f97316',
  'Пресс': '#8b5cf6', 'Ягодицы': '#ef4444',
}

const WORKOUT_META: Record<WorkoutType, { label: string; dayRu: string; emoji: string; color: string }> = {
  A: { label: 'Тренировка A', dayRu: 'Понедельник · Ширина', emoji: '💪', color: '#6366f1' },
  B: { label: 'Тренировка B', dayRu: 'Среда · Мощь', emoji: '⚡', color: '#f59e0b' },
  C: { label: 'Тренировка C', dayRu: 'Пятница · Детализация', emoji: '🎯', color: '#10b981' },
}

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Mon
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

export default function HomePage() {
  const navigate = useNavigate()
  const { programState, weights, customProgram } = useProgramStore()
  const { startWorkout, activeWorkout } = useWorkoutStore()
  const [tipIndex] = useState(() => Math.floor(Math.random() * SCIENCE_TIPS.length))
  const [settings] = useState(getSettings())

  const nextWorkout = programState.next_workout_type

  // Determine which slots were completed this week
  const weekStart = getWeekStart()
  const completedSlots = new Set<string>(
    getWorkouts()
      .filter(w => w.completed_at && w.completed_at >= weekStart)
      .map(w => w.workout_type)
  )

  const handleStartWorkout = (slot: WorkoutType) => {
    if (slot !== nextWorkout) return // only active slot is clickable
    const exercises = getExercisesForWorkout(slot, customProgram)
    if (!activeWorkout) {
      startWorkout(slot, programState.total_week, exercises, weights)
    }
    navigate('/workout')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header */}
      <div
        className="px-5 pb-5"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/50 text-sm font-medium tracking-wide">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long' })}
            </p>
            <h1 className="text-3xl font-black text-white mt-0.5 tracking-tight">
              Неделя{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))',
              }}>
                {programState.total_week}
              </span>
            </h1>
          </div>
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            🏋️
          </motion.div>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {/* 3 Workout Cards */}
        {(['A', 'B', 'C'] as WorkoutType[]).map((slot, i) => {
          const meta = WORKOUT_META[slot]
          const isActive = slot === nextWorkout
          const isDone = completedSlots.has(slot)
          const isPending = !isActive && !isDone
          const exercises = getExercisesForWorkout(slot, customProgram)

          return (
            <motion.div
              key={slot}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => isActive && handleStartWorkout(slot)}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: isDone ? 'rgba(16,185,129,0.06)' : isActive ? '#1c1c27' : 'rgba(255,255,255,0.02)',
                border: isActive
                  ? `1px solid ${meta.color}50`
                  : isDone ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.06)',
                opacity: isPending ? 0.55 : 1,
                cursor: isActive ? 'pointer' : 'default',
                boxShadow: isActive ? `0 0 24px ${meta.color}18` : 'none',
              }}
            >
              {/* Active glow */}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at top right, ${meta.color}15 0%, transparent 60%)`,
                }} />
              )}

              <div className="relative flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{meta.dayRu}</span>
                    {isActive && activeWorkout && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-xs font-semibold">LIVE</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    {meta.label}
                    {isDone && <span className="text-green-400 text-base">✅</span>}
                    {isActive && !isDone && <span className="text-base">🟣</span>}
                    {isPending && <span className="text-base opacity-50">⏳</span>}
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">{exercises.length} упражнений</p>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}25, ${meta.color}15)`,
                    border: `1px solid ${meta.color}30`,
                  }}
                >
                  {meta.emoji}
                </div>
              </div>

              {/* Exercise chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {exercises.slice(0, 4).map(ex => {
                  const accent = MUSCLE_COLORS[ex.muscle_primary] || meta.color
                  return (
                    <span
                      key={ex.id}
                      className="text-xs py-1"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                        borderLeft: `3px solid ${accent}`,
                        borderRadius: '0 20px 20px 0',
                        paddingLeft: '8px', paddingRight: '12px',
                      }}
                    >
                      {ex.muscle_emoji} {ex.muscle_primary}
                    </span>
                  )
                })}
              </div>

              {isActive && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary w-full text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: activeWorkout
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                    boxShadow: `0 4px 20px ${meta.color}40`,
                  }}
                >
                  {activeWorkout ? '▶️ Продолжить' : '🚀 Начать →'}
                </motion.button>
              )}
            </motion.div>
          )
        })}

        {/* Meal reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🍽️</span>
            <h3 className="font-semibold">Прогулки после еды</h3>
          </div>
          <div className="space-y-2">
            {settings.mealTimes.filter(m => m.enabled).map((meal, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-white/70 text-sm">{meal.label}</span>
                <span className="text-white/40 text-sm">{meal.time} → прогулка через 5 мин</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-400/80 mt-3">🚶 10 мин прогулки после еды = жиросжигание без стресса!</p>
        </motion.div>

        {/* Science tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-2xl p-5"
          style={{
            background: '#1c1c27',
            border: '1px solid rgba(99,102,241,0.25)',
            borderLeft: '4px solid #6366f1',
            boxShadow: '-4px 0 16px rgba(99,102,241,0.15)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a5b4fc' }}>Наука дня</span>
          <div className="flex gap-3 items-start mt-2">
            <span className="text-3xl leading-none">{SCIENCE_TIPS[tipIndex].icon}</span>
            <p className="text-sm text-white/75 leading-relaxed">{SCIENCE_TIPS[tipIndex].text}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build to check for errors**

Run: `cd D:/AI/Gym && npm run build 2>&1 | grep -E "error TS" | head -20`

Fix any remaining type errors (e.g., `startWorkout` signature may need `block` param — check workoutStore).

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: rework HomePage with 3 workout status cards, remove steps/weight/cycle blocks"
```

---

## Task 6: Update ExercisesPage, ExerciseModal, WorkoutPage

**Files:**
- Modify: `src/pages/ExercisesPage.tsx`
- Modify: `src/components/ExerciseModal.tsx`
- Modify: `src/pages/WorkoutPage.tsx`

- [ ] **Step 1: Fix ExercisesPage.tsx programExerciseIds**

Find the line:
```typescript
const programExerciseIds = new Set(EXERCISES.map(ex => ex.id.replace(/_b$/, '')))
```

This already uses `EXERCISES` from exercises.ts. Since the new `EXERCISES` export is `ALL_EXERCISES` (A+B+C), this should work automatically after Task 2. Verify it includes C slot exercises.

Also check `libExerciseToExercise()` — the `alternatives` mapping should already work:
```typescript
alternatives: ex.altVideos.map(v => v.url),
```
If ExerciseModal doesn't show alternatives, the issue is in the modal (next step).

- [ ] **Step 2: Fix ExerciseModal.tsx — scrub bar, clickable photo, C badge**

2a. Scrub bar fix — there are **two** identical iframe containers (main video ~line 306, alt video ~line 450). Both have `height: 460` and iframe `height="540"`. Replace both occurrences:

```typescript
// OLD (appears twice — use replace_all: true):
<div style={{ overflow: 'hidden', borderRadius: 16, height: 460 }}>
  <iframe

// NEW:
<div style={{ overflow: 'hidden', borderRadius: 16, height: 510 }}>
  <iframe
```

And for iframe height (also appears twice):
```typescript
// OLD height attribute (both iframes):
height="540"
// NEW:
height="590"
```
Keep `marginTop: -60` unchanged. This exposes the bottom 50px native scrub bar.

2b. Equipment photo clickable — find the `<img>` block inside the equipment accordion:

```typescript
// OLD (lines ~651-656):
<div
  className="rounded-2xl overflow-hidden"
  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
>
  <img
    src={equipmentPhoto}
    alt={exercise.name_en}
    className="w-full object-cover"
    style={{ maxHeight: 280, objectPosition: 'center top' }}
  />
</div>

// NEW:
<div
  className="rounded-2xl overflow-hidden"
  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
>
  <a href={equipmentPhoto} target="_blank" rel="noopener noreferrer">
    <img
      src={equipmentPhoto}
      alt={exercise.name_en}
      className="w-full object-cover"
      style={{ maxHeight: 280, objectPosition: 'center top' }}
    />
  </a>
</div>
```

2c. C slot badge — find the inline style at ~line 204 that currently only handles A/B:

```typescript
// OLD:
style={{
  background: exercise.workout_slot === 'A' ? 'rgba(99,102,241,0.18)' : 'rgba(245,158,11,0.18)',
  color: exercise.workout_slot === 'A' ? '#a5b4fc' : '#fbbf24',
  border: exercise.workout_slot === 'A'
    ? '1px solid rgba(99,102,241,0.3)'
    : '1px solid rgba(245,158,11,0.3)',
}}

// NEW:
style={{
  background: exercise.workout_slot === 'A'
    ? 'rgba(99,102,241,0.18)'
    : exercise.workout_slot === 'C'
    ? 'rgba(16,185,129,0.18)'
    : 'rgba(245,158,11,0.18)',
  color: exercise.workout_slot === 'A'
    ? '#a5b4fc'
    : exercise.workout_slot === 'C'
    ? '#34d399'
    : '#fbbf24',
  border: exercise.workout_slot === 'A'
    ? '1px solid rgba(99,102,241,0.3)'
    : exercise.workout_slot === 'C'
    ? '1px solid rgba(16,185,129,0.3)'
    : '1px solid rgba(245,158,11,0.3)',
}}
```

- [ ] **Step 3: WorkoutPage.tsx — verify 'C' support**

Read `src/pages/WorkoutPage.tsx` and verify `getExercisesForWorkout` is called with `programState.next_workout_type`. Since we updated `getExercisesForWorkout` to accept `'A'|'B'|'C'`, this should work without changes. Confirm no hardcoded `'A'|'B'` comparisons for workout type.

- [ ] **Step 4: Build**

Run: `cd D:/AI/Gym && npm run build 2>&1 | grep -E "error TS" | head -20`

- [ ] **Step 5: Commit**

```bash
git add src/pages/ExercisesPage.tsx src/components/ExerciseModal.tsx src/pages/WorkoutPage.tsx
git commit -m "fix: ExerciseModal scrub bar + clickable photo + C badge, ExercisesPage C slot"
```

---

## Task 7: Update InfoPage — Body Weight + Supplements

**Files:**
- Modify: `src/pages/InfoPage.tsx`

- [ ] **Step 1: Add body weight section to InfoPage**

Add a new section at the top of `SECTIONS` array (before 'technique'):

```typescript
{
  id: 'bodyweight',
  icon: '⚖️',
  title: 'Вес тела',
  badge: { label: 'ЕЖЕДНЕВНО', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  content: <BodyWeightSection />,
},
```

Create `BodyWeightSection` component above `SECTIONS`:

```typescript
function BodyWeightSection() {
  const { saveTodayWeight } = useProgramStore()
  const [input, setInput] = useState('')
  const measurements = getMeasurements()
  const recent = measurements.slice(0, 7).reverse()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="83.0"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-white/30"
        />
        <span className="text-white/40 font-medium">кг</span>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            const w = parseFloat(input)
            if (w > 0) { saveTodayWeight(w); setInput('') }
          }}
          className="px-4 py-3 rounded-full font-bold text-sm text-white whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
        >
          Сохранить
        </motion.button>
      </div>
      {recent.length > 1 && (
        <div className="space-y-1">
          {recent.map(m => (
            <div key={m.recorded_at} className="flex justify-between text-sm">
              <span className="text-white/40">{m.recorded_at}</span>
              <span className="text-white font-semibold">{m.weight_kg} кг</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

Add imports at top of InfoPage.tsx:
```typescript
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { getMeasurements } from '../lib/storage'
```

- [ ] **Step 2: Update supplements section**

Find the existing supplements section (id: 'supplements' or similar) and replace its content with 5 accordion sub-items. Replace the `content` field with:

```typescript
content: (
  <div className="space-y-3">
    {[
      {
        name: 'Креатин моногидрат',
        dose: '5 г/день',
        timing: 'Ежедневно в любое время, лучше после тренировки',
        effect: 'Увеличивает силу и объём мышц за счёт насыщения фосфокреатином. Одна из немногих добавок с железной доказательной базой.',
        icon: '⚡',
        color: '#6366f1',
      },
      {
        name: 'HMB (β-гидрокси β-метилбутират)',
        dose: '3 г/день (3×1 г)',
        timing: 'По 1 г с каждым основным приёмом пищи',
        effect: 'Защищает мышцы от распада при калорийном дефиците. Особенно эффективен в период сушки или при редких тренировках.',
        icon: '🛡️',
        color: '#10b981',
      },
      {
        name: 'Витамин D3 + K2',
        dose: '2000–5000 IU D3 + 100–200 мкг K2',
        timing: 'Утром с жирной едой',
        effect: 'D3 поддерживает уровень тестостерона и иммунитет. K2 направляет кальций в кости, а не в сосуды. Синергичная пара.',
        icon: '☀️',
        color: '#f59e0b',
      },
      {
        name: 'Омега-3',
        dose: '2–3 г EPA/DHA в день',
        timing: 'Во время еды (снижает "рыбную" отрыжку)',
        effect: 'Противовоспалительный эффект ускоряет восстановление после тренировок. Улучшает инсулинорезистентность и здоровье суставов.',
        icon: '🐟',
        color: '#06b6d4',
      },
      {
        name: 'Магний глицинат',
        dose: '400 мг перед сном',
        timing: 'За 30–60 мин до сна',
        effect: 'Улучшает качество сна и ночную регенерацию. Глицинатная форма хорошо усваивается и не вызывает слабительного эффекта.',
        icon: '🌙',
        color: '#8b5cf6',
      },
    ].map(supp => (
      <div
        key={supp.name}
        className="rounded-xl p-3 space-y-1"
        style={{ background: `${supp.color}12`, border: `1px solid ${supp.color}30` }}
      >
        <div className="flex items-center gap-2">
          <span>{supp.icon}</span>
          <span className="font-bold text-white text-sm">{supp.name}</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
            style={{ background: `${supp.color}25`, color: supp.color }}
          >
            {supp.dose}
          </span>
        </div>
        <p className="text-white/50 text-xs">{supp.timing}</p>
        <p className="text-white/70 text-xs leading-relaxed">{supp.effect}</p>
      </div>
    ))}
  </div>
),
```

- [ ] **Step 3: Build**

Run: `cd D:/AI/Gym && npm run build 2>&1 | grep -E "error TS" | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/pages/InfoPage.tsx
git commit -m "feat: add body weight section to InfoPage, update supplements to 5 items with full detail"
```

---

## Task 8: ProgramBuilderPage and SwapExerciseSheet — Slot C Support

**Files:**
- Modify: `src/pages/ProgramBuilderPage.tsx`
- Modify: `src/components/SwapExerciseSheet.tsx`

- [ ] **Step 1: Update ProgramBuilderPage.tsx — add slot C**

Make these 4 changes:

```typescript
// 1. Import WorkoutType at top (add to existing import from '../types'):
import { CustomProgram, MuscleGroup, WorkoutType } from '../types'

// 2. Draft initialization — add C slot (lines 14-24):
// OLD:
const [draft, setDraft] = useState<CustomProgram>(() => {
  if (customProgram) return { ...customProgram }
  return {
    A: EXERCISES.filter(e => e.workout_slot === 'A')
               .sort((a, b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
    B: EXERCISES.filter(e => e.workout_slot === 'B')
               .sort((a, b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
    createdAt: new Date().toISOString(),
  }
})

// NEW:
const [draft, setDraft] = useState<CustomProgram>(() => {
  if (customProgram) return { ...customProgram }
  return {
    A: EXERCISES.filter(e => e.workout_slot === 'A')
               .sort((a, b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
    B: EXERCISES.filter(e => e.workout_slot === 'B')
               .sort((a, b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
    C: EXERCISES.filter(e => e.workout_slot === 'C')
               .sort((a, b) => a.exercise_order - b.exercise_order)
               .map(e => e.id),
    createdAt: new Date().toISOString(),
  }
})

// 3. Active slot state (line 27):
// OLD:
const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A')
// NEW:
const [activeSlot, setActiveSlot] = useState<WorkoutType>('A')

// 4. allDraftIds (line 34):
// OLD:
const allDraftIds = new Set([...draft.A, ...draft.B])
// NEW:
const allDraftIds = new Set([...draft.A, ...draft.B, ...draft.C])

// 5. Tab array (line 105):
// OLD:
{(['A', 'B'] as const).map(slot => (
// NEW:
{(['A', 'B', 'C'] as WorkoutType[]).map(slot => (
```

- [ ] **Step 2: Update SwapExerciseSheet.tsx — add slot C**

```typescript
// 1. Import WorkoutType (add to imports):
import { WorkoutType } from '../types'

// 2. Prop type (line 11):
// OLD:
slot: 'A' | 'B'
// NEW:
slot: WorkoutType

// 3. programIds construction (lines 42-45):
// OLD:
const programIds = new Set([
  ...(customProgram?.A ?? EXERCISES.filter(e => e.workout_slot === 'A').map(e => e.id)),
  ...(customProgram?.B ?? EXERCISES.filter(e => e.workout_slot === 'B').map(e => e.id)),
])
// NEW:
const programIds = new Set([
  ...(customProgram?.A ?? EXERCISES.filter(e => e.workout_slot === 'A').map(e => e.id)),
  ...(customProgram?.B ?? EXERCISES.filter(e => e.workout_slot === 'B').map(e => e.id)),
  ...(customProgram?.C ?? EXERCISES.filter(e => e.workout_slot === 'C').map(e => e.id)),
])
```

Also check any callers of SwapExerciseSheet and update prop type from `'A' | 'B'` to `WorkoutType` there too.

- [ ] **Step 5: Final build — all errors should be zero**

Run: `cd D:/AI/Gym && npm run build 2>&1 | tail -20`

Expected: `✓ built in X.Xs` with no errors

- [ ] **Step 6: Final commit + deploy**

```bash
git add src/pages/ProgramBuilderPage.tsx src/components/SwapExerciseSheet.tsx
git commit -m "feat: add slot C to ProgramBuilder and SwapExerciseSheet"
git push
```

---

## Quick Reference: Video URLs for New Exercises

| Exercise | Primary | Alternatives |
|----------|---------|-------------|
| incline_dumbbell_press | DVTlN1AEQZH | DVd3338ASdO |
| squat | DTqZMvSEqyD | DUWzspwDenA, DV_IXcCAkWT |
| military_press | DUrWSM5jv1_ | DToqx8-kijp, DUUEdhkFNEv |
| bent_over_row | DT8oOXdD1zS | DT9eB_uExMS, DURs7ZGmM-8 |
| rdl | DVeTnK8kqOm | DVY01e-gU4u |
| dips | DVq4dqWlJih | DUOJeV7D8dh |
| lunges | DVY01e-gU4u | DVwi66liOve |
| hammer_curl | DVSR6FVgWd8 | DVjPOfeCG7p |

All URLs follow: `https://www.instagram.com/reel/<ID>/`
