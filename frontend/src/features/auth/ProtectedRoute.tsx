import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '@/store/useStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // authUser is hydrated synchronously from localStorage at store init,
  // so there is no loading gate to wait on.
  const authUser = useStore((s) => s.authUser)
  const location = useLocation()

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
