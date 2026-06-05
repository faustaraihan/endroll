import { NavLink } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  Bookmark,
  BarChart2,
  User,
  Film,
  Compass,
  Plus,
  Library,
} from 'lucide-react'
import styles from './Navigation.module.css'

const navItems = [
  { to: '/dashboard',   label: 'Home',        icon: LayoutDashboard },
  { to: '/diary',       label: 'Diary',       icon: BookOpen },
  { to: '/collections', label: 'Collections', icon: Library },
  { to: '/explore',     label: 'Explore',     icon: Compass },
  { to: '/watchlist',   label: 'Watchlist',   icon: Bookmark },
  { to: '/stats',       label: 'Stats',       icon: BarChart2 },
  { to: '/profile',     label: 'Profile',     icon: User },
]

export function Navigation() {
  return (
    <>
      {/* Sidebar — desktop */}
      <nav className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.sidebarLogo}>
          <Film size={22} color="var(--color-violet-400)" />
          <span className={styles.logoText}>endroll</span>
        </div>

        <ul className={styles.navList} role="list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <NavLink to="/log" className={`btn btn-primary ${styles.logBtn}`}>
          <Plus size={16} />
          Log a Film
        </NavLink>
      </nav>

      {/* Bottom bar — mobile */}
      <nav className={styles.bottomBar} aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.bottomItem} ${isActive ? styles.bottomItemActive : ''}`
            }
            aria-label={label}
          >
            <Icon size={20} />
            <span className={styles.bottomLabel}>{label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/log"
          className={styles.bottomLogBtn}
          aria-label="Log a film"
        >
          <Plus size={20} />
        </NavLink>
      </nav>
    </>
  )
}
