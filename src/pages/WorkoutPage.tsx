import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '../stores/workoutStore'
import { useProgramStore } from '../stores/programStore'
import { getExercisesByWorkout, getExerciseById } from '../lib/exercises'
import { getBlockForWeek, getRestTime } from '../lib/program'
import RestTimerOverlay from '../components/RestTimerOverlay'
import TempoGuide from '../components/TempoGuide'

export default function WorkoutPage() {
  const navigate = useNavigate()
  const {
    activeWorkout,
    restTimer,
    completeSet,
    startRestTimer,
    tickRestTimer,
    skipRest,
    setCurrentExercise,
    tickElapsed,
    finishWorkout,
    resetWorkout,
    startWorkout
  } = useWorkoutStore()

  const { programState, weights, updateWeight } = useProgramStore()
  const [showTip, setShowTip] = useState<string | null>(null)
  const [inputWeights, setInputWeights] = useState<Record<string, number>>({})
  const [inputReps, setInputReps] = useState<Record<string, number>>({})
  const elapsedRef = useRef<NodeJS.Timeout | null>(null)
  const restRef = useRef<NodeJS.Timeout | null>(null)

  const { block } = getBlockForWeek(programState.total_week)
  const exercises = activeWorkout ? getExercisesByWorkout(activeWorkout.workout_type) : []

  // Initialize if no active workout - start from store
  useEffect(() => {
    if (!activeWorkout) {
      const type = programState.next_workout_type
      const exList = getExercisesByWorkout(type)
      startWorkout(type, programState.total_week, exList, weights, block)
    }
  }, [])

  // Elapsed timer
  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      tickElapsed()
    }, 1000)
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current) }
  }, [])

  // Rest timer tick
  useEffect(() => {
    if (restTimer?.active) {
      restRef.current = setInterval(() => {
        tickRestTimer()
      }, 1000)
    } else {
      if (restRef.current) clearInterval(restRef.current)
    }
    return () => { if (restRef.current) clearInterval(restRef.current) }
  }, [restTimer?.active])

  // Init input weights from workout sets
  useEffect(() => {
    if (activeWorkout) {
      const iw: Record<string, number> = {}
      const ir: Record<string, number> = {}
      activeWorkout.sets.forEach(s => {
        const key = `${s.exercise_id}_${s.set_number}`
        iw[key] = s.weight_kg || weights[s.exercise_id] || 20
        ir[key] = s.target_reps
      })
      setInputWeights(iw)
      setInputReps(ir)
    }
  }, [activeWorkout?.id])

  if (!activeWorkout) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white/50">Загрузка...</div>
      </div>
    )
  }

  const currentExercise = exercises[activeWorkout.currentExerciseIndex]
  const exerciseSets = activeWorkout.sets.filter(s => s.exercise_id === currentExercise?.id)
  const completedSetsCount = exerciseSets.filter(s => s.completed).length
  const totalSetsCount = exerciseSets.length

  const allSetsCompleted = activeWorkout.sets.every(s => s.completed)

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleCompleteSet = (setNumber: number) => {
    if (!currentExercise) return
    const key = `${currentExercise.id}_${setNumber}`
    const w = inputWeights[key] ?? weights[currentExercise.id] ?? 20
    const r = inputReps[key] ?? 10

    completeSet(currentExercise.id, setNumber, r, w)
    updateWeight(currentExercise.id, w)

    // Start rest timer
    startRestTimer(currentExercise.is_compound, activeWorkout.block)
  }

  const handleFinish = async () => {
    const workout = finishWorkout()
    if (workout) {
      navigate('/workout/summary')
    }
  }

  const completedExercises = new Set(
    activeWorkout.sets
      .filter(s => s.completed)
      .map(s => s.exercise_id)
      .filter(id => {
        const allSets = activeWorkout.sets.filter(s => s.exercise_id === id)
        return allSets.every(s => s.completed)
      })
  )

  const totalVolume = activeWorkout.sets
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.weight_kg * s.actual_reps, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24 flex flex-col">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe pb-3"
        style={{
          background: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)`
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full mr-2"
              style={{
                background: activeWorkout.block === 'strength' ? '#f59e0b30' : '#6366f130',
                color: activeWorkout.block === 'strength' ? '#f59e0b' : '#8b5cf6'
              }}
            >
              {activeWorkout.block === 'strength' ? 'Сила' : activeWorkout.block === 'deload' ? 'Разгрузка' : 'Гипертрофия'}
            </span>
            <span className="text-white/40 text-xs">Тренировка {activeWorkout.workout_type}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 font-mono text-sm">
              ⏱ {formatTime(activeWorkout.elapsedSeconds)}
            </span>
            <span className="text-white/40 text-xs">
              ~{Math.round(totalVolume)} кг
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full gradient-primary"
            animate={{
              width: `${(completedExercises.size / exercises.length) * 100}%`
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-xs text-white/40 mt-1">
          {completedExercises.size}/{exercises.length} упражнений
        </p>
      </div>

      {/* Exercise horizontal scroll */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {exercises.map((ex, i) => {
            const isDone = completedExercises.has(ex.id)
            const isCurrent = i === activeWorkout.currentExerciseIndex
            return (
              <button
                key={ex.id}
                onClick={() => setCurrentExercise(i)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: isCurrent
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: isCurrent ? 'none' : `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  minWidth: 64
                }}
              >
                <span className="text-base">{isDone ? '✅' : ex.muscle_emoji}</span>
                <span className="text-xs text-white/70 leading-none text-center" style={{ fontSize: 10 }}>
                  {i + 1}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Current exercise */}
      {currentExercise && (
        <div className="flex-1 px-4">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-5 mb-4"
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white/40">
                    {activeWorkout.currentExerciseIndex + 1}/{exercises.length}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: currentExercise.is_compound ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)',
                      color: currentExercise.is_compound ? '#a5b4fc' : '#fbbf24'
                    }}
                  >
                    {currentExercise.is_compound ? 'Базовое' : 'Изоляция'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{currentExercise.name_ru}</h2>
                <p className="text-white/50 text-sm">{currentExercise.muscle_emoji} {currentExercise.muscle_primary}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-3 mb-4">
              <div className="flex-1 text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-white font-bold">{totalSetsCount}</div>
                <div className="text-white/40 text-xs">подходов</div>
              </div>
              <div className="flex-1 text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-white font-bold">
                  {block === 'strength' && currentExercise.is_compound ? '6-8' : currentExercise.reps}
                </div>
                <div className="text-white/40 text-xs">повторений</div>
              </div>
              <div className="flex-1 text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-white font-bold text-sm">{currentExercise.tempo}</div>
                <div className="text-white/40 text-xs">темп</div>
              </div>
            </div>

            {/* Tempo guide for compound */}
            {currentExercise.is_compound && currentExercise.tempo !== 'свободный' && (
              <TempoGuide tempo={currentExercise.tempo} />
            )}

            {/* Science tip */}
            {currentExercise.tips_ru && (
              <div>
                <button
                  onClick={() => setShowTip(showTip === currentExercise.id ? null : currentExercise.id)}
                  className="flex items-center gap-2 text-indigo-400 text-sm mb-2"
                >
                  <span>💡</span>
                  <span>Научный совет</span>
                  <span className="text-white/30">{showTip === currentExercise.id ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {showTip === currentExercise.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="p-3 rounded-xl text-sm text-white/70 leading-relaxed mb-3"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                      >
                        {currentExercise.tips_ru}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Sets */}
          <div className="space-y-3 mb-4">
            {exerciseSets.map((set) => {
              const key = `${set.exercise_id}_${set.set_number}`
              const w = inputWeights[key] ?? set.weight_kg ?? 20
              const r = inputReps[key] ?? set.target_reps

              return (
                <motion.div
                  key={set.set_number}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-4"
                  style={{
                    borderColor: set.completed
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(255,255,255,0.08)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Set number */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: set.completed
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(255,255,255,0.08)',
                        color: set.completed ? '#10b981' : 'white'
                      }}
                    >
                      {set.completed ? '✓' : set.set_number}
                    </div>

                    {/* Weight */}
                    <div className="flex items-center gap-1.5 flex-1">
                      <button
                        onClick={() => {
                          const newW = Math.max(0, w - currentExercise.increment_kg)
                          setInputWeights(prev => ({ ...prev, [key]: newW }))
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 text-lg"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        disabled={set.completed}
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-white font-bold text-lg">{w}</div>
                        <div className="text-white/30 text-xs">кг</div>
                      </div>
                      <button
                        onClick={() => {
                          const newW = w + currentExercise.increment_kg
                          setInputWeights(prev => ({ ...prev, [key]: newW }))
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 text-lg"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        disabled={set.completed}
                      >
                        +
                      </button>
                    </div>

                    {/* Reps */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const newR = Math.max(1, r - 1)
                          setInputReps(prev => ({ ...prev, [key]: newR }))
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        disabled={set.completed}
                      >
                        −
                      </button>
                      <div className="text-center w-8">
                        <div className="text-white font-bold">{r}</div>
                        <div className="text-white/30 text-xs">повт</div>
                      </div>
                      <button
                        onClick={() => {
                          const newR = r + 1
                          setInputReps(prev => ({ ...prev, [key]: newR }))
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        disabled={set.completed}
                      >
                        +
                      </button>
                    </div>

                    {/* Complete button */}
                    <button
                      onClick={() => !set.completed && handleCompleteSet(set.set_number)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-95 flex-shrink-0"
                      style={{
                        background: set.completed
                          ? 'rgba(16,185,129,0.2)'
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: set.completed ? '#10b981' : 'white'
                      }}
                    >
                      ✓
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mb-4">
            {activeWorkout.currentExerciseIndex > 0 && (
              <button
                onClick={() => setCurrentExercise(activeWorkout.currentExerciseIndex - 1)}
                className="flex-1 py-3 rounded-xl font-semibold text-white/60"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ← Назад
              </button>
            )}
            {activeWorkout.currentExerciseIndex < exercises.length - 1 ? (
              <button
                onClick={() => setCurrentExercise(activeWorkout.currentExerciseIndex + 1)}
                className="flex-1 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Следующее →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                🏁 Завершить тренировку
              </button>
            )}
          </div>

          {allSetsCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <button
                onClick={handleFinish}
                className="w-full py-4 rounded-xl font-bold text-white text-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                🎉 Все подходы выполнены! Завершить
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Rest timer overlay */}
      {restTimer?.active && (
        <RestTimerOverlay
          seconds={restTimer.seconds}
          totalSeconds={restTimer.totalSeconds}
          onSkip={skipRest}
          nextInfo={
            currentExercise
              ? `${currentExercise.name_ru}`
              : ''
          }
        />
      )}
    </div>
  )
}
