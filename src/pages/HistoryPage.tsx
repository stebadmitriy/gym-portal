import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { getExerciseById } from '../lib/exercises'
import { formatBlockName } from '../lib/program'
import { Workout } from '../types'

export default function HistoryPage() {
  const { workouts } = useProgramStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const blockColors: Record<string, string> = {
    hypertrophy: '#6366f1',
    strength: '#f59e0b',
    deload: '#10b981'
  }

  const blockNames: Record<string, string> = {
    hypertrophy: 'Гипертрофия',
    strength: 'Сила',
    deload: 'Разгрузка'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      weekday: 'short'
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      <div
        className="px-5 pb-4"
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)` }}
      >
        <h1 className="text-2xl font-black text-white">История</h1>
        <p className="text-white/40 text-sm mt-1">{workouts.length} тренировок записано</p>
      </div>

      <div className="px-5 space-y-3">
        {workouts.length === 0 && (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-white/50">Тренировок пока нет</p>
            <p className="text-white/30 text-sm mt-1">Начни первую тренировку!</p>
          </div>
        )}

        {workouts.map((workout, i) => {
          const blockColor = blockColors[workout.block] || '#6366f1'
          const isExpanded = expandedId === workout.id

          // Group sets by exercise
          const sets = workout.sets || []
          const exerciseIds = [...new Set(sets.map(s => s.exercise_id))]

          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className="card p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : workout.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: blockColor + '25', color: blockColor }}
                      >
                        {blockNames[workout.block] || 'Гипертрофия'}
                      </span>
                      <span className="text-white/30 text-xs">Тренировка {workout.workout_type}</span>
                    </div>
                    <p className="text-white font-semibold">{formatDate(workout.started_at)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {workout.duration_minutes && (
                        <span className="text-white/40 text-xs">⏱ {workout.duration_minutes} мин</span>
                      )}
                      {workout.total_volume && (
                        <span className="text-white/40 text-xs">📦 {Math.round(workout.total_volume)} кг×повт</span>
                      )}
                      {workout.feedback && (
                        <span className="text-xs">
                          {workout.feedback === 'easy' ? '💪' : workout.feedback === 'hard' ? '😓' : '👍'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-white/30 ml-3">{isExpanded ? '▲' : '▼'}</span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="border-t border-white/06 pt-4 space-y-2">
                        {exerciseIds.map(exerciseId => {
                          const exercise = getExerciseById(exerciseId)
                          const exSets = sets.filter(s => s.exercise_id === exerciseId)
                          const completedSets = exSets.filter(s => s.completed)

                          return (
                            <div key={exerciseId}>
                              <p className="text-white/70 text-sm font-medium mb-1">
                                {exercise?.name_ru || exerciseId}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {exSets.map(set => (
                                  <span
                                    key={set.set_number}
                                    className="text-xs px-2 py-1 rounded-lg"
                                    style={{
                                      background: set.completed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                      color: set.completed ? '#10b981' : 'rgba(255,255,255,0.3)'
                                    }}
                                  >
                                    {set.completed
                                      ? `${set.weight_kg}кг × ${set.actual_reps}`
                                      : `пропущен`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
