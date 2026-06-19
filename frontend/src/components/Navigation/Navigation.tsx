import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Bookmark,
  BarChart2,
  Settings,
  Compass,
  Plus,
  Library,
  MoreHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import styles from "./Navigation.module.css";

const navItems = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/diary", label: "Diary", icon: BookOpen },
  { to: "/collections", label: "Collections", icon: Library },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/watchlist", label: "Watchlist", icon: Bookmark },
  { to: "/stats", label: "Stats", icon: BarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const mobilePrimary = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/diary", label: "Diary", icon: BookOpen },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/watchlist", label: "Watchlist", icon: Bookmark },
];

const mobileMore = [
  { to: "/collections", label: "Collections", icon: Library },
  { to: "/stats", label: "Stats", icon: BarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  
  const theme = user?.preferences?.theme || "dark";

  const isMoreActive = mobileMore.some((item) =>
    location.pathname.startsWith(item.to),
  );

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMoreOpen(false);
  }

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: newTheme
      }
    }));
  };
  const initial = (user?.username?.[0] ?? "U").toUpperCase();

  return (
    <>
      {/* Sidebar — desktop */}
      <nav className={styles.sidebar} aria-label="Main navigation">
        {/* Brand */}
        <div className={styles.sidebarLogo}>
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.logoText}>endroll</span>
        </div>

        {/* Nav items */}
        <ul className={styles.navList} role="list">
          <li>
            <span className={styles.navSection} aria-hidden="true">
              Library
            </span>
          </li>
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className={styles.sidebarFoot}>
          <Link to="/log" className={styles.logBtn}>
            <Plus size={15} />
            Log a title
          </Link>
          <hr className={styles.hairline} />
          <div className={styles.themeRow}>
            <div className={styles.userInfo}>
              <div className={styles.avatar} aria-hidden="true">
                {initial}
              </div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>
                  {user.username || "You"}
                </span>
                <span className={styles.userHandle}>
                  @{(user.username || "user").toLowerCase()}
                </span>
              </div>
            </div>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom bar — mobile */}
      <nav className={styles.bottomBar} aria-label="Mobile navigation">
        {mobilePrimary.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.bottomItem} ${isActive ? styles.bottomItemActive : ""}`
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
          aria-label="Log a title"
        >
          <Plus size={20} />
        </NavLink>

        <button
          ref={moreBtnRef}
          type="button"
          className={`${styles.bottomItem} ${isMoreActive || moreOpen ? styles.bottomItemActive : ""}`}
          onClick={() => setMoreOpen((open) => !open)}
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
                  `${styles.moreItem} ${isActive ? styles.moreItemActive : ""}`
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
  );
}
