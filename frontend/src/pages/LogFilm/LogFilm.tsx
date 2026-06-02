import { useState } from 'react'
import { Search, Film, Star, ChevronLeft, Plus, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp, useToast } from '../../contexts'
import { mockSearchResults } from '../../data/mockData'
import type { SearchResult } from '../../types'
import styles from './LogFilm.module.css'

type Step = 'search' | 'form'

export default function LogFilm() {
  const { setWatchLogs, watchLogs } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<SearchResult | null>(null)

  // Form state
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState<number | null>(null)
  const [ratingInput, setRatingInput] = useState('')
  const [notes, setNotes] = useState('')
  const [isRewatch, setIsRewatch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      const filtered = mockSearchResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  function handleSelect(result: SearchResult) {
    // Check if already in diary
    const existing = watchLogs.find(l => l.title.tmdb_id === result.tmdb_id)
    if (existing) {
      const confirmed = window.confirm(
        `You already logged "${result.title}" on ${new Date(existing.watched_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.\n\nLog as a new rewatch?`
      )
      if (!confirmed) return
      setIsRewatch(true)
    }
    setSelectedTitle(result)
    setStep('form')
  }

  function handleRatingChange(val: string) {
    setRatingInput(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setRating(num)
    } else {
      setRating(null)
    }
  }

  function handleSlider(val: number) {
    const snapped = Math.round(val * 2) / 2
    setRating(snapped)
    setRatingInput(snapped.toFixed(1))
  }



  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTitle) return

    setIsSubmitting(true)
    setTimeout(() => {
      const newLog = {
        id: crypto.randomUUID(),
        user_id: 'u1',
        title_id: crypto.randomUUID(),
        title: {
          id: crypto.randomUUID(),
          tmdb_id: selectedTitle.tmdb_id,
          title: selectedTitle.title,
          type: selectedTitle.type,
          poster_path: selectedTitle.poster_path,
          release_year: selectedTitle.release_year,
          genres: selectedTitle.genres,
          cast: [],
          overview: selectedTitle.overview,
        },
        watched_at: watchedAt,
        rating: rating ?? undefined,
        notes: notes || undefined,
        rewatch_count: isRewatch ? 1 : 0,
      }

      setWatchLogs(prev => [newLog, ...prev])
      addToast(`"${selectedTitle.title}" logged to your diary! 🎬`, 'success')
      navigate('/diary')
    }, 600)
  }

  return (
    <div className={styles.page}>
      {step === 'search' && (
        <div className={styles.searchStep} style={{ animationName: 'fade-in' }}>
          <header className={styles.header}>
            <h1 className={styles.pageTitle}>Log a Film</h1>
            <p className={styles.pageSub}>Search for the film or series you watched</p>
          </header>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                id="log-search"
                type="search"
                className={styles.searchInput}
                placeholder="Search TMDb…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search for a film or series"
                autoFocus
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={!query.trim()}>
              Search
            </button>
          </form>

          {isSearching && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} aria-label="Searching..." />
              <p>Searching…</p>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <ul className={styles.resultList} role="list" aria-label="Search results">
              {searchResults.map(result => (
                <li key={result.tmdb_id}>
                  <button
                    className={styles.resultItem}
                    onClick={() => handleSelect(result)}
                    aria-label={`Select ${result.title} (${result.release_year})`}
                  >
                    {result.poster_path ? (
                      <img
                        src={result.poster_path}
                        alt={`Poster for ${result.title}`}
                        className={styles.resultPoster}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.resultPosterPlaceholder}>
                        <Film size={20} />
                      </div>
                    )}
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>{result.title}</div>
                      <div className={styles.resultMeta}>
                        <span className="badge badge-muted">
                          {result.type === 'film' ? 'Film' : 'Series'}
                        </span>
                        {result.release_year && (
                          <span className="text-sm text-muted">{result.release_year}</span>
                        )}
                      </div>
                    </div>
                    <Plus size={18} className={styles.resultAdd} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isSearching && searchResults.length === 0 && query && (
            <div className={styles.noResults}>
              <p>No results for "<strong>{query}</strong>".</p>
              <p className="text-sm text-muted">You can add a title manually.</p>
              <button className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add manually
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'form' && selectedTitle && (
        <form
          onSubmit={handleSubmit}
          className={styles.formStep}
          aria-label="Log film form"
        >
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${styles.backBtn}`}
            onClick={() => setStep('search')}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {/* Title preview */}
          <div className={styles.titlePreview}>
            {selectedTitle.poster_path && (
              <img
                src={selectedTitle.poster_path}
                alt={`Poster for ${selectedTitle.title} (${selectedTitle.release_year})`}
                className={styles.previewPoster}
              />
            )}
            <div>
              <h1 className={styles.previewTitle}>{selectedTitle.title}</h1>
              <div className={styles.previewMeta}>
                <span className="badge badge-violet">
                  {selectedTitle.type === 'film' ? 'Film' : 'Series'}
                </span>
                {selectedTitle.release_year && (
                  <span className="text-sm text-muted">{selectedTitle.release_year}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formDivider} />

          {/* Watched date */}
          <div className={styles.formGroup}>
            <label htmlFor="watched-date" className="input-label">Watched on</label>
            <input
              id="watched-date"
              type="date"
              className={`input ${styles.dateInput}`}
              value={watchedAt}
              onChange={e => setWatchedAt(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          {/* Rating */}
          <div className={styles.formGroup}>
            <label htmlFor="rating-input" className="input-label">
              Rating
              <span className={styles.labelHint}>(optional · 0–10)</span>
            </label>
            <div className={styles.ratingRow}>
              <input
                id="rating-range"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={rating ?? 5}
                onChange={e => handleSlider(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Rating slider 0 to 10"
              />
              <div className={styles.ratingInputWrap}>
                <Star size={14} fill={rating != null ? 'var(--color-amber-400)' : 'none'} color="var(--color-amber-400)" />
                <input
                  id="rating-input"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  className={styles.ratingText}
                  placeholder="—"
                  value={ratingInput}
                  onChange={e => handleRatingChange(e.target.value)}
                  aria-label="Enter rating as a number"
                />
              </div>
            </div>
          </div>

          {/* Rewatch */}
          <div className={styles.formGroup}>
            <label className="input-label">Rewatch?</label>
            <button
              type="button"
              role="switch"
              aria-checked={isRewatch}
              className={`${styles.toggle} ${isRewatch ? styles.toggleOn : ''}`}
              onClick={() => setIsRewatch(r => !r)}
              aria-label="Mark as rewatch"
            >
              <span className={styles.toggleThumb} />
              <span className={styles.toggleLabel}>{isRewatch ? 'Yes, this is a rewatch' : 'No, first watch'}</span>
            </button>
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label htmlFor="notes" className="input-label">
              Notes
              <span className={styles.labelHint}>(optional)</span>
            </label>
            <textarea
              id="notes"
              className={`input ${styles.textarea}`}
              placeholder="How did it make you feel? Any thoughts…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={1000}
            />
            <div className={styles.charCount}>{notes.length}/1000</div>
          </div>



          {/* Submit */}
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><div className={styles.btnSpinner} /> Saving…</>
            ) : (
              <><Check size={18} /> Save to Diary</>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
