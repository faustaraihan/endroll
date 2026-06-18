import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './contexts'
import { AppLayout } from './components'

// React Router does not reset scroll on navigation; without this, users
// land mid-page when moving between long pages (e.g. Diary -> detail)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Lazy loaded page components to enable code splitting
const Landing = lazy(() => import('./pages/Landing/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Diary = lazy(() => import('./pages/Diary/Diary'))
const Explore = lazy(() => import('./pages/Explore/Explore'))
const Watchlist = lazy(() => import('./pages/Watchlist/Watchlist'))
const Stats = lazy(() => import('./pages/Stats/Stats'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const LogFilm = lazy(() => import('./pages/LogFilm/LogFilm'))
const Collections = lazy(() => import('./pages/Collections/Collections'))
const TitleDetail = lazy(() => import('./pages/TitleDetail/TitleDetail'))

import { Loader2 } from 'lucide-react'

// Cinematic page loader fallback for Suspense
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg, #0b0b0c)',
      color: 'var(--text-3, #6f6c66)',
    }}>
      <style>{`
        @keyframes app-loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Loader2 
        size={32} 
        style={{ animation: 'app-loader-spin 1s linear infinite' }} 
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public landing */}
              <Route path="/" element={<Landing />} />

              {/* App routes with sidebar layout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route path="/diary"      element={<Diary />} />
                <Route path="/explore"    element={<Explore />} />
                <Route path="/watchlist"  element={<Watchlist />} />
                <Route path="/collections" element={<Collections />} />
              <Route path="/title/:id" element={<TitleDetail />} />
                <Route path="/stats"      element={<Stats />} />
                <Route path="/settings"   element={<Settings />} />
                <Route path="/log"        element={<LogFilm />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
      </ToastProvider>
    </BrowserRouter>
  )
}
