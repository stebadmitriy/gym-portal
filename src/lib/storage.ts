import { Workout, ProgramState, ExerciseWeight, Measurement, Settings } from '../types'

const KEYS = {
  PIN_HASH: 'gym_pin_hash',
  SESSION: 'gym_session',
  WEIGHTS_PREFIX: 'gym_weights_',
  PROGRAM_STATE: 'gym_program_state',
  WORKOUTS: 'gym_workouts',
  ONBOARDING_DONE: 'gym_onboarding_done',
  MEASUREMENTS: 'gym_measurements',
  SETTINGS: 'gym_settings',
}

// PIN management
export const hashPin = (pin: string): string => {
  return btoa(pin + 'gym_prime_2026')
}

export const getPinHash = (): string | null => {
  return localStorage.getItem(KEYS.PIN_HASH)
}

export const setPinHash = (pin: string): void => {
  localStorage.setItem(KEYS.PIN_HASH, hashPin(pin))
}

export const verifyPin = (pin: string): boolean => {
  const stored = getPinHash()
  if (!stored) return false
  return stored === hashPin(pin)
}

// Session management
export const getSession = (): string | null => {
  return sessionStorage.getItem(KEYS.SESSION)
}

export const setSession = (): void => {
  sessionStorage.setItem(KEYS.SESSION, 'active_' + Date.now())
}

export const clearSession = (): void => {
  sessionStorage.removeItem(KEYS.SESSION)
}

// Exercise weights
export const getWeight = (exerciseId: string): number => {
  const stored = localStorage.getItem(KEYS.WEIGHTS_PREFIX + exerciseId)
  if (!stored) return 0
  const data: ExerciseWeight = JSON.parse(stored)
  return data.weight_kg
}

export const setWeight = (exerciseId: string, weight: number): void => {
  const data: ExerciseWeight = {
    exercise_id: exerciseId,
    weight_kg: weight,
    updated_at: new Date().toISOString()
  }
  localStorage.setItem(KEYS.WEIGHTS_PREFIX + exerciseId, JSON.stringify(data))
}

export const getAllWeights = (): Record<string, number> => {
  const result: Record<string, number> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(KEYS.WEIGHTS_PREFIX)) {
      const exerciseId = key.replace(KEYS.WEIGHTS_PREFIX, '')
      const stored = localStorage.getItem(key)
      if (stored) {
        const data: ExerciseWeight = JSON.parse(stored)
        result[exerciseId] = data.weight_kg
      }
    }
  }
  return result
}

// Program state
const DEFAULT_PROGRAM_STATE: ProgramState = {
  total_week: 1,
  next_workout_type: 'A',
  last_workout_date: undefined
}

export const getProgramState = (): ProgramState => {
  const stored = localStorage.getItem(KEYS.PROGRAM_STATE)
  if (!stored) return DEFAULT_PROGRAM_STATE
  return JSON.parse(stored)
}

export const setProgramState = (state: ProgramState): void => {
  localStorage.setItem(KEYS.PROGRAM_STATE, JSON.stringify(state))
}

// Workouts
export const getWorkouts = (): Workout[] => {
  const stored = localStorage.getItem(KEYS.WORKOUTS)
  if (!stored) return []
  return JSON.parse(stored)
}

export const saveWorkout = (workout: Workout): void => {
  const workouts = getWorkouts()
  const index = workouts.findIndex(w => w.id === workout.id)
  if (index >= 0) {
    workouts[index] = workout
  } else {
    workouts.unshift(workout)
  }
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts))
}

// Measurements
export const getMeasurements = (): Measurement[] => {
  const stored = localStorage.getItem(KEYS.MEASUREMENTS)
  if (!stored) return []
  return JSON.parse(stored)
}

export const saveMeasurement = (measurement: Measurement): void => {
  const measurements = getMeasurements()
  const today = new Date().toISOString().split('T')[0]
  const index = measurements.findIndex(m => m.recorded_at === today)
  const data = { ...measurement, id: measurement.id || crypto.randomUUID(), recorded_at: today }
  if (index >= 0) {
    measurements[index] = data
  } else {
    measurements.unshift(data)
  }
  localStorage.setItem(KEYS.MEASUREMENTS, JSON.stringify(measurements))
}

export const getTodayMeasurement = (): Measurement | undefined => {
  const today = new Date().toISOString().split('T')[0]
  return getMeasurements().find(m => m.recorded_at === today)
}

// Settings
const DEFAULT_SETTINGS: Settings = {
  mealTimes: [
    { label: 'Завтрак', time: '08:00', enabled: true },
    { label: 'Обед', time: '13:00', enabled: true },
    { label: 'Ужин', time: '19:00', enabled: true },
  ],
  notificationsEnabled: false,
  stepGoal: 15000
}

export const getSettings = (): Settings => {
  const stored = localStorage.getItem(KEYS.SETTINGS)
  if (!stored) return DEFAULT_SETTINGS
  return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
}

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
}

// Onboarding
export const isOnboardingDone = (): boolean => {
  return localStorage.getItem(KEYS.ONBOARDING_DONE) === 'true'
}

export const setOnboardingDone = (): void => {
  localStorage.setItem(KEYS.ONBOARDING_DONE, 'true')
}

// Reset everything
export const resetAll = (): void => {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('gym_')) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}
