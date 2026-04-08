import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '../stores/workoutStore'
import { useProgramStore } from '../stores/programStore'
import { getExercisesByWorkout, getExercisesForWorkout } from '../lib/exercises'
import { getBlockForWeek, getRestTime, getWorkoutEstimates } from '../lib/program'
import { Exercise, WorkoutType } from '../types'
import RestTimerOverlay from '../components/RestTimerOverlay'
import TempoGuide from '../components/TempoGuide'
import ExerciseModal from '../components/ExerciseModal'

type WorkoutPhase = 'preview' | 'active' | 'finished'

// YouTube helpers
function isYouTubeShorts(url: string): boolean {
  return url.includes('youtube.com/shorts/')
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  let match = url.match(/youtube\.com\/watch\?(?:.*&)?v=([^&]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?loop=1&playlist=${match[1]}&rel=0&modestbranding=1`
  match = url.match(/youtube\.com\/shorts\/([^?&/]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?loop=1&playlist=${match[1]}&rel=0&modestbranding=1`
  match = url.match(/youtu\.be\/([^?&/]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?loop=1&playlist=${match[1]}&rel=0&modestbranding=1`
  return null
}

// Inline alternative exercise data for exercises not in the main list
const ALTERNATIVE_EXERCISES: Record<string, { name_ru: string; muscle_primary: string; tips_ru: string }> = {
  squat: { name_ru: 'Приседания', muscle_primary: 'Квадрицепсы', tips_ru: 'Стопы на ширине плеч, спина прямая, опускаться до параллели с полом.' },
  split_squat: { name_ru: 'Болгарские выпады', muscle_primary: 'Квадрицепсы + Ягодицы', tips_ru: 'Одна нога сзади на скамье. Опускай колено до пола контролируемо.' },
  hack_squat: { name_ru: 'Гак-приседания', muscle_primary: 'Квадрицепсы', tips_ru: 'Стопы узко, спина прижата к платформе. Колени не заходят за носки.' },
  rdl: { name_ru: 'Румынская становая', muscle_primary: 'Бицепс бедра', tips_ru: 'Спина прямая, тяни таз назад. Чувствуй растяжение в задней части бедра.' },
  hammer_curl: { name_ru: 'Молотковые сгибания', muscle_primary: 'Бицепс + Брахиалис', tips_ru: 'Нейтральный хват (ладони друг к другу). Не качай корпус.' },
  cable_curl: { name_ru: 'Сгибания на кабеле', muscle_primary: 'Бицепс', tips_ru: 'Локти фиксированы, полный диапазон движения. Контролируй опускание.' },
  cable_row: { name_ru: 'Тяга кабеля сидя', muscle_primary: 'Средняя спина', tips_ru: 'Тяни локти назад, лопатки своди в конце движения. Спина прямая.' },
  push_up: { name_ru: 'Отжимания', muscle_primary: 'Грудь + Трицепс', tips_ru: 'Тело прямое как доска. Локти под углом 45° к телу, не в стороны.' },
  cable_fly: { name_ru: 'Разводка на кабеле', muscle_primary: 'Грудь', tips_ru: 'Руки слегка согнуты, движение по дуге. Чувствуй растяжение в груди.' },
  dumbbell_press: { name_ru: 'Жим гантелей', muscle_primary: 'Дельты', tips_ru: 'Локти под углом 90°, не заваливай запястья. Полный диапазон.' },
  arnold_press: { name_ru: 'Жим Арнольда', muscle_primary: 'Дельты (все головки)', tips_ru: 'Начинай с ладонями к себе, в верхней точке разворачивай наружу.' },
  dumbbell_lateral: { name_ru: 'Разводки гантелями', muscle_primary: 'Боковые дельты', tips_ru: 'Небольшой наклон вперёд, локоть чуть согнут. Поднимай до уровня плеча.' },
  wall_sit: { name_ru: 'Стульчик у стены', muscle_primary: 'Квадрицепсы', tips_ru: 'Спина прямая к стене, колени 90°. Держи позицию 30–60 секунд.' },
  tricep_pushdown: { name_ru: 'Разгибание трицепса на кабеле', muscle_primary: 'Трицепс', tips_ru: 'Локти прижаты к телу. Полное разгибание в нижней точке.' },
  straight_arm_pulldown: { name_ru: 'Тяга прямыми руками', muscle_primary: 'Широчайшие', tips_ru: 'Руки прямые, небольшой наклон вперёд. Тяни руки к бёдрам через дугу.' },
  dumbbell_row: { name_ru: 'Тяга гантели в наклоне', muscle_primary: 'Широчайшие + Средняя спина', tips_ru: 'Колено и рука на скамье. Тяни локоть вверх и назад.' },
  low_row: { name_ru: 'Тяга нижнего блока узким хватом', muscle_primary: 'Средняя спина', tips_ru: 'Узкий нейтральный хват, локти вдоль тела. Лопатки сводить в конце.' },
  rocky_pulldown: { name_ru: 'Тяга "Роки"', muscle_primary: 'Широчайшие', tips_ru: 'Чередующийся хват, каждый повтор — поочерёдно левый/правый локоть ведущий.' },
  assisted_pullup: { name_ru: 'Подтягивания в гравитроне', muscle_primary: 'Широчайшие', tips_ru: 'Хват на ширине плеч. Тяни лопатки вниз перед движением.' },
}

// Resolve alternative: check main EXERCISES first, then inline data
function resolveAlternative(id: string, mainExercises: Exercise[]): { id: string; name_ru: string; muscle_primary: string; tips_ru: string } | null {
  const found = mainExercises.find(e => e.id === id)
  if (found) return { id: found.id, name_ru: found.name_ru, muscle_primary: found.muscle_primary, tips_ru: found.tips_ru }
  const inline = ALTERNATIVE_EXERCISES[id]
  if (inline) return { id, ...inline }
  return null
}

export default function WorkoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const urlSlot = (new URLSearchParams(location.search).get('slot') as WorkoutType) || null
  const {
    activeWorkout,
    restTimer,
    completeSet,
    updateSet,
    startRestTimer,
    tickRestTimer,
    skipRest,
    setCurrentExercise,
    tickElapsed,
    finishWorkout,
    resetWorkout,
    startWorkout
  } = useWorkoutStore()

  const { programState, weights, updateWeight, customProgram } = useProgramStore()
  const [workoutPhase, setWorkoutPhase] = useState<WorkoutPhase>('preview')
  const [showTip, setShowTip] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(true)
  const [showAltVideos, setShowAltVideos] = useState(false)
  const [activeAltVideoIndex, setActiveAltVideoIndex] = useState(0)
  const [showGif, setShowGif] = useState(true)
  const [gifLoaded, setGifLoaded] = useState<Record<string, boolean>>({})
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swappedExercises, setSwappedExercises] = useState<Record<number, Exercise>>({})
  const [swapToast, setSwapToast] = useState(false)
  const [inputWeights, setInputWeights] = useState<Record<string, number>>({})
  const [inputReps, setInputReps] = useState<Record<string, number>>({})
  const [selectedPreviewExercise, setSelectedPreviewExercise] = useState<Exercise | null>(null)
  const elapsedRef = useRef<NodeJS.Timeout | null>(null)
  const restRef = useRef<NodeJS.Timeout | null>(null)

  const { block, weekInBlock, blockInfo } = getBlockForWeek(programState.total_week)
  const workoutType = (activeWorkout?.workout_type || urlSlot || programState.next_workout_type) as WorkoutType
  const previewExercises = getExercisesForWorkout(workoutType, customProgram)
  const estimates = getWorkoutEstimates(workoutType, block)

  // Compute effective exercises list (with swaps applied)
  const baseExercises = activeWorkout ? getExercisesForWorkout(activeWorkout.workout_type, customProgram) : previewExercises
  const exercises = baseExercises.map((ex, i) => swappedExercises[i] ?? ex)

  // Initialize workout on mount (but don't start elapsed timer yet)
  useEffect(() => {
    if (!activeWorkout) {
      const type = urlSlot || programState.next_workout_type
      const exList = getExercisesForWorkout(type, customProgram)
      startWorkout(type, programState.total_week, exList, weights, block)
    }
  }, [])

  // Elapsed timer — only when active
  useEffect(() => {
    if (workoutPhase !== 'active') return
    elapsedRef.current = setInterval(() => {
      tickElapsed()
    }, 1000)
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current) }
  }, [workoutPhase])

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

  const currentExerciseIndex = activeWorkout.currentExerciseIndex
  const currentExercise = exercises[currentExerciseIndex]
  const exerciseSets = activeWorkout.sets.filter(s => s.exercise_id === (baseExercises[currentExerciseIndex]?.id))
  const completedSetsCount = exerciseSets.filter(s => s.completed).length
  const totalSetsCount = exerciseSets.length

  const allSetsCompleted = activeWorkout.sets.every(s => s.completed)

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const blockLabel = block === 'strength' ? 'Сила' : block === 'deload' ? 'Разгрузка' : 'Гипертрофия'

  const handleCompleteSet = (setNumber: number) => {
    if (!currentExercise) return
    const originalId = baseExercises[currentExerciseIndex]?.id
    if (!originalId) return
    const key = `${originalId}_${setNumber}`
    const w = inputWeights[key] ?? weights[originalId] ?? 20
    const r = inputReps[key] ?? 10

    completeSet(originalId, setNumber, r, w)
    updateWeight(originalId, w)
    startRestTimer(currentExercise.is_compound, activeWorkout.block)
  }

  const handleFinish = async () => {
    const workout = finishWorkout()
    if (workout) {
      navigate('/workout/summary')
    }
  }

  const handleSwap = (altId: string) => {
    // Build a pseudo Exercise from either main list or inline data
    const mainList = getExercisesForWorkout(activeWorkout.workout_type, customProgram)
    const resolved = resolveAlternative(altId, mainList)
    if (!resolved) return

    const original = baseExercises[currentExerciseIndex]
    if (!original) return

    const swapped: Exercise = {
      ...original,
      id: original.id, // keep original id so sets still match
      name_ru: resolved.name_ru,
      muscle_primary: resolved.muscle_primary,
      tips_ru: resolved.tips_ru,
    }

    setSwappedExercises(prev => ({ ...prev, [currentExerciseIndex]: swapped }))
    setShowSwapModal(false)
    setSwapToast(true)
    setTimeout(() => setSwapToast(false), 2500)
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

  // Alternative options for current exercise
  const currentAlternatives = (currentExercise?.alternatives ?? [])
    .map(id => resolveAlternative(id, getExercisesForWorkout(activeWorkout.workout_type, customProgram)))
    .filter(Boolean) as { id: string; name_ru: string; muscle_primary: string; tips_ru: string }[]

  // Workout type color theming (A=indigo, B=amber, C=emerald)
  const workoutColor = activeWorkout.workout_type === 'A' ? '#6366f1' : activeWorkout.workout_type === 'C' ? '#10b981' : '#f59e0b'
  const workoutColorLight = activeWorkout.workout_type === 'A' ? 'rgba(99,102,241,0.15)' : activeWorkout.workout_type === 'C' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'
  const workoutGradient = activeWorkout.workout_type === 'A'
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    : activeWorkout.workout_type === 'C'
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #f59e0b, #d97706)'

  // ─── PREVIEW SCREEN ─────────────────────────────────────────────────────────
  if (workoutPhase === 'preview') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col pb-28" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {/* Header with gradient energy */}
        <div
          className="px-4 pt-6 pb-5"
          style={{ background: `linear-gradient(180deg, ${workoutColorLight} 0%, rgba(10,10,15,0) 100%)` }}
        >
          {/* Block + week row */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full tracking-wide"
              style={{
                background: block === 'strength' ? 'rgba(245,158,11,0.15)' : workoutColorLight,
                color: block === 'strength' ? '#f59e0b' : workoutColor,
                border: `1px solid ${block === 'strength' ? 'rgba(245,158,11,0.3)' : `${workoutColor}40`}`
              }}
            >
              {blockLabel}
            </span>
            <span className="text-white/40 text-xs">Неделя {programState.total_week} · {blockInfo.nameRu}</span>
          </div>

          {/* Workout type large pill + title */}
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl flex-shrink-0"
              style={{
                background: workoutGradient,
                boxShadow: `0 0 24px ${workoutColor}50`
              }}
            >
              {workoutType}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight">
                Тренировка {workoutType}
              </h1>
              <div className="flex items-center gap-3 text-white/50 text-xs mt-1">
                <span>⏱ ~{estimates.durationMin} мин</span>
                <span>🔥 ~{estimates.calories} ккал</span>
                <span>💪 {estimates.exerciseCount} упр.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 px-4 overflow-y-auto">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Программа тренировки</p>
          <div className="space-y-2">
            {previewExercises.map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-transform"
                onClick={() => setSelectedPreviewExercise(ex)}
                style={{
                  background: ex.is_compound
                    ? 'rgba(99,102,241,0.08)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${ex.is_compound ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  borderLeft: `3px solid ${ex.is_compound ? workoutColor : 'rgba(255,255,255,0.15)'}`
                }}
              >
                {/* Number */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: ex.is_compound
                      ? `${workoutColor}30`
                      : 'rgba(255,255,255,0.08)',
                    color: ex.is_compound ? workoutColor : '#fff'
                  }}
                >
                  {i + 1}
                </div>

                {/* Emoji */}
                <span className="text-xl flex-shrink-0">{ex.muscle_emoji}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm truncate">{ex.name_ru}</span>
                    {ex.is_compound && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${workoutColor}20`, color: '#a5b4fc' }}>
                        база
                      </span>
                    )}
                  </div>
                  {ex.name_en && (
                    <span className="text-white/35 text-xs font-medium tracking-wider uppercase truncate block">{ex.name_en}</span>
                  )}
                  <span className="text-white/40 text-xs">{ex.muscle_primary}</span>
                </div>

                {/* Sets × reps */}
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold text-sm">{ex.sets}×{ex.reps}</div>
                  <div className="text-white/30 text-xs">{ex.tempo}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="px-4 pt-4 pb-2">
          <motion.button
            onClick={() => setWorkoutPhase('active')}
            className="w-full py-5 rounded-2xl font-extrabold text-xl text-white tracking-widest"
            style={{
              background: workoutGradient,
              boxShadow: `0 4px 32px ${workoutColor}60`
            }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            СТАРТ
          </motion.button>
        </div>

        {/* Exercise detail modal */}
        <AnimatePresence>
          {selectedPreviewExercise && (
            <ExerciseModal
              exercise={selectedPreviewExercise}
              currentWeight={weights[selectedPreviewExercise.id] || 0}
              onClose={() => setSelectedPreviewExercise(null)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ─── ACTIVE WORKOUT SCREEN ───────────────────────────────────────────────────
  const progressPct = (completedExercises.size / exercises.length) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24 flex flex-col">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 px-4 pb-3"
        style={{
          background: 'rgba(10,10,15,0.96)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)`
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {/* Prominent workout type pill */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
              style={{
                background: workoutGradient,
                boxShadow: `0 0 12px ${workoutColor}50`
              }}
            >
              {activeWorkout.workout_type}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: activeWorkout.block === 'strength' ? 'rgba(245,158,11,0.15)' : `${workoutColor}20`,
                    color: activeWorkout.block === 'strength' ? '#f59e0b' : workoutColor,
                  }}
                >
                  {activeWorkout.block === 'strength' ? 'Сила' : activeWorkout.block === 'deload' ? 'Разгрузка' : 'Гипертрофия'}
                </span>
                {/* Prominent set counter */}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                >
                  Подход {completedSetsCount + 1}/{totalSetsCount}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-sm font-bold"
              style={{ color: workoutColor }}
            >
              ⏱ {formatTime(activeWorkout.elapsedSeconds)}
            </span>
            <span className="text-white/40 text-xs">
              ~{Math.round(totalVolume)} кг
            </span>
          </div>
        </div>

        {/* Thicker animated progress bar */}
        <div className="h-2 rounded-full bg-white/08 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: workoutGradient }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
            const originalId = baseExercises[i]?.id
            const isDone = originalId ? completedExercises.has(originalId) : false
            const isCurrent = i === activeWorkout.currentExerciseIndex
            return (
              <motion.button
                key={ex.id + '_' + i}
                onClick={() => setCurrentExercise(i)}
                whileTap={{ scale: 0.93 }}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: isCurrent
                    ? workoutGradient
                    : isDone
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: isCurrent ? 'none' : `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isCurrent ? `0 0 14px ${workoutColor}50` : 'none',
                  minWidth: 64
                }}
              >
                <span className="text-base">{isDone ? '✅' : ex.muscle_emoji}</span>
                <span className="text-xs text-white/70 leading-none text-center" style={{ fontSize: 10 }}>
                  {i + 1}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Current exercise */}
      {currentExercise && (
        <div className="flex-1 px-4">
          {/* Exercise card with glowing border for active */}
          <motion.div
            key={currentExercise.id + '_' + currentExerciseIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 rounded-2xl p-5"
            style={{
              background: '#1c1c27',
              border: `1px solid ${workoutColor}50`,
              boxShadow: `0 0 0 1px ${workoutColor}20, 0 4px 24px ${workoutColor}15`,
              borderLeft: `3px solid ${workoutColor}`
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-white/40">
                    {currentExerciseIndex + 1}/{exercises.length}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: currentExercise.is_compound ? `${workoutColor}25` : 'rgba(245,158,11,0.2)',
                      color: currentExercise.is_compound ? '#a5b4fc' : '#fbbf24'
                    }}
                  >
                    {currentExercise.is_compound ? 'Базовое' : 'Изоляция'}
                  </span>
                  {swappedExercises[currentExerciseIndex] && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                      замена
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{currentExercise.name_ru}</h2>
                {currentExercise.name_en && (
                  <p className="text-white/30 text-xs font-medium tracking-wide uppercase mb-0.5">{currentExercise.name_en}</p>
                )}
                <p className="text-white/50 text-sm">{currentExercise.muscle_emoji} {currentExercise.muscle_primary}</p>
              </div>

              {/* Swap button */}
              {currentAlternatives.length > 0 && (
                <motion.button
                  onClick={() => setShowSwapModal(true)}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                >
                  🔄 Заменить
                </motion.button>
              )}
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
                        style={{ background: `${workoutColor}15`, border: `1px solid ${workoutColor}30` }}
                      >
                        {currentExercise.tips_ru}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* YouTube Video for current exercise */}
          {currentExercise.instagramUrl && (() => {
            const embedUrl = getYouTubeEmbedUrl(currentExercise.instagramUrl)
            const isShorts = isYouTubeShorts(currentExercise.instagramUrl)
            if (!embedUrl) return null
            return (
              <div className="mb-4">
                <button
                  onClick={() => setShowVideo(v => !v)}
                  className="flex items-center gap-2 text-sm mb-2 w-full"
                  style={{ color: workoutColor }}
                >
                  <span>📹</span>
                  <span className="font-semibold">Техника выполнения</span>
                  <span className="text-white/30 ml-auto">{showVideo ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {showVideo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: `1px solid ${workoutColor}25`, background: `${workoutColor}08` }}
                      >
                        <div style={{
                          position: 'relative',
                          paddingBottom: '177.78%',
                          height: 0,
                          borderRadius: 16,
                          overflow: 'hidden',
                        }}>
                          <iframe
                            key={currentExercise.id}
                            src={embedUrl}
                            title={currentExercise.name_ru}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })()}

          {/* Alternative Videos in active workout */}
          {(() => {
            const altVideoUrls = (currentExercise.alternatives ?? []).filter(a => a.startsWith('http') && getYouTubeEmbedUrl(a))
            if (altVideoUrls.length === 0) return null
            const safeAltIndex = Math.min(activeAltVideoIndex, altVideoUrls.length - 1)
            const altUrl = altVideoUrls[safeAltIndex]
            const altEmbed = getYouTubeEmbedUrl(altUrl)
            if (!altEmbed) return null
            return (
              <div className="mb-4">
                <button
                  onClick={() => setShowAltVideos(v => !v)}
                  className="flex items-center gap-2 text-sm mb-2 w-full"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  <span>🔄</span>
                  <span className="font-semibold">Альтернативные видео</span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full ml-1"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                  >
                    {altVideoUrls.length}
                  </span>
                  <span className="text-white/30 ml-auto">{showAltVideos ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {showAltVideos && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* Tab buttons if multiple alts */}
                      {altVideoUrls.length > 1 && (
                        <div className="flex gap-2 mb-2">
                          {altVideoUrls.map((_, i) => (
                            <motion.button
                              key={i}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setActiveAltVideoIndex(i)}
                              className="w-8 h-8 rounded-xl text-xs font-bold"
                              style={{
                                background: safeAltIndex === i ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.07)',
                                color: safeAltIndex === i ? 'white' : 'rgba(255,255,255,0.45)',
                              }}
                            >
                              {i + 1}
                            </motion.button>
                          ))}
                        </div>
                      )}
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}
                      >
                        <div style={{
                          position: 'relative',
                          paddingBottom: '177.78%',
                          height: 0,
                          borderRadius: 16,
                          overflow: 'hidden',
                        }}>
                          <iframe
                            key={altUrl}
                            src={altEmbed}
                            title={`Альтернатива ${safeAltIndex + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })()}

          {/* Sets */}
          <div className="space-y-3 mb-4">
            {exerciseSets.map((set) => {
              const originalId = baseExercises[currentExerciseIndex]?.id ?? ''
              const key = `${originalId}_${set.set_number}`
              const w = inputWeights[key] ?? set.weight_kg ?? 20
              const r = inputReps[key] ?? set.target_reps
              // Active set = next uncompleted set
              const isActiveSet = !set.completed && exerciseSets.filter(s => !s.completed)[0]?.set_number === set.set_number

              return (
                <motion.div
                  key={set.set_number}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl p-4"
                  style={{
                    background: set.completed
                      ? 'rgba(16,185,129,0.08)'
                      : isActiveSet
                      ? `${workoutColor}18`
                      : '#1c1c27',
                    border: set.completed
                      ? '1px solid rgba(16,185,129,0.3)'
                      : isActiveSet
                      ? `1px solid ${workoutColor}50`
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isActiveSet ? `0 0 0 1px ${workoutColor}20` : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Set number */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: set.completed
                          ? 'rgba(16,185,129,0.25)'
                          : isActiveSet
                          ? `${workoutColor}30`
                          : 'rgba(255,255,255,0.08)',
                        color: set.completed ? '#10b981' : isActiveSet ? workoutColor : 'white'
                      }}
                    >
                      {set.completed ? '✓' : set.set_number}
                    </div>

                    {/* Weight */}
                    <div className="flex items-center gap-1.5 flex-1">
                      <motion.button
                        onClick={() => {
                          const newW = Math.max(0, w - currentExercise.increment_kg)
                          setInputWeights(prev => ({ ...prev, [key]: newW }))
                          if (set.completed) updateSet(originalId, set.set_number, inputReps[key] ?? r, newW)
                        }}
                        whileTap={{ scale: 0.88 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          background: set.completed ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                          color: set.completed ? '#fbbf24' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        −
                      </motion.button>
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg text-white">{w}</div>
                        <div className="text-white/30 text-xs">кг</div>
                      </div>
                      <motion.button
                        onClick={() => {
                          const newW = w + currentExercise.increment_kg
                          setInputWeights(prev => ({ ...prev, [key]: newW }))
                          if (set.completed) updateSet(originalId, set.set_number, inputReps[key] ?? r, newW)
                        }}
                        whileTap={{ scale: 0.88 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          background: set.completed ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                          color: set.completed ? '#fbbf24' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        +
                      </motion.button>
                    </div>

                    {/* Reps */}
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        onClick={() => {
                          const newR = Math.max(1, r - 1)
                          setInputReps(prev => ({ ...prev, [key]: newR }))
                          if (set.completed) updateSet(originalId, set.set_number, newR, inputWeights[key] ?? w)
                        }}
                        whileTap={{ scale: 0.88 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: set.completed ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                          color: set.completed ? '#fbbf24' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        −
                      </motion.button>
                      <div className="text-center w-8">
                        <div className="font-bold text-white">{r}</div>
                        <div className="text-white/30 text-xs">повт</div>
                      </div>
                      <motion.button
                        onClick={() => {
                          const newR = r + 1
                          setInputReps(prev => ({ ...prev, [key]: newR }))
                          if (set.completed) updateSet(originalId, set.set_number, newR, inputWeights[key] ?? w)
                        }}
                        whileTap={{ scale: 0.88 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: set.completed ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                          color: set.completed ? '#fbbf24' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        +
                      </motion.button>
                    </div>

                    {/* Complete button */}
                    <motion.button
                      onClick={() => !set.completed && handleCompleteSet(set.set_number)}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: set.completed
                          ? 'rgba(16,185,129,0.25)'
                          : workoutGradient,
                        color: set.completed ? '#10b981' : 'white',
                        boxShadow: set.completed ? 'none' : `0 0 12px ${workoutColor}50`
                      }}
                    >
                      ✓
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mb-4">
            {activeWorkout.currentExerciseIndex > 0 && (
              <motion.button
                onClick={() => setCurrentExercise(activeWorkout.currentExerciseIndex - 1)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl font-semibold text-white/60"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ← Назад
              </motion.button>
            )}
            {activeWorkout.currentExerciseIndex < exercises.length - 1 ? (
              <motion.button
                onClick={() => setCurrentExercise(activeWorkout.currentExerciseIndex + 1)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl font-semibold text-white"
                style={{ background: workoutGradient }}
              >
                Следующее →
              </motion.button>
            ) : (
              <motion.button
                onClick={handleFinish}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                🏁 Завершить тренировку
              </motion.button>
            )}
          </div>

          {allSetsCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <motion.button
                onClick={handleFinish}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                className="w-full py-5 rounded-2xl font-bold text-white text-lg"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 24px rgba(16,185,129,0.4)'
                }}
              >
                🎉 Все подходы выполнены! Завершить
              </motion.button>
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

      {/* Swap modal (bottom sheet) */}
      <AnimatePresence>
        {showSwapModal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSwapModal(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.2)' }} />

              <h3 className="text-lg font-bold text-white mb-1">Заменить упражнение</h3>
              <p className="text-white/40 text-sm mb-4">Выбери альтернативу для этой тренировки</p>

              <div className="space-y-2 mb-4">
                {currentAlternatives.map(alt => (
                  <motion.button
                    key={alt.id}
                    onClick={() => handleSwap(alt.id)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-3 rounded-2xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{alt.name_ru}</div>
                        <div className="text-white/40 text-xs mt-0.5">{alt.muscle_primary}</div>
                        <div className="text-white/30 text-xs mt-1 leading-relaxed">{alt.tips_ru}</div>
                      </div>
                      <span className="text-indigo-400 text-sm ml-3 flex-shrink-0 mt-0.5">→</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Note */}
              <div
                className="p-3 rounded-xl text-xs text-white/40 mb-3 leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                ℹ️ Замена только на эту тренировку. В следующий раз вернётся оригинал.
              </div>

              <motion.button
                onClick={() => setShowSwapModal(false)}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl text-white/60 font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Отмена
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Swap toast */}
      <AnimatePresence>
        {swapToast && (
          <motion.div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            ✅ Упражнение заменено
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
