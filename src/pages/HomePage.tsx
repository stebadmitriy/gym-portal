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
        className="px-5 pt-safe pb-5"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/50 text-sm font-medium">{todayName}</p>
            <h1 className="text-2xl font-black text-white mt-0.5">
              Неделя {programState.total_week}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: blockInfo.color + '30', color: blockInfo.color }}
              >
                {blockInfo.nameRu}
              </span>
              <span className="text-white/40 text-xs">Неделя {weekInBlock}/{blockInfo.weeks}</span>
            </div>
          </div>
          <div className="text-3xl">🏋️</div>
        </div>

        {/* Cycle progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Цикл прогресс</span>
            <span>{programState.total_week % 9 || 9}/9 нед</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full gradient-primary"
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
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {activeWorkout ? 'ТРЕНИРОВКА ИДЁТ' : 'СЛЕДУЮЩАЯ'}
                </span>
                {activeWorkout && (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                Тренировка {nextWorkout}
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                {estimates.exerciseCount} упражнений · ~{estimates.durationMin} мин · ~{estimates.calories} ккал
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #6366f130, #8b5cf630)' }}
            >
              {nextWorkout === 'A' ? '💪' : '🔗'}
            </div>
          </div>

          {/* Exercise preview */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {getExercisesByWorkout(nextWorkout).slice(0, 4).map(ex => (
              <span
                key={ex.id}
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
              >
                {ex.muscle_emoji} {ex.muscle_primary}
              </span>
            ))}
          </div>

          <button
            onClick={handleStartWorkout}
            className="btn-primary w-full py-3.5 text-white font-semibold text-base flex items-center justify-center gap-2"
          >
            {activeWorkout ? '▶️ Продолжить тренировку' : '🚀 Начать тренировку →'}
          </button>
        </motion.div>

        {/* Steps Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚶</span>
            <h3 className="font-semibold">Шаги сегодня</h3>
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
            <span className="text-white/40 text-sm">/ {stepGoal.toLocaleString()}</span>
          </div>

          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
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
            <span className="text-white/40">кг</span>
            <button
              onClick={() => {
                const w = parseFloat(weightInput)
                if (w > 0) {
                  saveTodayWeight(w)
                  setWeightInput('')
                }
              }}
              className="px-4 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              ✓
            </button>
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

        {/* Tip of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
          style={{ borderColor: 'rgba(99,102,241,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Наука дня</span>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">{SCIENCE_TIPS[tipIndex].icon}</span>
            <p className="text-sm text-white/70 leading-relaxed">{SCIENCE_TIPS[tipIndex].text}</p>
          </div>
        </motion.div>

        {/* Block overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h3 className="font-semibold mb-3 text-white/80 text-sm uppercase tracking-wider">Текущий блок</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Блок</span>
              <span className="text-white font-medium text-sm">{blockInfo.nameRu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Подходы × Повторения</span>
              <span className="text-white font-medium text-sm">{blockInfo.sets}×{blockInfo.repsRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">RIR (запас)</span>
              <span className="text-white font-medium text-sm">{blockInfo.rir}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Интенсивность</span>
              <span className="text-white font-medium text-sm">{blockInfo.intensity}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
