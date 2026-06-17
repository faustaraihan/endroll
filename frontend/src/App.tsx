import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, ToastProvider } from './contexts'
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

// Cinematic page loader fallback for Suspense
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg, #0b0b0c)',
      color: 'var(--accent-bright, #ecbe6c)',
      fontFamily: 'Playfair Display, Georgia, serif',
      fontStyle: 'italic',
      fontSize: '1.25rem',
      letterSpacing: '0.05em',
    }}>
      <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        Loading Endroll…
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AppProvider>
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
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
