import { create } from 'zustand'
import { getPinHash, setPinHash, getSession, setSession, clearSession, verifyPin } from '../lib/storage'

interface AuthState {
  isAuthenticated: boolean
  hasPin: boolean
  shake: boolean
  checkAuth: () => void
  createPin: (pin: string) => void
  login: (pin: string) => boolean
  logout: () => void
  setShake: (val: boolean) => void
  changePin: (oldPin: string, newPin: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  hasPin: false,
  shake: false,

  checkAuth: () => {
    const hasPin = !!getPinHash()
    const session = getSession()
    set({ hasPin, isAuthenticated: !!session })
  },

  createPin: (pin: string) => {
    setPinHash(pin)
    setSession()
    set({ hasPin: true, isAuthenticated: true })
  },

  login: (pin: string) => {
    if (verifyPin(pin)) {
      setSession()
      set({ isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => {
    clearSession()
    set({ isAuthenticated: false })
  },

  setShake: (val: boolean) => set({ shake: val }),

  changePin: (oldPin: string, newPin: string) => {
    if (verifyPin(oldPin)) {
      setPinHash(newPin)
      return true
    }
    return false
  }
}))
