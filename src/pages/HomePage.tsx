import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { getBlockForWeek, getWorkoutEstimates, formatBlockName } from '../lib/program'
import { getExercisesByWorkout } from '../lib/exercises'
import { getSettings } from '../lib/storage'

const SCIENCE_TIPS = [
  { icon: '🧬', text: 'Ходьба после еды снижает инсулин и переключает тело в режим жиросжигания (Journal of Diabetes Care)' },
  { icon: '😴', text: 'Сон 7-9 часов увеличивает синтез белка на 30% и снижает кортизол' },
  { icon: '💧', text: 'Потеря 2% веса от обезвоживания снижает силу на 10-20%. Пей 3-4 л воды в день' },
  { icon: '🥩', text: '1.6-2.2г протеина на кг веса — научно подтверждённый оптимум для роста мышц' },
  { icon: '⏰', text: 'V-тейп формируется широчайшими и боковыми дельтами — именно эти мышцы в приоритете программы' },
  { icon: '🔥', text: 'RIR (повторения в запасе) точнее %1ПМ для управления интенсивностью у опытных атлетов' },
]

// Muscle group accent colors for exercise chips
const MUSCLE_COLORS: Record<string, string> = {
  'Спина': '#6366f1',
  'Грудь': '#ec4899',
  'Плечи': '#f59e0b',
  'Бицепс': '#10b981',
  'Трицепс': '#14b8a6',
  'Ноги': '#f97316',
  'Пресс': '#8b5cf6',
  'Ягодицы': '#ef4444',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { programState, weights, todaySteps, saveSteps, saveTodayWeight } = useProgramStore()
  const { startWorkout, activeWorkout } = useWorkoutStore()

  const [stepsInput, setStepsInput] = useState(todaySteps > 0 ? String(todaySteps) : '')
  const [weightInput, setWeightInput] = useState('')
  const [tipIndex] = useState(() => Math.floor(Math.random() * SCIENCE_TIPS.length))
  const [settings] = useState(getSettings())

  const { block, weekInBlock, blockInfo } = getBlockForWeek(programState.total_week)
  const nextWorkout = programState.next_workout_type
  const estimates = getWorkoutEstimates(nextWorkout, block)

  const today = new Date()
  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const todayName = dayNames[today.getDay()]

  const handleStartWorkout = () => {
    const exercises = getExercisesByWorkout(nextWorkout)
    if (!activeWorkout) {
      startWorkout(nextWorkout, programState.total_week, exercises, weights, block)
    }
    navigate('/workout')
  }

  const handleSaveSteps = () => {
    const steps = parseInt(stepsInput) || 0
    saveSteps(steps)
  }

  const stepGoal = settings.stepGoal || 15000
  const stepProgress = Math.min(100, (todaySteps / stepGoal) * 100)

  const totalWeeksInCycle = 9
  const cycleProgress = ((programState.total_week - 1) % 9) / 9 * 100

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
            <p className="text-white/50 text-sm font-medium tracking-wide">{todayName}</p>
            <h1 className="text-3xl font-black text-white mt-0.5 tracking-tight">
              Неделя{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))',
                }}
              >
                {programState.total_week}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{
                  background: blockInfo.color + '20',
                  color: blockInfo.color,
                  borderColor: blockInfo.color + '50',
                  boxShadow: `0 0 10px ${blockInfo.color}30`,
                }}
              >
                {blockInfo.nameRu}
              </span>
              <span className="text-white/40 text-xs">{weekInBlock}/{blockInfo.weeks} нед</span>
            </div>
          </div>
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            🏋️
          </motion.div>
        </div>

        {/* Cycle progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Цикл прогресс</span>
            <span className="text-white/60 font-medium">{programState.total_week % 9 || 9}/9 нед</span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }}
              initial={{ width: 0 }}
              animate={{ width: `${cycleProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Next Workout Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: '#1c1c27',
            border: activeWorkout
              ? '1px solid transparent'
              : '1px solid rgba(255,255,255,0.08)',
            backgroundImage: activeWorkout
              ? 'linear-gradient(#1c1c27, #1c1c27), linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)'
              : undefined,
            backgroundOrigin: activeWorkout ? 'border-box' : undefined,
            backgroundClip: activeWorkout ? 'padding-box, border-box' : undefined,
          }}
        >
          {/* Subtle glow backdrop when active */}
          {activeWorkout && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.12) 0%, transparent 60%)',
              }}
            />
          )}

          <div className="relative flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  {activeWorkout ? 'ТРЕНИРОВКА ИДЁТ' : 'СЛЕДУЮЩАЯ'}
                </span>
                {activeWorkout && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-semibold">LIVE</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Тренировка {nextWorkout}
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                {estimates.exerciseCount} упражнений · ~{estimates.durationMin} мин · ~{estimates.calories} ккал
              </p>
            </div>
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.2)',
              }}
            >
              {nextWorkout === 'A' ? '💪' : '🔗'}
            </motion.div>
          </div>

          {/* Exercise preview chips with muscle-group color accents */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {getExercisesByWorkout(nextWorkout).slice(0, 4).map(ex => {
              const accentColor = MUSCLE_COLORS[ex.muscle_primary] || '#6366f1'
              return (
                <span
                  key={ex.id}
                  className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.7)',
                    borderLeft: `3px solid ${accentColor}`,
                    borderRadius: '0 20px 20px 0',
                    paddingLeft: '8px',
                  }}
                >
                  <span>{ex.muscle_emoji}</span>
                  <span>{ex.muscle_primary}</span>
                </span>
              )
            })}
          </div>

          <motion.button
            onClick={handleStartWorkout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full text-white font-bold text-base flex items-center justify-center gap-2"
            style={{
              boxShadow: activeWorkout
                ? '0 4px 20px rgba(16,185,129,0.4)'
                : '0 4px 20px rgba(99,102,241,0.4)',
              background: activeWorkout
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            {activeWorkout ? '▶️ Продолжить тренировку' : '🚀 Начать тренировку →'}
          </motion.button>
        </motion.div>

        {/* Steps Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚶</span>
              <h3 className="font-semibold">Шаги сегодня</h3>
            </div>
            {/* Large step count display */}
            <div className="text-right">
              <span
                className="text-2xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {todaySteps.toLocaleString('ru-RU')}
              </span>
              <p className="text-white/40 text-xs">/ {stepGoal.toLocaleString('ru-RU')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              value={stepsInput}
              onChange={e => setStepsInput(e.target.value)}
              onBlur={handleSaveSteps}
              placeholder="0"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-white/30"
            />
          </div>

          {/* Thicker progress bar */}
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
              initial={{ width: 0 }}
              animate={{ width: `${stepProgress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          <p className="text-xs text-white/40 mt-2">
            🔬 Ходьба после еды снижает инсулин (Journal of Diabetes Care)
          </p>
        </motion.div>

        {/* Weight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚖️</span>
            <h3 className="font-semibold">Вес тела</h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="83.0"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-white/30"
            />
            <span className="text-white/40 font-medium">кг</span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                const w = parseFloat(weightInput)
                if (w > 0) {
                  saveTodayWeight(w)
                  setWeightInput('')
                }
              }}
              className="px-5 py-3 rounded-full font-bold text-sm text-white whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                minWidth: 64,
              }}
            >
              Сохранить
            </motion.button>
          </div>
        </motion.div>

        {/* Meal reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
          <p className="text-xs text-amber-400/80 mt-3">
            🚶 10 мин прогулки после еды = жиросжигание без стресса!
          </p>
        </motion.div>

        {/* Tip of the Day — with indigo left-border accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="overflow-hidden rounded-2xl p-5"
          style={{
            background: '#1c1c27',
            border: '1px solid rgba(99,102,241,0.25)',
            borderLeft: '4px solid #6366f1',
            boxShadow: '-4px 0 16px rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#a5b4fc' }}
            >
              Наука дня
            </span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-3xl leading-none">{SCIENCE_TIPS[tipIndex].icon}</span>
            <p className="text-sm text-white/75 leading-relaxed">{SCIENCE_TIPS[tipIndex].text}</p>
          </div>
        </motion.div>

        {/* Block overview — compact 2×2 stat grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h3 className="font-bold mb-3 text-white/60 text-xs uppercase tracking-widest">Текущий блок</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Блок', value: blockInfo.nameRu },
              { label: 'Подходы × Повт', value: `${blockInfo.sets}×${blockInfo.repsRange}` },
              { label: 'RIR (запас)', value: String(blockInfo.rir) },
              { label: 'Интенсивность', value: blockInfo.intensity },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-white/40 text-xs mb-1">{stat.label}</p>
                <p className="text-white font-bold text-sm leading-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
