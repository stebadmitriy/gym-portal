import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '../stores/workoutStore'
import { useProgramStore } from '../stores/programStore'
import { getBlockForWeek, calculateNextWeight } from '../lib/program'
import { EXERCISES } from '../lib/exercises'
import { FeedbackType, Workout } from '../types'

// Muscle group color palette for exercise breakdown
const MUSCLE_COLORS: Record<string, string> = {
  'Широчайшие': '#6366f1',
  'Грудь': '#ec4899',
  'Верхняя грудь': '#f43f5e',
  'Дельты': '#8b5cf6',
  'Боковые дельты': '#a855f7',
  'Задние дельты + Трапеция': '#7c3aed',
  'Квадрицепсы': '#f59e0b',
  'Бицепс бедра': '#d97706',
  'Ягодицы': '#fb7185',
  'Пресс': '#06b6d4',
  'Трапеция': '#3b82f6',
  'Спина (толщина)': '#4f46e5',
  'Бицепс': '#10b981',
  'Трицепс': '#14b8a6',
  'Бицепс + Брахиалис': '#10b981',
  'Средняя спина': '#6366f1',
}

function getMuscleColor(muscle: string): string {
  if (MUSCLE_COLORS[muscle]) return MUSCLE_COLORS[muscle]
  // Partial match
  for (const key of Object.keys(MUSCLE_COLORS)) {
    if (muscle.includes(key) || key.includes(muscle)) return MUSCLE_COLORS[key]
  }
  return '#6366f1'
}

export default function WorkoutSummaryPage() {
  const navigate = useNavigate()
  const { activeWorkout, resetWorkout } = useWorkoutStore()
  const { programState, completeWorkout, advanceProgram, updateWeight } = useProgramStore()
  const [feedback, setFeedback] = useState<FeedbackType | null>(null)
  const [saved, setSaved] = useState(false)

  const { block } = getBlockForWeek(programState.total_week)

  useEffect(() => {
    if (!activeWorkout && !saved) {
      navigate('/', { replace: true })
    }
  }, [])

  if (!activeWorkout) return null

  const finishedAt = new Date().toISOString()
  const durationMinutes = Math.round(activeWorkout.elapsedSeconds / 60)
  const completedSets = activeWorkout.sets.filter(s => s.completed)
  const totalVolume = completedSets.reduce((sum, s) => sum + s.weight_kg * s.actual_reps, 0)

  // Group sets by exercise
  const exerciseMap = new Map<string, typeof activeWorkout.sets>()
  activeWorkout.sets.forEach(s => {
    const existing = exerciseMap.get(s.exercise_id) || []
    exerciseMap.set(s.exercise_id, [...existing, s])
  })

  const handleSave = (selectedFeedback: FeedbackType) => {
    setFeedback(selectedFeedback)

    const workout: Workout = {
      id: activeWorkout.id,
      workout_type: activeWorkout.workout_type,
      block: activeWorkout.block,
      week_number: activeWorkout.week_number,
      started_at: activeWorkout.started_at,
      finished_at: finishedAt,
      duration_minutes: durationMinutes,
      feedback: selectedFeedback,
      sets: activeWorkout.sets,
      total_volume: totalVolume
    }

    completeWorkout(workout)

    // Update weights based on feedback
    exerciseMap.forEach((sets, exerciseId) => {
      const exercise = EXERCISES.find(e => e.id === exerciseId)
      if (!exercise || exercise.increment_kg === 0) return

      const completedWeights = sets.filter(s => s.completed).map(s => s.weight_kg)
      if (completedWeights.length === 0) return

      const currentWeight = Math.max(...completedWeights)
      const nextWeight = calculateNextWeight(currentWeight, selectedFeedback, exercise.increment_kg)
      updateWeight(exerciseId, nextWeight)
    })

    advanceProgram()
    setSaved(true)
  }

  const feedbackOptions: { type: FeedbackType; emoji: string; label: string; color: string }[] = [
    { type: 'hard', emoji: '😓', label: 'Тяжело', color: '#ef4444' },
    { type: 'normal', emoji: '👍', label: 'Нормально', color: '#6366f1' },
    { type: 'easy', emoji: '💪', label: 'Легко', color: '#10b981' },
  ]

  const { block: nextBlock, blockInfo: nextBlockInfo } = getBlockForWeek(
    programState.total_week + (programState.next_workout_type === 'B' ? 0 : 1)
  )

  // Workout type theming
  const workoutColor = activeWorkout.workout_type === 'A' ? '#6366f1' : '#8b5cf6'
  const workoutGradient = activeWorkout.workout_type === 'A'
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    : 'linear-gradient(135deg, #8b5cf6, #a855f7)'

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24 px-5 pt-16">

      {/* Hero celebration section */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        className="text-center mb-8 relative"
      >
        {/* Gradient glow ring behind emoji */}
        <div
          className="absolute inset-0 mx-auto rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{
            width: 160,
            height: 160,
            left: '50%',
            transform: 'translateX(-50%)',
            background: workoutGradient,
          }}
        />
        {/* Animated trophy emoji */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-7xl mb-4 relative"
        >
          🏆
        </motion.div>

        <h1 className="text-3xl font-black text-white mb-2">Тренировка завершена!</h1>

        {/* Workout type badge */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-sm"
            style={{
              background: workoutGradient,
              boxShadow: `0 0 16px ${workoutColor}50`
            }}
          >
            Тренировка {activeWorkout.workout_type}
          </span>
          <span className="text-white/40 text-sm">{new Date().toLocaleDateString('ru-RU')}</span>
        </div>
      </motion.div>

      {/* Stats metric grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 rounded-2xl overflow-hidden"
        style={{
          background: '#1c1c27',
          border: `1px solid ${workoutColor}30`,
          boxShadow: `0 0 0 1px ${workoutColor}10`
        }}
      >
        <div
          className="px-4 py-2 text-xs font-bold tracking-widest uppercase"
          style={{
            background: `${workoutColor}15`,
            color: workoutColor,
            borderBottom: `1px solid ${workoutColor}20`
          }}
        >
          Результаты тренировки
        </div>
        <div className="grid grid-cols-3 gap-0 p-4">
          <div className="text-center">
            <div
              className="text-3xl font-black"
              style={{
                background: workoutGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {durationMinutes}
            </div>
            <div className="text-white/40 text-xs mt-1">минут</div>
          </div>
          <div
            className="text-center border-x"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="text-3xl font-black"
              style={{
                background: workoutGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {Math.round(totalVolume)}
            </div>
            <div className="text-white/40 text-xs mt-1">кг×повт</div>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-black"
              style={{
                background: workoutGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {completedSets.length}
            </div>
            <div className="text-white/40 text-xs mt-1">подходов</div>
          </div>
        </div>
      </motion.div>

      {/* Feedback section */}
      <AnimatePresence mode="wait">
        {!saved && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.3 }}
            className="mb-6 rounded-2xl p-5"
            style={{ background: '#1c1c27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="font-bold text-white mb-1">Как прошла тренировка?</h3>
            <p className="text-white/40 text-xs mb-4">Это влияет на прогрессию веса</p>
            <div className="grid grid-cols-3 gap-3">
              {feedbackOptions.map(opt => (
                <motion.button
                  key={opt.type}
                  onClick={() => handleSave(opt.type)}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl font-semibold transition-colors"
                  style={{
                    background: `${opt.color}18`,
                    border: `1px solid ${opt.color}40`,
                    color: opt.color
                  }}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-sm">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Saved confirmation */}
        {saved && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-6 rounded-2xl p-4"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 20px rgba(16,185,129,0.15)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: 'rgba(16,185,129,0.2)' }}
              >
                ✅
              </div>
              <div>
                <p className="font-bold text-green-400">Сохранено!</p>
                <p className="text-white/50 text-sm">Веса обновлены для следующей тренировки</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise results with muscle group color coding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="font-bold text-white/70 mb-3 text-xs uppercase tracking-widest">Разбивка по упражнениям</h3>
        <div className="space-y-2">
          {Array.from(exerciseMap.entries()).map(([exerciseId, sets], idx) => {
            const exercise = EXERCISES.find(e => e.id === exerciseId)
            if (!exercise) return null
            const completedCount = sets.filter(s => s.completed).length
            const maxWeight = Math.max(...sets.filter(s => s.completed).map(s => s.weight_kg), 0)
            const muscleColor = getMuscleColor(exercise.muscle_primary)
            const allCompleted = completedCount === sets.length

            return (
              <motion.div
                key={exerciseId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + idx * 0.06 }}
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{
                  background: '#1c1c27',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderLeft: `3px solid ${muscleColor}`
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Muscle color dot */}
                  <div
                    className="w-2 h-8 rounded-full flex-shrink-0"
                    style={{ background: `${muscleColor}60` }}
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{exercise.name_ru}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: `${muscleColor}20`, color: muscleColor }}
                      >
                        {exercise.muscle_primary}
                      </span>
                      <span className="text-white/40 text-xs">
                        {completedCount}/{sets.length} подх.
                      </span>
                      {allCompleted && (
                        <span className="text-xs text-green-400">✓</span>
                      )}
                    </div>
                  </div>
                </div>
                {maxWeight > 0 && (
                  <div className="text-right flex-shrink-0 ml-3">
                    <p
                      className="font-bold text-sm"
                      style={{ color: allCompleted ? 'white' : 'rgba(255,255,255,0.5)' }}
                    >
                      {maxWeight} кг
                    </p>
                    <p className="text-white/40 text-xs">макс вес</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <motion.button
          onClick={() => {
            if (!saved) handleSave('normal')
            resetWorkout()
            navigate('/', { replace: true })
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className="w-full py-5 rounded-2xl font-bold text-white text-base"
          style={{
            background: workoutGradient,
            boxShadow: `0 4px 24px ${workoutColor}50`
          }}
        >
          🏠 На главную
        </motion.button>
        <motion.button
          onClick={() => {
            if (!saved) handleSave('normal')
            resetWorkout()
            navigate('/history')
          }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-xl font-semibold text-white/60"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          📋 История тренировок
        </motion.button>
      </motion.div>
    </div>
  )
}
