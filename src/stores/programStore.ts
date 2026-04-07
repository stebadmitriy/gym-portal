import { create } from 'zustand'
import { ProgramState, WorkoutType, CustomProgram } from '../types'
import {
  getProgramState, setProgramState, setWeight, getWorkouts, saveWorkout,
  getMeasurements, saveMeasurement, getTodayMeasurement,
  getCustomProgram, setCustomProgram as saveCustomProgramStorage,
  clearCustomProgram as clearCustomProgramStorage,
} from '../lib/storage'
import { getBlockForWeek, advanceProgramState } from '../lib/program'
import { Workout, Measurement } from '../types'
import { DEFAULT_IDS_A, DEFAULT_IDS_B, DEFAULT_IDS_C } from '../lib/exercises'
import {
  syncWorkoutToSupabase, syncWeightToSupabase,
  syncProgramStateToSupabase, syncMeasurementToSupabase,
  loadFromSupabase,
} from '../lib/supabase'

interface ProgramStoreState {
  programState: ProgramState
  workouts: Workout[]
  measurements: Measurement[]
  weights: Record<string, number>
  isLoaded: boolean
  customProgram: CustomProgram | null

  loadAll: () => void
  updateWeight: (exerciseId: string, weight: number) => void
  getExerciseWeight: (exerciseId: string) => number
  completeWorkout: (workout: Workout) => void
  advanceProgram: () => void
  saveTodayWeight: (weight: number) => void
  resetProgram: () => void
  swapExercise: (slot: WorkoutType, oldId: string, newId: string) => void
  saveCustomProgram: (program: CustomProgram) => void
  clearCustomProgram: () => void
}

export const useProgramStore = create<ProgramStoreState>((set, get) => ({
  programState: {
    total_week: 1,
    next_workout_type: 'A',
  },
  workouts: [],
  measurements: [],
  weights: {},
  isLoaded: false,
  customProgram: getCustomProgram(),

  loadAll: () => {
    // 1. Load from localStorage immediately (instant UI)
    const programState = getProgramState()
    const workouts = getWorkouts()
    const measurements = getMeasurements()

    const weights: Record<string, number> = {}
    const prefix = 'gym_weights_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const exerciseId = key.replace(prefix, '')
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const data = JSON.parse(stored)
            weights[exerciseId] = data.weight_kg
          } catch {}
        }
      }
    }

    const customProgram = getCustomProgram()
    set({ programState, workouts, measurements, weights, isLoaded: true, customProgram })

    // 2. Async: fetch from Supabase and merge (Supabase is source of truth)
    loadFromSupabase().then(snapshot => {
      if (!snapshot) return

      const merged: Partial<ProgramStoreState> = {}

      // Use Supabase workouts if they exist, otherwise keep localStorage
      if (snapshot.workouts.length > 0) {
        merged.workouts = snapshot.workouts
        // Also persist to localStorage for offline use
        snapshot.workouts.forEach(w => saveWorkout(w))
      }

      // Merge weights: Supabase wins per exercise if present
      if (Object.keys(snapshot.weights).length > 0) {
        const mergedWeights = { ...weights, ...snapshot.weights }
        merged.weights = mergedWeights
        // Persist Supabase weights to localStorage
        Object.entries(snapshot.weights).forEach(([id, kg]) => setWeight(id, kg))
      }

      // Use Supabase program state if it exists
      if (snapshot.programState) {
        merged.programState = snapshot.programState
        setProgramState(snapshot.programState)
      }

      // Merge measurements
      if (snapshot.measurements.length > 0) {
        merged.measurements = snapshot.measurements
      }

      if (Object.keys(merged).length > 0) {
        set(merged as Partial<ProgramStoreState>)
      }
    })
  },

  updateWeight: (exerciseId: string, weight: number) => {
    setWeight(exerciseId, weight)
    set(state => ({ weights: { ...state.weights, [exerciseId]: weight } }))
    syncWeightToSupabase(exerciseId, weight)
  },

  getExerciseWeight: (exerciseId: string) => {
    const { weights } = get()
    return weights[exerciseId] || 0
  },

  completeWorkout: (workout: Workout) => {
    saveWorkout(workout)
    set(state => ({
      workouts: [workout, ...state.workouts.filter(w => w.id !== workout.id)]
    }))
    syncWorkoutToSupabase(workout)
  },

  advanceProgram: () => {
    const { programState } = get()
    const next = advanceProgramState(programState)
    setProgramState(next)
    set({ programState: next })
    syncProgramStateToSupabase(next)
  },

  saveTodayWeight: (weight: number) => {
    const today = new Date().toISOString().split('T')[0]
    const existing = getTodayMeasurement()
    const measurement: Measurement = {
      ...existing,
      id: existing?.id || crypto.randomUUID(),
      recorded_at: today,
      weight_kg: weight,
    }
    saveMeasurement(measurement)
    const measurements = getMeasurements()
    set({ measurements })
    syncMeasurementToSupabase(measurement)
  },

  resetProgram: () => {
    // Local-only reset — does NOT touch Supabase
    const defaultState: ProgramState = {
      total_week: 1,
      next_workout_type: 'A',
    }
    setProgramState(defaultState)
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('gym_weights_') || key === 'gym_workouts' || key === 'gym_program_state')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
    set({ programState: defaultState, workouts: [], weights: {} })
    // No Supabase sync — local reset only
  },

  swapExercise: (slot: WorkoutType, oldId, newId) => {
    const currentA = get().customProgram?.A ?? DEFAULT_IDS_A
    const currentB = get().customProgram?.B ?? DEFAULT_IDS_B
    const currentC = get().customProgram?.C ?? DEFAULT_IDS_C
    const cp = get().customProgram
    const updated: CustomProgram = {
      A: currentA,
      B: currentB,
      C: currentC,
      createdAt: cp?.createdAt ?? new Date().toISOString(),
    }
    if (slot === 'A') updated.A = currentA.map(id => id === oldId ? newId : id)
    else if (slot === 'B') updated.B = currentB.map(id => id === oldId ? newId : id)
    else updated.C = currentC.map(id => id === oldId ? newId : id)
    saveCustomProgramStorage(updated)
    set({ customProgram: updated })
  },

  saveCustomProgram: (program) => {
    saveCustomProgramStorage(program)
    set({ customProgram: program })
  },

  clearCustomProgram: () => {
    clearCustomProgramStorage()
    set({ customProgram: null })
  },
}))
