import { Outlet } from 'react-router-dom'
import { Navigation } from '../Navigation/Navigation'
import { Toast } from '../Toast/Toast'
import styles from './AppLayout.module.css'

export function AppLayout() {
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
