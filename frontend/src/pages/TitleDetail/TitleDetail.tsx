import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Film,
  Plus,
  Bookmark,
  BookmarkCheck,
  FolderHeart,
  Star,
  Clock,
  CalendarDays,
  BookOpen,
} from 'lucide-react'
import { useApp } from '../../contexts'
import { useToast } from '../../contexts'
import { formatRuntime, getInitials } from '../../utils'
import { GenrePill, CollectModal, SeriesTracker } from '../../components'
import { mockTitles } from '../../data/mockData'
import styles from './TitleDetail.module.css'

export default function TitleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    watchLogs,
    watchlist,
    setWatchlist,
    collectionItems,
    personalRatings,
    setRatingForTitle,
  } = useApp()
  const { addToast } = useToast()

  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [collectModalOpen, setCollectModalOpen] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [tempRating, setTempRating] = useState<number | null>(null)

  // Find the title
  const title = useMemo(
    () => mockTitles.find((t) => t.id === id),
    [id]
  )

  // Get user's watch logs for this title (excluding episode-level logs for clean journal)
  const titleLogs = useMemo(
    () =>
      watchLogs
        .filter((log) => log.title_id === id && (log.episode_number === undefined || log.episode_number === null))
        .sort(
          (a, b) =>
            new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        ),
    [watchLogs, id]
  )

  // Check watchlist status
  const isInWatchlist = useMemo(
    () => watchlist.some((item) => item.title_id === id),
    [watchlist, id]
  )

  // Compute personal stats
  const personalStats = useMemo(() => {
    if (titleLogs.length === 0) return null
    const totalRewatches = titleLogs.reduce(
      (sum, l) => sum + l.rewatch_count,
      0
    )
    return {
      timesWatched: titleLogs.length,
      totalRewatches,
    }
  }, [titleLogs])

  // Number of collections this title belongs to
  const collectionsCount = useMemo(
    () =>
      new Set(
        collectionItems
          .filter((item) => item.title_id === id)
          .map((item) => item.collection_id)
      ).size,
    [collectionItems, id]
  )

  // Toggle watchlist
  const handleWatchlistToggle = () => {
    if (!title) return
    if (isInWatchlist) {
      setWatchlist((prev) => prev.filter((item) => item.title_id !== id))
      addToast(`${title.title} removed from watchlist`, 'info')
    } else {
      setWatchlist((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: 'u1',
          title_id: title.id,
          title,
          added_at: new Date().toISOString(),
          priority: prev.length + 1,
        },
      ])
      addToast(`${title.title} added to watchlist`, 'success')
    }
  }

  // Parse date for display
  const parseDateParts = (dateStr: string) => {
    const d = new Date(dateStr)
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
    }
  }

  // ── Not found ──
  if (!title) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <Film size={48} strokeWidth={1.5} />
          <h1 className={styles.notFoundTitle}>Title not found</h1>
          <p className={styles.notFoundText}>
            The title you're looking for doesn't exist or has been removed.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero} aria-label={`Details for ${title.title}`}>
        {/* Blurred backdrop */}
        <div className={styles.heroBackdrop}>
          {title.poster_path ? (
            <img
              src={title.poster_path}
              alt=""
              aria-hidden="true"
              className={styles.heroBackdropImg}
            />
          ) : (
            <div className={styles.heroBackdropFallback} />
          )}
        </div>
        <div className={styles.heroGradient} />

        {/* Content */}
        <div className={styles.heroContent}>
          {/* Poster */}
          <div className={styles.posterWrap}>
            {title.poster_path ? (
              <img
                src={title.poster_path}
                alt={`Poster ${title.title} (${title.release_year})`}
                className={styles.poster}
              />
            ) : (
              <div className={styles.posterFallback}>
                <Film size={40} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Title info */}
          <div className={styles.titleInfo}>
            <button
              className={styles.backBtn}
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <h1 className={styles.titleName}>{title.title}</h1>

            <div className={styles.titleMeta}>
              {title.release_year && <span>{title.release_year}</span>}
              {title.runtime_minutes && (
                <>
                  <span className={styles.metaDot} />
                  <span>{formatRuntime(title.runtime_minutes)}</span>
                </>
              )}
              <span className={styles.metaDot} />
              <span className={styles.typeBadge}>
                {title.type === 'film' ? 'Film' : 'Series'}
              </span>
            </div>

            {title.director && (
              <p className={styles.director}>
                Directed by <strong>{title.director}</strong>
              </p>
            )}

            {title.genres.length > 0 && (
              <div className={styles.genreRow}>
                {title.genres.map((genre) => (
                  <GenrePill key={genre} genre={genre} />
                ))}
              </div>
            )}

            {title.overview && (
              <>
                <p
                  className={`${styles.overview} ${
                    overviewExpanded
                      ? styles.overviewExpanded
                      : styles.overviewClamped
                  }`}
                >
                  {title.overview}
                </p>
                {title.overview.length > 150 && (
                  <button
                    className={styles.expandBtn}
                    onClick={() => setOverviewExpanded(!overviewExpanded)}
                  >
                    {overviewExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ ACTION BAR ══════════ */}
      <div className={styles.actionBar}>
        <Link to="/log" state={{ title }} className={styles.actionBtnPrimary}>
          <Plus size={14} />
          Log this
        </Link>

        <button
          className={
            isInWatchlist ? styles.actionBtnActive : styles.actionBtn
          }
          onClick={handleWatchlistToggle}
        >
          {isInWatchlist ? (
            <>
              <BookmarkCheck size={14} />
              In Watchlist
            </>
          ) : (
            <>
              <Bookmark size={14} />
              Watchlist
            </>
          )}
        </button>

        <button
          className={styles.actionBtn}
          onClick={() => setCollectModalOpen(true)}
        >
          <FolderHeart size={14} />
          Collect
        </button>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div className={styles.body}>
        {/* ── Journal Section ── */}
        <section
          className={styles.journalSection}
          aria-label="Your journal entries"
        >
          {title.type === 'series' && (
            <SeriesTracker title={title} />
          )}

          <h2 className={styles.sectionTitle}>Your Journal</h2>

          {titleLogs.length === 0 ? (
            <div className={styles.emptyJournal}>
              <div className={styles.emptyIcon}>
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <h3 className={styles.emptyTitle}>No entries yet</h3>
              <p className={styles.emptySubtitle}>
                You haven't logged this title. Ready to watch?
              </p>
              <Link to="/log" state={{ title }} className="btn btn-primary btn-sm">
                <Plus size={14} />
                Log now
              </Link>
            </div>
          ) : (
            <ul className={styles.journalList} role="list">
              {titleLogs.map((log, i) => {
                const dateParts = parseDateParts(log.watched_at)
                return (
                  <li key={log.id}>
                    <article
                      className={styles.journalEntry}
                      style={{ '--stagger': i } as React.CSSProperties}
                    >
                      {/* Date block */}
                      <div className={styles.entryDate}>
                        <span className={styles.entryDateDay}>
                          {dateParts.day}
                        </span>
                        <span className={styles.entryDateMonth}>
                          {dateParts.month}
                        </span>
                      </div>

                      {/* Entry body */}
                      <div className={styles.entryBody}>
                        <div className={styles.entryHeader}>
                          {log.rating !== undefined && log.rating !== null && (
                            <span className={styles.entryRating}>
                              <Star size={12} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                              {log.rating.toFixed(1)}
                              <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1px' }}>/10</span>
                            </span>
                          )}
                          {log.rewatch_count > 0 && (
                            <span className={styles.entryBadge}>
                              Rewatch #{log.rewatch_count}
                            </span>
                          )}
                          {log.season_number != null && (
                            <span className={styles.entrySeasonBadge}>
                              S{log.season_number}
                              {log.episode_number != null &&
                                ` E${log.episode_number}`}
                            </span>
                          )}
                        </div>

                        {log.notes && (
                          <p className={styles.entryNotes}>"{log.notes}"</p>
                        )}
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* ── Details Sidebar ── */}
        <aside className={styles.detailsSidebar} aria-label="Title details">
          {/* Interactive Rating */}
          <div className={styles.detailBlock}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className={styles.detailLabel}>Your Rating</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!isEditingRating ? (
                  <>
                    {id && personalRatings[id] !== undefined ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTempRating(personalRatings[id])
                            setIsEditingRating(true)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-violet-400)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRatingForTitle(id, null)
                            setIsEditingRating(false)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setTempRating(5.0)
                          setIsEditingRating(true)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-violet-400)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Rate
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (id && tempRating !== null) {
                          setRatingForTitle(id, tempRating)
                        }
                        setIsEditingRating(false)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-amber-400)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingRating(false)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className={styles.ratingInteractiveArea} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className={styles.ratingInteractiveMain} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star
                  size={16}
                  fill={(isEditingRating ? tempRating : (id ? personalRatings[id] : null)) !== null ? 'var(--color-amber-400)' : 'none'}
                  color="var(--color-amber-400)"
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {isEditingRating 
                    ? (tempRating !== null ? tempRating.toFixed(1) : '—') 
                    : (id && personalRatings[id] !== undefined ? personalRatings[id].toFixed(1) : '—')
                  }
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginLeft: '3px', letterSpacing: 0 }}>/10</span>
                </span>
              </div>
              {isEditingRating && (
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={tempRating ?? 5}
                  onChange={(e) => {
                    setTempRating(parseFloat(e.target.value))
                  }}
                  style={{
                    width: '100%',
                    accentColor: 'var(--color-amber-400)',
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.1)',
                    outline: 'none'
                  }}
                  aria-label="Set rating"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Personal stats (only if has logs) */}
          {personalStats && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Your Stats</span>
              <div className={styles.quickStats}>
                <div className={styles.quickStatBox} style={{ width: '100%', gridColumn: 'span 2' }}>
                  <span className={styles.quickStatValue}>
                    {personalStats.timesWatched}
                  </span>
                  <span className={styles.quickStatLabel}>
                    {personalStats.timesWatched === 1 ? 'Watch' : 'Watches'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Collections count */}
          {collectionsCount > 0 && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Collections</span>
              <p className={styles.detailValue}>
                In {collectionsCount}{' '}
                {collectionsCount === 1 ? 'collection' : 'collections'}
              </p>
            </div>
          )}

          {/* Runtime */}
          {title.runtime_minutes && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Runtime</span>
              <div className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--color-text-muted)" />
                {formatRuntime(title.runtime_minutes)}
              </div>
            </div>
          )}

          {/* Release */}
          {title.release_year && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Release Year</span>
              <div className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarDays size={14} color="var(--color-text-muted)" />
                {title.release_year}
              </div>
            </div>
          )}

          {/* Cast */}
          {title.cast.length > 0 && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Cast</span>
              <div className={styles.castGrid}>
                {title.cast.map((actor) => (
                  <div key={actor} className={styles.castItem}>
                    <div className={styles.castAvatar}>
                      {getInitials(actor)}
                    </div>
                    <span className={styles.castName}>{actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ══════════ COLLECT MODAL ══════════ */}
      {collectModalOpen && (
        <CollectModal
          title={title}
          onClose={() => setCollectModalOpen(false)}
        />
      )}
    </div>
  )
}
