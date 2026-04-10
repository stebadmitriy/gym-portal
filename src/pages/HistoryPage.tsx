import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { EXERCISES } from '../lib/exercises'
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

  // Color-coded left border per workout type
  const workoutTypeBorder: Record<string, string> = {
    A: '#6366f1',
    B: '#8b5cf6',
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      weekday: 'short'
    })
  }

  const formatDateGroup = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return 'На этой неделе'
    if (diffDays < 14) return 'Прошлая неделя'
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  }

  // Group workouts by date group
  const groupedWorkouts: Array<{ groupLabel: string; items: typeof workouts }> = []
  const seenGroups = new Set<string>()
  workouts.forEach(w => {
    const label = formatDateGroup(w.started_at)
    if (!seenGroups.has(label)) {
      seenGroups.add(label)
      groupedWorkouts.push({ groupLabel: label, items: [] })
    }
    groupedWorkouts[groupedWorkouts.length - 1].items.push(w)
  })

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
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">ЖУРНАЛ</span>
        </div>
        <h1 className="text-2xl font-black text-white">История</h1>
        <p className="text-white/40 text-sm mt-1">{workouts.length} тренировок записано</p>
      </div>

      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)', margin: '0 20px 16px' }} />

      <div className="px-4 space-y-1">
        {/* Empty state */}
        {workouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              📋
            </div>
            <p className="text-white/60 font-semibold mb-1">Тренировок пока нет</p>
            <p className="text-white/30 text-sm">Начни первую тренировку!</p>
          </motion.div>
        )}

        {/* Grouped workout cards */}
        {groupedWorkouts.map(({ groupLabel, items }) => (
          <div key={groupLabel}>
            {/* Date group header */}
            <div className="flex items-center gap-3 py-3 px-1">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30">{groupLabel}</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="space-y-2">
              {items.map((workout, i) => {
                const blockColor = blockColors[workout.block] || '#6366f1'
                const leftBorderColor = workoutTypeBorder[workout.workout_type] || '#6366f1'
                const isExpanded = expandedId === workout.id

                // Group sets by exercise
                const sets = workout.sets || []
                const exerciseIds = [...new Set(sets.map(s => s.exercise_id))]

                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: isExpanded
                          ? `1px solid ${leftBorderColor}40`
                          : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: isExpanded ? `0 0 0 1px ${leftBorderColor}15, 0 4px 24px ${leftBorderColor}10` : 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                    >
                      {/* Left color-coded accent bar */}
                      <div className="flex">
                        <div
                          className="w-1 flex-shrink-0"
                          style={{ background: `linear-gradient(180deg, ${leftBorderColor}, ${leftBorderColor}60)` }}
                        />
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: blockColor + '20', color: blockColor, border: `1px solid ${blockColor}35` }}
                                >
                                  {blockNames[workout.block] || 'Гипертрофия'}
                                </span>
                                <span
                                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: `${leftBorderColor}18`, color: leftBorderColor, border: `1px solid ${leftBorderColor}30` }}
                                >
                                  Тренировка {workout.workout_type}
                                </span>
                              </div>
                              <p className="text-white font-bold text-sm">{formatDate(workout.started_at)}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                {workout.duration_minutes && (
                                  <span className="text-white/35 text-xs">⏱ {workout.duration_minutes} мин</span>
                                )}
                                {workout.total_volume && (
                                  <span className="text-white/35 text-xs">📦 {Math.round(workout.total_volume)} кг×повт</span>
                                )}
                                {workout.feedback && (
                                  <span className="text-base">
                                    {workout.feedback === 'easy' ? '💪' : workout.feedback === 'hard' ? '😓' : '👍'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-0.5"
                              style={{
                                background: isExpanded ? `${leftBorderColor}25` : 'rgba(255,255,255,0.06)',
                                color: isExpanded ? leftBorderColor : 'rgba(255,255,255,0.25)',
                                fontSize: '10px'
                              }}
                            >
                              ▼
                            </motion.div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-3"
                              >
                                <div
                                  className="pt-3 space-y-3"
                                  style={{ borderTop: `1px solid ${leftBorderColor}20` }}
                                >
                                  {exerciseIds.map(exerciseId => {
                                    const exercise = EXERCISES.find(e => e.id === exerciseId)
                                    const exSets = sets.filter(s => s.exercise_id === exerciseId)

                                    return (
                                      <div key={exerciseId}>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                                          {exercise?.name_ru || exerciseId}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {exSets.map(set => (
                                            <span
                                              key={set.set_number}
                                              className="text-xs px-2.5 py-1 rounded-lg font-medium"
                                              style={{
                                                background: set.completed ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                                                color: set.completed ? '#34d399' : 'rgba(255,255,255,0.25)',
                                                border: set.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)'
                                              }}
                                            >
                                              {set.completed
                                                ? `${set.weight_kg} кг × ${set.actual_reps}`
                                                : `—`}
                                            </span>
                                          ))}
                                        </div>
                                        {workout.exercise_notes?.[exerciseId] && (
                                          <p className="text-white/40 text-xs mt-1.5 italic">
                                            📝 {workout.exercise_notes[exerciseId]}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
