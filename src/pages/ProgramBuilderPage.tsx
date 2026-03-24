import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { EXERCISES } from '../lib/exercises'
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_EMOJI, VTAPER_TARGETS } from '../lib/exerciseLibrary'
import { CustomProgram, MuscleGroup } from '../types'

export default function ProgramBuilderPage() {
  const navigate = useNavigate()
  const { customProgram, saveCustomProgram } = useProgramStore()

  // Initialize draft from custom program or defaults
  const [draft, setDraft] = useState<CustomProgram>(() => {
    if (customProgram) return { ...customProgram }
    return {
      A: EXERCISES.filter(e => e.workout_slot === 'A')
                 .sort((a, b) => a.exercise_order - b.exercise_order)
                 .map(e => e.id),
      B: EXERCISES.filter(e => e.workout_slot === 'B')
                 .sort((a, b) => a.exercise_order - b.exercise_order)
                 .map(e => e.id),
      createdAt: new Date().toISOString(),
    }
  })

  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A')
  const [muscleFilter, setMuscleFilter] = useState<string>('all')

  // Current slot exercise IDs
  const currentIds = draft[activeSlot]

  // All exercise IDs in both slots
  const allDraftIds = new Set([...draft.A, ...draft.B])

  // Get exercise display data by ID
  const getExerciseData = (id: string) => {
    const libEx = EXERCISE_LIBRARY.find(e => e.id === id)
    if (libEx) return { name_ru: libEx.name_ru, emoji: libEx.muscle_emoji, muscle_group: libEx.muscle_group }
    const defEx = EXERCISES.find(e => e.id === id || e.id === id.replace(/_b$/, ''))
    if (defEx) return { name_ru: defEx.name_ru, emoji: defEx.muscle_emoji, muscle_group: '' }
    return { name_ru: id, emoji: '💪', muscle_group: '' }
  }

  // Live muscle balance for current slot
  const balance = useMemo(() => {
    const coverage: Partial<Record<MuscleGroup, number>> = {}
    currentIds.forEach(id => {
      const libEx = EXERCISE_LIBRARY.find(e => e.id === id)
      if (libEx) {
        coverage[libEx.muscle_group] = (coverage[libEx.muscle_group] || 0) + 1
      }
    })
    return coverage
  }, [currentIds])

  const addExercise = (id: string) => {
    if (currentIds.includes(id)) return
    setDraft(prev => ({ ...prev, [activeSlot]: [...prev[activeSlot], id] }))
  }

  const removeExercise = (id: string) => {
    setDraft(prev => ({ ...prev, [activeSlot]: prev[activeSlot].filter(x => x !== id) }))
  }

  const handleSave = () => {
    saveCustomProgram(draft)
    navigate('/exercises')
  }

  // Filtered library
  const filteredLibrary = EXERCISE_LIBRARY.filter(ex =>
    muscleFilter === 'all' || ex.muscle_group === muscleFilter
  )

  // Get unique muscle groups from library
  const muscleGroups = [...new Set(EXERCISE_LIBRARY.map(e => e.muscle_group))]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-32">
      {/* Header */}
      <div
        className="px-5 pb-4"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.12) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 16px)`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            ←
          </button>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider">Настройки</p>
            <h1 className="text-xl font-black text-white">Конструктор программы</h1>
          </div>
        </div>

        {/* A/B Tabs */}
        <div className="flex gap-2">
          {(['A', 'B'] as const).map(slot => (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className="flex-1 py-3 rounded-2xl font-bold text-lg transition-all"
              style={{
                background: activeSlot === slot
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.06)',
                color: activeSlot === slot ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow: activeSlot === slot ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              Тренировка {slot}
              <span className="ml-2 text-sm font-normal opacity-70">
                {draft[slot].length} упр.
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Balance indicator */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Баланс мышечных групп</p>
          <div className="space-y-2">
            {Object.entries(VTAPER_TARGETS)
              .filter(([key]) => key in balance || (balance[key as MuscleGroup] ?? 0) < 2)
              .slice(0, 6)
              .map(([key, target]) => {
                const count = balance[key as MuscleGroup] ?? 0
                const pct = Math.min(100, (count / Math.max(1, target.target / 4)) * 100)
                const isHigh = target.priority === 'high'
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-base w-6">{MUSCLE_GROUP_EMOJI[key as MuscleGroup]}</span>
                    <span className="text-white/60 text-xs w-28 truncate">
                      {MUSCLE_GROUP_LABELS[key as MuscleGroup]}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: `${pct}%` }}
                        style={{
                          background: pct > 50
                            ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                            : isHigh ? '#ef4444' : 'rgba(255,255,255,0.2)'
                        }}
                      />
                    </div>
                    <span className="text-white/40 text-xs w-4 text-right">{count}</span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Current slot exercises */}
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
            В тренировке {activeSlot} ({currentIds.length})
          </p>
          {currentIds.length === 0 ? (
            <div
              className="py-6 text-center rounded-2xl"
              style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <p className="text-white/30 text-sm">Добавь упражнения ниже</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentIds.map((id, index) => {
                const ex = getExerciseData(id)
                return (
                  <motion.div
                    key={id}
                    layout
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-white/40 text-sm w-5">{index + 1}</span>
                    <span className="text-xl">{ex.emoji}</span>
                    <span className="flex-1 text-white text-sm font-medium">{ex.name_ru}</span>
                    <button
                      onClick={() => removeExercise(id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      ✕
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add exercises section */}
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Добавить упражнение</p>

          {/* Muscle group filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            <button
              onClick={() => setMuscleFilter('all')}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: muscleFilter === 'all' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: muscleFilter === 'all' ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              Все
            </button>
            {muscleGroups.map(mg => (
              <button
                key={mg}
                onClick={() => setMuscleFilter(mg)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: muscleFilter === mg ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                  color: muscleFilter === mg ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                }}
              >
                {MUSCLE_GROUP_EMOJI[mg as MuscleGroup]} {MUSCLE_GROUP_LABELS[mg as MuscleGroup]}
              </button>
            ))}
          </div>

          {/* Library cards */}
          <div className="space-y-2">
            {filteredLibrary.map(ex => {
              const isInCurrent = currentIds.includes(ex.id)
              const isInOther = !isInCurrent && allDraftIds.has(ex.id)
              return (
                <motion.button
                  key={ex.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isInCurrent && addExercise(ex.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
                  style={{
                    background: isInCurrent
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: isInCurrent
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                    cursor: isInCurrent ? 'default' : 'pointer',
                  }}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: isInCurrent ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)' }}
                  >
                    {ex.muscle_emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{ex.name_ru}</p>
                    <p className="text-white/40 text-xs truncate">{ex.name_en}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isInOther && (
                      <span className="text-xs text-amber-400/70">
                        {draft.A.includes(ex.id) ? 'A' : 'B'}
                      </span>
                    )}
                    {isInCurrent ? (
                      <span className="text-indigo-400 text-lg">✓</span>
                    ) : (
                      <span className="text-white/20 text-lg">+</span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky save button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4"
        style={{
          background: 'linear-gradient(0deg, rgba(10,10,15,1) 60%, transparent 100%)',
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)`
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
          }}
        >
          💾 Сохранить программу
        </motion.button>
      </div>
    </div>
  )
}
