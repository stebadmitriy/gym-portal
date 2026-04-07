import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { getExercisesForWorkout } from '../lib/exercises'
import { getSettings, getWorkouts } from '../lib/storage'
import { getBlockForWeek } from '../lib/program'
import { WorkoutType } from '../types'

const SCIENCE_TIPS = [
  { icon: '🧬', text: 'Ходьба после еды снижает инсулин и переключает тело в режим жиросжигания (Journal of Diabetes Care)' },
  { icon: '😴', text: 'Сон 7-9 часов увеличивает синтез белка на 30% и снижает кортизол' },
  { icon: '💧', text: 'Потеря 2% веса от обезвоживания снижает силу на 10-20%. Пей 3-4 л воды в день' },
  { icon: '🥩', text: '1.6-2.2г протеина на кг веса — научно подтверждённый оптимум для роста мышц' },
  { icon: '⏰', text: 'V-тейп формируется широчайшими и боковыми дельтами — именно эти мышцы в приоритете программы' },
  { icon: '🔥', text: 'RIR (повторения в запасе) точнее %1ПМ для управления интенсивностью у опытных атлетов' },
]

const MUSCLE_COLORS: Record<string, string> = {
  'Спина': '#6366f1', 'Грудь': '#ec4899', 'Плечи': '#f59e0b',
  'Бицепс': '#10b981', 'Трицепс': '#14b8a6', 'Ноги': '#f97316',
  'Пресс': '#8b5cf6', 'Ягодицы': '#ef4444',
}

const WORKOUT_META: Record<WorkoutType, { label: string; dayRu: string; emoji: string; color: string }> = {
  A: { label: 'День 1', dayRu: 'Акцент на верх груди и ширину', emoji: '💪', color: '#6366f1' },
  B: { label: 'День 2', dayRu: 'Акцент на мощь и толщину спины', emoji: '⚡', color: '#f59e0b' },
  C: { label: 'День 3', dayRu: 'Детализация и V-Taper Специализация', emoji: '🎯', color: '#10b981' },
}

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

export default function HomePage() {
  const navigate = useNavigate()
  const { programState, weights, customProgram } = useProgramStore()
  const { startWorkout, activeWorkout } = useWorkoutStore()
  const [tipIndex] = useState(() => Math.floor(Math.random() * SCIENCE_TIPS.length))
  const [settings] = useState(getSettings())

  const nextWorkout = programState.next_workout_type

  const weekStart = getWeekStart()
  const completedSlots = new Set<string>(
    getWorkouts()
      .filter(w => w.finished_at && w.finished_at >= weekStart)
      .map(w => w.workout_type)
  )

  const handleStartWorkout = (slot: WorkoutType) => {
    if (slot !== nextWorkout) return
    const exercises = getExercisesForWorkout(slot, customProgram)
    const { block } = getBlockForWeek(programState.total_week)
    if (!activeWorkout) {
      startWorkout(slot, programState.total_week, exercises, weights, block)
    }
    navigate('/workout')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header */}
      <div
        className="px-5 pb-5"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/50 text-sm font-medium tracking-wide">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long' })}
            </p>
            <h1 className="text-3xl font-black text-white mt-0.5 tracking-tight">
              Неделя{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))',
              }}>
                {programState.total_week}
              </span>
            </h1>
          </div>
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            🏋️
          </motion.div>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {/* 3 Workout Cards */}
        {(['A', 'B', 'C'] as WorkoutType[]).map((slot, i) => {
          const meta = WORKOUT_META[slot]
          const isActive = slot === nextWorkout
          const isDone = completedSlots.has(slot)
          const isPending = !isActive && !isDone
          const exercises = getExercisesForWorkout(slot, customProgram)

          return (
            <motion.div
              key={slot}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => isActive && handleStartWorkout(slot)}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: isDone ? 'rgba(16,185,129,0.06)' : isActive ? '#1c1c27' : 'rgba(255,255,255,0.02)',
                border: isActive
                  ? `1px solid ${meta.color}50`
                  : isDone ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.06)',
                opacity: isPending ? 0.55 : 1,
                cursor: isActive ? 'pointer' : 'default',
                boxShadow: isActive ? `0 0 24px ${meta.color}18` : 'none',
              }}
            >
              {isActive && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at top right, ${meta.color}15 0%, transparent 60%)`,
                }} />
              )}

              <div className="relative flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{meta.dayRu}</span>
                    {isActive && activeWorkout && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-xs font-semibold">LIVE</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    {meta.label}
                    {isDone && <span className="text-green-400 text-base">✅</span>}
                    {isActive && !isDone && <span className="text-base">🟣</span>}
                    {isPending && <span className="text-base opacity-50">⏳</span>}
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">{exercises.length} упражнений</p>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}25, ${meta.color}15)`,
                    border: `1px solid ${meta.color}30`,
                  }}
                >
                  {meta.emoji}
                </div>
              </div>

              {/* Exercise chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {exercises.slice(0, 4).map(ex => {
                  const accent = MUSCLE_COLORS[ex.muscle_primary] || meta.color
                  return (
                    <span
                      key={ex.id}
                      className="text-xs py-1"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                        borderLeft: `3px solid ${accent}`,
                        borderRadius: '0 20px 20px 0',
                        paddingLeft: '8px',
                        paddingRight: '12px',
                      }}
                    >
                      {ex.muscle_emoji} {ex.muscle_primary}
                    </span>
                  )
                })}
              </div>

              {isActive && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary w-full text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: activeWorkout
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                    boxShadow: `0 4px 20px ${meta.color}40`,
                  }}
                >
                  {activeWorkout ? '▶️ Продолжить' : '🚀 Начать →'}
                </motion.button>
              )}
            </motion.div>
          )
        })}

        {/* Meal reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🍽️</span>
            <h3 className="font-semibold">Прогулки после еды</h3>
          </div>
          <div className="space-y-2">
            {settings.mealTimes.filter(m => m.enabled).map((meal, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-white/70 text-sm">{meal.label}</span>
                <span className="text-white/40 text-sm">{meal.time} → прогулка через 5 мин</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-400/80 mt-3">🚶 10 мин прогулки после еды = жиросжигание без стресса!</p>
        </motion.div>

        {/* Science tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-2xl p-5"
          style={{
            background: '#1c1c27',
            border: '1px solid rgba(99,102,241,0.25)',
            borderLeft: '4px solid #6366f1',
            boxShadow: '-4px 0 16px rgba(99,102,241,0.15)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a5b4fc' }}>Наука дня</span>
          <div className="flex gap-3 items-start mt-2">
            <span className="text-3xl leading-none">{SCIENCE_TIPS[tipIndex].icon}</span>
            <p className="text-sm text-white/75 leading-relaxed">{SCIENCE_TIPS[tipIndex].text}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
