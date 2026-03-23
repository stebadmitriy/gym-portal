import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EXERCISES } from '../lib/exercises'
import { useProgramStore } from '../stores/programStore'
import { Exercise } from '../types'
import ExerciseModal from '../components/ExerciseModal'

const MUSCLE_FILTERS = ['Все', 'Широчайшие', 'Спина', 'Грудь', 'Дельты', 'Ноги', 'Бицепс', 'Пресс']

function ExerciseThumbnail({ emoji, colorSlot }: {
  emoji: string
  colorSlot: 'A' | 'B'
}) {
  const bg = colorSlot === 'A' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)'
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ background: bg }}
    >
      <span className="text-2xl">{emoji}</span>
    </div>
  )
}

export default function ExercisesPage() {
  const { weights } = useProgramStore()
  const [filter, setFilter] = useState<'All' | 'A' | 'B'>('All')
  const [muscleFilter, setMuscleFilter] = useState('Все')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const filtered = EXERCISES.filter(ex => {
    const workoutMatch = filter === 'All' || ex.workout_slot === filter
    const muscleMatch = muscleFilter === 'Все' ||
      ex.muscle_primary.toLowerCase().includes(muscleFilter.toLowerCase())
    return workoutMatch && muscleMatch
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      <div
        className="px-5 pb-4"
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)` }}
      >
        <h1 className="text-2xl font-black text-white">Упражнения</h1>
        <p className="text-white/40 text-sm mt-1">{EXERCISES.length} упражнений в программе</p>
      </div>

      {/* Filters */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 mb-3">
          {(['All', 'A', 'B'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filter === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              {f === 'All' ? 'Все' : `Тренировка ${f}`}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {MUSCLE_FILTERS.map(m => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: muscleFilter === m ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                color: muscleFilter === m ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                border: muscleFilter === m ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise grid */}
      <div className="px-5 grid grid-cols-1 gap-3">
        {filtered.map((exercise, i) => {
          const currentWeight = weights[exercise.id] || 0

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedExercise(exercise)}
              className="card p-4 cursor-pointer active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-4">
                <ExerciseThumbnail
                  emoji={exercise.muscle_emoji}
                  colorSlot={exercise.workout_slot}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: exercise.workout_slot === 'A' ? '#a5b4fc' : '#fbbf24' }}
                    >
                      Тр. {exercise.workout_slot}
                    </span>
                    <span className="text-white/30 text-xs">
                      {exercise.is_compound ? 'Базовое' : 'Изоляция'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-tight truncate">
                    {exercise.name_ru}
                  </h3>
                  <p className="text-white/40 text-xs mt-0.5">
                    {exercise.sets}×{exercise.reps} · {exercise.tempo}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  {currentWeight > 0 ? (
                    <>
                      <div className="text-white font-bold">{currentWeight}</div>
                      <div className="text-white/30 text-xs">кг</div>
                    </>
                  ) : (
                    <div className="text-white/20 text-xs">нет данных</div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedExercise && (
          <ExerciseModal
            exercise={selectedExercise}
            currentWeight={weights[selectedExercise.id] || 0}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
