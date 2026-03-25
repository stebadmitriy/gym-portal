import { Link, useLocation } from 'react-router-dom'
import { useWorkoutStore } from '../stores/workoutStore'

const tabs = [
  { path: '/', icon: '🏠', label: 'Сегодня' },
  { path: '/workout', icon: '💪', label: 'Тренировка' },
  { path: '/exercises', icon: '🏋️', label: 'Упражнения' },
  { path: '/progress', icon: '📊', label: 'Прогресс' },
  { path: '/info', icon: '📚', label: 'Инфо' },
  { path: '/settings', icon: '⚙️', label: 'Настройки' },
]

export default function BottomNav() {
  const location = useLocation()
  const { activeWorkout } = useWorkoutStore()

  // Don't show on pin page or summary page
  if (location.pathname === '/pin' || location.pathname === '/workout/summary') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path ||
            (tab.path === '/workout' && location.pathname.startsWith('/workout'))

          const isWorkoutActive = tab.path === '/workout' && !!activeWorkout

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center rounded-xl transition-all"
              style={{
                minWidth: 44,
                padding: '10px 8px',
                color: isActive ? '#8b5cf6' : 'rgba(255,255,255,0.4)',
              }}
            >
              <span className="text-xl leading-none relative">
                {tab.icon}
                {isWorkoutActive && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400"
                    style={{ border: '2px solid #0a0a0f' }}
                  />
                )}
              </span>
              <span className="text-[10px] mt-0.5 leading-none font-medium" style={{ color: isActive ? '#8b5cf6' : 'rgba(255,255,255,0.3)' }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
