import { useState, useMemo } from 'react'
import { Film, Star, Plus, Edit3, Trash2, ChevronDown, LayoutGrid, List, AlignJustify, FolderHeart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp, useToast } from '../../contexts'
import { formatDate } from '../../utils'
import { EmptyState, CollectModal } from '../../components'
import type { Title } from '../../types'
import styles from './Diary.module.css'

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc'
type FilterType = 'all' | 'film' | 'series'
type ViewMode = 'list' | 'grid' | 'compact'

export default function Diary() {
  const { watchLogs, setWatchLogs } = useApp()
  const { addToast } = useToast()
  const [sort, setSort] = useState<SortOption>('date-desc')
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [collectTitle, setCollectTitle] = useState<Title | null>(null)

  const filtered = useMemo(() => {
    return watchLogs
      .filter(log => filter === 'all' || log.title.type === filter)
      .sort((a, b) => {
        switch (sort) {
          case 'date-desc': return new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
          case 'date-asc':  return new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime()
          case 'rating-desc': return (b.rating ?? 0) - (a.rating ?? 0)
          case 'rating-asc': return (a.rating ?? 0) - (b.rating ?? 0)
          case 'title-asc': return a.title.title.localeCompare(b.title.title)
          case 'title-desc': return b.title.title.localeCompare(a.title.title)
          case 'year-desc': {
            const yearA = a.title.release_year || 0;
            const yearB = b.title.release_year || 0;
            return yearB - yearA;
          }
          case 'year-asc': {
            const yearA = a.title.release_year || 0;
            const yearB = b.title.release_year || 0;
            return yearA - yearB;
          }
          default: return 0
        }
      })
  }, [watchLogs, filter, sort])

  function handleDelete(id: string, titleName: string) {
    setWatchLogs(prev => prev.filter(l => l.id !== id))
    addToast(`"${titleName}" removed from diary.`, 'success')
  }

  return (
    <div className={styles.page}>
      {/* ── Sticky header bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>Diary</h1>
          <span className={styles.entryCount}>{watchLogs.length} entries</span>
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
                            {log.season_number && (
                              <span className={styles.metaBadge}>Season {log.season_number}</span>
                            )}
                            {log.rewatch_count > 0 && (
                              <span className={`${styles.metaBadge} ${styles.metaBadgeViolet}`}>
                                Rewatch #{log.rewatch_count}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.entryRight}>
                          {log.rating != null && (
                            <div className={styles.ratingBig}>
                              <Star size={14} fill="currentColor" />
                              <span>{log.rating.toFixed(1)}</span>
                              <span className={styles.ratingMax}>/10</span>
                            </div>
                          )}
                          <div className={styles.entryActions}>
                            <button
                              className="btn btn-icon btn-ghost"
                              aria-label={`Collect ${log.title.title}`}
                              onClick={() => setCollectTitle(log.title)}
                              title="Add to Collection"
                            >
                              <FolderHeart size={14} />
                            </button>
                            <button
                              className="btn btn-icon btn-ghost"
                              aria-label={`Edit entry ${log.title.title}`}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn btn-icon btn-ghost"
                              style={{ color: 'var(--color-error)' }}
                              aria-label={`Delete entry ${log.title.title}`}
                              onClick={() => handleDelete(log.id, log.title.title)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      <CollectModal
        title={collectTitle}
        onClose={() => setCollectTitle(null)}
      />
    </div>
  )
}

