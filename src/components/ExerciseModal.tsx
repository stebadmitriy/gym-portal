import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Exercise } from '../types'

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

interface ExerciseModalProps {
  exercise: Exercise
  currentWeight: number
  onClose: () => void
}

function getInstagramEmbedUrl(instagramUrl: string): string | null {
  const match = instagramUrl.match(/instagram\.com\/(?:p|reel)\/([^/?#]+)/)
  if (!match) return null
  return `https://www.instagram.com/p/${match[1]}/embed/`
}

export default function ExerciseModal({ exercise, currentWeight, onClose }: ExerciseModalProps) {
  const embedUrl = exercise.instagramUrl ? getInstagramEmbedUrl(exercise.instagramUrl) : null
  const [showEquipment, setShowEquipment] = useState(false)
  const equipmentPhoto = EQUIPMENT_PHOTOS[exercise.id] || null

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
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
          maxHeight: '90vh',
          overflowY: 'auto',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pt-4 pb-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{
                  background: exercise.workout_slot === 'A' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)',
                  color: exercise.workout_slot === 'A' ? '#a5b4fc' : '#fbbf24'
                }}
              >
                Тренировка {exercise.workout_slot}
              </span>
              <h2 className="text-xl font-black text-white leading-tight">{exercise.name_ru}</h2>
              {exercise.name_en && (
                <p className="text-white/55 text-sm font-semibold tracking-widest uppercase mt-0.5">{exercise.name_en}</p>
              )}
              <p className="text-white/50 text-sm mt-1">{exercise.muscle_emoji} {exercise.muscle_primary}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              ✕
            </button>
          </div>

          {/* Instagram Video Embed */}
          <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(99,102,241,0.08)' }}>
            {embedUrl ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ overflow: 'hidden', borderRadius: 16, height: 460 }}>
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="540"
                    frameBorder={0}
                    scrolling="no"
                    allowTransparency={true}
                    title={`${exercise.name_ru} — @appyoucan`}
                    style={{ marginTop: -60, display: 'block', border: 'none' }}
                    loading="lazy"
                  />
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-2"
                  style={{ background: 'linear-gradient(0deg, rgba(28,28,39,0.9) 0%, transparent 100%)' }}
                >
                  <span className="text-white/40 text-xs">@appyoucan</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ minHeight: 160 }}>
                <span className="text-7xl py-8">{exercise.muscle_emoji}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold text-sm">{exercise.sets} × {exercise.reps}</div>
              <div className="text-white/40 text-xs mt-0.5">Подходы × Повт</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold text-sm">{exercise.tempo}</div>
              <div className="text-white/40 text-xs mt-0.5">Темп (опуск-пауза-подъём)</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold text-sm">{currentWeight > 0 ? `${currentWeight} кг` : 'Не задан'}</div>
              <div className="text-white/40 text-xs mt-0.5">Рабочий вес</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-white font-bold text-sm">
                {exercise.is_compound ? '🏋️ Базовое' : '🎯 Изоляция'}
              </div>
              <div className="text-white/40 text-xs mt-0.5">Тип</div>
            </div>
          </div>

          {/* Increment */}
          {exercise.increment_kg > 0 && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-4"
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

          {/* Equipment photo */}
          {equipmentPhoto && (
            <div className="mt-4">
              <button
                onClick={() => setShowEquipment(prev => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-white/70 text-sm font-semibold">📸 Тренажёр в зале</span>
                <span className="text-white/40">{showEquipment ? '▲' : '▼'}</span>
              </button>
              {showEquipment && (
                <div className="mt-2 rounded-xl overflow-hidden">
                  <img
                    src={equipmentPhoto}
                    alt={exercise.name_en}
                    className="w-full object-cover"
                    style={{ maxHeight: 280, objectPosition: 'center top' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
