import { useState, useRef, useEffect } from 'react'
import { Search as SearchIcon, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts'
import { useStore } from '@/store/useStore'
import { EmptyState, PageHeader, SearchInput, SectionHeader } from '@/components'
import { TitleCard } from '@/components/ui/TitleCard'
import { Poster } from '@/components/ui/Poster/Poster'
import type { SearchResult, Title, WatchlistItem } from '@/types'
import styles from './ExplorePage.module.css'

export default function ExplorePage() {
  const watchlist = useStore(state => state.watchlist)
  const setWatchlist = useStore(state => state.setWatchlist)
  const exploreData = useStore(state => state.exploreData)
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [dropdownResults, setDropdownResults] = useState<SearchResult[]>([])
  const [pageResults, setPageResults] = useState<SearchResult[]>([])
  
  const [isSearchingDropdown, setIsSearchingDropdown] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const [isSearchingPage, setIsSearchingPage] = useState(false)
  const [hasSearchedPage, setHasSearchedPage] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }

    if (!value.trim()) {
      setIsDropdownOpen(false)
      setDropdownResults([])
      setIsSearchingDropdown(false)
      return
    }

    setIsSearchingDropdown(true)
    setIsDropdownOpen(true)

    debounceTimerRef.current = window.setTimeout(() => {
      const allExploreTitles = Array.from(
        new Map(
          [
            ...exploreData.trending,
            ...exploreData.nowPlaying,
            ...exploreData.classics,
            ...exploreData.upcoming,
            ...exploreData.searchResults
          ].map(item => [item.tmdb_id, item])
        ).values()
      )
      const filtered = allExploreTitles.filter(r =>
        r.title.toLowerCase().includes(value.toLowerCase())
      )
      setDropdownResults(filtered)
      setIsSearchingDropdown(false)
    }, 350)
  }

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setIsDropdownOpen(false)
    setIsSearchingPage(true)
    setHasSearchedPage(true)

    // Simulate search loading for full page
    setTimeout(() => {
      const allExploreTitles = Array.from(
        new Map(
          [
            ...exploreData.trending,
            ...exploreData.nowPlaying,
            ...exploreData.classics,
            ...exploreData.upcoming,
            ...exploreData.searchResults
          ].map(item => [item.tmdb_id, item])
        ).values()
      )
      const filtered = allExploreTitles.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
      )
      setPageResults(filtered)
      setIsSearchingPage(false)
    }, 400)
  }

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
          backdrop_path: result.backdrop_path,
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


  return (
    <div className={styles.page}>
      <PageHeader
        className={styles.exploreHeader}
        title="Explore"
        description="Discover new cinema, television, or search for titles to log."
        rightElement={
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm} role="search">
              <SearchInput 
                value={query}
                onChange={handleQueryChange}
                onClear={() => {
                  setQuery('')
                  setHasSearchedPage(false)
                  setIsDropdownOpen(false)
                }}
                placeholder="Search movies or series…"
              />
              <button type="submit" className={styles.searchSubmitBtn} aria-label="Submit search">
                <SearchIcon size={16} />
              </button>
            </form>

            {isDropdownOpen && query.trim().length > 0 && (
              <div className={styles.dropdownMenu}>
                {isSearchingDropdown ? (
                  <div className={styles.dropdownLoading}>Searching...</div>
                ) : dropdownResults.length > 0 ? (
                  <ul className={styles.dropdownList}>
                    {dropdownResults.slice(0, 5).map(result => (
                      <li key={result.tmdb_id}>
                        <button 
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setIsDropdownOpen(false)
                            handleNavigateDetail(result.tmdb_id)
                          }}
                        >
                          <Poster 
                            title={result.title}
                            src={result.poster_path} 
                            alt="" 
                            className={styles.dropdownPoster} 
                            size="sm"
                          />
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownTitle}>{result.title}</span>
                            <span className={styles.dropdownYear}>
                              {result.release_year} • {result.type === 'movie' ? 'Movie' : 'Series'}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                    {dropdownResults.length > 5 && (
                      <li className={styles.dropdownViewAllWrap}>
                        <button 
                            type="button" 
                            className={styles.dropdownViewAll}
                            onClick={() => handleSearchSubmit()}
                        >
                          View all {dropdownResults.length} results
                        </button>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className={styles.dropdownEmpty}>No results found for "{query}"</div>
                )}
              </div>
            )}
          </div>
        }
      />

      {/* ── Search Mode States ── */}
      {isSearchingPage && (
        <ul className={styles.resultList} role="list" aria-label="Loading search results" aria-busy="true">
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

      {!isSearchingPage && hasSearchedPage && pageResults.length === 0 && (
        <EmptyState
          icon={<SearchIcon size={36} strokeWidth={1.5} />}
          title={<>No results for "<strong>{query}</strong>"</>}
          description="Try different keywords, or check the spelling."
        />
      )}

      {/* ── Search Results Grid ── */}
      {!isSearchingPage && hasSearchedPage && pageResults.length > 0 && (
        <section className={styles.resultsSection} aria-label="Search results">
          <p className={styles.resultCount} aria-live="polite">
            <strong>{pageResults.length}</strong> results for "{query}"
          </p>
          <ul className={styles.resultList} role="list">
            {pageResults.map((result, i) => (
              <li key={result.tmdb_id}>
                <SearchResultCard
                  result={result}
                  index={i}
                  onToggleWatchlist={handleToggleWatchlist}
                  isInWatchlist={isInWatchlist}
                  onNavigateDetail={handleNavigateDetail}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Explore Recommendation Rows (Visible when not actively searched) ── */}
      {!hasSearchedPage && !isSearchingPage && (
        <div className={styles.exploreContent}>
          <ExploreRow
            title="Trending This Week"
            items={exploreData.trending}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />

          <ExploreRow
            title="Now Playing in Theatres"
            items={exploreData.nowPlaying}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />

          <ExploreRow
            title="Top Rated Classics"
            items={exploreData.classics}
            onAddToWatchlist={handleToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />

          <ExploreRow
            title="Upcoming Releases"
            items={exploreData.upcoming}
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
  isInWatchlist: (tmdbId: number) => boolean
  onNavigateDetail: (tmdbId: number) => void
}

function SearchResultCard({
  result,
  index,
  onToggleWatchlist,
  isInWatchlist,
  onNavigateDetail
}: SearchResultCardProps) {
  const inWatchlist = isInWatchlist(result.tmdb_id)

  return (
    <article
      className={styles.resultCard}
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className={styles.posterWrap}>
        <button
          type="button"
          className={styles.posterImgBtn}
          onClick={() => onNavigateDetail(result.tmdb_id)}
          aria-label={`View details for ${result.title}`}
        >
          <Poster
            title={result.title}
            src={result.poster_path}
            alt=""
            className={styles.posterImg}
            size="sm"
          />
        </button>
      </div>

      <div className={styles.resultInfo}>
        <div className={styles.resultTitleRow}>
          <button
            type="button"
            className={styles.resultTitleBtn}
            onClick={() => onNavigateDetail(result.tmdb_id)}
          >
            {result.title}
          </button>
        </div>

        <div className={styles.resultMeta}>
          {result.release_year && <span>{result.release_year}</span>}
          {result.release_year && <span className={styles.metaDot}>•</span>}
          <span>{result.type === 'movie' ? 'Movie' : 'Series'}</span>
          {result.genres.length > 0 && (
            <>
              <span className={styles.metaDot}>•</span>
              <span className={styles.resultGenres}>{result.genres.join(', ')}</span>
            </>
          )}
        </div>

        <div className={styles.resultActionsClean}>
          <button
            className={styles.cleanActionBtn}
            onClick={() => onToggleWatchlist(result)}
          >
            <Bookmark 
              size={14} 
              fill={inWatchlist ? "var(--accent-ink, #e7b865)" : "none"} 
              color={inWatchlist ? "var(--accent-ink, #e7b865)" : "currentColor"} 
            />
            <span style={{ color: inWatchlist ? "var(--accent-ink, #e7b865)" : "inherit" }}>
              {inWatchlist ? 'In Watchlist' : 'Watchlist'}
            </span>
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
      <SectionHeader title={title} />

      <div className={styles.rowContainer}>
        {showLeft && (
          <button
            className={`${styles.arrowBtn} ${styles.arrowLeft}`}
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={32} />
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
              backdrop_path: item.backdrop_path,
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
                  showLogAction={false}
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
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </div>
  )
}
