export type WorkoutType = 'A' | 'B'
export type BlockType = 'hypertrophy' | 'strength' | 'deload'
export type FeedbackType = 'hard' | 'normal' | 'easy'

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
  gifUrl?: string
  instagramUrl?: string
  alternatives?: string[]
}

export interface WorkoutSet {
  id?: string
  workout_id?: string
  exercise_id: string
  set_number: number
  target_reps: number
  actual_reps: number
  weight_kg: number
  completed: boolean
  completed_at?: string
}

export interface Workout {
  id: string
  workout_type: WorkoutType
  block: BlockType
  week_number: number
  started_at: string
  finished_at?: string
  duration_minutes?: number
  feedback?: FeedbackType
  sets?: WorkoutSet[]
  total_volume?: number
}

export interface ProgramState {
  total_week: number
  next_workout_type: WorkoutType
  last_workout_date?: string
}

export interface ExerciseWeight {
  exercise_id: string
  weight_kg: number
  updated_at: string
}

export interface Measurement {
  id?: string
  recorded_at: string
  weight_kg?: number
  steps_today?: number
  notes?: string
}

export interface MealTime {
  label: string
  time: string
  enabled: boolean
}

export interface Settings {
  mealTimes: MealTime[]
  notificationsEnabled: boolean
  stepGoal: number
}
