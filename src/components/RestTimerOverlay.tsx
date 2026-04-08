import { motion } from 'framer-motion'

interface Props {
  seconds: number
  totalSeconds: number
  onSkip: () => void
  nextInfo: string
}

export default function RestTimerOverlay({ seconds, totalSeconds, onSkip, nextInfo }: Props) {
  const progress = seconds / totalSeconds

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatTime = () => {
    if (minutes > 0) return `${minutes}:${secs.toString().padStart(2, '0')}`
    return `${seconds}`
  }

  const barColor = seconds <= 10 ? '#ef4444' : seconds <= 30 ? '#f59e0b' : '#6366f1'
  const isUrgent = seconds <= 10

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-20 left-3 right-3 z-40 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(18,18,28,0.97)',
        border: `1px solid ${barColor}40`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${barColor}20`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Progress bar at top */}
      <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full"
          style={{ background: barColor, width: `${progress * 100}%`, transition: 'width 1s linear, background 0.3s ease' }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Timer */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">Отдых</span>
          <motion.span
            key={seconds}
            initial={{ scale: 1.15, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-black tabular-nums text-xl"
            style={{ color: barColor }}
          >
            {formatTime()}
          </motion.span>
          {isUrgent && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="text-sm"
            >
              🔔
            </motion.span>
          )}
        </div>

        {/* Next info */}
        {nextInfo && (
          <div className="flex-1 min-w-0">
            <p className="text-white/35 text-xs truncate">→ {nextInfo}</p>
          </div>
        )}

        {/* Skip button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onSkip}
          className="flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)' }}
        >
          Пропустить
        </motion.button>
      </div>
    </motion.div>
  )
}
