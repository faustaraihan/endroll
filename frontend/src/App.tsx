import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ToastProvider, AuthProvider } from './contexts'
import { AppLayout, ProtectedRoute } from './components'

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
const Home = lazy(() => import('./pages/Home/Home'))
const Diary = lazy(() => import('./pages/Diary/Diary'))
const Explore = lazy(() => import('./pages/Explore/Explore'))
const Watchlist = lazy(() => import('./pages/Watchlist/Watchlist'))
const Statistics = lazy(() => import('./pages/Statistics/Statistics'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const LogTitle = lazy(() => import('./pages/LogTitle/LogTitle'))
const Collections = lazy(() => import('./pages/Collections/Collections'))
const TitleDetail = lazy(() => import('./pages/TitleDetail/TitleDetail'))

// Auth pages
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))

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
      <AuthProvider>
        <ToastProvider>
            <Toaster
              position="bottom-right"
              theme="dark"
              closeButton
              gap={8}
              duration={4000}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* App routes with sidebar layout */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/home"  element={<Home />} />
                  <Route path="/diary"      element={<Diary />} />
                  <Route path="/explore"    element={<Explore />} />
                  <Route path="/watchlist"  element={<Watchlist />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/title/:id" element={<TitleDetail />} />
                  <Route path="/statistics"      element={<Statistics />} />
                  <Route path="/settings"   element={<Settings />} />
                  <Route path="/log"        element={<LogTitle />} />
                </Route>

                {/* Redirect root to app home since landing is now on a separate project */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
