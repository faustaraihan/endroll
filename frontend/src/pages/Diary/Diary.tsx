import { useState, useMemo } from 'react'
import { Film, Star, Plus, ChevronDown, LayoutGrid, List, AlignJustify } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../contexts'
import { formatDate } from '../../utils'
import { EmptyState } from '../../components'
import styles from './Diary.module.css'
import type { WatchLog } from '../../types'

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc'
type FilterType = 'all' | 'film' | 'series'
type ViewMode = 'list' | 'grid' | 'compact'

export default function Diary() {
  const { watchLogs, personalRatings } = useApp()
  const [sort, setSort] = useState<SortOption>('date-desc')
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const filtered = useMemo(() => {
    // 1. Filter out episode logs (if any) and filter by type (film / series)
    const baseLogs = watchLogs
      .filter(log => filter === 'all' || log.title.type === filter)
      .filter(log => log.episode_number === undefined || log.episode_number === null)

    // 2. Group by title.id
    const groups: Record<string, WatchLog[]> = {}
    for (const log of baseLogs) {
      const key = log.title.id
      if (!groups[key]) groups[key] = []
      groups[key].push(log)
    }

    // 3. For each group, find the latest log (representative)
    // To make it stable and consistent, we sort the group by watched_at descending,
    // and if dates are equal, by their original index in the watchLogs array ascending
    // (since index 0 is the newest, index N is the oldest).
    const watchLogIndexMap = new Map<string, number>()
    watchLogs.forEach((log, index) => {
      watchLogIndexMap.set(log.id, index)
    })

    const groupedLogs = Object.values(groups).map(group => {
      const sortedGroup = [...group].sort((a, b) => {
        const dateDiff = new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        if (dateDiff !== 0) return dateDiff
        const idxA = watchLogIndexMap.get(a.id) ?? 0
        const idxB = watchLogIndexMap.get(b.id) ?? 0
        return idxA - idxB
      })

      // The representative log is the latest one
      return sortedGroup[0]
    })

    // 4. Sort the grouped logs based on user sort selection
    return groupedLogs.sort((a, b) => {
      switch (sort) {
        case 'date-desc': return new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        case 'date-asc':  return new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime()
        case 'rating-desc': {
          const rA = (a.title.type === 'film' ? (a.rating ?? personalRatings[a.title.id]) : personalRatings[a.title.id]) ?? 0
          const rB = (b.title.type === 'film' ? (b.rating ?? personalRatings[b.title.id]) : personalRatings[b.title.id]) ?? 0
          return rB - rA
        }
        case 'rating-asc': {
          const rA = (a.title.type === 'film' ? (a.rating ?? personalRatings[a.title.id]) : personalRatings[a.title.id]) ?? 0
          const rB = (b.title.type === 'film' ? (b.rating ?? personalRatings[b.title.id]) : personalRatings[b.title.id]) ?? 0
          return rA - rB
        }
        case 'title-asc': return a.title.title.localeCompare(b.title.title)
        case 'title-desc': return b.title.title.localeCompare(a.title.title)
        case 'year-desc': {
          const yearA = a.title.release_year || 0
          const yearB = b.title.release_year || 0
          return yearB - yearA
        }
        case 'year-asc': {
          const yearA = a.title.release_year || 0
          const yearB = b.title.release_year || 0
          return yearA - yearB
        }
        default: return 0
      }
    })
  }, [watchLogs, filter, sort, personalRatings])



  return (
    <div className={styles.page}>
      {/* ── Sticky header bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>Diary</h1>
          <span className={styles.entryCount}>{filtered.length} entries</span>
        </div>

        <div className={styles.controls}>
          {/* View Mode Toggle */}
          <div className={styles.viewToggleGroup} role="group" aria-label="Tampilan">
            <button
              className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('list')}
              title="Details View"
            >
              <List size={16} />
            </button>
            <button
              className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
              title="Large Icons View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`${styles.viewToggleBtn} ${viewMode === 'compact' ? styles.viewToggleBtnActive : ''}`}
              onClick={() => setViewMode('compact')}
              title="Compact / Tiles View"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          {/* Filter pills */}
          <div className={styles.filterGroup} role="group" aria-label="Filter tipe">
            {(['all', 'film', 'series'] as FilterType[]).map(f => (
              <button
                key={f}
                className={`${styles.filterPill} ${filter === f ? styles.filterPillActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'film' ? 'Film' : 'Series'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className={styles.sortWrap}>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              aria-label="Urutkan berdasarkan"
            >
              <option value="date-desc">Watched: Newest</option>
              <option value="date-asc">Watched: Oldest</option>
              <option value="rating-desc">Rating: Highest</option>
              <option value="rating-asc">Rating: Lowest</option>
              <option value="title-asc">Title: A–Z</option>
              <option value="title-desc">Title: Z–A</option>
              <option value="year-desc">Release Year: Newest</option>
              <option value="year-asc">Release Year: Oldest</option>
            </select>
            <ChevronDown size={14} className={styles.sortIcon} />
          </div>

          <Link to="/log" className="btn btn-primary btn-sm">
            <Plus size={14} /> Log
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Film size={40} strokeWidth={1.5} />}
            title={<>No entries yet.<br />What did you watch recently?</>}
            actionLabel="Log now"
            actionLink="/log"
            actionIcon={<Plus size={16} />}
          />
        ) : (
          <div className={styles.timeline}>
            <ul className={`${styles.diaryList} ${styles[viewMode]}`} role="list">
              {filtered.map((log, i) => (
                <li key={log.id}>
                  <article
                    className={styles.entry}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {/* Poster */}
                    <Link to={`/title/${log.title.id}`} className={styles.entryPosterLink}>
                      {log.title.poster_path ? (
                        <img
                          src={log.title.poster_path}
                          alt={`Poster film ${log.title.title} (${log.title.release_year})`}
                          className={styles.posterImg}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.posterFallback}>
                          <Film size={24} />
                        </div>
                      )}
                    </Link>

                    {/* Body */}
                    <div className={styles.entryBody}>
                      <div className={styles.entryRow}>
                        <div className={styles.entryLeft}>
                          <Link to={`/title/${log.title.id}`} className={styles.entryTitleLink}>
                            <h2 className={styles.entryTitle}>{log.title.title}</h2>
                          </Link>
                          <div className={styles.entryMeta}>
                            <span className={styles.metaType}>
                              {log.title.type === 'film' ? 'Film' : 'Series'}
                            </span>
                            {log.title.release_year && (
                              <span className={styles.metaYear}>{log.title.release_year}</span>
                            )}
                            {log.title.type === 'film' && log.rewatch_count > 0 && (
                              <span className={`${styles.metaBadge} ${styles.metaBadgeViolet}`}>
                                Rewatch #{log.rewatch_count}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.entryRight}>
                          {log.title.type === 'film' && log.rating !== undefined && log.rating !== null ? (
                            <div className={styles.ratingBig}>
                              <Star size={14} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                              <span>{log.rating.toFixed(1)}</span>
                              <span className={styles.ratingMax}>/10</span>
                            </div>
                          ) : personalRatings[log.title.id] !== undefined ? (
                            <div className={styles.ratingBig}>
                              <Star size={14} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                              <span>{personalRatings[log.title.id].toFixed(1)}</span>
                              <span className={styles.ratingMax}>/10</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {log.notes && (
                        <blockquote className={styles.notes}>
                          "{log.notes}"
                        </blockquote>
                      )}

                      <div className={styles.entryFooter}>
                        <time className={styles.date} dateTime={log.watched_at}>
                          {formatDate(log.watched_at)}
                        </time>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>


    </div>
  )
}

