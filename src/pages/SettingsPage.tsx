import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useProgramStore } from '../stores/programStore'
import { getSettings, saveSettings, verifyPin } from '../lib/storage'
import { Settings, MealTime } from '../types'
import { resetSupabaseData } from '../lib/supabase'

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-white/50">{label}</span>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </div>
  )
}

function GradientDivider() {
  return (
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />
  )
}

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

  // DB reset with PIN
  const [showDbReset, setShowDbReset] = useState(false)
  const [dbResetPin, setDbResetPin] = useState('')
  const [dbResetError, setDbResetError] = useState('')
  const [dbResetSuccess, setDbResetSuccess] = useState(false)
  const [dbResetLoading, setDbResetLoading] = useState(false)

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

  const handleDbReset = async () => {
    setDbResetError('')
    if (!verifyPin(dbResetPin)) {
      setDbResetError('Неверный PIN')
      return
    }
    setDbResetLoading(true)
    try {
      await resetSupabaseData()
      resetProgram()
      setDbResetSuccess(true)
      setDbResetPin('')
      setTimeout(() => {
        setDbResetSuccess(false)
        setShowDbReset(false)
      }, 2000)
    } catch {
      setDbResetError('Ошибка сброса БД. Проверь соединение.')
    } finally {
      setDbResetLoading(false)
    }
  }

  const SOURCES = [
    'Schoenfeld BJ (2010). The mechanisms of muscle hypertrophy. J Strength Cond Res.',
    'Zourdos MC et al (2016). Novel resistance training-specific RPE scale. J Strength Cond Res.',
    'Reynolds AN et al (2020). Advice to walk after meals is more effective. Diabetologia.',
    'Helms ER et al (2014). Recommendations for natural bodybuilding. J Sports Med.',
    'Ralston GW et al (2017). The effect of load and volume in strength training. Strength Cond J.',
  ]

  const inputClass = "w-full rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-all outline-none"
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  }
  const inputFocusStyle = `focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60`

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header */}
      <div
        className="px-5 pb-5"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">ПЕРСОНАЛИЗАЦИЯ</span>
        </div>
        <h1 className="text-2xl font-black text-white">Настройки</h1>
        <p className="text-white/40 text-sm mt-1">Персонализация и управление</p>
      </div>

      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)', margin: '0 20px 20px' }} />

      <div className="px-4 space-y-3">
        {/* PIN Settings */}
        <SectionCard>
          <SectionHeader icon="🔐" label="Безопасность" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowChangePIN(!showChangePIN)}
            className="w-full py-3 rounded-xl text-sm font-medium text-left flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="pl-3 text-white/80">Изменить PIN-код</span>
            <div className="pr-3 flex items-center gap-1.5">
              <span className="text-white/30 text-xs">{showChangePIN ? 'скрыть' : 'открыть'}</span>
              <motion.span
                animate={{ rotate: showChangePIN ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/30 text-xs"
              >
                ▼
              </motion.span>
            </div>
          </motion.button>

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
                    className={`${inputClass} ${inputFocusStyle}`}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="Новый PIN (4 цифры)"
                    className={`${inputClass} ${inputFocusStyle}`}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmNewPin}
                    onChange={e => setConfirmNewPin(e.target.value)}
                    placeholder="Подтвердить PIN"
                    className={`${inputClass} ${inputFocusStyle}`}
                    style={inputStyle}
                  />
                  {pinError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <span className="text-red-400 text-sm">⚠️ {pinError}</span>
                    </div>
                  )}
                  {pinSuccess && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span className="text-green-400 text-sm">✓ PIN успешно изменён!</span>
                    </div>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleChangePIN}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    Сохранить PIN
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        <GradientDivider />

        {/* Notifications */}
        <SectionCard>
          <SectionHeader icon="🔔" label="Уведомления" />

          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-white text-sm font-semibold">Прогулки после еды</p>
              <p className="text-white/40 text-xs mt-0.5">Уведомление через 5 мин после еды</p>
            </div>
            {settings.notificationsEnabled ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Включено</span>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestNotifications}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Включить
              </motion.button>
            )}
          </div>

          {notifRequested && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl mt-3"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <p className="text-green-400 text-sm">🎉 Тестовое уведомление придёт через 5 сек</p>
            </motion.div>
          )}
        </SectionCard>

        <GradientDivider />

        {/* Meal times */}
        <SectionCard>
          <SectionHeader icon="🍽️" label="Время приёма пищи" />

          <div className="space-y-3">
            {settings.mealTimes.map((meal, i) => (
              <div key={i} className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleMealTimeChange(i, 'enabled', !meal.enabled)}
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    background: meal.enabled
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.07)',
                    border: meal.enabled ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    boxShadow: meal.enabled ? '0 2px 8px rgba(99,102,241,0.35)' : 'none'
                  }}
                >
                  {meal.enabled && <span className="text-xs text-white font-bold">✓</span>}
                </motion.button>
                <span className={`text-sm flex-1 ${meal.enabled ? 'text-white' : 'text-white/40'}`}>{meal.label}</span>
                <input
                  type="time"
                  value={meal.time}
                  onChange={e => handleMealTimeChange(i, 'time', e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    colorScheme: 'dark'
                  }}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <GradientDivider />

        {/* Step Goal */}
        <SectionCard>
          <SectionHeader icon="🚶" label="Цель по шагам" />
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={settings.stepGoal}
              onChange={e => handleSaveSettings({ ...settings, stepGoal: parseInt(e.target.value) || 15000 })}
              className="flex-1 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <span className="text-white/40 text-sm flex-shrink-0">шагов/день</span>
          </div>
        </SectionCard>

        <GradientDivider />

        {/* Program Reset */}
        <SectionCard>
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              ⚠️
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-400/70">Опасная зона</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: resetConfirm > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)',
              color: '#f87171',
              border: `1px solid ${resetConfirm > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.25)'}`,
              boxShadow: resetConfirm > 0 ? '0 0 16px rgba(239,68,68,0.15)' : 'none'
            }}
          >
            {resetConfirm === 0
              ? '🔄 Сбросить программу'
              : '⚠️ Нажми ещё раз для подтверждения'}
          </motion.button>
          <p className="text-white/25 text-xs mt-2 text-center">
            Удалит все тренировки и веса. Необратимо!
          </p>

          <div className="mt-4" style={{ borderTop: '1px solid rgba(239,68,68,0.12)', paddingTop: '16px' }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowDbReset(!showDbReset); setDbResetError(''); setDbResetPin('') }}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: showDbReset ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.06)',
                color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              🗄️ Сбросить облачную БД
              <motion.span
                animate={{ rotate: showDbReset ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/30 text-xs"
              >
                ▼
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showDbReset && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    <p className="text-white/40 text-xs leading-relaxed">
                      Удалит все тренировки, веса и измерения из Supabase + localStorage. Введи PIN для подтверждения.
                    </p>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={dbResetPin}
                      onChange={e => setDbResetPin(e.target.value)}
                      placeholder="Введи PIN"
                      className={`${inputClass} ${inputFocusStyle}`}
                      style={inputStyle}
                    />
                    {dbResetError && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span className="text-red-400 text-sm">⚠️ {dbResetError}</span>
                      </div>
                    )}
                    {dbResetSuccess && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <span className="text-green-400 text-sm">✓ БД сброшена успешно</span>
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDbReset}
                      disabled={dbResetLoading || dbResetPin.length !== 4}
                      className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                    >
                      {dbResetLoading ? '⏳ Сброс...' : '🗑️ Подтвердить сброс БД'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

        <GradientDivider />

        {/* About */}
        <SectionCard>
          <SectionHeader icon="ℹ️" label="О программе" />
          <div className="space-y-2 mb-5">
            {[
              { label: 'Возраст', value: '41 год' },
              { label: 'Вес', value: '83 кг' },
              { label: 'Уровень', value: 'Средний (1.5 года)' },
              { label: 'Цель', value: 'V-тейп (ширина)' },
              { label: 'Тренировок в неделю', value: '2×' },
            ].map(row => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2 text-sm"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-white/40">{row.label}</span>
                <span className="text-white font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <div
            className="h-px mb-4"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }}
          />

          <h4 className="font-bold text-white/40 text-xs uppercase tracking-widest mb-3">Научные источники</h4>
          <div className="space-y-2">
            {SOURCES.map((source, i) => (
              <p key={i} className="text-white/25 text-xs leading-relaxed">
                [{i + 1}] {source}
              </p>
            ))}
          </div>
        </SectionCard>

        <div className="text-center py-4">
          <p className="text-white/15 text-xs">GymPrime v1.0 · Научный тренинг</p>
        </div>
      </div>
    </div>
  )
}
