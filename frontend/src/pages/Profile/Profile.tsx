import { Mail, Calendar, Star, Film, Tv, Clock, Flame, Edit3, Settings, LogOut } from 'lucide-react'
import { useApp } from '../../contexts'
import { formatDate, getInitials } from '../../utils'
import { GenrePill, StatBox } from '../../components'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, stats, streak } = useApp()

  return (
    <div className={styles.page}>
      {/* ── Left Column: Profile Card ── */}
      <aside className={styles.left}>
        <div className={styles.profileSticky}>
          <div className={styles.profileCard}>
            <div className={styles.avatarWrap}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`Avatar ${user.username}`}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback} aria-label={`Avatar ${user.username}`}>
                  {getInitials(user.username)}
                </div>
              )}
              <button
                className={styles.editAvatarBtn}
                aria-label="Edit profile picture"
              >
                <Edit3 size={14} />
              </button>
            </div>

            <div className={styles.profileInfo}>
              <h1 className={styles.username}>{user.username}</h1>
              <p className={styles.joinDate}>
                <Calendar size={13} /> Member since {formatDate(user.created_at)}
              </p>
            </div>

            {user.preferences.favorite_genres && (
              <div className={styles.genresList}>
                {user.preferences.favorite_genres.map(g => (
                  <GenrePill key={g} genre={g} />
                ))}
              </div>
            )}

            <button className={`btn btn-secondary ${styles.editProfileBtn}`}>
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>
          
          <div className={styles.accountCard}>
            <h2 className={styles.sectionTitleSmall}>Account</h2>
            <div className={styles.accountList}>
              <div className={styles.accountRow}>
                <Mail size={15} className={styles.accountIcon} />
                <div className={styles.accountDetail}>
                  <span className={styles.accountLabel}>Email</span>
                  <span className={styles.accountValue}>{user.email}</span>
                </div>
              </div>
              <div className={styles.accountRow}>
                <Settings size={15} className={styles.accountIcon} />
                <div className={styles.accountDetail}>
                  <span className={styles.accountLabel}>Preferences</span>
                  <span className={styles.accountValue}>Theme {user.preferences.theme}</span>
                </div>
              </div>
            </div>
            <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Right Column: Stats & Data ── */}
      <main className={styles.right}>
        
        {/* Streak Hero */}
        <section className={styles.streakHero} aria-label="Streak">
          <div className={styles.streakHeroCard}>
            <div className={styles.streakHeroIcon}>
              <Flame size={32} />
            </div>
            <div className={styles.streakHeroInfo}>
              <div className={styles.streakHeroLabel}>Current Streak</div>
              <div className={styles.streakHeroValue}>
                {streak.current_streak_weeks} <span>weeks</span>
              </div>
            </div>
          </div>
          <div className={styles.streakHeroCard}>
            <div className={styles.streakHeroIcon} style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)' }}>
              <Flame size={32} />
            </div>
            <div className={styles.streakHeroInfo}>
              <div className={styles.streakHeroLabel}>Best Streak</div>
              <div className={styles.streakHeroValue}>
                {streak.longest_streak_weeks} <span>weeks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section aria-label="Viewing Stats">
          <h2 className={styles.sectionTitle}>Viewing Numbers</h2>
          <div className={styles.statsGrid}>
            <StatBox icon={<Film size={18} />} value={stats.total_films} label="Films Watched" />
            <StatBox icon={<Tv size={18} />} value={stats.total_series} label="Series Completed" />
            <StatBox icon={<Clock size={18} />} value={stats.total_watch_hours} label="Total Hours" unit="h" />
            <StatBox icon={<Star size={18} color="var(--color-amber-400)" fill="var(--color-amber-400)" />} value={stats.average_rating?.toFixed(1) ?? '—'} label="Average Rating" />
          </div>
        </section>

        {/* Top Directors List */}
        {stats.favorite_directors.length > 0 && (
          <section aria-label="Top Directors">
            <h2 className={styles.sectionTitle}>Favorite Directors</h2>
            <div className={styles.directorCards}>
              {stats.favorite_directors.map(({ director, count, avatar_url }, i) => (
                <div key={director} className={styles.directorCard}>
                  <div className={styles.directorRank}>#{i + 1}</div>
                  <div className={styles.directorAvatar}>
                    {avatar_url ? (
                      <img src={avatar_url} alt={director} className={styles.directorImg} />
                    ) : (
                      <span className={styles.directorInitials}>{getInitials(director)}</span>
                    )}
                  </div>
                  <div className={styles.directorDetails}>
                    <h3 className={styles.directorName}>{director}</h3>
                    <p className={styles.directorCount}>{count} films</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
