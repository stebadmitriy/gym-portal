import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWorkoutStore } from '../stores/workoutStore'
import { useProgramStore } from '../stores/programStore'
import { getBlockForWeek, calculateNextWeight } from '../lib/program'
import { getExerciseById } from '../lib/exercises'
import { FeedbackType, Workout } from '../types'

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
      const exercise = getExerciseById(exerciseId)
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24 px-5 pt-16">
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-3xl font-black text-white mb-2">Тренировка завершена!</h1>
        <p className="text-white/50">Тренировка {activeWorkout.workout_type} · {new Date().toLocaleDateString('ru-RU')}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5 mb-6"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black gradient-text">{durationMinutes}</div>
            <div className="text-white/40 text-xs mt-1">минут</div>
          </div>
          <div className="text-center border-x border-white/08">
            <div className="text-2xl font-black gradient-text">{Math.round(totalVolume)}</div>
            <div className="text-white/40 text-xs mt-1">кг×повт</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black gradient-text">{completedSets.length}</div>
            <div className="text-white/40 text-xs mt-1">подходов</div>
          </div>
        </div>
      </motion.div>

      {/* Feedback */}
      {!saved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5 mb-6"
        >
          <h3 className="font-semibold text-white mb-1">Как прошла тренировка?</h3>
          <p className="text-white/40 text-xs mb-4">Это влияет на прогрессию веса</p>
          <div className="grid grid-cols-3 gap-3">
            {feedbackOptions.map(opt => (
              <button
                key={opt.type}
                onClick={() => handleSave(opt.type)}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl font-semibold transition-all active:scale-95"
                style={{
                  background: `${opt.color}20`,
                  border: `1px solid ${opt.color}40`,
                  color: opt.color
                }}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Saved state */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-5 mb-6"
          style={{ borderColor: 'rgba(16,185,129,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-400">Сохранено!</p>
              <p className="text-white/50 text-sm">Веса обновлены для следующей тренировки</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exercise results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="font-semibold text-white/70 mb-3 text-sm uppercase tracking-wider">Результаты</h3>
        <div className="space-y-2">
          {Array.from(exerciseMap.entries()).map(([exerciseId, sets]) => {
            const exercise = getExerciseById(exerciseId)
            if (!exercise) return null
            const completedCount = sets.filter(s => s.completed).length
            const maxWeight = Math.max(...sets.filter(s => s.completed).map(s => s.weight_kg), 0)

            return (
              <div key={exerciseId} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{exercise.name_ru}</p>
                  <p className="text-white/40 text-xs">{completedCount}/{sets.length} подходов</p>
                </div>
                {maxWeight > 0 && (
                  <div className="text-right">
                    <p className="text-white font-bold">{maxWeight} кг</p>
                    <p className="text-white/40 text-xs">макс вес</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <button
          onClick={() => {
            if (!saved) handleSave('normal')
            resetWorkout()
            navigate('/', { replace: true })
          }}
          className="btn-primary w-full py-4 text-white font-bold text-base"
        >
          🏠 На главную
        </button>
        <button
          onClick={() => {
            if (!saved) handleSave('normal')
            resetWorkout()
            navigate('/history')
          }}
          className="w-full py-4 rounded-xl font-semibold text-white/60"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          📋 История тренировок
        </button>
      </motion.div>
    </div>
  )
}
