import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'

export default function PinPage() {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [shakeKey, setShakeKey] = useState(0)
  const [error, setError] = useState('')

  const { hasPin, login, createPin, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated])

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit

    setPin(newPin)
    setError('')

    if (newPin.length === 4) {
      setTimeout(() => {
        if (!hasPin) {
          // Create mode: first step
          if (step === 'enter') {
            setConfirmPin(newPin)
            setPin('')
            setStep('confirm')
          } else {
            // Confirm step
            if (newPin === confirmPin) {
              createPin(confirmPin)
            } else {
              setError('PIN не совпадает. Попробуй снова')
              setShakeKey(k => k + 1)
              setPin('')
              setStep('enter')
              setConfirmPin('')
            }
          }
        } else {
          // Login mode
          const success = login(newPin)
          if (success) {
            navigate('/', { replace: true })
          } else {
            setError('Неверный PIN')
            setShakeKey(k => k + 1)
            setPin('')
          }
        }
      }, 100)
    }
  }, [pin, step, hasPin, confirmPin, login, createPin, navigate])

  const handleDelete = useCallback(() => {
    setPin(p => p.slice(0, -1))
    setError('')
  }, [])

  const title = !hasPin
    ? step === 'enter' ? 'Создайте PIN-код' : 'Подтвердите PIN-код'
    : 'Введите PIN-код'

  const subtitle = !hasPin
    ? step === 'enter' ? 'Выберите 4-значный PIN для защиты приложения' : 'Введите PIN ещё раз для подтверждения'
    : 'GymPrime защищён PIN-кодом'

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 pt-safe">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="text-5xl mb-3">🏋️</div>
        <h1 className="text-3xl font-black gradient-text">GymPrime</h1>
        <p className="text-sm text-white/50 mt-1">Научный тренинг</p>
      </motion.div>

      {/* Title */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-white/50">{subtitle}</p>
      </motion.div>

      {/* PIN Dots */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? {
          x: [0, -10, 10, -10, 10, 0],
        } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-4"
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-4 h-4 rounded-full transition-all duration-200"
            style={{
              background: i < pin.length
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.15)',
              transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm mb-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 mt-4 w-full max-w-xs">
        {keys.map((key, i) => {
          if (key === '') {
            return <div key={i} />
          }

          if (key === '⌫') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="flex items-center justify-center h-16 rounded-2xl text-2xl text-white/60 active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {key}
              </button>
            )
          }

          return (
            <button
              key={i}
              onClick={() => handleDigit(key)}
              className="flex items-center justify-center h-16 rounded-2xl text-2xl font-semibold active:scale-95 transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
