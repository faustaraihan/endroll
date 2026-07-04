import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authUser = useStore((s) => s.authUser)
  const isLoading = useStore((s) => s.isLoading)
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: 'var(--bg, #0b0b0c)', color: 'var(--text-3, #6f6c66)',
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
