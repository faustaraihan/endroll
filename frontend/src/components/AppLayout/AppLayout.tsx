import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from '../Navigation/Navigation'
import { Toast } from '../Toast/Toast'
import { useStore } from '../../store/useStore'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const user = useStore(state => state.user)

  useEffect(() => {
    if (user?.preferences?.theme) {
      document.documentElement.setAttribute('data-theme', user.preferences.theme)
      localStorage.setItem("endroll-theme", user.preferences.theme)
    }
  }, [user?.preferences?.theme])
  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.main} id="main-content">
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}
