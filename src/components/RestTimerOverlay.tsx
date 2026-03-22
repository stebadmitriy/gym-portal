import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  seconds: number
  totalSeconds: number
  onSkip: () => void
  nextInfo: string
}

export default function RestTimerOverlay({ seconds, totalSeconds, onSkip, nextInfo }: Props) {
  const progress = seconds / totalSeconds
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  const formatTime = () => {
    if (minutes > 0) return `${minutes}:${secs.toString().padStart(2, '0')}`
    return `${seconds}`
  }

  const bgColor = seconds <= 10 ? '#ef4444' : seconds <= 30 ? '#f59e0b' : '#6366f1'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(10, 10, 15, 0.97)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="flex flex-col items-center"
      >
        <p className="text-white/50 text-sm font-medium mb-6 uppercase tracking-widest">Отдых</p>

        {/* Circular timer */}
        <div className="relative mb-8">
          <svg width="200" height="200" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={bgColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="circle-progress"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={seconds}
              initial={{ scale: 1.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-white tabular-nums"
            >
              {formatTime()}
            </motion.span>
            <span className="text-white/40 text-sm">сек</span>
          </div>
        </div>

        {/* Next info */}
        {nextInfo && (
          <div className="text-center mb-8 px-8">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Следующее</p>
            <p className="text-white font-semibold text-base">{nextInfo}</p>
          </div>
        )}

        {/* Vibration warning */}
        {seconds <= 10 && seconds > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-400 text-sm mb-4 animate-pulse"
          >
            Готовься! 🔔
          </motion.p>
        )}

        <button
          onClick={onSkip}
          className="px-8 py-3.5 rounded-2xl font-semibold text-white/60 text-base"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Пропустить →
        </button>
      </motion.div>
    </motion.div>
  )
}
