# GymPortal — Personal Training PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a science-based personal gym training PWA (Progressive Web App) for iPhone 17, hosted on GitHub Pages, with Supabase as the only backend, that generates adaptive workout programs and tracks progressive overload.

**Architecture:** React 18 + Vite SPA deployed to GitHub Pages via `gh-pages` branch. Supabase (PostgreSQL + Realtime) stores all workout data — no custom backend needed. Service Worker enables offline mode, push notifications, and home screen installation.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Supabase JS SDK v2, Workbox (Service Worker), Framer Motion (animations), Recharts (progress graphs)

---

## Scientific Foundation (baked into the algorithm)

### User Profile
- **Age:** 41 years old (born 21.05.1984)
- **Weight:** 83 kg
- **Experience:** 1.5 years intermediate
- **Gym:** Prime Gym (specific machines available)
- **Frequency:** 2×/week (e.g. Mon + Thu)
- **Goal:** V-taper physique — wider lats + lateral deltoids, lower body fat

### Periodization Blocks
- **Block 2 — Hypertrophy** (start): 4×10-12 reps, 70-80% 1RM, RIR 2-3, rest 2.5 min compound / 2 min isolation
- **Block 3 — Strength**: 4-5×6-8 reps, 80-85% 1RM, RIR 1-2, rest 3.5 min compound / 2.5 min isolation
- **Deload** (week 9): 50% volume, light weights
- Cycle repeats with higher base weights

### Progressive Overload Algorithm
```
target_weight = current_weight × 1.025
round UP to nearest increment (2.5 kg barbell / 5 kg machine)
feedback_easy → +5% instead of +2.5%
feedback_hard → hold weight next week
missed_2_weeks → -5% reset
```

### Rest Timer (science-based, age-adjusted)
- Compound / Hypertrophy block: 2.5 min
- Isolation / Hypertrophy block: 2.0 min
- Compound / Strength block: 3.5 min
- Isolation / Strength block: 2.5 min

### Workout Program (8 exercises, ~85 min)

**Workout A — Lat Width + Chest + Shoulders**
1. Lat Pulldown **NARROW NEUTRAL grip** 4×10-12 ★ V-taper primary
2. Chest Press Machine 4×10-12
3. Shoulder Press 4×10-12
4. Incline Pec Fly 3×12
5. Cable Lateral Raise 3×15 ★ lateral deltoids
6. Leg Press 4×10-12
7. Seated Leg Curl 3×12
8. Abdominal Crunch 3×15

**Workout B — Back Thickness + Lat Width + Legs**
1. Pull Over Machine 4×10-12 ★ V-taper primary
2. Linear Back Row 4×10-12
3. Shoulder Press 3×12 ★ (2nd weekly hit)
4. Cable Lateral Raise 3×15 ★ (2nd weekly hit)
5. Leg Extension 4×12
6. Iso Kneeling Ham Curl 3×12
7. Biceps Curl 3×12
8. Abdominal Crunch 3×15

### Tempo
- Compound lifts: **3-1-2** (3s down, 1s pause, 2s up)
- Isolation: **2-0-2**
- Visual timer in UI per rep

---

## File Structure

```
D:/AI/Gym/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── tailwind.config.ts
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker (Workbox)
│   ├── icons/                 # App icons (192, 512px)
│   └── exercises/             # Local exercise GIF cache (ExerciseDB)
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Router + PIN gate
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client singleton
│   │   ├── program.ts         # Workout program algorithm (pure functions)
│   │   ├── progression.ts     # Weight progression logic (pure functions)
│   │   ├── exercises.ts       # Exercise definitions + metadata
│   │   └── notifications.ts   # Push notification + Wake Lock helpers
│   ├── hooks/
│   │   ├── useWorkout.ts      # Active workout state machine
│   │   ├── useTimer.ts        # Rest timer with notifications
│   │   ├── useProgress.ts     # History + chart data
│   │   └── usePin.ts          # PIN auth state
│   ├── components/
│   │   ├── ui/                # Design system atoms
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── GradientText.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Timer.tsx
│   │   ├── workout/
│   │   │   ├── WorkoutCard.tsx      # Exercise card with sets/reps/weight
│   │   │   ├── SetRow.tsx           # Single set row (weight input + done)
│   │   │   ├── RestTimer.tsx        # Full-screen rest timer overlay
│   │   │   ├── TempoGuide.tsx       # 3-1-2 visual tempo timer
│   │   │   ├── ExerciseOverview.tsx # Swipeable workout overview
│   │   │   └── WorkoutSummary.tsx   # Post-workout screen + feedback
│   │   ├── exercise/
│   │   │   ├── ExerciseCard.tsx     # GIF + instructions card
│   │   │   ├── ExerciseTips.tsx     # Science tips per exercise
│   │   │   └── InstagramEmbed.tsx   # @appyoucan embed wrapper
│   │   └── charts/
│   │       ├── WeightChart.tsx      # Progress chart per exercise
│   │       └── VolumeChart.tsx      # Weekly volume chart
│   ├── pages/
│   │   ├── PinPage.tsx        # PIN entry/setup screen
│   │   ├── HomePage.tsx       # Weekly schedule + next workout
│   │   ├── WorkoutPage.tsx    # Active workout screen
│   │   ├── HistoryPage.tsx    # Past workouts list
│   │   ├── ProgressPage.tsx   # Charts + body stats
│   │   ├── ExercisesPage.tsx  # Exercise library
│   │   └── SettingsPage.tsx   # PIN change, weights reset, increments
│   ├── store/
│   │   └── workoutStore.ts    # Zustand store for active workout
│   └── styles/
│       └── globals.css        # Tailwind + custom gradient vars
├── supabase/
│   └── migrations/
│       └── 001_initial.sql    # DB schema
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-03-22-gym-portal.md
```

---

## Supabase Schema

```sql
-- Exercise definitions (seeded, not user-editable)
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,           -- e.g. 'lat_pulldown'
  name_ru TEXT NOT NULL,
  muscle_primary TEXT NOT NULL,
  muscle_secondary TEXT,
  equipment TEXT,                -- 'machine' | 'barbell' | 'cable'
  increment_kg DECIMAL DEFAULT 2.5,
  is_compound BOOLEAN DEFAULT true,
  tempo TEXT DEFAULT '3-1-2',
  workout_slot TEXT,             -- 'A' | 'B' | 'AB'
  exercise_order INTEGER,
  exdb_gif_url TEXT,
  instagram_url TEXT,
  tips_ru TEXT
);

-- User working weights (one row per exercise)
CREATE TABLE user_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT REFERENCES exercises(id),
  weight_kg DECIMAL NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Completed workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_type TEXT NOT NULL,    -- 'A' | 'B'
  block TEXT NOT NULL,           -- 'hypertrophy' | 'strength' | 'deload'
  week_number INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  feedback TEXT                  -- 'easy' | 'normal' | 'hard'
);

-- Individual sets per workout
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  target_reps INTEGER,
  actual_reps INTEGER,
  weight_kg DECIMAL NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- Body measurements (optional)
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at DATE DEFAULT CURRENT_DATE,
  weight_kg DECIMAL,
  notes TEXT
);
```

---

## Task 1: Project Setup + PWA Foundation

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- Create: `index.html`, `public/manifest.json`
- Create: `src/main.tsx`, `src/App.tsx`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Initialize Vite + React + TypeScript project**
```bash
cd D:/AI/Gym
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @supabase/supabase-js zustand framer-motion recharts
npm install -D workbox-webpack-plugin vite-plugin-pwa
```

- [ ] **Step 2: Configure Tailwind with Gradient Energy design tokens**

`tailwind.config.ts`:
```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          from: '#6366f1',  // indigo
          to: '#8b5cf6',    // violet
          accent: '#f59e0b', // amber
        },
        surface: {
          0: '#0a0a0f',
          1: '#13131a',
          2: '#1c1c27',
          3: '#252533',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

- [ ] **Step 3: Configure PWA manifest**

`public/manifest.json`:
```json
{
  "name": "GymPrime — Мои Тренировки",
  "short_name": "GymPrime",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#6366f1",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 4: Configure vite-plugin-pwa**

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/gym-portal/', // GitHub Pages repo name
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'exercises/*.gif'],
      manifest: false, // use public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,gif}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: { cacheName: 'supabase-cache' }
        }]
      }
    })
  ]
})
```

- [ ] **Step 5: Create App entry with bottom navigation**

`src/App.tsx` — router with 5 tabs: Сегодня / Тренировка / История / Прогресс / Упражнения

- [ ] **Step 6: Verify dev server runs**
```bash
npm run dev
```
Expected: Vite server on http://localhost:5173

- [ ] **Step 7: Commit**
```bash
git init && git add -A
git commit -m "feat: PWA foundation — Vite + React + Tailwind + manifest"
```

---

## Task 2: Supabase Setup + Database Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `src/lib/supabase.ts`
- Create: `.env.local` (gitignored)

- [ ] **Step 1: Create Supabase project**
1. Go to https://supabase.com → New project → name: "gym-portal"
2. Copy Project URL and anon key
3. Create `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 2: Run migrations in Supabase SQL editor**
Copy `supabase/migrations/001_initial.sql` (schema above) and run in SQL editor.

- [ ] **Step 3: Create Supabase client**

`src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 4: Seed exercise data**

Add seed SQL for all 14 exercises with Russian names, tips, muscle groups, increments, ExerciseDB GIF URLs.

Key exercises to seed:
```sql
INSERT INTO exercises VALUES
('lat_pulldown', 'Тяга верхнего блока (узкий хват)', 'lats', 'biceps,rear_delt', 'cable', 2.5, true, '3-1-2', 'AB', 1, 'https://...gif', null,
'Локти вдоль тела — не в стороны! Тяни лопатки ВНИЗ перед началом движения. Широкий хват качает трапеции, а не широчайшие.'),
('pull_over', 'Пуловер', 'lats', 'chest,triceps', 'machine', 2.5, true, '3-1-2', 'B', 1, '...', null,
'Растяни широчайшие в верхней точке — пауза 1 сек. Это упражнение уникально тем что нагружает лат в растянутом положении.'),
-- ... all exercises
```

- [ ] **Step 5: Verify connection**
```ts
// Quick test in browser console:
const { data } = await supabase.from('exercises').select('*')
console.log(data) // should return 14 exercises
```

- [ ] **Step 6: Commit**
```bash
git add supabase/ src/lib/supabase.ts .env.local.example
git commit -m "feat: Supabase schema + exercise seed data"
```

---

## Task 3: PIN Authentication

**Files:**
- Create: `src/hooks/usePin.ts`
- Create: `src/pages/PinPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write PIN hook**

`src/hooks/usePin.ts`:
```ts
const PIN_KEY = 'gym_pin_hash'
const SESSION_KEY = 'gym_session'

export function usePin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  })
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem(PIN_KEY))

  const hashPin = (pin: string) =>
    btoa(pin + 'gym_salt_2026') // simple obfuscation for personal use

  const setupPin = (pin: string) => {
    localStorage.setItem(PIN_KEY, hashPin(pin))
    sessionStorage.setItem(SESSION_KEY, 'true')
    setHasPin(true)
    setIsAuthenticated(true)
  }

  const verifyPin = (pin: string): boolean => {
    const valid = localStorage.getItem(PIN_KEY) === hashPin(pin)
    if (valid) sessionStorage.setItem(SESSION_KEY, 'true')
    setIsAuthenticated(valid)
    return valid
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }

  return { isAuthenticated, hasPin, setupPin, verifyPin, logout }
}
```

- [ ] **Step 2: Build PIN page UI**

`src/pages/PinPage.tsx` — Dark screen with:
- 4-digit PIN pad (numpad style)
- "Создать PIN" for first time
- "Ввести PIN" for returning
- Gradient button
- Logo / app name

- [ ] **Step 3: Gate app behind PIN**

`src/App.tsx`:
```tsx
const { isAuthenticated, hasPin } = usePin()
if (!isAuthenticated) return <PinPage />
return <MainRouter />
```

- [ ] **Step 4: Test PIN flow**
- First launch → setup PIN screen
- Enter 4 digits → confirm → enter app
- Close tab → reopen → PIN required again

- [ ] **Step 5: Commit**
```bash
git commit -m "feat: PIN authentication gate"
```

---

## Task 4: Workout Program Engine (Pure Functions)

**Files:**
- Create: `src/lib/exercises.ts` — exercise definitions
- Create: `src/lib/program.ts` — program logic
- Create: `src/lib/progression.ts` — weight progression

- [ ] **Step 1: Define exercise metadata**

`src/lib/exercises.ts`:
```ts
export type Block = 'hypertrophy' | 'strength' | 'deload'

export interface Exercise {
  id: string
  nameRu: string
  workoutSlot: 'A' | 'B' | 'AB'
  isCompound: boolean
  tempo: string // '3-1-2' | '2-0-2'
  incrementKg: number
  sets: Record<Block, number>
  reps: Record<Block, string>  // '10-12' | '6-8' | '15'
  restSeconds: Record<Block, number>
}

export const EXERCISES: Exercise[] = [
  {
    id: 'lat_pulldown',
    nameRu: 'Тяга верхнего блока (узкий хват)',
    workoutSlot: 'A',
    isCompound: true,
    tempo: '3-1-2',
    incrementKg: 2.5,
    sets: { hypertrophy: 4, strength: 5, deload: 2 },
    reps: { hypertrophy: '10-12', strength: '6-8', deload: '12-15' },
    restSeconds: { hypertrophy: 150, strength: 210, deload: 90 },
  },
  // ... all 14 exercises
]
```

- [ ] **Step 2: Program state machine**

`src/lib/program.ts`:
```ts
export interface ProgramState {
  currentBlock: Block
  weekInBlock: number      // 1-4
  totalWeek: number        // 1-N (ever-increasing)
  nextWorkoutType: 'A' | 'B'
  lastWorkoutDate: string | null
}

export function getNextWorkoutType(state: ProgramState): 'A' | 'B' {
  return state.nextWorkoutType
}

export function getCurrentBlock(totalWeek: number): Block {
  const cycleWeek = ((totalWeek - 1) % 9) + 1
  if (cycleWeek <= 4) return 'hypertrophy'
  if (cycleWeek <= 8) return 'strength'
  return 'deload'
}

export function getWeekInBlock(totalWeek: number): number {
  const cycleWeek = ((totalWeek - 1) % 9) + 1
  if (cycleWeek <= 4) return cycleWeek
  if (cycleWeek <= 8) return cycleWeek - 4
  return 1
}

export function advanceProgram(state: ProgramState): ProgramState {
  const totalWeek = state.nextWorkoutType === 'B'
    ? state.totalWeek + 1  // week advances after B workout
    : state.totalWeek
  return {
    totalWeek,
    currentBlock: getCurrentBlock(totalWeek),
    weekInBlock: getWeekInBlock(totalWeek),
    nextWorkoutType: state.nextWorkoutType === 'A' ? 'B' : 'A',
    lastWorkoutDate: new Date().toISOString().split('T')[0],
  }
}
```

- [ ] **Step 3: Weight progression logic**

`src/lib/progression.ts`:
```ts
export function roundToIncrement(weight: number, increment: number): number {
  return Math.ceil(weight / increment) * increment
}

export function calculateNextWeight(
  currentWeight: number,
  feedback: 'easy' | 'normal' | 'hard' | null,
  increment: number,
  block: Block
): number {
  if (block === 'deload') return currentWeight * 0.6

  let multiplier = 1.025  // default +2.5%
  if (feedback === 'easy') multiplier = 1.05   // +5%
  if (feedback === 'hard') multiplier = 1.0    // hold

  return roundToIncrement(currentWeight * multiplier, increment)
}

export function getStartingWeightPrompt(exerciseId: string): string {
  // Returns onboarding instructions for first-time weight setup
  return `Шаг 1: Возьми вес с которым легко делаешь 15 повт.
Шаг 2: Добавь 10-20% и попробуй 12 повт.
Шаг 3: Последние 2-3 повт тяжело, техника держится → это твой рабочий вес`
}
```

- [ ] **Step 4: Write unit tests**

`src/lib/__tests__/progression.test.ts`:
```ts
import { roundToIncrement, calculateNextWeight } from '../progression'

test('rounds up to nearest 2.5kg increment', () => {
  expect(roundToIncrement(76.875, 2.5)).toBe(77.5)
  expect(roundToIncrement(75, 2.5)).toBe(75)
  expect(roundToIncrement(75.1, 2.5)).toBe(77.5)
})

test('easy feedback increases by 5%', () => {
  const next = calculateNextWeight(75, 'easy', 2.5, 'hypertrophy')
  expect(next).toBe(80) // 75 * 1.05 = 78.75 → round up to 80
})

test('hard feedback holds weight', () => {
  const next = calculateNextWeight(75, 'hard', 2.5, 'hypertrophy')
  expect(next).toBe(75)
})

test('deload reduces to 60%', () => {
  const next = calculateNextWeight(80, null, 2.5, 'deload')
  expect(next).toBe(50) // 80 * 0.6 = 48 → round up to 50
})
```

- [ ] **Step 5: Run tests**
```bash
npm run test
```

- [ ] **Step 6: Commit**
```bash
git commit -m "feat: workout program engine + progression algorithm"
```

---

## Task 5: Home Page — Weekly Schedule

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/components/ui/Card.tsx`, `GradientText.tsx`

- [ ] **Step 1: Build Home page**

Shows:
- Greeting + current week/block info
  ```
  Неделя 3 · Блок Гипертрофия
  ```
- Today's status (rest day / workout day)
- Next workout card:
  ```
  Тренировка A — Вторник
  8 упражнений · ~85 мин · ~500 ккал
  [Начать тренировку]
  ```
- This week's two workouts with status (✅ done / 🔜 upcoming)
- Tips card: science tip of the day

- [ ] **Step 2: Style with Gradient Energy**
- Dark background: `bg-surface-0`
- Cards: `bg-surface-2` with subtle border
- Primary action button: gradient `from-indigo-500 to-violet-600`
- Accent highlights: amber

- [ ] **Step 3: Commit**
```bash
git commit -m "feat: home page with weekly schedule"
```

---

## Task 6: Active Workout Screen

**Files:**
- Create: `src/pages/WorkoutPage.tsx`
- Create: `src/store/workoutStore.ts`
- Create: `src/hooks/useWorkout.ts`
- Create: `src/components/workout/WorkoutCard.tsx`
- Create: `src/components/workout/SetRow.tsx`
- Create: `src/components/workout/ExerciseOverview.tsx`

- [ ] **Step 1: Workout state store**

`src/store/workoutStore.ts` (Zustand):
```ts
interface WorkoutStore {
  // State
  isActive: boolean
  workoutType: 'A' | 'B' | null
  exercises: WorkoutExercise[]
  currentExerciseIndex: number
  startedAt: Date | null

  // Actions
  startWorkout: (type: 'A' | 'B', exercises: WorkoutExercise[]) => void
  completeSet: (exerciseId: string, setNum: number, weight: number, reps: number) => void
  adjustWeight: (exerciseId: string, delta: number) => void
  finishWorkout: (feedback: 'easy' | 'normal' | 'hard') => void

  // Derived
  completedSets: number
  totalSets: number
  progressPercent: number
}
```

- [ ] **Step 2: Exercise card component**

`src/components/workout/WorkoutCard.tsx`:
- Exercise name (Russian)
- Target: "4 подхода × 10-12 повторений"
- Tempo badge: "3-1-2"
- Set rows (see below)
- "Показать технику" button → opens ExerciseCard modal
- Swipe right = done, swipe left = skip

- [ ] **Step 3: Set row component**

`src/components/workout/SetRow.tsx`:
```
Подход 1    [−]  [  52.5 кг  ]  [+]    10 повт   [✓]
Подход 2    [−]  [  52.5 кг  ]  [+]    10 повт   [✓]
Подход 3    [−]  [  52.5 кг  ]  [+]    □          [ ]  ← active
```
- Tap weight → opens number picker
- +/- buttons adjust by increment
- Tap ✓ → save set + start rest timer

- [ ] **Step 4: Exercise overview panel**

`src/components/workout/ExerciseOverview.tsx`:
- Horizontal swipe to browse all exercises
- Checkmark per completed exercise
- Progress bar at top: "3 из 8 упражнений"
- Tap exercise → jump to it

- [ ] **Step 5: Workout progress bar**

Sticky top bar:
```
[████████░░░░░░░░] 42%   Тренировка A · 00:34:12
```

- [ ] **Step 6: Commit**
```bash
git commit -m "feat: active workout screen with sets tracking"
```

---

## Task 7: Rest Timer + Notifications

**Files:**
- Create: `src/hooks/useTimer.ts`
- Create: `src/components/workout/RestTimer.tsx`
- Create: `src/lib/notifications.ts`

- [ ] **Step 1: Timer hook**

`src/hooks/useTimer.ts`:
```ts
export function useRestTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [total, setTotal] = useState(0)

  const start = useCallback((durationSeconds: number) => {
    setTotal(durationSeconds)
    setSeconds(durationSeconds)
    setIsRunning(true)
    requestWakeLock()  // prevent screen sleep
  }, [])

  const skip = useCallback(() => {
    setIsRunning(false)
    releaseWakeLock()
  }, [])

  useEffect(() => {
    if (!isRunning || seconds <= 0) return
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 30 && s > 29) scheduleNotification('⏱ Следующий подход через 30 сек!')
        if (s <= 1) { setIsRunning(false); releaseWakeLock() }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  return { seconds, total, isRunning, start, skip }
}
```

- [ ] **Step 2: Screen Wake Lock helper**

`src/lib/notifications.ts`:
```ts
let wakeLock: WakeLockSentinel | null = null

export async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
    }
  } catch (e) { console.warn('WakeLock not available', e) }
}

export function releaseWakeLock() {
  wakeLock?.release()
  wakeLock = null
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotification(message: string) {
  if (Notification.permission === 'granted') {
    new Notification('GymPrime', {
      body: message,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      silent: false,
    })
  }
}
```

- [ ] **Step 3: Full-screen rest timer overlay**

`src/components/workout/RestTimer.tsx`:
```
┌─────────────────────────────────────┐
│  ОТДЫХ                              │
│                                     │
│       ╭─────────────╮               │
│       │   2:15      │  ← countdown  │
│       ╰─────────────╯               │
│    [████████████░░░] ← progress arc │
│                                     │
│  Следующее: Подход 3 · 52.5 кг     │
│                                     │
│        [Пропустить отдых]           │
└─────────────────────────────────────┘
```
- Circular progress ring (SVG)
- Vibrates at 30 sec warning (navigator.vibrate)
- Sound ping at 0 sec

- [ ] **Step 4: Tempo visual guide**

`src/components/workout/TempoGuide.tsx`:
- Only shows for compound exercises
- 3-phase animated bar: red (down 3s) → yellow (hold 1s) → green (up 2s)
- Activates when user taps "Начать повтор"

- [ ] **Step 5: Test timer on iOS**
- Add to home screen in Safari
- Start workout → complete set → verify rest timer starts
- Lock phone → verify notification arrives at 30s mark

- [ ] **Step 6: Commit**
```bash
git commit -m "feat: rest timer with wake lock and push notifications"
```

---

## Task 8: Post-Workout Summary + Persistence

**Files:**
- Create: `src/components/workout/WorkoutSummary.tsx`
- Modify: `src/hooks/useWorkout.ts`

- [ ] **Step 1: Save workout to Supabase**

After workout ends, save to DB:
```ts
async function saveWorkout(state: WorkoutStore) {
  // 1. Insert workout record
  const { data: workout } = await supabase
    .from('workouts')
    .insert({ workout_type, block, week_number, started_at, finished_at, duration_minutes })
    .select().single()

  // 2. Insert all sets
  await supabase.from('workout_sets').insert(
    state.exercises.flatMap(ex =>
      ex.sets.map(set => ({
        workout_id: workout.id,
        exercise_id: ex.id,
        set_number: set.num,
        weight_kg: set.weight,
        actual_reps: set.reps,
        completed: set.completed
      }))
    )
  )

  // 3. Update user weights based on today's actual weights
  for (const ex of state.exercises) {
    const lastCompletedSet = ex.sets.filter(s => s.completed).at(-1)
    if (lastCompletedSet) {
      await supabase.from('user_weights')
        .upsert({ exercise_id: ex.id, weight_kg: lastCompletedSet.weight })
    }
  }
}
```

- [ ] **Step 2: Post-workout summary screen**

`src/components/workout/WorkoutSummary.tsx`:
```
🎉 Тренировка завершена!

Время: 01:24:33
Объём: 3 840 кг (сумма вес×повт)
Упражнений: 8/8

Как ощущения?
[😓 Тяжело]  [👍 Нормально]  [💪 Легко]

Следующая тренировка B:
  Четверг · ~85 мин
```

- [ ] **Step 3: Advance program state after feedback**

User taps feedback → `advanceProgram()` → save new state → redirect to Home

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: workout persistence + post-workout summary"
```

---

## Task 9: Progress Charts + History

**Files:**
- Create: `src/pages/ProgressPage.tsx`
- Create: `src/pages/HistoryPage.tsx`
- Create: `src/components/charts/WeightChart.tsx`
- Create: `src/hooks/useProgress.ts`

- [ ] **Step 1: Weight progress chart**

`src/components/charts/WeightChart.tsx` (Recharts):
- Exercise selector dropdown
- Line chart: X=дата, Y=вес в кг
- Shows progression over all weeks
- Gradient fill under line

- [ ] **Step 2: History list**

`src/pages/HistoryPage.tsx`:
- List of past workouts (date, type A/B, duration, volume)
- Tap → expand to see all sets
- Block badge (Гипертрофия / Сила / Разгрузка)

- [ ] **Step 3: Progress page**

`src/pages/ProgressPage.tsx`:
- Total weeks trained
- Current block + week progress: "Блок Гипертрофия · Неделя 2/4 [██░░]"
- Volume trend (weekly total kg lifted)
- Exercise weight charts
- Body weight input (manual, optional)

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: progress charts and workout history"
```

---

## Task 10: Exercise Library

**Files:**
- Create: `src/pages/ExercisesPage.tsx`
- Create: `src/components/exercise/ExerciseCard.tsx`
- Create: `src/components/exercise/InstagramEmbed.tsx`

- [ ] **Step 1: Exercise library page**

Grid of exercise cards, filterable by:
- Группа мышц (Спина / Плечи / Грудь / Ноги / Руки)
- Тренировка A / B

- [ ] **Step 2: Exercise detail modal**

`src/components/exercise/ExerciseCard.tsx`:
```
[GIF animation from ExerciseDB]

Тяга верхнего блока
Широчайшие (первичные) · Бицепс (вторичные)

⚠️ ТЕХНИКА:
• Локти вдоль тела, не в стороны
• Тяни лопатки ВНИЗ перед движением
• Узкий хват = нижние широчайшие (V-тейп)

📺 Видео техники:
[Instagram @appyoucan embed]

Текущий вес: 52.5 кг
Рабочие подходы: 4 × 10-12
Темп: 3-1-2
```

- [ ] **Step 3: Instagram embed component**

`src/components/exercise/InstagramEmbed.tsx`:
```tsx
export function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
    />
  )
}
```

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: exercise library with GIFs and Instagram embeds"
```

---

## Task 11: Onboarding — Initial Weight Setup

**Files:**
- Create: `src/pages/OnboardingPage.tsx`

- [ ] **Step 1: First-run detection**

On first launch after PIN setup → redirect to onboarding.

- [ ] **Step 2: Weight setup wizard**

For each exercise in Workout A (and B):
```
Упражнение 1/8: Тяга верхнего блока

Как определить стартовый вес:
① Возьми вес с которым легко делаешь 15 повт
② Добавь 10-20% и попробуй 12 повт
③ Последние 2-3 тяжело, техника держится → рабочий вес!

Вес за последнее время: [_____] кг
                        [Далее →]
```

Can skip → set default (30 kg for most exercises).

- [ ] **Step 3: Save weights to Supabase**

```ts
await supabase.from('user_weights').upsert(
  weights.map(({ exerciseId, weight }) => ({ exercise_id: exerciseId, weight_kg: weight }))
)
```

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: onboarding weight setup wizard"
```

---

## Task 12: Settings Page

**Files:**
- Create: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Settings page content**

- Change PIN
- Weight increments per exercise (2.5 / 5 kg)
- Rest timer duration overrides
- Reset program (with confirmation)
- Export data (JSON download)
- About: версия, научные источники

- [ ] **Step 2: Commit**
```bash
git commit -m "feat: settings page"
```

---

## Task 13: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add deploy workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

- [ ] **Step 2: Add GitHub Secrets**
In GitHub repo → Settings → Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

- [ ] **Step 3: Create GitHub repo and push**
```bash
gh repo create gym-portal --private
git remote add origin https://github.com/USERNAME/gym-portal.git
git push -u origin main
```

- [ ] **Step 4: Verify deployment**
- Check GitHub Actions tab → green build
- Open https://USERNAME.github.io/gym-portal/
- Add to iPhone home screen in Safari

- [ ] **Step 5: Commit**
```bash
git commit -m "ci: GitHub Pages deployment workflow"
```

---

## Task 14: iOS Testing + Polish

- [ ] **Step 1: Install on iPhone 17**
- Open Safari → navigate to your GitHub Pages URL
- Share → Add to Home Screen → "GymPrime"
- Verify: fullscreen, no Safari UI, correct icon

- [ ] **Step 2: Enable Push Notifications**
- iOS 16.4+ requires PWA to be installed first
- On first workout start → prompt for notification permission
- Test: complete a set → verify rest timer notification on lock screen

- [ ] **Step 3: Verify offline mode**
- Enable airplane mode
- Open app from home screen
- Verify workout works offline (data syncs when back online)

- [ ] **Step 4: iPhone 17 UI polish**
- Safe area insets: `pb-safe` padding for home indicator
- Font size min 16px (prevents iOS zoom)
- Touch targets min 44px
- Haptic feedback on set completion (navigator.vibrate([50]))

- [ ] **Step 5: Final commit**
```bash
git commit -m "fix: iOS PWA polish — safe areas, touch targets, haptics"
```

---

## Definition of Done

- [ ] Builds without errors (`npm run build`)
- [ ] PIN gate works on iOS Safari
- [ ] Can complete a full Workout A (all 8 exercises)
- [ ] Rest timer shows on lock screen (notification)
- [ ] Screen stays awake during rest timer (WakeLock)
- [ ] Weights save to Supabase after workout
- [ ] Next workout shows correct progression (+2.5%)
- [ ] Exercise GIFs load from ExerciseDB
- [ ] Installable as PWA on iPhone 17
- [ ] Works offline (cached assets + Supabase pending queue)
- [ ] Progress chart shows weight history per exercise

---

## Scientific Sources

1. BuiltWithScience (2025) — V-taper lat width: narrow/neutral grip pulldown is superior
2. Journal of Human Kinetics (2023) — Bench press vs chest press machine: similar EMG activation
3. PMC/CUNY Lehman College (2025) — Dumbbell vs cable lateral raises: equal hypertrophy
4. WalkinLab (2025) — Muscle maintenance after 40: 70-85% 1RM optimal, deload every 3-4 weeks
5. NASM + PubMed (2022) — RIR 2-3 optimal for hypertrophy without CNS burnout
6. Schoenfeld (2021) — Volume landmarks: 10-20 sets/muscle/week for hypertrophy
7. PMC (2026) — Testosterone + resistance training after 40: compound movements priority
