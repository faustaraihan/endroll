import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ToastProvider } from './contexts'
import { AppLayout, ProtectedRoute } from './components'
import { useStore } from '@/store/useStore'

import { ErrorBoundary } from '@/components/ErrorBoundary'

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
const Home = lazy(() => import('@/features/home/HomePage'))
const Diary = lazy(() => import('@/features/diary/DiaryPage'))
const Explore = lazy(() => import('@/features/titles/ExplorePage'))
const Watchlist = lazy(() => import('@/features/watchlist/WatchlistPage'))
const Statistics = lazy(() => import('@/features/statistics/StatisticsPage'))
const Settings = lazy(() => import('@/features/settings/SettingsPage'))
const LogTitle = lazy(() => import('@/features/diary/LogTitlePage'))
const Collections = lazy(() => import('@/features/collections/CollectionsPage'))
const TitleDetail = lazy(() => import('@/features/titles/TitleDetailPage'))

// Auth pages
const Login = lazy(() => import('@/features/auth/LoginPage'))
const Register = lazy(() => import('@/features/auth/RegisterPage'))
const AuthCallback = lazy(() => import('@/features/auth/AuthCallbackPage'))

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
  const initialize = useStore((s) => s.initialize)
  const isLoading = useStore((s) => s.isLoading)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
            <Toaster
              position="bottom-right"
              theme="dark"
              closeButton
              gap={8}
              duration={4000}
            />
            <Suspense fallback={<PageLoader />}>
              <ErrorBoundary>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

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
              </ErrorBoundary>
            </Suspense>
        </ToastProvider>
    </BrowserRouter>
  )
}
