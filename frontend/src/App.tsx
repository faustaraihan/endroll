import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, ToastProvider } from './contexts'
import { AppLayout } from './components'

// Lazy loaded page components to enable code splitting
const Landing = lazy(() => import('./pages/Landing/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Diary = lazy(() => import('./pages/Diary/Diary'))
const Explore = lazy(() => import('./pages/Explore/Explore'))
const Watchlist = lazy(() => import('./pages/Watchlist/Watchlist'))
const Stats = lazy(() => import('./pages/Stats/Stats'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
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
      backgroundColor: '#09090b',
      color: 'var(--color-violet-400, #a78bfa)',
      fontFamily: 'Playfair Display, Georgia, serif',
      fontStyle: 'italic',
      fontSize: '1.25rem',
      letterSpacing: '0.05em',
    }}>
      <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        Loading Endroll...
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
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
                <Route path="/profile"    element={<Profile />} />
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
