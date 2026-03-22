import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EXERCISES } from '../lib/exercises'
import { useProgramStore } from '../stores/programStore'
import { Exercise } from '../types'

const MUSCLE_FILTERS = ['Все', 'Широчайшие', 'Спина', 'Грудь', 'Дельты', 'Ноги', 'Бицепс', 'Пресс']

// ExerciseDB API search terms mapped to our exercise IDs
const EXERCISE_SEARCH_TERMS: Record<string, string> = {
  lat_pulldown: 'lat pulldown',
  chest_press: 'chest press',
  shoulder_press: 'shoulder press',
  shoulder_press_b: 'shoulder press',
  incline_pec_fly: 'pec deck',
  cable_lateral_raise: 'cable lateral raise',
  cable_lateral_raise_b: 'cable lateral raise',
  leg_press: 'leg press',
  seated_leg_curl: 'seated leg curl',
  abdominal_crunch: 'crunch',
  abdominal_crunch_b: 'crunch',
  pull_over: 'pullover',
  linear_back_row: 'seated cable row',
  leg_extension: 'leg extension',
  ham_curl: 'lying leg curl',
  biceps_curl: 'bicep curl',
}

// Cache for fetched GIF URLs
const gifCache: Record<string, string | null> = {}

async function fetchExerciseGif(exerciseId: string): Promise<string | null> {
  if (exerciseId in gifCache) return gifCache[exerciseId]

  const searchTerm = EXERCISE_SEARCH_TERMS[exerciseId]
  if (!searchTerm) {
    gifCache[exerciseId] = null
    return null
  }

  try {
    const encoded = encodeURIComponent(searchTerm)
    const url = `https://exercisedb-api.vercel.app/api/v1/exercises?search=${encoded}&limit=1&offset=0`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('API error')
    const json = await res.json()

    // The API returns { data: { exercises: [...] } } or similar
    const exercises = json?.data?.exercises ?? json?.exercises ?? json?.data ?? []
    const first = Array.isArray(exercises) ? exercises[0] : null
    const gifUrl = first?.gifUrl ?? first?.gif_url ?? null

    gifCache[exerciseId] = gifUrl
    return gifUrl
  } catch {
    gifCache[exerciseId] = null
    return null
  }
}

function useExerciseGif(exerciseId: string, enabled: boolean) {
  const [gifUrl, setGifUrl] = useState<string | null>(gifCache[exerciseId] ?? null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    if (gifCache[exerciseId] !== undefined) {
      setGifUrl(gifCache[exerciseId])
      return
    }
    setLoading(true)
    fetchExerciseGif(exerciseId).then(url => {
      setGifUrl(url)
      setLoading(false)
    })
  }, [exerciseId, enabled])

  return { gifUrl, loading }
}

interface ExerciseModalProps {
  exercise: Exercise
  currentWeight: number
  onClose: () => void
}

function ExerciseModal({ exercise, currentWeight, onClose }: ExerciseModalProps) {
  const { gifUrl, loading } = useExerciseGif(exercise.id, true)

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
              {exercise.name_en && (
                <p className="text-white/30 text-xs font-medium tracking-widest uppercase mt-0.5">{exercise.name_en}</p>
              )}
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

          {/* GIF / Visual */}
          <div
            className="w-full rounded-2xl flex items-center justify-center mb-5 overflow-hidden"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              minHeight: 160,
              maxHeight: 240
            }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/40 text-xs">Загрузка анимации...</span>
              </div>
            ) : gifUrl ? (
              <img
                src={gifUrl}
                alt={exercise.name_ru}
                className="w-full object-contain"
                style={{ maxHeight: 240 }}
              />
            ) : (
              <span className="text-7xl py-8">{exercise.muscle_emoji}</span>
            )}
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
            className="p-4 rounded-xl mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p className="text-indigo-400 text-xs font-semibold mb-2 uppercase tracking-wider">💡 Научный совет</p>
            <p className="text-white/80 text-sm leading-relaxed">{exercise.tips_ru}</p>
          </div>

          {/* Instagram video link */}
          {exercise.instagramUrl && (
            <a
              href={exercise.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
              style={{
                background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                color: 'white'
              }}
            >
              <span>▶</span>
              <span>Смотреть технику на @appyoucan</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Thumbnail GIF shown on exercise card (lazy-loaded on demand)
function ExerciseThumbnail({ exerciseId, emoji, colorSlot }: {
  exerciseId: string
  emoji: string
  colorSlot: 'A' | 'B'
}) {
  const [hovered, setHovered] = useState(false)
  const { gifUrl, loading } = useExerciseGif(exerciseId, hovered)

  const bg = colorSlot === 'A' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)'

  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: bg }}
      onMouseEnter={() => setHovered(true)}
      onTouchStart={() => setHovered(true)}
    >
      {hovered && gifUrl ? (
        <img src={gifUrl} alt="" className="w-full h-full object-cover" />
      ) : loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
      ) : (
        <span className="text-2xl">{emoji}</span>
      )}
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
                <ExerciseThumbnail
                  exerciseId={exercise.id}
                  emoji={exercise.muscle_emoji}
                  colorSlot={exercise.workout_slot}
                />

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
