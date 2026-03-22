import { create } from 'zustand'
import { ProgramState, WorkoutType } from '../types'
import { getProgramState, setProgramState, getWeight, setWeight, getWorkouts, saveWorkout, getMeasurements, saveMeasurement, getTodayMeasurement } from '../lib/storage'
import { getBlockForWeek, advanceProgramState } from '../lib/program'
import { Workout, Measurement } from '../types'

interface ProgramStoreState {
  programState: ProgramState
  workouts: Workout[]
  measurements: Measurement[]
  todaySteps: number
  weights: Record<string, number>
  isLoaded: boolean

  loadAll: () => void
  updateWeight: (exerciseId: string, weight: number) => void
  getExerciseWeight: (exerciseId: string) => number
  completeWorkout: (workout: Workout) => void
  advanceProgram: () => void
  saveSteps: (steps: number) => void
  saveTodayWeight: (weight: number) => void
  resetProgram: () => void
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

    set({
      programState,
      workouts,
      measurements,
      todaySteps: todayMeasurement?.steps_today || 0,
      weights,
      isLoaded: true
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
  }
}))
