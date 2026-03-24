import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_EMOJI, VTAPER_TARGETS } from '../lib/exerciseLibrary'
import { EXERCISES } from '../lib/exercises'
import { useProgramStore } from '../stores/programStore'
import { LibraryExercise, MuscleGroup, Exercise } from '../types'
import ExerciseModal from '../components/ExerciseModal'
import SwapExerciseSheet from '../components/SwapExerciseSheet'

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

// Muscle group accent colors for left border
const MUSCLE_GROUP_COLORS: Record<string, string> = {
  back_width: '#6366f1',
  back_thickness: '#818cf8',
  chest: '#ec4899',
  shoulders_lateral: '#06b6d4',
  shoulders_front: '#0ea5e9',
  shoulders_rear: '#38bdf8',
  legs_quads: '#10b981',
  legs_hamstrings: '#34d399',
  glutes: '#f59e0b',
  biceps: '#f97316',
  triceps: '#fb923c',
  abs: '#a78bfa',
  traps: '#c084fc',
  forearms: '#e879f9',
}

// V-Taper Balance Card — hero element with animated progress bars
function VTaperCard() {
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
      className="mx-5 mb-5 p-5 rounded-3xl"
      style={{
        background: 'linear-gradient(145deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.08) 50%, rgba(10,10,15,0.6) 100%)',
        border: '1px solid rgba(99,102,241,0.28)',
        boxShadow: '0 0 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
            boxShadow: '0 0 12px rgba(99,102,241,0.3)',
          }}
        >
          🏆
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-white font-bold text-sm">V-Тейп покрытие</span>
          <p className="text-white/35 text-xs leading-tight">упражнений в программе</p>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          {vtaperEntries.length} групп
        </div>
      </div>

      <div className="space-y-3">
        {vtaperEntries.map(([group, target]) => {
          const coverage = coverageByGroup[group] ?? { inProgram: 0, total: 0 }
          const pct = coverage.total > 0 ? coverage.inProgram / coverage.total : 0
          const emoji = MUSCLE_GROUP_EMOJI[group] ?? '💪'
          const isHigh = target.priority === 'high'
          const isMedium = target.priority === 'medium'
          const accentColor = MUSCLE_GROUP_COLORS[group] ?? '#6366f1'

          return (
            <div key={group}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm w-5 text-center leading-none">{emoji}</span>
                <span
                  className="text-xs font-semibold flex-1 min-w-0 truncate"
                  style={{
                    color: isHigh ? '#c7d2fe' : isMedium ? '#ddd6fe' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {target.label}
                </span>
                {isHigh && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                  >
                    ★ ключевое
                  </span>
                )}
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: pct >= 0.5 ? '#6ee7b7' : 'rgba(255,255,255,0.35)' }}
                >
                  {coverage.inProgram}/{coverage.total}
                </span>
              </div>
              {/* Animated progress bar */}
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(pct * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                  style={{
                    background: isHigh
                      ? `linear-gradient(90deg, ${accentColor}, #8b5cf6)`
                      : isMedium
                      ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                      : 'rgba(255,255,255,0.2)',
                    boxShadow: isHigh ? `0 0 8px ${accentColor}60` : 'none',
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
  const { weights, customProgram, clearCustomProgram } = useProgramStore()
  const navigate = useNavigate()
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all')
  const [programFilter, setProgramFilter] = useState<'all' | 'in_program'>('all')
  const [selectedLibExercise, setSelectedLibExercise] = useState<LibraryExercise | null>(null)
  const [swapping, setSwapping] = useState<{
    id: string
    slot: 'A' | 'B'
    muscleGroup: string
  } | null>(null)

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
        className="px-5 pb-4 flex items-start justify-between"
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)` }}
      >
        <div>
          <h1 className="text-2xl font-black text-white">Упражнения</h1>
          <p className="text-white/40 text-sm mt-1">{EXERCISE_LIBRARY.length} упражнений в библиотеке</p>
        </div>
        <button
          onClick={() => navigate('/program-builder')}
          className="text-xs px-3 py-1.5 rounded-xl font-semibold mt-1"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
        >
          🛠 Конструктор
        </button>
      </div>

      {/* V-Taper Balance Card */}
      <VTaperCard />

      {/* Custom program active banner */}
      {customProgram && (
        <div
          className="mx-5 mb-3 flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <span className="text-indigo-300 text-sm font-medium">✏️ Используется своя программа</span>
          <button
            onClick={clearCustomProgram}
            className="text-xs text-white/50 underline"
          >
            Сбросить
          </button>
        </div>
      )}

      {/* Sticky filters */}
      <div
        className="sticky top-0 z-10 px-5 pb-3 pt-2"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 70%, transparent 100%)' }}
      >
        {/* Row 1: muscle group chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setMuscleFilter('all')}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: muscleFilter === 'all'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.06)',
              color: muscleFilter === 'all' ? 'white' : 'rgba(255,255,255,0.5)',
              border: muscleFilter === 'all'
                ? '1px solid transparent'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: muscleFilter === 'all' ? '0 0 12px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            Все
          </motion.button>
          {muscleGroups.map(group => {
            const isActive = muscleFilter === group
            const accentColor = MUSCLE_GROUP_COLORS[group] ?? '#6366f1'
            return (
              <motion.button
                key={group}
                whileTap={{ scale: 0.94 }}
                onClick={() => setMuscleFilter(group)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  border: isActive
                    ? '1px solid transparent'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? `0 0 12px ${accentColor}50` : 'none',
                }}
              >
                {MUSCLE_GROUP_EMOJI[group]} {MUSCLE_GROUP_LABELS[group]}
              </motion.button>
            )
          })}
        </div>

        {/* Row 2: program toggle */}
        <div className="flex gap-2">
          {(['all', 'in_program'] as const).map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.96 }}
              onClick={() => setProgramFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: programFilter === f ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)',
                color: programFilter === f ? '#fbbf24' : 'rgba(255,255,255,0.45)',
                border: programFilter === f
                  ? '1px solid rgba(245,158,11,0.35)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: programFilter === f ? '0 0 10px rgba(245,158,11,0.15)' : 'none',
              }}
            >
              {f === 'all' ? 'Все упражнения' : '✓ В программе'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section subtitle */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <span className="text-white/30 text-xs font-medium">
          Показано: {filtered.length} упражнений
        </span>
        {muscleFilter !== 'all' && (
          <span className="text-xs font-semibold" style={{ color: MUSCLE_GROUP_COLORS[muscleFilter] ?? '#a5b4fc' }}>
            {MUSCLE_GROUP_EMOJI[muscleFilter]} {MUSCLE_GROUP_LABELS[muscleFilter]}
          </span>
        )}
      </div>

      {/* Exercise list */}
      <div className="px-5 grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((exercise, i) => {
            const inProgram = programExerciseIds.has(exercise.id)
            const videoCount = 1 + exercise.altVideos.length
            const isCompound = exercise.is_compound
            const accentColor = MUSCLE_GROUP_COLORS[exercise.muscle_group] ?? '#6366f1'

            return (
              <motion.div
                key={exercise.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedLibExercise(exercise)}
                className="cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '14px 16px 14px 0',
                  display: 'flex',
                  boxShadow: inProgram ? '0 2px 12px rgba(99,102,241,0.07)' : 'none',
                }}
              >
                {/* Left color accent border */}
                <div
                  className="flex-shrink-0 w-1 rounded-r-full mr-4 self-stretch"
                  style={{
                    background: isCompound
                      ? `linear-gradient(180deg, ${accentColor}, ${accentColor}60)`
                      : 'linear-gradient(180deg, #f59e0b, #f59e0b60)',
                    marginLeft: 0,
                    minHeight: 40,
                  }}
                />

                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  {/* Emoji circle */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{
                      background: isCompound
                        ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}10)`
                        : 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))',
                      border: `1px solid ${isCompound ? `${accentColor}25` : 'rgba(245,158,11,0.2)'}`,
                    }}
                  >
                    {exercise.muscle_emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight truncate">
                      {exercise.name_ru}
                    </p>
                    <p className="text-white/30 text-xs truncate mt-0.5 font-medium tracking-wide uppercase">
                      {exercise.name_en}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-white/40 text-xs">
                        {MUSCLE_GROUP_EMOJI[exercise.muscle_group]} {MUSCLE_GROUP_LABELS[exercise.muscle_group]}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isCompound ? `${accentColor}18` : 'rgba(245,158,11,0.12)',
                          color: isCompound ? accentColor : '#f59e0b',
                        }}
                      >
                        {isCompound ? 'Базовое' : 'Изоляция'}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {inProgram && (
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(16,185,129,0.15)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          boxShadow: '0 0 8px rgba(16,185,129,0.15)',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[10px] font-bold" style={{ color: '#34d399' }}>
                          В программе
                        </span>
                      </div>
                    )}
                    {inProgram && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const slotA = customProgram?.A ?? EXERCISES.filter(ex => ex.workout_slot === 'A').map(ex => ex.id)
                          const slot = slotA.includes(exercise.id) ? 'A' : 'B'
                          setSwapping({ id: exercise.id, slot, muscleGroup: exercise.muscle_group })
                        }}
                        className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                      >
                        ⇄
                      </button>
                    )}
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.2)',
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <polygon points="3,1 8,4.5 3,8" fill="#818cf8" />
                      </svg>
                      <span className="text-[10px] font-semibold" style={{ color: '#818cf8' }}>
                        {videoCount}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 flex flex-col items-center gap-3"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              🔍
            </div>
            <p className="text-white/50 text-sm font-semibold">Упражнения не найдены</p>
            <p className="text-white/25 text-xs">Попробуйте изменить фильтры</p>
          </motion.div>
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

      {/* Swap Exercise Sheet */}
      {swapping && (
        <SwapExerciseSheet
          isOpen={!!swapping}
          onClose={() => setSwapping(null)}
          exerciseId={swapping.id}
          slot={swapping.slot}
          muscleGroup={swapping.muscleGroup}
        />
      )}
    </div>
  )
}
