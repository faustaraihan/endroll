import { useState, useRef, useEffect } from 'react'
import { Search as SearchIcon, Film, Tv, Plus, X, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp, useToast } from '../../contexts'
import {
  mockTrendingThisWeek,
  mockNowPlaying,
  mockTopRatedClassics,
  mockUpcomingClassics,
  mockSearchResults
} from '../../data/mockData'
import { EmptyState, GenrePill, TitleCard, PosterPlaceholder } from '../../components'
import type { SearchResult, Title, WatchlistItem } from '../../types'
import styles from './Explore.module.css'

// Combine all mock data to have a large pool of items to filter dynamically
const allMockTitles = Array.from(
  new Map(
    [
      ...mockTrendingThisWeek,
      ...mockNowPlaying,
      ...mockTopRatedClassics,
      ...mockUpcomingClassics,
      ...mockSearchResults
    ].map(item => [item.tmdb_id, item])
  ).values()
)

export default function Explore() {
  const { watchlist, setWatchlist } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Live search dengan debounce — hasil muncul sambil mengetik
  function handleQueryChange(value: string) {
    setQuery(value)
    if (!value.trim()) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
    } else {
      setIsSearching(true)
    }
  }

  useEffect(() => {
    if (!query.trim()) return
    const timer = setTimeout(() => {
      const filtered = allMockTitles.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setHasSearched(true)
      setIsSearching(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  function isInWatchlist(tmdbId: number) {
    return watchlist.some(item => item.title.tmdb_id === tmdbId)
  }

  function handleToggleWatchlist(result: SearchResult) {
    if (isInWatchlist(result.tmdb_id)) {
      const removed: WatchlistItem[] = watchlist.filter(item => item.title.tmdb_id === result.tmdb_id)
      setWatchlist(prev => prev.filter(item => item.title.tmdb_id !== result.tmdb_id))
      addToast(`"${result.title}" removed from watchlist.`, 'info', {
        action: {
          label: 'Undo',
          onClick: () => setWatchlist(prev => [...removed, ...prev]),
        },
      })
    } else {
      const titleId = crypto.randomUUID()
      const newItem = {
        id: crypto.randomUUID(),
        user_id: 'u1',
        title_id: titleId,
        title: {
          id: titleId,
          tmdb_id: result.tmdb_id,
          title: result.title,
          type: result.type,
          poster_path: result.poster_path,
          release_year: result.release_year,
          genres: result.genres,
          cast: [],
          overview: result.overview,
        },
        added_at: new Date().toISOString(),
      }
      setWatchlist(prev => [newItem, ...prev])
      addToast(`"${result.title}" added to watchlist.`, 'success')
    }
  }

  const handleNavigateDetail = (tmdbId: number) => {
    navigate(`/title/${tmdbId}`)
  }

  const handleLog = (result: SearchResult) => {
    navigate('/log', { state: { title: result } })
  }

  return (
    <div className={styles.page}>
      {/* ── Page Header (Consistent layout) ── */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>Explore</h1>
          <p className={styles.pageSub}>
            Discover new cinema, television, or search for titles to log.
          </p>
        </div>

        <form onSubmit={e => e.preventDefault()} className={styles.searchForm} role="search">
          <div className={styles.searchBox}>
            <SearchIcon size={16} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              id="search-input"
              className={styles.searchInput}
              placeholder="Search movies or series…"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              aria-label="Search film or series"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => handleQueryChange('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
      </header>

      {/* ── Search Mode States ── */}
      {isSearching && (
        <ul className={styles.resultGrid} role="list" aria-label="Loading search results" aria-busy="true">
          {[0, 1, 2, 3].map(i => (
            <li key={i}>
              <div className={styles.skeletonCard}>
                <div className={`skeleton ${styles.skeletonPoster}`} />
                <div className={`skeleton ${styles.skeletonLine}`} />
                <div className={`skeleton ${styles.skeletonLineShort}`} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <EmptyState
          icon={<SearchIcon size={36} strokeWidth={1.5} />}
          title={<>No results for "<strong>{query}</strong>"</>}
          description="Try different keywords, or check the spelling."
        />
      )}

      {/* ── Search Results Grid ── */}
      {!isSearching && hasSearched && results.length > 0 && (
        <section className={styles.resultsSection} aria-label="Search results">
          <p className={styles.resultCount} aria-live="polite">
            <strong>{results.length}</strong> results for "{query}"
          </p>
          <ul className={styles.resultGrid} role="list">
            {results.map((result, i) => (
              <li key={result.tmdb_id}>
                <SearchResultCard
                  result={result}
                  index={i}
                  onToggleWatchlist={handleToggleWatchlist}
                  onLog={handleLog}
                  isInWatchlist={isInWatchlist}
                  onNavigateDetail={handleNavigateDetail}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Explore Recommendation Rows (Visible when not actively searched) ── */}
      {!hasSearched && !isSearching && (
        <div className={styles.exploreContent}>
          <ExploreRow
            title="Trending This Week"
            items={mockTrendingThisWeek}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />

          <ExploreRow
            title="Now Playing in Theatres"
            items={mockNowPlaying}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />

          <ExploreRow
            title="Top Rated Classics"
            items={mockTopRatedClassics}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />

          <ExploreRow
            title="Upcoming Releases"
            items={mockUpcomingClassics}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />
        </div>
      )}
    </div>
  )
}

/* ── Modular Search Result Card Component (Handles Image Load Failures) ── */
interface SearchResultCardProps {
  result: SearchResult
  index: number
  onToggleWatchlist: (item: SearchResult) => void
  onLog: (item: SearchResult) => void
  isInWatchlist: (tmdbId: number) => boolean
  onNavigateDetail: (tmdbId: number) => void
}

function SearchResultCard({
  result,
  index,
  onToggleWatchlist,
  onLog,
  isInWatchlist,
  onNavigateDetail
}: SearchResultCardProps) {
  const [imgError, setImgError] = useState(false)
  const inWatchlist = isInWatchlist(result.tmdb_id)

  return (
    <article
      className={styles.resultCard}
      style={{ '--i': index } as React.CSSProperties}
    >
      <button
        type="button"
        className={styles.posterWrap}
        onClick={() => onNavigateDetail(result.tmdb_id)}
        aria-label={`View details for ${result.title}`}
      >
        {result.poster_path && !imgError ? (
          <img
            src={result.poster_path}
            alt=""
            className={styles.posterImg}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <PosterPlaceholder title={result.title} size="md" />
        )}
        <div className={styles.typePill}>
          {result.type === 'film' ? <Film size={8} /> : <Tv size={8} />}
          {result.type === 'film' ? 'Film' : 'Series'}
        </div>
      </button>

      <div className={styles.resultInfo}>
        <div>
          <h2 className={styles.resultTitle}>
            <button
              type="button"
              className={styles.resultTitleBtn}
              onClick={() => onNavigateDetail(result.tmdb_id)}
            >
              {result.title}
              <span className={styles.resultYear}>({result.release_year})</span>
            </button>
          </h2>
        </div>

        {result.genres.length > 0 && (
          <div className={styles.genrePills}>
            {result.genres.slice(0, 2).map(g => (
              <GenrePill key={g} genre={g} />
            ))}
          </div>
        )}

        <div className={styles.resultActions}>
          <button
            className={`btn btn-sm ${inWatchlist ? 'btn-secondary' : 'btn-ghost'} ${styles.watchlistBtn}`}
            onClick={() => onToggleWatchlist(result)}
            aria-pressed={inWatchlist}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Bookmark size={13} fill={inWatchlist ? 'currentColor' : 'none'} />
            <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
          </button>
          <button
            className="btn btn-primary btn-sm flex-1"
            onClick={() => onLog(result)}
          >
            <Plus size={13} /> Log
          </button>
        </div>
      </div>
    </article>
  )
}

/* ── Reusable Swipeable Horizontal Carousel Row ── */
interface ExploreRowProps {
  title: string
  items: SearchResult[]
  onAddToWatchlist: (item: SearchResult) => void
  isInWatchlist: (tmdbId: number) => boolean
}

function ExploreRow({
  title,
  items,
  onAddToWatchlist,
  isInWatchlist
}: ExploreRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
      setShowLeft(scrollLeft > 5)
      setShowRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    const el = rowRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
      const observer = new ResizeObserver(() => checkScroll())
      observer.observe(el)

      return () => {
        el.removeEventListener('scroll', checkScroll)
        observer.disconnect()
      }
    }
  }, [items])

  const handleScroll = (dir: 'left' | 'right') => {
    if (rowRef.current) {
      const amt = rowRef.current.clientWidth * 0.75
      rowRef.current.scrollBy({
        left: dir === 'left' ? -amt : amt,
        behavior: 'smooth'
      })
    }
  }

  if (items.length === 0) return null

  return (
    <div className={styles.rowWrapper}>
      <h3 className={styles.exploreRowHeading}>{title}</h3>

      <div className={styles.rowContainer}>
        {showLeft && (
          <button
            className={`${styles.arrowBtn} ${styles.arrowLeft}`}
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div ref={rowRef} className={styles.rowItems} role="list">
          {items.map((item, i) => {
            const titleObj: Title = {
              id: String(item.tmdb_id),
              tmdb_id: item.tmdb_id,
              title: item.title,
              type: item.type,
              poster_path: item.poster_path,
              release_year: item.release_year,
              genres: item.genres,
              cast: [],
              overview: item.overview,
            }
            const inWatchlist = isInWatchlist(item.tmdb_id)

            return (
              <div key={item.tmdb_id} className={styles.card} role="listitem">
                <TitleCard
                  title={titleObj}
                  index={i}
                  showLogAction={true}
                  showMetaType={true}
                  onToggleWatchlist={() => onAddToWatchlist(item)}
                  inWatchlist={inWatchlist}
                />
              </div>
            )
          })}
        </div>

        {showRight && (
          <button
            className={`${styles.arrowBtn} ${styles.arrowRight}`}
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
