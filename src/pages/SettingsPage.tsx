import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useProgramStore } from '../stores/programStore'
import { getSettings, saveSettings } from '../lib/storage'
import { Settings, MealTime } from '../types'

export default function SettingsPage() {
  const { changePin } = useAuthStore()
  const { resetProgram } = useProgramStore()

  const [settings, setSettings] = useState<Settings>(getSettings())
  const [showChangePIN, setShowChangePIN] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(0) // 0: none, 1: first click, 2: confirmed
  const [notifRequested, setNotifRequested] = useState(false)

  const handleSaveSettings = (updated: Settings) => {
    setSettings(updated)
    saveSettings(updated)
  }

  const handleMealTimeChange = (index: number, field: keyof MealTime, value: any) => {
    const newMeals = settings.mealTimes.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    )
    handleSaveSettings({ ...settings, mealTimes: newMeals })
  }

  const handleChangePIN = () => {
    setPinError('')
    if (newPin.length !== 4) {
      setPinError('PIN должен быть 4 цифры')
      return
    }
    if (newPin !== confirmNewPin) {
      setPinError('PIN не совпадает')
      return
    }
    const success = changePin(oldPin, newPin)
    if (success) {
      setPinSuccess(true)
      setOldPin('')
      setNewPin('')
      setConfirmNewPin('')
      setTimeout(() => {
        setPinSuccess(false)
        setShowChangePIN(false)
      }, 1500)
    } else {
      setPinError('Неверный текущий PIN')
    }
  }

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        handleSaveSettings({ ...settings, notificationsEnabled: true })
        setNotifRequested(true)
        // Schedule demo notification
        setTimeout(() => {
          new Notification('🚶 GymPrime', {
            body: '10 мин прогулки после еды = жиросжигание без стресса!',
            icon: '/gym-portal/pwa-192x192.png'
          })
        }, 5000)
      }
    }
  }

  const handleReset = () => {
    if (resetConfirm === 0) {
      setResetConfirm(1)
    } else if (resetConfirm === 1) {
      resetProgram()
      setResetConfirm(0)
    }
  }

  const SOURCES = [
    'Schoenfeld BJ (2010). The mechanisms of muscle hypertrophy. J Strength Cond Res.',
    'Zourdos MC et al (2016). Novel resistance training-specific RPE scale. J Strength Cond Res.',
    'Reynolds AN et al (2020). Advice to walk after meals is more effective. Diabetologia.',
    'Helms ER et al (2014). Recommendations for natural bodybuilding. J Sports Med.',
    'Ralston GW et al (2017). The effect of load and volume in strength training. Strength Cond J.',
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      <div
        className="px-5 pb-4"
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)` }}
      >
        <h1 className="text-2xl font-black text-white">Настройки</h1>
        <p className="text-white/40 text-sm mt-1">Персонализация и управление</p>
      </div>

      <div className="px-5 space-y-4">
        {/* PIN Settings */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🔐</span> Безопасность
          </h3>

          <button
            onClick={() => setShowChangePIN(!showChangePIN)}
            className="w-full py-3 rounded-xl text-sm font-medium text-white/70 text-left flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <span className="pl-3">Изменить PIN-код</span>
            <span className="pr-3 text-white/30">{showChangePIN ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {showChangePIN && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value)}
                    placeholder="Текущий PIN"
                    className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="Новый PIN (4 цифры)"
                    className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmNewPin}
                    onChange={e => setConfirmNewPin(e.target.value)}
                    placeholder="Подтвердить PIN"
                    className="w-full bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30"
                  />
                  {pinError && <p className="text-red-400 text-sm">{pinError}</p>}
                  {pinSuccess && <p className="text-green-400 text-sm">✓ PIN успешно изменён!</p>}
                  <button
                    onClick={handleChangePIN}
                    className="btn-primary w-full py-3 text-white font-semibold text-sm"
                  >
                    Сохранить PIN
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🔔</span> Уведомления
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white text-sm font-medium">Прогулки после еды</p>
              <p className="text-white/40 text-xs">Уведомление через 5 мин после еды</p>
            </div>
            {settings.notificationsEnabled ? (
              <span className="text-green-400 text-sm font-medium">Включено ✓</span>
            ) : (
              <button
                onClick={handleRequestNotifications}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Включить
              </button>
            )}
          </div>

          {notifRequested && (
            <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <p className="text-green-400 text-sm">🎉 Тестовое уведомление придёт через 5 сек</p>
            </div>
          )}
        </div>

        {/* Meal times */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🍽️</span> Время приёма пищи
          </h3>

          <div className="space-y-3">
            {settings.mealTimes.map((meal, i) => (
              <div key={i} className="flex items-center gap-3">
                <button
                  onClick={() => handleMealTimeChange(i, 'enabled', !meal.enabled)}
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    background: meal.enabled ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {meal.enabled && <span className="text-xs text-white">✓</span>}
                </button>
                <span className="text-white text-sm flex-1">{meal.label}</span>
                <input
                  type="time"
                  value={meal.time}
                  onChange={e => handleMealTimeChange(i, 'time', e.target.value)}
                  className="bg-white/05 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Step Goal */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🚶</span> Цель по шагам
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={settings.stepGoal}
              onChange={e => handleSaveSettings({ ...settings, stepGoal: parseInt(e.target.value) || 15000 })}
              className="flex-1 bg-white/05 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <span className="text-white/40">шагов/день</span>
          </div>
        </div>

        {/* Program Reset */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
            <span>⚠️</span> Опасная зона
          </h3>
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: resetConfirm > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)'
            }}
          >
            {resetConfirm === 0
              ? '🔄 Сбросить программу'
              : '⚠️ Нажми ещё раз для подтверждения'}
          </button>
          <p className="text-white/30 text-xs mt-2 text-center">
            Удалит все тренировки и веса. Необратимо!
          </p>
        </div>

        {/* About */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>ℹ️</span> О программе
          </h3>
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Возраст</span>
              <span className="text-white">41 год</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Вес</span>
              <span className="text-white">83 кг</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Уровень</span>
              <span className="text-white">Средний (1.5 года)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Цель</span>
              <span className="text-white">V-тейп (ширина)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Тренировок в неделю</span>
              <span className="text-white">2×</span>
            </div>
          </div>

          <h4 className="font-medium text-white/60 text-xs uppercase tracking-wider mb-3">Научные источники</h4>
          <div className="space-y-2">
            {SOURCES.map((source, i) => (
              <p key={i} className="text-white/30 text-xs leading-relaxed">
                [{i + 1}] {source}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-white/20 text-xs">GymPrime v1.0 · Научный тренинг</p>
        </div>
      </div>
    </div>
  )
}
