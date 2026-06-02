import { useState } from 'react'
import { Search as SearchIcon, Film, Tv, Plus, X, Clock } from 'lucide-react'
import { useApp, useToast } from '../../contexts'
import { mockSearchResults } from '../../data/mockData'
import { EmptyState, GenrePill } from '../../components'
import type { SearchResult } from '../../types'
import styles from './Search.module.css'

export default function Search() {
  const { watchlist, setWatchlist } = useApp()
  const { addToast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    setTimeout(() => {
      const filtered = mockSearchResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setIsSearching(false)
    }, 600)
  }

  function isInWatchlist(tmdbId: number) {
    return watchlist.some(item => item.title.tmdb_id === tmdbId)
  }

  function handleAddToWatchlist(result: SearchResult) {
    if (isInWatchlist(result.tmdb_id)) {
      addToast(`"${result.title}" is already in your watchlist.`, 'info')
      return
    }
    const newItem = {
      id: crypto.randomUUID(),
      user_id: 'u1',
      title_id: crypto.randomUUID(),
      title: {
        id: crypto.randomUUID(),
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

  return (
    <div className={styles.page}>
      {/* ── Hero search area ── */}
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Discover films & series</p>
        <h1 className={styles.heroTitle}>Find what you want<br />to log.</h1>

        <form onSubmit={handleSearch} className={styles.searchForm} role="search">
          <div className={styles.searchBox}>
            <SearchIcon size={20} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              id="search-input"
              className={styles.searchInput}
              placeholder="Film or series title..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search film or series"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => { setQuery(''); setResults([]); setHasSearched(false) }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className={`btn btn-primary ${styles.searchBtn}`} disabled={!query.trim()}>
            Search
          </button>
        </form>

        <p className={styles.heroSub}>Data from TMDb · Over 500,000 titles</p>
      </div>

      {/* ── States ── */}
      {isSearching && (
        <div className={styles.loadingState} aria-live="polite">
          <div className={styles.spinnerWrap}>
            {[0,1,2].map(i => (
              <div key={i} className={styles.spinnerDot} style={{ '--d': i } as React.CSSProperties} />
            ))}
          </div>
          <p>Searching TMDb…</p>
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <EmptyState
          icon={<SearchIcon size={36} strokeWidth={1.5} />}
          title={<>No results for "<strong>{query}</strong>"</>}
          description="Try different keywords, or check the spelling."
        />
      )}

      {!isSearching && results.length > 0 && (
        <section className={styles.resultsSection} aria-label="Search results">
          <p className={styles.resultCount}>
            <strong>{results.length}</strong> results for "{query}"
          </p>
          <ul className={styles.resultGrid} role="list">
            {results.map((result, i) => (
              <li key={result.tmdb_id}>
                <article
                  className={styles.resultCard}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {/* Poster */}
                  <div className={styles.posterWrap}>
                    {result.poster_path ? (
                      <img
                        src={result.poster_path}
                        alt={`Poster ${result.title} (${result.release_year})`}
                        className={styles.poster}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.posterFallback}>
                        <Film size={28} />
                      </div>
                    )}
                    <div className={styles.typePill}>
                      {result.type === 'film' ? <Film size={10} /> : <Tv size={10} />}
                      {result.type === 'film' ? 'Film' : 'Series'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className={styles.resultInfo}>
                    <div>
                      <h2 className={styles.resultTitle}>{result.title}</h2>
                      <span className={styles.resultYear}>{result.release_year}</span>
                    </div>

                    {result.genres.length > 0 && (
                      <div className={styles.genrePills}>
                        {result.genres.slice(0, 3).map(g => (
                          <GenrePill key={g} genre={g} />
                        ))}
                      </div>
                    )}

                    {result.overview && (
                      <p className={styles.overview}>{result.overview}</p>
                    )}

                    <div className={styles.resultActions}>
                      <button
                        className={`btn btn-sm ${isInWatchlist(result.tmdb_id) ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => handleAddToWatchlist(result)}
                        style={{ borderColor: 'var(--color-border-soft)' }}
                      >
                        {isInWatchlist(result.tmdb_id) ? (
                          <><Clock size={13} /> In watchlist</>
                        ) : (
                          <><Plus size={13} /> Watchlist</>
                        )}
                      </button>
                      <button className="btn btn-primary btn-sm">
                        <Plus size={13} /> Log film
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Initial / idle state — show discovery suggestions */}
      {!hasSearched && (
        <div className={styles.idleState}>
          <div className={styles.suggestionGrid}>
            {mockSearchResults.slice(0, 6).map((r, i) => (
              <button
                key={r.tmdb_id}
                className={styles.suggestionCard}
                onClick={() => setQuery(r.title)}
                style={{ '--i': i } as React.CSSProperties}
                aria-label={`Search ${r.title}`}
              >
                {r.poster_path && (
                  <img
                    src={r.poster_path}
                    alt=""
                    className={styles.suggestionPoster}
                    aria-hidden="true"
                  />
                )}
                <div className={styles.suggestionOverlay}>
                  <span className={styles.suggestionTitle}>{r.title}</span>
                  <span className={styles.suggestionYear}>{r.release_year}</span>
                </div>
              </button>
            ))}
          </div>
          <p className={styles.idleHint}>or click a title above to start</p>
        </div>
      )}
    </div>
  )
}
