import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useProgramStore } from './stores/programStore'
import PinPage from './pages/PinPage'
import HomePage from './pages/HomePage'
import WorkoutPage from './pages/WorkoutPage'
import HistoryPage from './pages/HistoryPage'
import ProgressPage from './pages/ProgressPage'
import ExercisesPage from './pages/ExercisesPage'
import SettingsPage from './pages/SettingsPage'
import WorkoutSummaryPage from './pages/WorkoutSummaryPage'
import InfoPage from './pages/InfoPage'
import BottomNav from './components/BottomNav'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasPin } = useAuthStore()

  if (!isAuthenticated || !hasPin) {
    return <Navigate to="/pin" replace />
  }

  return <>{children}</>
}

function AppContent() {
  const { isAuthenticated, hasPin, checkAuth } = useAuthStore()
  const { loadAll } = useProgramStore()

  useEffect(() => {
    checkAuth()
    loadAll()
  }, [])

  const showNav = isAuthenticated && hasPin

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <Routes>
        <Route path="/pin" element={<PinPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <WorkoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout/summary"
          element={
            <ProtectedRoute>
              <WorkoutSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <ExercisesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/info"
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/gym-portal">
      <AppContent />
    </BrowserRouter>
  )
}
