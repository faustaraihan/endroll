import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
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
import { useToast } from '../../../../contexts'
import { useStore } from '../../../../store/useStore'
import { useAllKnownTitles } from '../../../../hooks/useDerivedState'
import { formatRuntime, getInitials } from '../../../../utils'
import { BackButton, Badge } from '../../../../components'
import { GenrePill } from '../GenrePill/GenrePill'
import { CollectionModal } from '../../../lists/components/CollectionModal/CollectionModal'
import { Poster } from '../Poster/Poster'
import styles from './TitleDetailView.module.css'

export default function TitleDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const watchLogs = useStore(state => state.watchLogs)
  const setWatchLogs = useStore(state => state.setWatchLogs)
  const watchlist = useStore(state => state.watchlist)
  const setWatchlist = useStore(state => state.setWatchlist)
  const collectionItems = useStore(state => state.collectionItems)
  const personalRatings = useStore(state => state.personalRatings)
  const setRatingForTitle = useStore(state => state.setRatingForTitle)
  const { getTitleById } = useAllKnownTitles()
  const { addToast } = useToast()

  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [collectModalOpen, setCollectionModalOpen] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [tempRating, setTempRating] = useState<number | null>(null)
  
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [tempNotes, setTempNotes] = useState('')

  // Find the title by local ID or TMDB ID — we now use the central getTitleById
  // Note: id from useParams could be the local UUID or the TMDb ID string.
  // Our allKnownTitles map inside AppContext handles indexing both.
  const title = useMemo(() => {
    return id ? getTitleById(id) : undefined
  }, [id, getTitleById])

  // Use the resolved title's canonical ID for database queries to avoid ID mismatches
  const canonicalId = title?.id || id

  // Get user's watch logs for this title
  const titleLogs = useMemo(
    () =>
      watchLogs
        .filter((log) => log.title_id === canonicalId)
        .sort(
          (a, b) =>
            new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        ),
    [watchLogs, canonicalId]
  )

  // Check watchlist status
  const isInWatchlist = useMemo(
    () => watchlist.some((item) => item.title_id === canonicalId),
    [watchlist, canonicalId]
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
          .filter((item) => item.title_id === canonicalId)
          .map((item) => item.collection_id)
      ).size,
    [collectionItems, canonicalId]
  )

  // Toggle watchlist
  const handleWatchlistToggle = () => {
    if (!title) return
    if (isInWatchlist) {
      const removed = watchlist.filter((item) => item.title_id === canonicalId)
      setWatchlist((prev) => prev.filter((item) => item.title_id !== canonicalId))
      addToast(`"${title.title}" removed from watchlist.`, 'info', {
        action: {
          label: 'Undo',
          onClick: () => setWatchlist((prev) => [...removed, ...prev]),
        },
      })
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
      addToast(`"${title.title}" added to watchlist.`, 'success')
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
            onClick={() => navigate('/home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }



  return (
    <div className={styles.page}>
      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero} aria-label={`Detail ${title.title}`}>
        {/* Back button floating over backdrop */}
        <div className={styles.heroBackNav}>
          <BackButton icon="arrow" />
        </div>

        {/* Blurred backdrop */}
        <div className={styles.heroBackdrop}>
          {title.backdrop_path ? (
            <img
              src={title.backdrop_path}
              alt=""
              aria-hidden="true"
              className={styles.heroBackdropImgClear}
            />
          ) : title.poster_path ? (
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
            <Poster
              title={title.title}
              src={title.poster_path}
              alt={`Poster ${title.title} (${title.release_year})`}
              className={styles.poster}
              size="lg"
            />
          </div>

          {/* Title info */}
          <div className={styles.titleInfo}>
            <p className={styles.heroEyebrow}>
              {title.type === 'movie' ? 'Movie' : 'Series'}
            </p>
            <h1 className={styles.titleName}>{title.title}</h1>

            <div className={styles.titleMeta}>
              {title.release_year && <span>{title.release_year}</span>}
              {title.runtime_minutes && (
                <>
                  <span className={styles.metaDot} />
                  <span>{formatRuntime(title.runtime_minutes)}</span>
                </>
              )}
              {title.director && (
                <>
                  <span className={styles.metaDot} />
                  <span>
                    Directed by <strong>{title.director}</strong>
                  </span>
                </>
              )}
            </div>

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
        <Link to="/log" state={{ title }} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
          <Plus size={14} />
          Log this
        </Link>

        <button
          className={
            isInWatchlist ? `${styles.actionBtn} ${styles.actionBtnActive}` : styles.actionBtn
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
          onClick={() => setCollectionModalOpen(true)}
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
          <div className={styles.journalHeader}>
            <div>
              <p className={styles.journalEyebrow}>Your journal</p>
            </div>
          </div>

          {titleLogs.length === 0 ? (
            <div className={styles.emptyJournal}>
              <div className={styles.emptyIcon}>
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <h3 className={styles.emptyTitle}>No entries yet</h3>
              <p className={styles.emptySubtitle}>
                You haven't logged this title yet. Ready to watch?
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
                              <Star size={12} fill="var(--accent, #d9a441)" color="var(--accent, #d9a441)" />
                              {log.rating.toFixed(1)}
                              <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '1px' }}>/10</span>
                            </span>
                          )}
                          {log.rewatch_count > 0 && (
                            <Badge variant="neutral">
                              Rewatch #{log.rewatch_count}
                            </Badge>
                          )}
                        </div>

                        {editingLogId === log.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className={styles.inlineEditArea}
                              placeholder="How did it make you feel? Jot down anything you want to remember…"
                              autoFocus
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setEditingLogId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setWatchLogs(prev => prev.map(l => l.id === log.id ? { ...l, notes: tempNotes } : l))
                                  setEditingLogId(null)
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            style={{ cursor: 'pointer', padding: '2px 0', marginTop: '4px' }}
                            onClick={() => {
                              setEditingLogId(log.id)
                              setTempNotes(log.notes || '')
                            }}
                            title="Click to edit notes"
                          >
                            {log.notes ? (
                              <p className={styles.entryNotes}>"{log.notes}"</p>
                            ) : (
                              <p className={styles.entryNotes} style={{ fontStyle: 'normal', opacity: 0.5, borderLeftColor: 'transparent', paddingLeft: 0 }}>
                                Click to add a note...
                              </p>
                            )}
                          </div>
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
                    {canonicalId && personalRatings[canonicalId] !== undefined ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTempRating(personalRatings[canonicalId])
                            setIsEditingRating(true)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-ink, #e7b865)',
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
                            setRatingForTitle(canonicalId, null)
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
                          color: 'var(--accent-ink, #e7b865)',
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
                        if (canonicalId && tempRating !== null) {
                          setRatingForTitle(canonicalId, tempRating)
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
                  fill={(isEditingRating ? tempRating : (canonicalId ? personalRatings[canonicalId] : null)) !== null ? 'var(--accent, #d9a441)' : 'none'}
                  color="var(--accent, #d9a441)"
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text, var(--color-text-primary))', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {isEditingRating 
                    ? (tempRating !== null ? (
                        tempRating.toFixed(1)
                      ) : (
                        <span style={{ color: 'var(--text-3, var(--color-text-muted))', fontWeight: 400 }}>–</span>
                      )) 
                    : (canonicalId && personalRatings[canonicalId] !== undefined ? (
                        personalRatings[canonicalId].toFixed(1)
                      ) : (
                        <span style={{ color: 'var(--text-3, var(--color-text-muted))', fontWeight: 400 }}>–</span>
                      ))
                  }
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-3, var(--color-text-muted))', marginLeft: '3px', letterSpacing: 0 }}>/10</span>
                </span>
              </div>
              {isEditingRating && (
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={tempRating ?? 5}
                  onChange={(e) => {
                    setTempRating(Math.round(parseFloat(e.target.value) * 2) / 2)
                  }}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent, #d9a441)',
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--border, rgba(255,255,255,0.1))',
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
                In {collectionsCount} {collectionsCount === 1 ? 'collection' : 'collections'}
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
        <CollectionModal
          title={title}
          onClose={() => setCollectionModalOpen(false)}
        />
      )}
    </div>
  )
}
