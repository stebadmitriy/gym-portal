import { create } from 'zustand'
import { WorkoutSet, WorkoutType, BlockType } from '../types'
import { getBlockForWeek, getRestTime, calculateNextWeight } from '../lib/program'

interface ActiveWorkout {
  id: string
  workout_type: WorkoutType
  block: BlockType
  week_number: number
  started_at: string
  sets: WorkoutSet[]
  currentExerciseIndex: number
  currentSetIndex: number
  elapsedSeconds: number
}

interface WorkoutStoreState {
  activeWorkout: ActiveWorkout | null
  restTimer: {
    active: boolean
    seconds: number
    totalSeconds: number
    isCompound: boolean
  } | null
  isFinished: boolean

  startWorkout: (type: WorkoutType, weekNumber: number, exercises: any[], weights: Record<string, number>, block: BlockType) => void
  completeSet: (exerciseId: string, setNumber: number, actualReps: number, weight: number) => void
  startRestTimer: (isCompound: boolean, block: BlockType) => void
  tickRestTimer: () => void
  skipRest: () => void
  setCurrentExercise: (index: number) => void
  tickElapsed: () => void
  finishWorkout: () => ActiveWorkout | null
  resetWorkout: () => void
}

export const useWorkoutStore = create<WorkoutStoreState>((set, get) => ({
  activeWorkout: null,
  restTimer: null,
  isFinished: false,

  startWorkout: (type, weekNumber, exercises, weights, block) => {
    const sets: WorkoutSet[] = []

    exercises.forEach(exercise => {
      const exerciseWeight = weights[exercise.id] || 0
      const targetReps = block === 'strength' && exercise.is_compound ? 7 : 11
      const numSets = block === 'deload' ? Math.max(2, Math.floor(exercise.sets / 2)) : exercise.sets

      for (let s = 1; s <= numSets; s++) {
        sets.push({
          exercise_id: exercise.id,
          set_number: s,
          target_reps: targetReps,
          actual_reps: 0,
          weight_kg: exerciseWeight,
          completed: false
        })
      }
    })

    const workout: ActiveWorkout = {
      id: crypto.randomUUID(),
      workout_type: type,
      block,
      week_number: weekNumber,
      started_at: new Date().toISOString(),
      sets,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      elapsedSeconds: 0
    }

    set({ activeWorkout: workout, isFinished: false })
  },

  completeSet: (exerciseId, setNumber, actualReps, weight) => {
    const { activeWorkout } = get()
    if (!activeWorkout) return

    const updatedSets = activeWorkout.sets.map(s => {
      if (s.exercise_id === exerciseId && s.set_number === setNumber) {
        return {
          ...s,
          actual_reps: actualReps,
          weight_kg: weight,
          completed: true,
          completed_at: new Date().toISOString()
        }
      }
      return s
    })

    set({ activeWorkout: { ...activeWorkout, sets: updatedSets } })
  },

  startRestTimer: (isCompound, block) => {
    const totalSeconds = getRestTime(isCompound, block)
    set({
      restTimer: {
        active: true,
        seconds: totalSeconds,
        totalSeconds,
        isCompound
      }
    })
  },

  tickRestTimer: () => {
    const { restTimer } = get()
    if (!restTimer || !restTimer.active) return

    if (restTimer.seconds <= 1) {
      // Vibrate at end
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
      set({ restTimer: { ...restTimer, seconds: 0, active: false } })
    } else {
      // Vibrate at 30 seconds warning
      if (restTimer.seconds === 30 && navigator.vibrate) {
        navigator.vibrate(100)
      }
      set({ restTimer: { ...restTimer, seconds: restTimer.seconds - 1 } })
    }
  },

  skipRest: () => {
    set({ restTimer: null })
  },

  setCurrentExercise: (index) => {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    set({ activeWorkout: { ...activeWorkout, currentExerciseIndex: index } })
  },

  tickElapsed: () => {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    set({
      activeWorkout: {
        ...activeWorkout,
        elapsedSeconds: activeWorkout.elapsedSeconds + 1
      }
    })
  },

  finishWorkout: () => {
    const { activeWorkout } = get()
    if (!activeWorkout) return null
    set({ isFinished: true })
    return activeWorkout
  },

  resetWorkout: () => {
    set({ activeWorkout: null, restTimer: null, isFinished: false })
  }
}))
