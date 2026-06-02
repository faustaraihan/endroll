import { Film, Tv, Clock, Star, ArrowRight } from 'lucide-react'
import { useApp } from '../../contexts'
import { mockDailyActivity } from '../../data/mockData'
import { StatBox } from '../../components'
import styles from './Stats.module.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the last N days as ISO date strings (oldest → newest) */
function getLastNDays(n: number): string[] {
  const days: string[] = []
  const today = new Date('2026-06-02')
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/** Activity level 0–3 mapped to CSS class */
function activityLevel(count: number | undefined): string {
  if (!count || count === 0) return styles.cellEmpty
  if (count === 1) return styles.cellLow
  if (count === 2) return styles.cellMid
  return styles.cellHigh
}

/** Generate director initials from name */
function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Stats() {
  const { stats, streak } = useApp()

  const days = getLastNDays(91) // ~13 weeks of 7 days
  const maxGenreCount = stats.favorite_genres[0]?.count ?? 1
  const maxEraCount = Math.max(...(stats.era_distribution?.map(e => e.count) ?? [1]))
  const maxMonthCount = Math.max(...(stats.monthly_activity?.map(m => m.count) ?? [1]))

  // Chunk days into weeks (columns) for the heatmap
  const weeks: string[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Your cinematic rhythm.</h1>
        <p className={styles.pageSub}>
          A private look at your viewing habits over the past 90 days. Consistent watching builds your streak.
        </p>
      </header>

      {/* ── Main content grid ── */}
      <div className={styles.mainGrid}>
        {/* ── Left: Streak heatmap ── */}
        <section className={styles.heatmapCard} aria-label="Watch activity heatmap">
          <div className={styles.heatmapTop}>
            <div className={styles.streakInfo}>
              <span className={styles.streakLabel}>CURRENT STREAK</span>
              <div className={styles.streakValue}>
                {streak.current_streak_weeks}
                <span className={styles.streakUnit}>weeks</span>
              </div>
              <div className={styles.streakBest}>
                🔥 Personal best: {streak.longest_streak_weeks} weeks
              </div>
            </div>

            <div className={styles.heatmapWrap}>
              <div className={styles.heatmapLegendRow}>
                <span className={styles.heatmapPeriod}>Last 90 Days</span>
                <div className={styles.heatmapLegend}>
                  <span className={styles.legendLabel}>Less</span>
                  <span className={`${styles.legendDot} ${styles.cellEmpty}`} />
                  <span className={`${styles.legendDot} ${styles.cellLow}`} />
                  <span className={`${styles.legendDot} ${styles.cellMid}`} />
                  <span className={`${styles.legendDot} ${styles.cellHigh}`} />
                  <span className={styles.legendLabel}>More</span>
                </div>
              </div>

              <div className={styles.heatmapScroll}>
                <div className={styles.heatmap} role="grid" aria-label="Activity heatmap">
                  {weeks.map((week, wi) => (
                    <div key={wi} className={styles.heatmapCol} role="row">
                      {week.map(day => {
                        const count = mockDailyActivity[day] ?? 0
                        return (
                          <div
                            key={day}
                            role="gridcell"
                            className={`${styles.heatmapCell} ${activityLevel(count)}`}
                            title={`${day}: ${count} film${count !== 1 ? 's' : ''} watched`}
                            aria-label={`${day}: ${count} films watched`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right: Stat cards ── */}
        <div className={styles.statCardsGrid}>
          <StatBox icon={<Film size={18} />} value={stats.total_films} label="Total Films" />
          <StatBox icon={<Tv size={18} />} value={stats.total_series} label="Series Finished" />
          <StatBox icon={<Clock size={18} />} value={stats.total_watch_hours} label="Total Watched" unit="h" />
          <StatBox icon={<Star size={18} color="var(--color-amber-400)" fill="var(--color-amber-400)" />} value={stats.average_rating?.toFixed(1) ?? '—'} label="Average Rating" />
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>
        {/* Genre Focus */}
        <section className={styles.genreCard} aria-label="Genre focus">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Genre Focus</h2>
            <span className={styles.sectionBadge}>Top {stats.favorite_genres.length}</span>
          </div>
          <div className={styles.genreList}>
            {stats.favorite_genres.map(({ genre, count }, i) => (
              <div key={genre} className={styles.genreRow}>
                <span className={styles.genreName}>{genre}</span>
                <div className={styles.genreTrack} role="meter" aria-valuenow={count} aria-valuemax={maxGenreCount} aria-label={`${genre}: ${count} titles`}>
                  <div
                    className={styles.genreFill}
                    style={{
                      width: `${(count / maxGenreCount) * 100}%`,
                      '--bar-index': i,
                    } as React.CSSProperties}
                  />
                </div>
                <span className={styles.genreCount}>{count} titles</span>
              </div>
            ))}
          </div>
        </section>

        {/* Eras Explored */}
        {stats.era_distribution && (
          <section className={styles.erasCard} aria-label="Eras explored">
            <h2 className={styles.sectionTitle}>Eras Explored</h2>
            <div className={styles.erasChart}>
              {stats.era_distribution.map(({ era, count }) => (
                <div key={era} className={styles.eraCol}>
                  <div className={styles.eraBarWrap}>
                    <div
                      className={styles.eraBar}
                      style={{ height: `${(count / maxEraCount) * 100}%` }}
                      role="meter"
                      aria-valuenow={count}
                      aria-valuemax={maxEraCount}
                      aria-label={`${era}: ${count} films`}
                    />
                  </div>
                  <span className={styles.eraLabel}>{era}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Cinematic Flow ── */}
      {stats.monthly_activity && stats.monthly_activity.length > 0 && (
        <section className={styles.flowCard} aria-label="Monthly activity">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cinematic Flow</h2>
            <span className={styles.sectionBadge}>Last 12 Months</span>
          </div>
          <div className={styles.flowChart}>
            {stats.monthly_activity.map(({ month, count }) => {
              const isPeak = count === maxMonthCount && count > 0
              return (
                <div key={month} className={styles.flowCol}>
                  <div className={styles.flowBarWrap}>
                    <div
                      className={`${styles.flowBar} ${isPeak ? styles.flowBarPeak : ''}`}
                      style={{ height: `${(count / maxMonthCount) * 100}%` }}
                      role="meter"
                      aria-valuenow={count}
                      aria-valuemax={maxMonthCount}
                      aria-label={`${month}: ${count} titles`}
                      title={`${month}: ${count} titles`}
                    />
                  </div>
                  <span className={styles.flowLabel}>{month}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Bottom Grid ── */}
      <div className={styles.bottomGrid}>
        {/* Most Watched Directors */}
        <section className={styles.directorsCard} aria-label="Most watched directors">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Most Watched Directors</h2>
            <button className={styles.viewAllBtn} aria-label="View all directors">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className={styles.directorsList}>
            {stats.favorite_directors.map(({ director, count, avatar_url }) => (
              <div key={director} className={styles.directorItem}>
                <div className={styles.directorAvatar} aria-hidden="true">
                  {avatar_url ? (
                    <img src={avatar_url} alt={`Photo of ${director}`} className={styles.directorAvatarImg} />
                  ) : (
                    <span className={styles.directorInitials}>{initials(director)}</span>
                  )}
                </div>
                <div className={styles.directorInfo}>
                  <span className={styles.directorName}>{director}</span>
                  <span className={styles.directorCount}>{count} films</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Faces of Your Journal (Favorite Actors) */}
        {stats.favorite_actors && (
          <section className={styles.actorsCard} aria-label="Most watched actors">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Faces of Your Journal</h2>
              <button className={styles.viewAllBtn} aria-label="View all actors">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.actorsList}>
              {stats.favorite_actors.map(({ name, count, avatar_url }) => (
                <div key={name} className={styles.actorItem}>
                  <div className={styles.actorAvatar} aria-hidden="true">
                    {avatar_url ? (
                      <img src={avatar_url} alt={`Photo of ${name}`} className={styles.actorAvatarImg} />
                    ) : (
                      <span className={styles.actorInitials}>{initials(name)}</span>
                    )}
                  </div>
                  <div className={styles.actorInfo}>
                    <span className={styles.actorName}>{name}</span>
                    <span className={styles.actorCount}>{count} watches</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
