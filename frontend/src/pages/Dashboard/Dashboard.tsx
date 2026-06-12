import { Film, Star, Flame, ArrowRight, Plus, Clock, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../contexts'
import { formatDate, getGreeting } from '../../utils'
import { StatBox, EmptyState, GenrePill, Poster } from '../../components'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, stats, watchLogs, streak, watchlist, personalRatings } = useApp()
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
        <header className={styles.header}>
          <div className={styles.greetingBlock}>
            <p className={styles.greeting}>{getGreeting()}</p>
            <h1 className={styles.username}>{user.username}</h1>
          </div>
          <Link to="/log" className={`btn btn-primary ${styles.logBtn}`}>
            <Plus size={16} />
            Log Film
          </Link>
        </header>

        {/* Streak bar — full width */}
        <section 
          className={`${styles.streakBanner} ${isSecured ? styles.streakSecured : styles.streakPending}`} 
          aria-label="Weekly streak"
        >
          <div className={styles.streakFlame}>
            <Flame size={20} fill={isSecured ? "var(--color-amber-400)" : "none"} />
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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently watched</h2>
            <Link to="/diary" className={styles.seeAll}>
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <EmptyState
              icon={<Film size={36} strokeWidth={1.5} />}
              title={<>No films here yet.<br />What did you watch recently?</>}
              actionLabel="Log first film"
              actionLink="/log"
              actionIcon={<Plus size={16} />}
            />
          ) : (
            <ul className={styles.logList} role="list">
              {recentLogs.map((log, i) => (
                <li key={log.id}>
                  <Link to={`/title/${log.title_id}`} className={styles.logCardLink}>
                  <article className={styles.logCard} style={{ '--stagger': i } as React.CSSProperties}>
                    {/* Poster */}
                    <div className={styles.posterCol}>
                      <Poster
                        title={log.title.title}
                        src={log.title.poster_path}
                        alt={`Poster ${log.title.type === 'film' ? 'film' : 'series'} ${log.title.title} (${log.title.release_year})`}
                        className={styles.poster}
                        size="sm"
                      />
                    </div>

                    {/* Info */}
                    <div className={styles.logInfo}>
                      <h3 className={styles.logTitle}>{log.title.title}</h3>
                      <div className={styles.logMeta}>
                        <span className={styles.metaYear}>{log.title.release_year}</span>
                        {log.season_number && (
                          <span className="badge">Season {log.season_number}</span>
                        )}
                        {log.rewatch_count > 0 && (
                          <span className="badge badge-violet">Rewatch</span>
                        )}
                      </div>
                      {(() => {
                        const ratingToShow = log.title.type === 'film'
                          ? (log.rating ?? personalRatings[log.title_id])
                          : personalRatings[log.title_id];
                        if (ratingToShow == null) return null;
                        return (
                          <div className={styles.ratingBig}>
                            <Star size={12} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                            <span>{ratingToShow.toFixed(1)}</span>
                            <span className={styles.ratingMax}>/10</span>
                          </div>
                        );
                      })()}
                      {log.notes && (
                        <p className={styles.logNotes}>{log.notes}</p>
                      )}
                    </div>

                    {/* Date */}
                    <time className={styles.logDate} dateTime={log.watched_at}>
                      {formatDate(log.watched_at)}
                    </time>
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
        {/* Big stats */}
        <div className={styles.statStack}>
          <StatBox icon={<Film size={18} />} value={stats.total_films} label="Films" />
          <StatBox icon={<Tv size={18} />} value={stats.total_series} label="Series" />
          <StatBox icon={<Clock size={18} />} value={stats.total_watch_hours} label="Hours watched" unit="h" />
          <StatBox icon={<Star size={18} color="var(--color-amber-400)" fill="var(--color-amber-400)" />} value={stats.average_rating?.toFixed(1) ?? '—'} label="Average rating" />
        </div>

        {/* Watchlist preview */}
        {watchlist.length > 0 && (
          <section className={styles.watchlistPreview} aria-label="Watchlist">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Watchlist</h2>
              <Link to="/watchlist" className={styles.seeAll}>
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.watchlistPosters}>
              {watchlist.slice(0, 4).map(item => (
                <div key={item.id} className={styles.wlPosterWrap}>
                  <Poster
                    title={item.title.title}
                    src={item.title.poster_path}
                    alt={`Poster ${item.title.title}`}
                    className={styles.wlPoster}
                    size="sm"
                  />
                  <div className={styles.wlPosterOverlay}>
                    <span className={styles.wlTitle}>{item.title.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fav genres */}
        {stats.favorite_genres.length > 0 && (
          <section className={styles.genreWidget} aria-label="Favorite genres">
            <h2 className={styles.sectionTitle}>Your favorite genres</h2>
            <div className={styles.genrePills}>
              {stats.favorite_genres.slice(0, 4).map(({ genre }) => (
                <GenrePill key={genre} genre={genre} />
              ))}
            </div>
          </section>
        )}

        <Link to="/stats" className={styles.statsLink}>
          View full statistics <ArrowRight size={14} />
        </Link>
      </aside>
    </div>
  )
}
