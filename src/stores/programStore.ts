import { create } from 'zustand'
import { ProgramState, WorkoutType, CustomProgram } from '../types'
import { getProgramState, setProgramState, getWeight, setWeight, getWorkouts, saveWorkout, getMeasurements, saveMeasurement, getTodayMeasurement, getCustomProgram, setCustomProgram as saveCustomProgramStorage, clearCustomProgram as clearCustomProgramStorage } from '../lib/storage'
import { getBlockForWeek, advanceProgramState } from '../lib/program'
import { Workout, Measurement } from '../types'
import { EXERCISES } from '../lib/exercises'

interface ProgramStoreState {
  programState: ProgramState
  workouts: Workout[]
  measurements: Measurement[]
  todaySteps: number
  weights: Record<string, number>
  isLoaded: boolean
  customProgram: CustomProgram | null

  loadAll: () => void
  updateWeight: (exerciseId: string, weight: number) => void
  getExerciseWeight: (exerciseId: string) => number
  completeWorkout: (workout: Workout) => void
  advanceProgram: () => void
  saveSteps: (steps: number) => void
  saveTodayWeight: (weight: number) => void
  resetProgram: () => void
  swapExercise: (slot: 'A' | 'B', oldId: string, newId: string) => void
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
  todaySteps: 0,
  weights: {},
  isLoaded: false,
  customProgram: getCustomProgram(),

  loadAll: () => {
    const programState = getProgramState()
    const workouts = getWorkouts()
    const measurements = getMeasurements()
    const todayMeasurement = getTodayMeasurement()

    // Load all weights from localStorage
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

    set({
      programState,
      workouts,
      measurements,
      todaySteps: todayMeasurement?.steps_today || 0,
      weights,
      isLoaded: true,
      customProgram,
    })
  },

  updateWeight: (exerciseId: string, weight: number) => {
    setWeight(exerciseId, weight)
    set(state => ({
      weights: { ...state.weights, [exerciseId]: weight }
    }))
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
  },

  advanceProgram: () => {
    const { programState } = get()
    const next = advanceProgramState(programState)
    setProgramState(next)
    set({ programState: next })
  },

  saveSteps: (steps: number) => {
    const today = new Date().toISOString().split('T')[0]
    const existing = getTodayMeasurement()
    saveMeasurement({
      ...existing,
      recorded_at: today,
      steps_today: steps
    })
    set({ todaySteps: steps })
  },

  saveTodayWeight: (weight: number) => {
    const today = new Date().toISOString().split('T')[0]
    const existing = getTodayMeasurement()
    saveMeasurement({
      ...existing,
      recorded_at: today,
      weight_kg: weight
    })
    const measurements = getMeasurements()
    set({ measurements })
  },

  resetProgram: () => {
    const defaultState: ProgramState = {
      total_week: 1,
      next_workout_type: 'A',
    }
    setProgramState(defaultState)
    // Clear weights
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('gym_weights_') || key === 'gym_workouts' || key === 'gym_program_state')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
    set({ programState: defaultState, workouts: [], weights: {} })
  },

  swapExercise: (slot, oldId, newId) => {
    const { customProgram } = get()
    const defaultIds = {
      A: EXERCISES.filter(e => e.workout_slot === 'A')
                 .sort((a, b) => a.exercise_order - b.exercise_order)
                 .map(e => e.id),
      B: EXERCISES.filter(e => e.workout_slot === 'B')
                 .sort((a, b) => a.exercise_order - b.exercise_order)
                 .map(e => e.id),
    }
    const base = customProgram ?? {
      A: defaultIds.A,
      B: defaultIds.B,
      createdAt: new Date().toISOString(),
    }
    const updated: CustomProgram = {
      ...base,
      [slot]: base[slot].map(id => id === oldId ? newId : id),
    }
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
