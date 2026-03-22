import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  tempo: string
}

const PHASE_LABELS: Record<string, string> = {
  '3': 'Опускание',
  '1': 'Пауза',
  '2': 'Подъём',
}

export default function TempoGuide({ tempo }: Props) {
  const parts = tempo.split('-')
  const [activePhase, setActivePhase] = useState<number>(-1)
  const [isRunning, setIsRunning] = useState(false)

  const phases = parts.map((p, i) => ({
    seconds: parseInt(p) || 0,
    label: i === 0 ? 'Опускание' : i === 1 ? 'Пауза' : 'Подъём',
    color: i === 0 ? '#6366f1' : i === 1 ? '#f59e0b' : '#10b981'
  }))

  const totalCycle = phases.reduce((sum, p) => sum + p.seconds, 0)

  return (
    <div
      className="p-3 rounded-xl mb-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40 font-medium">Темп {tempo}</span>
        <span className="text-xs text-white/30">{totalCycle} сек/повт</span>
      </div>
      <div className="flex gap-2">
        {phases.map((phase, i) => (
          <div key={i} className="flex-1">
            <div
              className="h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: phase.color + '30', color: phase.color }}
            >
              {phase.seconds}с
            </div>
            <p className="text-center text-xs text-white/30 mt-1">{phase.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
