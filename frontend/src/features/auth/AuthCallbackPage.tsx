import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleRedirect = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (!error) {
        navigate('/home', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }
    handleRedirect()
  }, [navigate])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#0b0b0c', color: '#6f6c66',
    }}>
      Completing sign in...
    </div>
  )
}
