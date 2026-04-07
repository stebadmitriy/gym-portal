import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Exercise } from '../types'
import { useProgramStore } from '../stores/programStore'
import { pinVideo, unpinVideo } from '../lib/exerciseLibrary'

const EQUIPMENT_PHOTOS: Record<string, string> = {
  lat_pulldown: '/gym-portal/gym-photos/lat_pulldown.jpg',
  chest_press: '/gym-portal/gym-photos/chest_press.jpg',
  shoulder_press: '/gym-portal/gym-photos/shoulder_press.jpg',
  shoulder_press_b: '/gym-portal/gym-photos/shoulder_press.jpg',
  incline_pec_fly: '/gym-portal/gym-photos/incline_pec_fly.jpg',
  cable_lateral_raise: '/gym-portal/gym-photos/cable_lateral_raise.jpg',
  cable_lateral_raise_b: '/gym-portal/gym-photos/cable_lateral_raise.jpg',
  leg_press: '/gym-portal/gym-photos/leg_press.jpg',
  seated_leg_curl: '/gym-portal/gym-photos/seated_leg_curl.jpg',
  abdominal_crunch: '/gym-portal/gym-photos/abdominal_crunch.jpg',
  abdominal_crunch_b: '/gym-portal/gym-photos/abdominal_crunch.jpg',
  hip_thrust: '/gym-portal/gym-photos/hip_thrust.jpg',
  pull_over: '/gym-portal/gym-photos/pull_over.jpg',
  linear_back_row: '/gym-portal/gym-photos/linear_back_row.jpg',
  leg_extension: '/gym-portal/gym-photos/leg_extension.jpg',
  ham_curl: '/gym-portal/gym-photos/ham_curl.jpg',
  biceps_curl: '/gym-portal/gym-photos/biceps_curl.jpg',
  cable_face_pull: '/gym-portal/gym-photos/cable_face_pull.jpg',
}

// Muscle group accent colors matching ExercisesPage
const MUSCLE_COLORS: Record<string, string> = {
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

interface ExerciseModalProps {
  exercise: Exercise
  currentWeight: number
  onClose: () => void
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  // Full URL: youtube.com/watch?v=ID
  let match = url.match(/youtube\.com\/watch\?(?:.*&)?v=([^&]+)/)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?loop=1&playlist=${match[1]}&rel=0&modestbranding=1`
  }
  // Shorts: youtube.com/shorts/ID
  match = url.match(/youtube\.com\/shorts\/([^?&/]+)/)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?loop=1&playlist=${match[1]}&rel=0&modestbranding=1`
  }
  // youtu.be/ID
  match = url.match(/youtu\.be\/([^?&/]+)/)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?loop=1&playlist=${match[1]}&rel=0&modestbranding=1`
  }
  return null
}

// Inline video loading skeleton
function VideoSkeleton() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: 460, background: 'rgba(99,102,241,0.05)', position: 'relative' }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polygon points="6,3 17,10 6,17" fill="rgba(99,102,241,0.6)" />
            </svg>
          </div>
          <span className="text-white/20 text-xs">Загрузка видео…</span>
        </div>
      </div>
    </div>
  )
}

export default function ExerciseModal({ exercise, currentWeight, onClose }: ExerciseModalProps) {
  const { programState } = useProgramStore()
  const totalWeek = programState.total_week

  // All videos: primary + alternatives
  const allVideos = [
    ...(exercise.instagramUrl ? [exercise.instagramUrl] : []),
    ...(exercise.alternatives || [])
  ]
  const blockIndex = Math.floor((totalWeek - 1) / 4)

  // Check for pinned video in localStorage
  const [pinnedUrl, setPinnedUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(`gymPrime_primaryVideo_${exercise.id}`) } catch { return null }
  })

  // Which video is currently "main"
  const mainVideoUrl = pinnedUrl || (allVideos[blockIndex % allVideos.length] ?? exercise.instagramUrl)
  const mainEmbedUrl = mainVideoUrl ? getYouTubeEmbedUrl(mainVideoUrl) : null

  const isPinned = !!pinnedUrl
  const currentVariantIndex = allVideos.indexOf(mainVideoUrl ?? '')

  const [showEquipment, setShowEquipment] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [activeAltIndex, setActiveAltIndex] = useState(0)
  const [mainVideoLoaded, setMainVideoLoaded] = useState(false)
  const [altVideoLoaded, setAltVideoLoaded] = useState(false)
  const equipmentPhoto = EQUIPMENT_PHOTOS[exercise.id] || null

  // Derive a muscle group color from muscle_primary label fallback
  const muscleColor = (() => {
    // Try to match any key in MUSCLE_COLORS by scanning exercise id segments
    for (const key of Object.keys(MUSCLE_COLORS)) {
      if (exercise.id.includes(key.replace('_', ''))) return MUSCLE_COLORS[key]
    }
    return '#6366f1'
  })()

  const handlePin = (url: string) => {
    pinVideo(exercise.id, url)
    setPinnedUrl(url)
    setShowAlternatives(false)
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    setShowAlternatives(false)
    setActiveAltIndex(0)
    setMainVideoLoaded(false)
    setAltVideoLoaded(false)
    setPinnedUrl(localStorage.getItem(`gymPrime_primaryVideo_${exercise.id}`))
  }, [exercise.id])

  // Reset alt video loaded state when switching alt tab
  useEffect(() => {
    setAltVideoLoaded(false)
  }, [activeAltIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg"
        style={{
          background: '#13131e',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '28px 28px 0 0',
          maxHeight: '90vh',
          overflowY: 'auto',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        }}
      >
        {/* Colorful top gradient bar based on muscle group */}
        <div
          className="w-full h-1.5 rounded-t-[28px]"
          style={{
            background: `linear-gradient(90deg, ${muscleColor}, ${muscleColor}80, transparent)`,
          }}
        />

        {/* Handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-6 pt-3 pb-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full mb-2.5 inline-block"
                style={{
                  background: exercise.workout_slot === 'A'
                    ? 'rgba(99,102,241,0.18)'
                    : exercise.workout_slot === 'C'
                    ? 'rgba(16,185,129,0.18)'
                    : 'rgba(245,158,11,0.18)',
                  color: exercise.workout_slot === 'A'
                    ? '#a5b4fc'
                    : exercise.workout_slot === 'C'
                    ? '#34d399'
                    : '#fbbf24',
                  border: exercise.workout_slot === 'A'
                    ? '1px solid rgba(99,102,241,0.3)'
                    : exercise.workout_slot === 'C'
                    ? '1px solid rgba(16,185,129,0.3)'
                    : '1px solid rgba(245,158,11,0.3)',
                }}
              >
                Тренировка {exercise.workout_slot}
              </span>
              <h2 className="text-2xl font-black text-white leading-tight">{exercise.name_ru}</h2>
              {exercise.name_en && (
                <p className="text-white/40 text-xs font-bold tracking-[0.12em] uppercase mt-1">
                  {exercise.name_en}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${muscleColor}18`,
                    color: muscleColor,
                    border: `1px solid ${muscleColor}30`,
                  }}
                >
                  {exercise.muscle_emoji} {exercise.muscle_primary}
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white/60"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              ✕
            </motion.button>
          </div>

          {/* YouTube Video Embed */}
          <div
            className="mb-4 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            {mainEmbedUrl ? (
              <div style={{ position: 'relative', width: '100%' }}>
                {/* Info bar */}
                {allVideos.length > 1 && (
                  <div
                    className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2"
                    style={{
                      background: 'linear-gradient(180deg, rgba(19,19,30,0.95) 0%, transparent 100%)',
                      zIndex: 2,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {isPinned ? (
                        <span
                          className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(245,158,11,0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245,158,11,0.3)',
                          }}
                        >
                          📌 Закреплено
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(99,102,241,0.2)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.25)',
                          }}
                        >
                          {(currentVariantIndex >= 0 ? currentVariantIndex : 0) + 1}/{allVideos.length}
                        </span>
                      )}
                    </div>
                    {isPinned && (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => { unpinVideo(exercise.id); setPinnedUrl(null) }}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        ✕ сброс
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Loading skeleton */}
                {!mainVideoLoaded && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                    <VideoSkeleton />
                  </div>
                )}

                {/* 16:9 aspect ratio container */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 16, overflow: 'hidden' }}>
                  <iframe
                    src={mainEmbedUrl}
                    title={exercise.name_ru}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    loading="lazy"
                    onLoad={() => setMainVideoLoaded(true)}
                  />
                </div>

                {allVideos.length > 1 && !isPinned && (
                  <div className="flex justify-end px-3 py-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePin(exercise.instagramUrl!)}
                      className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{
                        background: 'rgba(245,158,11,0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245,158,11,0.25)',
                      }}
                    >
                      📌 Закрепить
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ minHeight: 160 }}>
                <span className="text-7xl py-8">{exercise.muscle_emoji}</span>
              </div>
            )}
          </div>

          {/* Alternative Videos */}
          {exercise.alternatives && exercise.alternatives.length > 0 && (
            <div className="mb-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAlternatives(prev => !prev)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl mb-2"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)' }}
                  >
                    🔄
                  </span>
                  <span className="text-white/75 text-sm font-semibold">
                    Альтернативные видео
                  </span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                  >
                    {exercise.alternatives.length}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: showAlternatives ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/35 text-sm"
                >
                  ▼
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {showAlternatives && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Tab buttons for selecting which alt video */}
                    {exercise.alternatives.length > 1 && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {exercise.alternatives.map((_, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveAltIndex(i)}
                            className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: activeAltIndex === i
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'rgba(255,255,255,0.07)',
                              color: activeAltIndex === i ? 'white' : 'rgba(255,255,255,0.45)',
                              boxShadow: activeAltIndex === i ? '0 0 10px rgba(99,102,241,0.3)' : 'none',
                            }}
                          >
                            {i + 1}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Pin button for the active alternative */}
                    <div className="mb-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handlePin(exercise.alternatives![activeAltIndex])}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{
                          background: 'rgba(245,158,11,0.15)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245,158,11,0.25)',
                        }}
                      >
                        📌 Сделать главным
                      </motion.button>
                    </div>

                    {/* The active alternative video */}
                    {(() => {
                      const altUrl = exercise.alternatives[activeAltIndex]
                      const altEmbedUrl = getYouTubeEmbedUrl(altUrl)
                      return altEmbedUrl ? (
                        <div
                          className="rounded-2xl overflow-hidden"
                          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
                        >
                          <div style={{ position: 'relative', width: '100%' }}>
                            {!altVideoLoaded && (
                              <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                                <VideoSkeleton />
                              </div>
                            )}
                            {/* 16:9 aspect ratio */}
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 16, overflow: 'hidden' }}>
                              <iframe
                                src={altEmbedUrl}
                                title={`Альтернатива ${activeAltIndex + 1}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                loading="lazy"
                                onLoad={() => setAltVideoLoaded(true)}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Stats grid — icon + value cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Sets × Reps */}
            <div
              className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.05))',
                border: '1px solid rgba(99,102,241,0.18)',
              }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.2)' }}
              >
                🔁
              </span>
              <div className="min-w-0">
                <div className="text-white font-black text-sm leading-tight">{exercise.sets} × {exercise.reps}</div>
                <div className="text-white/35 text-[10px] mt-0.5 leading-tight">Подходы × Повт</div>
              </div>
            </div>

            {/* Tempo */}
            <div
              className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.05))',
                border: '1px solid rgba(139,92,246,0.18)',
              }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)' }}
              >
                ⏱
              </span>
              <div className="min-w-0">
                <div className="text-white font-black text-sm leading-tight">{exercise.tempo}</div>
                <div className="text-white/35 text-[10px] mt-0.5 leading-tight">Темп (опуск-пауза-подъём)</div>
              </div>
            </div>

            {/* Weight */}
            <div
              className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.05))',
                border: '1px solid rgba(16,185,129,0.18)',
              }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.2)' }}
              >
                🏋️
              </span>
              <div className="min-w-0">
                <div className="text-white font-black text-sm leading-tight">
                  {currentWeight > 0 ? `${currentWeight} кг` : '—'}
                </div>
                <div className="text-white/35 text-[10px] mt-0.5 leading-tight">Рабочий вес</div>
              </div>
            </div>

            {/* Type */}
            <div
              className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))',
                border: '1px solid rgba(245,158,11,0.18)',
              }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.2)' }}
              >
                {exercise.is_compound ? '⚡' : '🎯'}
              </span>
              <div className="min-w-0">
                <div className="text-white font-black text-sm leading-tight">
                  {exercise.is_compound ? 'Базовое' : 'Изоляция'}
                </div>
                <div className="text-white/35 text-[10px] mt-0.5 leading-tight">Тип упражнения</div>
              </div>
            </div>
          </div>

          {/* Increment */}
          {exercise.increment_kg > 0 && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <span className="text-xl flex-shrink-0">📈</span>
              <div>
                <p className="text-white text-sm font-bold">Прогрессия: +{exercise.increment_kg} кг</p>
                <p className="text-white/40 text-xs mt-0.5">При выполнении всех повторений в норме</p>
              </div>
            </div>
          )}

          {/* Science tip — with left border accent */}
          <div
            className="p-4 rounded-2xl mb-0 flex gap-3"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.18)',
              borderLeft: '3px solid #6366f1',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-indigo-400 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-sm"
                  style={{ background: 'rgba(99,102,241,0.2)' }}
                >
                  💡
                </span>
                Научный совет
              </p>
              <p className="text-white/80 text-sm leading-relaxed">{exercise.tips_ru}</p>
            </div>
          </div>

          {/* Equipment photo accordion */}
          {equipmentPhoto && (
            <div className="mt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEquipment(prev => !prev)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    📸
                  </span>
                  <span className="text-white/70 text-sm font-semibold">Тренажёр в зале</span>
                </div>
                <motion.span
                  animate={{ rotate: showEquipment ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/30 text-sm"
                >
                  ▼
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {showEquipment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                    className="mt-2"
                  >
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <a href={equipmentPhoto} target="_blank" rel="noopener noreferrer">
                        <img
                          src={equipmentPhoto}
                          alt={exercise.name_en}
                          className="w-full object-cover"
                          style={{ maxHeight: 280, objectPosition: 'center top' }}
                        />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
