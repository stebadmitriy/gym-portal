import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine
} from 'recharts'
import { useProgramStore } from '../stores/programStore'
import { EXERCISES } from '../lib/exercises'
import { getBlockForWeek } from '../lib/program'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c27] border border-white/10 rounded-xl p-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.value} {p.name === 'weight' ? 'кг' : 'кг×повт'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProgressPage() {
  const { workouts, programState, weights, measurements } = useProgramStore()
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES[0]?.id || '')
  const { block, weekInBlock, blockInfo } = getBlockForWeek(programState.total_week)

  // Weight chart data for selected exercise
  const weightChartData = useMemo(() => {
    const data: { date: string; weight: number }[] = []
    const seen = new Set<string>()

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
      <div
        className="px-5 pb-4"
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)` }}
      >
        <h1 className="text-2xl font-black text-white">Прогресс</h1>
        <p className="text-white/40 text-sm mt-1">Твой путь к V-тейпу</p>
      </div>

      <div className="px-5 space-y-5">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: totalWorkouts, label: 'Тренировок' },
            { value: `${Math.round(totalKg / 1000)}т`, label: 'Поднято' },
            { value: totalWeeks, label: 'Недель' },
          ].map((stat, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="text-2xl font-black gradient-text">{stat.value}</div>
              <div className="text-white/40 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Block progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Блок {blockInfo.nameRu}
            </h3>
            <span className="text-white/40 text-sm">Неделя {weekInBlock}/{blockInfo.weeks}</span>
          </div>

          <div className="flex gap-1 mb-3">
            {[...Array(9)].map((_, i) => {
              const isCurrent = i + 1 === cycleWeek
              const isPast = i + 1 < cycleWeek
              let color = 'rgba(255,255,255,0.08)'
              if (isPast) color = i < 4 ? '#6366f160' : i < 8 ? '#f59e0b60' : '#10b98160'
              if (isCurrent) color = i < 4 ? '#6366f1' : i < 8 ? '#f59e0b' : '#10b981'

              return (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full transition-all"
                  style={{ background: color }}
                />
              )
            })}
          </div>

          <div className="flex gap-3 text-xs text-white/40">
            <span><span style={{ color: '#6366f1' }}>■</span> Гипертрофия (4 нед)</span>
            <span><span style={{ color: '#f59e0b' }}>■</span> Сила (4 нед)</span>
            <span><span style={{ color: '#10b981' }}>■</span> Разгрузка</span>
          </div>
        </motion.div>

        {/* Exercise weight chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <h3 className="font-semibold mb-3">Прогресс в упражнении</h3>

          <select
            value={selectedExerciseId}
            onChange={e => setSelectedExerciseId(e.target.value)}
            className="w-full bg-white/05 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm mb-4 appearance-none"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {EXERCISES.map(ex => (
              <option key={ex.id} value={ex.id} style={{ background: '#1c1c27' }}>
                {ex.name_ru} (Тр. {ex.workout_slot})
              </option>
            ))}
          </select>

          {weightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-white/30 text-sm">
              Данных пока нет
            </div>
          )}

          {/* Current weight */}
          <div className="flex justify-between mt-3 pt-3 border-t border-white/06">
            <span className="text-white/50 text-sm">Текущий рабочий вес</span>
            <span className="text-white font-bold">
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
            <h3 className="font-semibold mb-4">Вес тела</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={bodyWeightData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} />
              </LineChart>
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
            <h3 className="font-semibold mb-4">Недельный объём</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={weeklyVolumeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  )
}
