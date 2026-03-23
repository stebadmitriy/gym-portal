import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_EMOJI, VTAPER_TARGETS } from '../lib/exerciseLibrary'
import { EXERCISES } from '../lib/exercises'
import { useProgramStore } from '../stores/programStore'
import { LibraryExercise, MuscleGroup, Exercise } from '../types'
import ExerciseModal from '../components/ExerciseModal'

// Strip _b suffix to normalize program exercise IDs against library IDs
const programExerciseIds = new Set(EXERCISES.map(ex => ex.id.replace(/_b$/, '')))

function libExerciseToExercise(ex: LibraryExercise): Exercise {
  return {
    id: ex.id,
    name_ru: ex.name_ru,
    name_en: ex.name_en,
    muscle_primary: MUSCLE_GROUP_LABELS[ex.muscle_group] ?? ex.muscle_group,
    is_compound: ex.is_compound,
    increment_kg: 0,
    tempo: '3-1-1',
    workout_slot: 'A',
    exercise_order: 0,
    tips_ru: ex.tips_ru,
    sets: 3,
    reps: '8-12',
    muscle_emoji: ex.muscle_emoji,
    instagramUrl: ex.primaryVideo.url,
    alternatives: ex.altVideos.map(v => v.url),
  }
}

// V-Taper Balance Card
function VTaperCard() {
  // Build coverage data per muscle group
  const coverageByGroup = useMemo(() => {
    const result: Record<string, { inProgram: number; total: number }> = {}
    for (const ex of EXERCISE_LIBRARY) {
      const g = ex.muscle_group
      if (!result[g]) result[g] = { inProgram: 0, total: 0 }
      result[g].total++
      if (programExerciseIds.has(ex.id)) result[g].inProgram++
    }
    return result
  }, [])

  const vtaperEntries = Object.entries(VTAPER_TARGETS).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a[1].priority] - priorityOrder[b[1].priority]
  })

  return (
    <div
      className="mx-5 mb-4 p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏆</span>
        <span className="text-white font-bold text-sm">V-Тейп покрытие</span>
        <span className="text-white/40 text-xs ml-auto">упражнений в программе</span>
      </div>

      <div className="space-y-2">
        {vtaperEntries.map(([group, target]) => {
          const coverage = coverageByGroup[group] ?? { inProgram: 0, total: 0 }
          const pct = coverage.total > 0 ? coverage.inProgram / coverage.total : 0
          const emoji = MUSCLE_GROUP_EMOJI[group] ?? '💪'
          const isHigh = target.priority === 'high'
          const isMedium = target.priority === 'medium'

          return (
            <div key={group}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm w-5 text-center">{emoji}</span>
                <span
                  className="text-xs font-semibold flex-1 min-w-0 truncate"
                  style={{ color: isHigh ? '#a5b4fc' : isMedium ? '#c4b5fd' : 'rgba(255,255,255,0.5)' }}
                >
                  {target.label}
                </span>
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {coverage.inProgram}/{coverage.total}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(pct * 100)}%`,
                    background: isHigh
                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      : isMedium
                      ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ExercisesPage() {
  const { weights } = useProgramStore()
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all')
  const [programFilter, setProgramFilter] = useState<'all' | 'in_program'>('all')
  const [selectedLibExercise, setSelectedLibExercise] = useState<LibraryExercise | null>(null)

  const muscleGroups = useMemo(
    () => Array.from(new Set(EXERCISE_LIBRARY.map(ex => ex.muscle_group))),
    []
  )

  const filtered = useMemo(() => {
    return EXERCISE_LIBRARY.filter(ex => {
      const muscleMatch = muscleFilter === 'all' || ex.muscle_group === muscleFilter
      const programMatch = programFilter === 'all' || programExerciseIds.has(ex.id)
      return muscleMatch && programMatch
    })
  }, [muscleFilter, programFilter])

  const selectedAsExercise = useMemo(
    () => (selectedLibExercise ? libExerciseToExercise(selectedLibExercise) : null),
    [selectedLibExercise]
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header */}
      <div
        className="px-5 pb-4"
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)` }}
      >
        <h1 className="text-2xl font-black text-white">Упражнения</h1>
        <p className="text-white/40 text-sm mt-1">{EXERCISE_LIBRARY.length} упражнений в библиотеке</p>
      </div>

      {/* V-Taper Balance Card */}
      <VTaperCard />

      {/* Filters */}
      <div className="px-5 mb-4">
        {/* Row 1: muscle group chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
          <button
            onClick={() => setMuscleFilter('all')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: muscleFilter === 'all' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              color: muscleFilter === 'all' ? 'white' : 'rgba(255,255,255,0.5)',
              border: muscleFilter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Все
          </button>
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setMuscleFilter(group)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: muscleFilter === group ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: muscleFilter === group ? 'white' : 'rgba(255,255,255,0.5)',
                border: muscleFilter === group ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {MUSCLE_GROUP_EMOJI[group]} {MUSCLE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>

        {/* Row 2: program toggle */}
        <div className="flex gap-2">
          {(['all', 'in_program'] as const).map(f => (
            <button
              key={f}
              onClick={() => setProgramFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: programFilter === f ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                color: programFilter === f ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                border: programFilter === f ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {f === 'all' ? 'Все упражнения' : 'В программе'}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-5 grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((exercise, i) => {
            const inProgram = programExerciseIds.has(exercise.id)
            const videoCount = 1 + exercise.altVideos.length
            const isCompound = exercise.is_compound

            return (
              <motion.div
                key={exercise.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                onClick={() => setSelectedLibExercise(exercise)}
                className="cursor-pointer active:scale-[0.98] transition-transform"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '14px 16px',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Emoji circle */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{
                      background: isCompound
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(245,158,11,0.15)',
                    }}
                  >
                    {exercise.muscle_emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight truncate">
                      {exercise.name_ru}
                    </p>
                    <p className="text-white/35 text-xs truncate mt-0.5">
                      {exercise.name_en}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {MUSCLE_GROUP_EMOJI[exercise.muscle_group]} {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                      <span className="ml-2 text-white/25">
                        {isCompound ? 'Базовое' : 'Изоляция'}
                      </span>
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {inProgram && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(99,102,241,0.2)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.3)',
                        }}
                      >
                        В программе
                      </span>
                    )}
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      ◎ {videoCount}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">
            Упражнения не найдены
          </div>
        )}
      </div>

      {/* Exercise Modal */}
      <AnimatePresence>
        {selectedLibExercise && selectedAsExercise && (
          <ExerciseModal
            exercise={selectedAsExercise}
            currentWeight={weights[selectedLibExercise.id] || 0}
            onClose={() => setSelectedLibExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
