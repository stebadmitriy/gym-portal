import { BlockType, ProgramState, WorkoutType } from '../types'

export interface BlockInfo {
  name: string
  nameRu: string
  weeks: number
  sets: number
  repsRange: string
  rir: string
  intensity: string
  color: string
}

export const BLOCKS: BlockInfo[] = [
  {
    name: 'hypertrophy',
    nameRu: 'Гипертрофия',
    weeks: 4,
    sets: 4,
    repsRange: '10-12',
    rir: '2-3',
    intensity: '70-80% 1ПМ',
    color: '#6366f1'
  },
  {
    name: 'strength',
    nameRu: 'Сила',
    weeks: 4,
    sets: 5,
    repsRange: '6-8',
    rir: '1-2',
    intensity: '80-85% 1ПМ',
    color: '#f59e0b'
  },
  {
    name: 'deload',
    nameRu: 'Разгрузка',
    weeks: 1,
    sets: 2,
    repsRange: '10-12',
    rir: '4-5',
    intensity: '50% объёма',
    color: '#10b981'
  }
]

// 9-week cycle: 4 hypertrophy + 4 strength + 1 deload
export const getBlockForWeek = (totalWeek: number): { block: BlockType; weekInBlock: number; blockInfo: BlockInfo } => {
  const cycleWeek = ((totalWeek - 1) % 9) + 1

  if (cycleWeek <= 4) {
    return {
      block: 'hypertrophy',
      weekInBlock: cycleWeek,
      blockInfo: BLOCKS[0]
    }
  } else if (cycleWeek <= 8) {
    return {
      block: 'strength',
      weekInBlock: cycleWeek - 4,
      blockInfo: BLOCKS[1]
    }
  } else {
    return {
      block: 'deload',
      weekInBlock: 1,
      blockInfo: BLOCKS[2]
    }
  }
}

export const getRestTime = (isCompound: boolean, block: BlockType): number => {
  if (block === 'deload') return 90
  if (block === 'hypertrophy') {
    return isCompound ? 150 : 120
  } else {
    return isCompound ? 210 : 150
  }
}

export const calculateNextWeight = (
  currentWeight: number,
  feedback: 'hard' | 'normal' | 'easy' | null,
  increment: number,
  missedWeeks: number = 0
): number => {
  if (currentWeight === 0) return increment

  let target = currentWeight

  if (missedWeeks >= 2) {
    target = currentWeight * 0.95
  } else if (feedback === 'easy') {
    target = currentWeight * 1.05
  } else if (feedback === 'hard') {
    return currentWeight // hold
  } else {
    target = currentWeight * 1.025
  }

  // Round UP to nearest increment
  if (increment === 0) return 0
  return Math.ceil(target / increment) * increment
}

export const advanceProgramState = (current: ProgramState): ProgramState => {
  const rotation: Record<WorkoutType, WorkoutType> = { A: 'B', B: 'C', C: 'A' }
  const nextWorkout = rotation[current.next_workout_type]
  const nextWeek = current.next_workout_type === 'C' ? current.total_week + 1 : current.total_week

  return {
    total_week: nextWeek,
    next_workout_type: nextWorkout,
    last_workout_date: new Date().toISOString().split('T')[0]
  }
}

export const getSetsForBlock = (block: BlockType, exerciseOriginalSets: number, exerciseReps: string): { sets: number; reps: string } => {
  if (block === 'deload') {
    return {
      sets: Math.max(2, Math.floor(exerciseOriginalSets / 2)),
      reps: exerciseReps
    }
  }

  if (block === 'strength') {
    // Compound exercises get different sets/reps in strength block
    return {
      sets: exerciseOriginalSets,
      reps: '6-8'
    }
  }

  return {
    sets: exerciseOriginalSets,
    reps: exerciseReps
  }
}

export const getTargetRepsForBlock = (block: BlockType, isCompound: boolean): number => {
  if (block === 'strength' && isCompound) return 7 // middle of 6-8
  return 11 // middle of 10-12
}

export const formatBlockName = (block: BlockType): string => {
  const info = BLOCKS.find(b => b.name === block)
  return info ? info.nameRu : 'Гипертрофия'
}

export const getWorkoutEstimates = (workoutType: WorkoutType, block: BlockType) => {
  const exerciseCount = 8
  const avgSetsPerExercise = block === 'deload' ? 2 : block === 'strength' ? 4.5 : 4
  const totalSets = exerciseCount * avgSetsPerExercise
  const avgRestTime = block === 'strength' ? 200 : 135
  const avgSetTime = 45

  const totalMinutes = Math.round((totalSets * (avgSetTime + avgRestTime)) / 60)
  const calories = Math.round(totalSets * 12)

  return {
    exerciseCount,
    durationMin: totalMinutes,
    calories
  }
}
