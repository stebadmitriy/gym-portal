import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramStore } from '../stores/programStore'
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_EMOJI } from '../lib/exerciseLibrary'
import { EXERCISES } from '../lib/exercises'
import { WorkoutType } from '../types'

interface SwapExerciseSheetProps {
  isOpen: boolean
  onClose: () => void
  exerciseId: string
  slot: WorkoutType
  muscleGroup: string
}

export default function SwapExerciseSheet({
  isOpen,
  onClose,
  exerciseId,
  slot,
  muscleGroup,
}: SwapExerciseSheetProps) {
  const { customProgram, swapExercise } = useProgramStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Reset selected when sheet opens/closes
  useEffect(() => {
    if (!isOpen) setSelectedId(null)
  }, [isOpen])

  const programIds = new Set([
    ...(customProgram?.A ?? EXERCISES.filter(e => e.workout_slot === 'A').map(e => e.id)),
    ...(customProgram?.B ?? EXERCISES.filter(e => e.workout_slot === 'B').map(e => e.id)),
    ...(customProgram?.C ?? EXERCISES.filter(e => e.workout_slot === 'C').map(e => e.id)),
  ])

  const alternatives = EXERCISE_LIBRARY.filter(ex => ex.muscle_group === muscleGroup)

  const muscleEmoji = MUSCLE_GROUP_EMOJI[muscleGroup] ?? '💪'
  const muscleLabel = MUSCLE_GROUP_LABELS[muscleGroup] ?? muscleGroup

  const selectedExercise = selectedId
    ? EXERCISE_LIBRARY.find(ex => ex.id === selectedId)
    : null

  const handleConfirm = () => {
    if (!selectedId) return
    swapExercise(slot, exerciseId, selectedId)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              maxHeight: '85vh',
              background: '#0f0f1a',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
              <div>
                <h2 className="text-white font-black text-lg leading-tight">
                  Заменить упражнение
                </h2>
                <p className="text-white/50 text-sm mt-0.5">
                  {muscleEmoji} {muscleLabel}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* Divider */}
            <div
              className="mx-5 flex-shrink-0"
              style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ overscrollBehavior: 'contain' }}>
              <AnimatePresence mode="wait">
                {selectedId && selectedExercise ? (
                  /* Confirmation step */
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-white/50 text-sm mb-4">
                      Вы хотите заменить текущее упражнение на:
                    </p>

                    {/* Selected exercise preview */}
                    <div
                      className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                      style={{
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.2)' }}
                      >
                        {selectedExercise.muscle_emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-base leading-tight">
                          {selectedExercise.name_ru}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {selectedExercise.name_en}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConfirm}
                        className="w-full py-4 rounded-2xl font-bold text-white text-base"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                        }}
                      >
                        Заменить
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedId(null)}
                        className="w-full py-4 rounded-2xl font-semibold text-white/70 text-base"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        Назад
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* Exercise list */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {alternatives.map(ex => {
                      const isCurrent = ex.id === exerciseId
                      const isInProgram = !isCurrent && programIds.has(ex.id)

                      return (
                        <motion.button
                          key={ex.id}
                          whileTap={isCurrent ? {} : { scale: 0.98 }}
                          onClick={() => {
                            if (!isCurrent) setSelectedId(ex.id)
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                          style={{
                            background: isCurrent
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(255,255,255,0.04)',
                            border: isCurrent
                              ? '1px solid rgba(255,255,255,0.06)'
                              : '1px solid rgba(255,255,255,0.06)',
                            opacity: isCurrent ? 0.5 : 1,
                            cursor: isCurrent ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {/* Emoji circle */}
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{
                              background: isCurrent
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(99,102,241,0.15)',
                            }}
                          >
                            {ex.muscle_emoji}
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm leading-tight">
                              {ex.name_ru}
                            </p>
                            <p className="text-white/40 text-xs mt-0.5 truncate">
                              {ex.name_en}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {isCurrent && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{
                                  background: 'rgba(99,102,241,0.2)',
                                  color: '#a5b4fc',
                                  border: '1px solid rgba(99,102,241,0.3)',
                                }}
                              >
                                Текущее
                              </span>
                            )}
                            {isInProgram && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{
                                  background: 'rgba(245,158,11,0.15)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245,158,11,0.25)',
                                }}
                              >
                                Уже в программе
                              </span>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Safe area bottom padding */}
            <div style={{ height: 'env(safe-area-inset-bottom, 16px)', flexShrink: 0 }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
