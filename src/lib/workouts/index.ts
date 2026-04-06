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
