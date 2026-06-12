import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  Bookmark,
  BarChart2,
  Settings,
  Film,
  Compass,
  Plus,
  Library,
  MoreHorizontal,
} from 'lucide-react'
import styles from './Navigation.module.css'

const navItems = [
  { to: '/dashboard',   label: 'Home',        icon: LayoutDashboard },
  { to: '/diary',       label: 'Diary',       icon: BookOpen },
  { to: '/collections', label: 'Collections', icon: Library },
  { to: '/explore',     label: 'Explore',     icon: Compass },
  { to: '/watchlist',   label: 'Watchlist',   icon: Bookmark },
  { to: '/stats',       label: 'Stats',       icon: BarChart2 },
  { to: '/settings',    label: 'Settings',    icon: Settings },
]

// Mobile: 4 primary items in the bar, the rest behind a "More" menu
const mobilePrimary = [
  { to: '/dashboard', label: 'Home',      icon: LayoutDashboard },
  { to: '/diary',     label: 'Diary',     icon: BookOpen },
  { to: '/explore',   label: 'Explore',   icon: Compass },
  { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
]

const mobileMore = [
  { to: '/collections', label: 'Collections', icon: Library },
  { to: '/stats',       label: 'Stats',       icon: BarChart2 },
  { to: '/settings',    label: 'Settings',    icon: Settings },
]

export function Navigation() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const moreBtnRef = useRef<HTMLButtonElement>(null)

  const isMoreActive = mobileMore.some(item => location.pathname.startsWith(item.to))

  // Tutup sheet saat berpindah halaman (penyesuaian state saat render,
  // bukan effect — lihat react.dev/learn/you-might-not-need-an-effect)
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname)
    setMoreOpen(false)
  }

  // Tutup dengan Escape, kembalikan fokus ke tombol pemicu
  useEffect(() => {
    if (!moreOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false)
        moreBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [moreOpen])

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
        {mobilePrimary.map(({ to, label, icon: Icon }) => (
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

        <button
          ref={moreBtnRef}
          type="button"
          className={`${styles.bottomItem} ${isMoreActive || moreOpen ? styles.bottomItemActive : ''}`}
          onClick={() => setMoreOpen(open => !open)}
          aria-label="More menu"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
        >
          <MoreHorizontal size={20} />
          <span className={styles.bottomLabel}>More</span>
        </button>
      </nav>

      {/* "More" sheet — mobile */}
      {moreOpen && (
        <>
          <div
            className={styles.moreBackdrop}
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-more-menu"
            className={styles.moreSheet}
            role="menu"
            aria-label="More menu"
          >
            {mobileMore.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                role="menuitem"
                className={({ isActive }) =>
                  `${styles.moreItem} ${isActive ? styles.moreItemActive : ''}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  )
}
