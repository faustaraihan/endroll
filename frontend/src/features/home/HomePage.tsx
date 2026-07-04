import { Film, Star, Flame, ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { useDynamicStreak, useDynamicStats } from '@/hooks/useDerivedState'
import { getGreeting } from '@/utils'
import { EmptyState, Badge, PageHeader, SectionHeader } from '@/components'
import { GenrePill } from '@/components/ui/GenrePill'
import { Poster } from '@/components/ui/Poster/Poster'
import styles from './HomePage.module.css'

export default function HomePage() {
  const user = useStore(state => state.user)
  const watchLogs = useStore(state => state.watchLogs)
  const watchlist = useStore(state => state.watchlist)
  const personalRatings = useStore(state => state.personalRatings)
  const streak = useDynamicStreak()
  const stats = useDynamicStats()
  const recentLogs = watchLogs.slice(0, 5)

  // Calculate if the user has logged a title this week (Monday to Sunday)
  const isSecured = (() => {
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = day === 0 ? -6 : 1 - day
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() + mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return watchLogs.some(log => {
      const logDate = new Date(log.watched_at)
      return logDate >= startOfWeek && logDate <= endOfWeek
    })
  })()

  return (
    <div className={styles.page}>
      {/* ── Left column ── */}
      <div className={styles.left}>
        {/* Greeting */}
        <PageHeader 
          eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          title={<>{getGreeting()} {user.username}.</>}
          className={styles.dashboardHeader}
        />

        {/* Streak bar — full width */}
        <section 
          className={`${styles.streakBanner} ${isSecured ? styles.streakSecured : styles.streakPending}`} 
          aria-label="Weekly streak"
        >
          <div className={styles.streakFlame}>
            <Flame size={20} fill={isSecured ? "var(--accent-contrast, #17120a)" : "none"} color={isSecured ? "var(--accent-contrast, #17120a)" : "currentColor"} />
          </div>
          
          <div className={styles.streakContent}>
            <h2 className={styles.streakTitle}>
              {streak.current_streak_weeks}-Week Streak
            </h2>
            <p className={styles.streakStatus}>
              {isSecured
                ? 'Secured for this week'
                : 'Log a watch this week to keep it going'}
            </p>
          </div>

          <div className={styles.streakBest}>
            Best: <strong>{streak.longest_streak_weeks}w</strong>
          </div>
        </section>

        {/* Recent diary */}
        <section aria-label="Recent diary entries">
          <SectionHeader 
            eyebrow="This week"
            title="Recently watched"
            linkTo="/diary"
            linkLabel="All entries"
          />

          {recentLogs.length === 0 ? (
            <EmptyState
              icon={<Film size={36} strokeWidth={1.5} />}
              title={<>No movies here yet.<br />What did you watch recently?</>}
              actionLabel="Log first title"
              actionLink="/log"
              actionIcon={<Plus size={16} />}
            />
          ) : (
            <ul className={styles.logList} role="list">
              {recentLogs.map((log, i) => (
                <li key={log.id}>
                  <Link to={`/title/${log.title_id}`} className={styles.logCardLink}>
                  <article className={styles.logCard} style={{ '--stagger': i } as React.CSSProperties}>
                    {/* Date column */}
                    <div className={styles.logDateCol}>
                      <div className={styles.logDateDay}>
                        {new Date(log.watched_at).getDate()}
                      </div>
                      <div className={styles.logDateMonth}>
                        {new Date(log.watched_at).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </div>
                    </div>

                    {/* Poster */}
                    <div className={styles.posterCol}>
                      <Poster
                        title={log.title.title}
                        src={log.title.poster_path}
                        alt={`Poster ${log.title.type === 'movie' ? 'movie' : 'series'} ${log.title.title} (${log.title.release_year})`}
                        className={styles.poster}
                        size="sm"
                      />
                    </div>

                    {/* Info */}
                    <div className={styles.logInfo}>
                      <h3 className={styles.logTitle}>{log.title.title}</h3>
                      <div className={styles.logMeta}>
                        <span className={styles.metaYear}>{log.title.release_year}</span>
                        {log.rewatch_count > 0 && (
                          <Badge variant="neutral">Rewatch ×{log.rewatch_count}</Badge>
                        )}
                      </div>
                      {log.notes && (
                        <p className={styles.logNotes}>{log.notes}</p>
                      )}
                    </div>

                    {/* Rating */}
                    {(() => {
                      const ratingToShow = log.title.type === 'movie'
                        ? (log.rating ?? personalRatings[log.title_id])
                        : personalRatings[log.title_id];
                      if (ratingToShow == null) return <div />;
                      return (
                        <div className={styles.ratingBig} style={{ alignSelf: 'center' }}>
                          <Star size={11} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" />
                          <span>{ratingToShow.toFixed(1)}</span>
                          <span className={styles.ratingMax}>/10</span>
                        </div>
                      );
                    })()}
                  </article>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Right column ── */}
      <aside className={styles.right} aria-label="Quick stats">
        {/* Stat rail — 4 inline stats */}
        <div className={styles.statRail}>
          <div className={styles.statCell}>
            <div className={styles.statVal}>{stats.total_movies}</div>
            <div className={styles.statLbl}>Movies</div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statVal}>{stats.total_series}</div>
            <div className={styles.statLbl}>Series</div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statVal}>{stats.total_watch_hours}<span className={styles.statUnit}>h</span></div>
            <div className={styles.statLbl}>Watched</div>
          </div>
          <div className={styles.statCell}>
            <div className={styles.statVal}>
              <Star size={18} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" style={{ alignSelf: 'center' }} />
              {stats.average_rating?.toFixed(1) ?? '—'}
            </div>
            <div className={styles.statLbl}>Avg rating</div>
          </div>
        </div>

        {/* Watchlist preview — 2×2 mini poster grid */}
        {watchlist.length > 0 && (
          <section aria-label="Watchlist">
            <SectionHeader 
              title="Watchlist"
              linkTo="/watchlist"
              linkLabel="All"
            />
            <div className={styles.wlGrid}>
              {watchlist.slice(0, 4).map(item => (
                <Link key={item.id} to={`/title/${item.title.id}`} className={styles.wlCell}>
                  <Poster
                    title={item.title.title}
                    src={item.title.poster_path}
                    alt={`Poster ${item.title.title}`}
                    className={styles.wlPoster}
                    size="sm"
                  />
                  <div className={styles.wlCap}>{item.title.title}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Fav genres */}
        {stats.favorite_genres.length > 0 && (
          <section aria-label="Favorite genres">
            <p className="eyebrow" style={{ marginBottom: 11 }}>Your favourite genres</p>
            <div className={styles.genrePills}>
              {stats.favorite_genres.slice(0, 4).map(({ genre }: { genre: string }) => (
                <GenrePill key={genre} genre={genre} />
              ))}
            </div>
          </section>
        )}

        <Link to="/statistics" className={styles.statsLink}>
          View full statistics <ArrowRight size={14} />
        </Link>
      </aside>
    </div>
  )
}
