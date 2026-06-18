import { ArrowRight, Flame, Check, Star } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useDynamicStreak, useDynamicStats, useDailyActivity } from '../../store/useDerivedState'
import { Poster } from '../../components'
import styles from './Stats.module.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getHeatmapWeeks(): string[][] {
  // Today is 2026-06-16 in mock state
  const today = new Date('2026-06-16')
  
  // Find the Monday of the current week (day: 0 = Sunday, 1 = Monday, etc.)
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const currentMonday = new Date(today)
  currentMonday.setDate(today.getDate() + mondayOffset)
  currentMonday.setHours(0, 0, 0, 0)
  
  // Go back 51 weeks to find the oldest Monday
  const startMonday = new Date(currentMonday)
  startMonday.setDate(currentMonday.getDate() - 51 * 7)
  
  const weeks: string[][] = []
  const cursor = new Date(startMonday)
  
  for (let w = 0; w < 52; w++) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      week.push(cursor.toISOString().split('T')[0])
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function activityLevel(count: number | undefined): string {
  if (!count || count === 0) return styles.cellEmpty
  if (count === 1) return styles.cellLow
  if (count === 2) return styles.cellMid
  return styles.cellHigh
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Stats() {
  const watchLogs = useStore(state => state.watchLogs)
  const personalRatings = useStore(state => state.personalRatings)
  const user = useStore(state => state.user)
  const dailyActivity = useDailyActivity()
  const streak = useDynamicStreak()
  const stats = useDynamicStats()

  // Personalized info
  const firstName = user.username.split(' ')[0]

  const weeks = getHeatmapWeeks()
  const maxGenreCount = stats.favorite_genres[0]?.count ?? 1
  const maxEraCount = Math.max(...(stats.era_distribution?.map((e: {era: string, count: number}) => e.count) ?? [1]))
  const maxMonthCount = Math.max(...(stats.monthly_activity?.map((m: {month: string, count: number}) => m.count) ?? [1]))

  // Comfort Cinema: Top 5 watched titles for this user (total watch count > 1)
  const titleWatchCounts = new Map<string, { log: typeof watchLogs[0]; totalWatches: number }>()
  watchLogs.forEach(log => {
    const existing = titleWatchCounts.get(log.title_id)
    const watchesForThisLog = 1 + log.rewatch_count
    if (existing) {
      existing.totalWatches += watchesForThisLog
      if (new Date(log.watched_at) > new Date(existing.log.watched_at)) {
        existing.log = log
      }
    } else {
      titleWatchCounts.set(log.title_id, {
        log,
        totalWatches: watchesForThisLog
      })
    }
  })
  const comfortCinema = Array.from(titleWatchCounts.values())
    .sort((a, b) => {
      if (b.totalWatches !== a.totalWatches) {
        return b.totalWatches - a.totalWatches
      }
      const ratingA = personalRatings[a.log.title_id] ?? 0
      const ratingB = personalRatings[b.log.title_id] ?? 0
      if (ratingB !== ratingA) {
        return ratingB - ratingA
      }
      return new Date(b.log.watched_at).getTime() - new Date(a.log.watched_at).getTime()
    })
    .slice(0, 5)
    .map(item => ({
      ...item.log,
      total_watch_count: item.totalWatches
    }))

  // Rating Curve
  const ratings = Object.values(personalRatings)
  const ratingCounts = new Array(10).fill(0)
  let maxRatingCount = 0
  ratings.forEach(r => {
    const bucket = Math.min(Math.max(Math.ceil(r) - 1, 0), 9)
    ratingCounts[bucket]++
    if (ratingCounts[bucket] > maxRatingCount) maxRatingCount = ratingCounts[bucket]
  })

  // Calculate if the user has logged a title this week (Monday to Sunday)
  const isSecured = (() => {
    const today = new Date('2026-06-16')
    const day = today.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() + mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return watchLogs.some(log => {
      const logDate = new Date(log.watched_at)
      return logDate >= startOfWeek && logDate <= endOfWeek
    })
  })()

  // Generate current week tracker days (Mon-Sun)
  const currentWeekDays = (() => {
    const today = new Date('2026-06-16')
    const day = today.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    
    const currentMonday = new Date(today)
    currentMonday.setDate(today.getDate() + mondayOffset)
    currentMonday.setHours(0, 0, 0, 0)
    
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    const trackerDays = []
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday)
      d.setDate(currentMonday.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      
      const hasLog = watchLogs.some(log => log.watched_at === dateStr)
      const isToday = dateStr === '2026-06-16'
      
      trackerDays.push({
        dateStr,
        label: dayLabels[i],
        logged: hasLog,
        isToday
      })
    }
    return trackerDays
  })()

  return (
    <div className={styles.page}>
      {/* ── Personalized Header ── */}
      <header className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className={styles.profileAvatarImg} />
          ) : (
            <div className={styles.avatarGradient}>
              <span className={styles.profileInitial}>{firstName[0]}</span>
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <p className="eyebrow">Personal Insights</p>
          <h1 className={styles.pageTitle}>{firstName}'s Cinematic Rhythm</h1>
          <p className={styles.pageSub}>
            {stats.total_films + stats.total_series} watch logs. A quiet archive of frames, feelings, and memories.
          </p>
        </div>
      </header>

      {/* ── Hero Stats ── */}
      <div className={styles.heroStats}>
        <div className={styles.heroStatBlock}>
          <span className={styles.heroValue}>{stats.total_films}</span>
          <span className={styles.heroLabel}>Films</span>
        </div>
        <div className={styles.heroStatBlock}>
          <span className={styles.heroValue}>{stats.total_series}</span>
          <span className={styles.heroLabel}>Series</span>
        </div>
        <div className={styles.heroStatBlock}>
          <span className={styles.heroValue}>
            {stats.total_watch_hours}<span className={styles.heroUnit}>h</span>
          </span>
          <span className={styles.heroLabel}>Watched</span>
        </div>
        <div className={styles.heroStatBlock}>
          <span className={styles.heroValue}>
            <Star size={18} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" style={{ alignSelf: 'center' }} />
            {stats.average_rating?.toFixed(1) ?? '—'}
          </span>
          <span className={styles.heroLabel}>Avg Rating</span>
        </div>
      </div>

      {/* ── Comfort Cinema (Compact row below Hero Stats) ── */}
      {comfortCinema.length > 0 && (
        <section className={styles.comfortSection} aria-label="Comfort cinema">
          <div className={styles.sectionHeaderCompact}>
            <h2 className={styles.sectionTitleCompact}>Comfort Cinema</h2>
            <span className={styles.sectionBadgeCompact}>• {comfortCinema.length} titles</span>
          </div>
          <div className={styles.comfortList}>
            {comfortCinema.map(log => (
              <div key={log.title_id} className={styles.comfortPosterCard}>
                <div className={styles.comfortPosterWrap}>
                  <Poster
                    title={log.title.title}
                    src={log.title.poster_path}
                    alt={`Poster ${log.title.title}`}
                    className={styles.comfortPoster}
                    size="sm"
                  />
                  {log.total_watch_count > 1 && (
                    <div className={styles.comfortCountBadge}>{log.total_watch_count}×</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Streak & Heatmap Row ── */}
      <div className={styles.streakGrid}>
        {/* Left: Streak card */}
        <section
          className={`${styles.streakCard} ${isSecured ? styles.streakCardSecured : styles.streakCardPending}`}
          aria-label="Weekly streak"
        >
          <div className={styles.streakCardHeader}>
            <div className={styles.streakFlameSquare}>
              <Flame size={18} fill={isSecured ? "var(--accent-contrast, #17120a)" : "none"} color={isSecured ? "var(--accent-contrast, #17120a)" : "currentColor"} />
            </div>
            <div className={styles.streakCardInfo}>
              <h2 className={styles.streakCardTitle}>{streak.current_streak_weeks}-Week Streak</h2>
              <p className={styles.streakCardStatus}>
                {isSecured ? 'Secured for this week' : 'Log a watch to secure'}
              </p>
            </div>
            <div className={styles.streakCardBest}>
              Best
              <strong>{streak.longest_streak_weeks}w</strong>
            </div>
          </div>

          {/* Weekly Tracker */}
          <div className={styles.weeklyTracker}>
            <span className={styles.weeklyTrackerTitle}>This Week</span>
            <div className={styles.weeklyTrackerDays}>
              {currentWeekDays.map(day => (
                <div key={day.dateStr} className={styles.weeklyDayCell} title={day.dateStr}>
                  <div
                    className={`${styles.weeklyDayBubble} ${day.logged ? styles.weeklyDayBubbleLogged : ''} ${day.isToday ? styles.weeklyDayToday : ''}`}
                  >
                    {day.logged ? <Check size={11} strokeWidth={3} /> : day.label}
                  </div>
                  <span className={styles.weeklyDayLabel}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Heatmap card */}
        <section className={styles.heatmapCard} aria-label="Activity heatmap">
          <div className={styles.heatmapHeader}>
            <span className={styles.heatmapPeriod}>Cinematic Rhythm (Last 12 Months)</span>
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
                    const count = dailyActivity[day] ?? 0
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
        </section>
      </div>



      {/* ── Genre Focus + Rating Curve ── */}
      <div className={styles.splitRow}>
        <section className={styles.genreCard} aria-label="Genre focus">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Genre Focus</h2>
            <span className={styles.sectionBadge}>Top {stats.favorite_genres.length}</span>
          </div>
          <div className={styles.genreList}>
            {stats.favorite_genres.map(({ genre, count }: { genre: string; count: number }) => (
              <div key={genre} className={styles.genreRow}>
                <span className={styles.genreName}>{genre}</span>
                <div className={styles.genreTrack}>
                  <div className={styles.genreFill} style={{ width: `${(count / maxGenreCount) * 100}%` }} />
                </div>
                <span className={styles.genreCount}>{count} titles</span>
              </div>
            ))}
          </div>
        </section>

        {ratings.length > 0 && (
          <section className={styles.chartCard} aria-label="Rating curve">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>The Rating Curve</h2>
              <span className={styles.sectionBadge}>{ratings.length} ratings</span>
            </div>
            <div className={styles.chartWrap}>
              {ratingCounts.map((count, i) => (
                <div key={i} className={styles.chartCol}>
                  <div className={styles.chartBarWrap}>
                    <div
                      className={`${styles.chartBar} ${count === maxRatingCount && count > 0 ? styles.chartBarPeak : ''}`}
                      style={{ height: `${maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={styles.chartLabel}>{i + 1}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Eras Explored + Cinematic Flow ── */}
      <div className={styles.splitRow}>
        {stats.era_distribution && (
          <section className={styles.chartCard} aria-label="Eras explored">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Eras Explored</h2>
            </div>
            <div className={styles.chartWrap}>
              {stats.era_distribution.map(({ era, count }: { era: string; count: number }) => (
                <div key={era} className={styles.chartCol}>
                  <div className={styles.chartBarWrap}>
                    <div
                      className={`${styles.chartBar} ${count === maxEraCount ? styles.chartBarPeak : ''}`}
                      style={{ height: `${(count / maxEraCount) * 100}%` }}
                    />
                  </div>
                  <span className={styles.chartLabel}>{era}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {stats.monthly_activity && stats.monthly_activity.length > 0 && (
          <section className={styles.chartCard} aria-label="Monthly activity">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Cinematic Flow</h2>
              <span className={styles.sectionBadge}>Last 6 months</span>
            </div>
            <div className={styles.chartWrap}>
              {stats.monthly_activity.slice(-6).map(({ month, count }: { month: string; count: number }) => (
                <div key={month} className={styles.chartCol}>
                  <div className={styles.chartBarWrap}>
                    <div
                      className={`${styles.chartBar} ${count === maxMonthCount && count > 0 ? styles.chartBarPeak : ''}`}
                      style={{ height: `${(count / maxMonthCount) * 100}%` }}
                    />
                  </div>
                  <span className={styles.chartLabel}>{month.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Directors + Actors ── */}
      <div className={styles.splitRow}>
        <section className={styles.facesCard} aria-label="Most watched directors">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Most Watched Directors</h2>
            <button className={styles.viewAllBtn}>View all <ArrowRight size={12} /></button>
          </div>
          <div className={styles.facesList}>
            {stats.favorite_directors.map(({ director, count, avatar_url }: { director: string; count: number; avatar_url?: string }) => (
              <div key={director} className={styles.faceItem}>
                <div className={styles.faceAvatar}>
                  {avatar_url ? <img src={avatar_url} alt="" /> : <span className={styles.faceInitials}>{initials(director)}</span>}
                </div>
                <div className={styles.faceInfo}>
                  <span className={styles.faceName}>{director}</span>
                  <span className={styles.faceCount}>{count} films</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {stats.favorite_actors && (
          <section className={styles.facesCard} aria-label="Most watched actors">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Faces of Your Journal</h2>
              <button className={styles.viewAllBtn}>View all <ArrowRight size={12} /></button>
            </div>
            <div className={styles.facesList}>
              {stats.favorite_actors.map(({ name, count, avatar_url }: { name: string; count: number; avatar_url?: string }) => (
                <div key={name} className={styles.faceItem}>
                  <div className={styles.faceAvatar}>
                    {avatar_url ? <img src={avatar_url} alt="" /> : <span className={styles.faceInitials}>{initials(name)}</span>}
                  </div>
                  <div className={styles.faceInfo}>
                    <span className={styles.faceName}>{name}</span>
                    <span className={styles.faceCount}>{count} watches</span>
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
