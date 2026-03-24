import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine, Area, AreaChart
} from 'recharts'
import { useProgramStore } from '../stores/programStore'
import { EXERCISES } from '../lib/exercises'
import { getBlockForWeek } from '../lib/program'

// ── Styled tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl p-3 text-sm"
        style={{
          background: 'rgba(18,18,28,0.96)',
          border: '1px solid rgba(139,92,246,0.35)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className="text-white/50 text-xs mb-1.5 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-black text-base" style={{ color: p.color }}>
            {p.value}{' '}
            <span className="font-medium text-sm opacity-80">
              {p.name === 'weight' ? 'кг' : 'кг×повт'}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Section divider ─────────────────────────────────────────────────────────
const GradientDivider = () => (
  <div
    className="w-full h-px my-1"
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent)',
    }}
  />
)

// ── Inline SVG gradient defs for charts ─────────────────────────────────────
const ChartGradientDefs = () => (
  <defs>
    <linearGradient id="gradViolet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
    </linearGradient>
  </defs>
)

export default function ProgressPage() {
  const { workouts, programState, weights, measurements } = useProgramStore()
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES[0]?.id || '')
  const { block, weekInBlock, blockInfo } = getBlockForWeek(programState.total_week)

  // Weight chart data for selected exercise
  const weightChartData = useMemo(() => {
    const data: { date: string; weight: number }[] = []

    workouts
      .slice()
      .reverse()
      .forEach(workout => {
        const sets = workout.sets || []
        const exerciseSets = sets.filter(s => s.exercise_id === selectedExerciseId && s.completed)
        if (exerciseSets.length > 0) {
          const maxWeight = Math.max(...exerciseSets.map(s => s.weight_kg))
          const dateStr = new Date(workout.started_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
          })
          data.push({ date: dateStr, weight: maxWeight })
        }
      })

    return data
  }, [workouts, selectedExerciseId])

  // Body weight chart data
  const bodyWeightData = useMemo(() => {
    return measurements
      .slice()
      .reverse()
      .filter(m => m.weight_kg)
      .map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        weight: m.weight_kg!
      }))
  }, [measurements])

  // Weekly volume data
  const weeklyVolumeData = useMemo(() => {
    const byWeek = new Map<string, number>()
    workouts.forEach(workout => {
      const weekLabel = `Нед ${workout.week_number}`
      const volume = (workout.sets || [])
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.weight_kg * s.actual_reps, 0)
      byWeek.set(weekLabel, (byWeek.get(weekLabel) || 0) + volume)
    })
    return Array.from(byWeek.entries()).map(([week, volume]) => ({ week, volume: Math.round(volume) }))
  }, [workouts])

  const totalWorkouts = workouts.length
  const totalKg = workouts.reduce((sum, w) => {
    return sum + (w.sets || []).filter(s => s.completed).reduce((s, set) => s + set.weight_kg * set.actual_reps, 0)
  }, 0)
  const totalWeeks = programState.total_week - 1

  const cycleWeek = ((programState.total_week - 1) % 9) + 1
  const cycleProgress = (cycleWeek / 9) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header */}
      <div
        className="px-5 pb-5"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`,
        }}
      >
        <h1 className="text-3xl font-black text-white tracking-tight">Прогресс</h1>
        <p className="text-white/40 text-sm mt-1">Твой путь к V-тейпу</p>
      </div>

      <div className="px-5 space-y-5">
        {/* KPI Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: totalWorkouts, label: 'Тренировок', color: '#8b5cf6' },
            { value: `${Math.round(totalKg / 1000)}т`, label: 'Поднято', color: '#f59e0b' },
            { value: totalWeeks, label: 'Недель', color: '#6366f1' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.96 }}
              className="rounded-2xl p-4 text-center"
              style={{
                background: '#1c1c27',
                border: `1px solid ${stat.color}25`,
                boxShadow: `0 4px 16px ${stat.color}15`,
              }}
            >
              <div
                className="text-3xl font-black leading-none"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}, white)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {stat.value}
              </div>
              <div className="text-white/40 text-xs mt-1.5 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <GradientDivider />

        {/* Block progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-0.5">Текущий блок</p>
              <h3 className="font-black text-lg">{blockInfo.nameRu}</h3>
            </div>
            <span
              className="text-sm font-bold px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(99,102,241,0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              {weekInBlock}/{blockInfo.weeks} нед
            </span>
          </div>

          <div className="flex gap-1.5 mb-3">
            {[...Array(9)].map((_, i) => {
              const isCurrent = i + 1 === cycleWeek
              const isPast = i + 1 < cycleWeek
              let color = 'rgba(255,255,255,0.07)'
              if (isPast) color = i < 4 ? '#6366f155' : i < 8 ? '#f59e0b55' : '#10b98155'
              if (isCurrent) color = i < 4 ? '#6366f1' : i < 8 ? '#f59e0b' : '#10b981'

              return (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    background: color,
                    height: isCurrent ? 12 : 8,
                    boxShadow: isCurrent ? `0 0 8px ${color}` : 'none',
                    marginTop: isCurrent ? -2 : 2,
                    transition: 'all 0.3s ease',
                  }}
                />
              )
            })}
          </div>

          <div className="flex gap-4 text-xs text-white/40 mt-1">
            <span><span style={{ color: '#6366f1' }}>■</span> Гипертрофия (4 нед)</span>
            <span><span style={{ color: '#f59e0b' }}>■</span> Сила (4 нед)</span>
            <span><span style={{ color: '#10b981' }}>■</span> Разгрузка</span>
          </div>
        </motion.div>

        <GradientDivider />

        {/* Exercise weight chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Прогресс</p>
          <h3 className="font-black text-lg mb-3">в упражнении</h3>

          <select
            value={selectedExerciseId}
            onChange={e => setSelectedExerciseId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm mb-4 appearance-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {EXERCISES.map(ex => (
              <option key={ex.id} value={ex.id} style={{ background: '#1c1c27' }}>
                {ex.name_ru} (Тр. {ex.workout_slot})
              </option>
            ))}
          </select>

          {weightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={weightChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <ChartGradientDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#gradViolet)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#a5b4fc' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-36 flex flex-col items-center justify-center gap-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-2xl opacity-40">📊</span>
              <span className="text-white/30 text-sm">Данных пока нет</span>
            </div>
          )}

          {/* Current working weight */}
          <div
            className="flex justify-between mt-4 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-white/50 text-sm">Текущий рабочий вес</span>
            <span
              className="font-black text-lg"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {weights[selectedExerciseId] || 0} кг
            </span>
          </div>
        </motion.div>

        {/* Body weight chart */}
        {bodyWeightData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-5"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Динамика</p>
            <h3 className="font-black text-lg mb-4">Вес тела</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={bodyWeightData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <ChartGradientDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#gradAmber)"
                  dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#fbbf24', strokeWidth: 2, stroke: '#fde68a' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Weekly volume */}
        {weeklyVolumeData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Недельный</p>
            <h3 className="font-black text-lg mb-4">Объём нагрузки</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyVolumeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="barGradIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="url(#barGradIndigo)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  )
}
