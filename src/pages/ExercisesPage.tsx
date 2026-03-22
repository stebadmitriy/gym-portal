import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EXERCISES } from '../lib/exercises'
import { useProgramStore } from '../stores/programStore'
import { Exercise } from '../types'

const MUSCLE_FILTERS = ['Все', 'Широчайшие', 'Спина', 'Грудь', 'Дельты', 'Ноги', 'Бицепс', 'Пресс']

interface ExerciseModalProps {
  exercise: Exercise
  currentWeight: number
  onClose: () => void
}

function ExerciseModal({ exercise, currentWeight, onClose }: ExerciseModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg"
        style={{
          background: '#1c1c27',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '85vh',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom, 24px)'
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pt-4 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{
                  background: exercise.workout_slot === 'A' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)',
                  color: exercise.workout_slot === 'A' ? '#a5b4fc' : '#fbbf24'
                }}
              >
                Тренировка {exercise.workout_slot}
              </span>
              <h2 className="text-2xl font-black text-white">{exercise.name_ru}</h2>
              <p className="text-white/50 mt-1">{exercise.muscle_emoji} {exercise.muscle_primary}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              ✕
            </button>
          </div>

          {/* Visual muscle indicator */}
          <div
            className="w-full h-28 rounded-2xl flex items-center justify-center mb-5 text-6xl"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {exercise.muscle_emoji}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold">{exercise.sets} × {exercise.reps}</div>
              <div className="text-white/40 text-xs mt-0.5">Подходы × Повт</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold">{exercise.tempo}</div>
              <div className="text-white/40 text-xs mt-0.5">Темп</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold">{currentWeight > 0 ? `${currentWeight} кг` : 'Не задан'}</div>
              <div className="text-white/40 text-xs mt-0.5">Рабочий вес</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold">
                {exercise.is_compound ? '🏋️ Базовое' : '🎯 Изоляция'}
              </div>
              <div className="text-white/40 text-xs mt-0.5">Тип</div>
            </div>
          </div>

          {/* Increment */}
          {exercise.increment_kg > 0 && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-5"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-lg">📈</span>
              <div>
                <p className="text-white text-sm font-medium">Прогрессия: +{exercise.increment_kg} кг</p>
                <p className="text-white/40 text-xs">При выполнении всех повторений в норме</p>
              </div>
            </div>
          )}

          {/* Science tip */}
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p className="text-indigo-400 text-xs font-semibold mb-2 uppercase tracking-wider">💡 Научный совет</p>
            <p className="text-white/80 text-sm leading-relaxed">{exercise.tips_ru}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
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
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: exercise.workout_slot === 'A'
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(245,158,11,0.15)'
                  }}
                >
                  {exercise.muscle_emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: exercise.workout_slot === 'A' ? '#a5b4fc' : '#fbbf24'
                      }}
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

      {/* Exercise Modal */}
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
