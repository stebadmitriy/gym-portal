import { createClient } from '@supabase/supabase-js'
import { Workout, Measurement, ProgramState } from '../types'

const SUPABASE_URL = 'https://wvmaadgcmlxympfxqfqy.supabase.co'
const SUPABASE_KEY = 'sb_publishable_yDbIEKM6pXJI5T6eIgCNTQ_zjmIOGi8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Sync writes (fire-and-forget, localStorage is primary) ──────────────────

export const syncWorkoutToSupabase = async (workout: Workout) => {
  try {
    const { error } = await supabase.from('workouts').upsert(workout)
    if (error) console.warn('Supabase workout sync failed:', error.message)
  } catch {
    console.warn('Supabase unavailable, working offline')
  }
}

export const syncWeightToSupabase = async (exerciseId: string, weight: number) => {
  try {
    const { error } = await supabase
      .from('weights')
      .upsert({ exercise_id: exerciseId, weight_kg: weight, updated_at: new Date().toISOString() })
    if (error) console.warn('Supabase weight sync failed:', error.message)
  } catch {
    console.warn('Supabase unavailable, working offline')
  }
}

export const syncProgramStateToSupabase = async (state: ProgramState) => {
  try {
    const { error } = await supabase
      .from('program_state')
      .upsert({ id: 1, ...state })
    if (error) console.warn('Supabase program_state sync failed:', error.message)
  } catch {
    console.warn('Supabase unavailable, working offline')
  }
}

export const syncMeasurementToSupabase = async (measurement: Measurement) => {
  try {
    const { error } = await supabase.from('measurements').upsert(measurement)
    if (error) console.warn('Supabase measurement sync failed:', error.message)
  } catch {
    console.warn('Supabase unavailable, working offline')
  }
}

// ─── Load all data from Supabase ─────────────────────────────────────────────

export interface SupabaseSnapshot {
  workouts: Workout[]
  weights: Record<string, number>
  programState: ProgramState | null
  measurements: Measurement[]
}

export const loadFromSupabase = async (): Promise<SupabaseSnapshot | null> => {
  try {
    const [workoutsRes, weightsRes, psRes, measurementsRes] = await Promise.all([
      supabase.from('workouts').select('*').order('started_at', { ascending: false }),
      supabase.from('weights').select('*'),
      supabase.from('program_state').select('*').eq('id', 1).maybeSingle(),
      supabase.from('measurements').select('*').order('recorded_at', { ascending: false }),
    ])

    const weights: Record<string, number> = {}
    for (const row of (weightsRes.data ?? [])) {
      weights[row.exercise_id] = row.weight_kg
    }

    return {
      workouts: (workoutsRes.data ?? []) as Workout[],
      weights,
      programState: (psRes.data as ProgramState) ?? null,
      measurements: (measurementsRes.data ?? []) as Measurement[],
    }
  } catch (e) {
    console.warn('Failed to load from Supabase:', e)
    return null
  }
}

// ─── Reset all user data in Supabase ─────────────────────────────────────────

export const resetSupabaseData = async (): Promise<void> => {
  try {
    await Promise.all([
      supabase.from('workouts').delete().not('id', 'is', null),
      supabase.from('weights').delete().not('exercise_id', 'is', null),
      supabase.from('measurements').delete().not('id', 'is', null),
      supabase.from('program_state').upsert({ id: 1, total_week: 1, next_workout_type: 'A', last_workout_date: null }),
    ])
  } catch (e) {
    console.warn('Supabase reset failed:', e)
    throw e
  }
}
