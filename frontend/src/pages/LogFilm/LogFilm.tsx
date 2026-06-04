import { useState, useEffect } from 'react'
import { Search, Film, Star, ChevronLeft, Plus, Check, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp, useToast } from '../../contexts'
import { mockSearchResults, mockTitles } from '../../data/mockData'
import { seriesMockData } from '../../data/seriesMockData'
import type { SearchResult, WatchLog, Title } from '../../types'
import styles from './LogFilm.module.css'

type Step = 'search' | 'form'

export default function LogFilm() {
  const { setWatchLogs, watchLogs, personalRatings, setRatingForTitle } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<SearchResult | Title | null>(null)

  // Form state
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState<number | null>(null)
  const [ratingInput, setRatingInput] = useState('')
  const [notes, setNotes] = useState('')
  const [seasonNumber, setSeasonNumber] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resolve title ID for metadata lookup
  const resolvedTitleId = selectedTitle
    ? (('id' in selectedTitle ? selectedTitle.id : null) ||
       watchLogs.find(l => l.title.tmdb_id === selectedTitle.tmdb_id)?.title.id ||
       mockTitles.find(t => t.tmdb_id === selectedTitle.tmdb_id)?.id ||
       null)
    : null

  const seasonsList = resolvedTitleId && seriesMockData[resolvedTitleId]
    ? seriesMockData[resolvedTitleId].seasons
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ season_number: n, title: `Season ${n}` }))

  // Edit / Duplicate state
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateLog, setDuplicateLog] = useState<WatchLog | null>(null)
  const [pendingTitle, setPendingTitle] = useState<SearchResult | Title | null>(null)

  // Pre-select title from router state (e.g. from Search page)
  useEffect(() => {
    const stateTitle = location.state?.title as SearchResult | Title | undefined
    if (stateTitle) {
      handleSelect(stateTitle)
    }
  }, [location.state])

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

  function handleSelect(result: SearchResult | Title) {
    // Check if already in diary
    const existing = watchLogs.find(l => 
      ('id' in result && l.title.id === result.id) || 
      (result.tmdb_id && l.title.tmdb_id === result.tmdb_id)
    )
    if (existing) {
      setDuplicateLog(existing)
      setPendingTitle(result)
      setShowDuplicateModal(true)
      return
    }
    startFormForTitle(result)
  }

  function startFormForTitle(result: SearchResult | Title) {
    setSelectedTitle(result)
    setEditingLogId(null)
    setSeasonNumber(1)
    setWatchedAt(new Date().toISOString().slice(0, 10))
    
    // Cari rating global dari film ini
    const existingWatch = watchLogs.find(l => 
      ('id' in result && l.title.id === result.id) || 
      (result.tmdb_id && l.title.tmdb_id === result.tmdb_id)
    )
    const existingRating = existingWatch ? (personalRatings[existingWatch.title.id] ?? null) : null
    
    setRating(existingRating)
    setRatingInput(existingRating !== null ? existingRating.toFixed(1) : '')
    setNotes('')
    setStep('form')
  }

  function handleConfirmRewatch() {
    if (!pendingTitle) return
    setSelectedTitle(pendingTitle)
    setEditingLogId(null)
    setSeasonNumber(1)
    setWatchedAt(new Date().toISOString().slice(0, 10))
    
    // Cari rating global dari film ini
    const existingWatch = watchLogs.find(l => 
      ('id' in pendingTitle && l.title.id === pendingTitle.id) || 
      (pendingTitle.tmdb_id && l.title.tmdb_id === pendingTitle.tmdb_id)
    )
    const existingRating = existingWatch ? (personalRatings[existingWatch.title.id] ?? null) : null
    
    setRating(existingRating)
    setRatingInput(existingRating !== null ? existingRating.toFixed(1) : '')
    setNotes('')
    setStep('form')
    setShowDuplicateModal(false)
    setDuplicateLog(null)
    setPendingTitle(null)
  }

  function handleConfirmEdit() {
    if (!duplicateLog || !pendingTitle) return
    setSelectedTitle(pendingTitle)
    setEditingLogId(duplicateLog.id)
    setSeasonNumber(duplicateLog.season_number ?? 1)
    setWatchedAt(duplicateLog.watched_at)
    
    // Ambil rating global film
    const existingRating = personalRatings[duplicateLog.title.id] ?? null
    setRating(existingRating)
    setRatingInput(existingRating !== null ? existingRating.toFixed(1) : '')
    setNotes(duplicateLog.notes ?? '')
    setStep('form')
    setShowDuplicateModal(false)
    setDuplicateLog(null)
    setPendingTitle(null)
  }

  function handleCancelDuplicate() {
    setShowDuplicateModal(false)
    setDuplicateLog(null)
    setPendingTitle(null)
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
    const snapped = Math.round(val * 10) / 10
    setRating(snapped)
    setRatingInput(snapped.toFixed(1))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTitle) return

    setIsSubmitting(true)
    setTimeout(() => {
      // Cari atau buat title ID yang stabil
      const existingWatch = watchLogs.find(l => 
        ('id' in selectedTitle && l.title.id === selectedTitle.id) || 
        (selectedTitle.tmdb_id && l.title.tmdb_id === selectedTitle.tmdb_id)
      )
      const titleIdToUse = existingWatch 
        ? existingWatch.title.id 
        : ('id' in selectedTitle ? selectedTitle.id : crypto.randomUUID())
        
      const titleToUse = existingWatch ? existingWatch.title : {
        id: titleIdToUse,
        tmdb_id: selectedTitle.tmdb_id,
        title: selectedTitle.title,
        type: selectedTitle.type,
        poster_path: selectedTitle.poster_path,
        release_year: selectedTitle.release_year,
        genres: selectedTitle.genres,
        cast: 'cast' in selectedTitle ? selectedTitle.cast : [],
        director: 'director' in selectedTitle ? selectedTitle.director : undefined,
        runtime_minutes: 'runtime_minutes' in selectedTitle ? selectedTitle.runtime_minutes : undefined,
        overview: selectedTitle.overview,
      }

      // Update rating global
      setRatingForTitle(titleIdToUse, rating)

      if (editingLogId) {
        // Editing existing log
        setWatchLogs(prev =>
          prev.map(l =>
            l.id === editingLogId
              ? {
                  ...l,
                  watched_at: watchedAt,
                  notes: notes || undefined,
                  season_number: selectedTitle.type === 'series' ? seasonNumber : undefined,
                }
              : l
          )
        )
        addToast(`Catatan "${selectedTitle.title}" berhasil diperbarui! 🎬`, 'success')
      } else {
        // Adding new log
        // Hitung rewatch secara otomatis
        const rewatchCount = selectedTitle.type === 'series'
          ? watchLogs.filter(l => l.title_id === titleIdToUse && l.season_number === seasonNumber).length
          : watchLogs.filter(l => l.title_id === titleIdToUse).length

        const newLog = {
          id: crypto.randomUUID(),
          user_id: 'u1',
          title_id: titleIdToUse,
          title: titleToUse,
          watched_at: watchedAt,
          notes: notes || undefined,
          rewatch_count: rewatchCount,
          season_number: selectedTitle.type === 'series' ? seasonNumber : undefined,
        }

        setWatchLogs(prev => [newLog, ...prev])
        addToast(`"${selectedTitle.title}" logged to your diary! 🎬`, 'success')
      }
      setIsSubmitting(false)
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
              <p>Tidak ada hasil pencarian untuk "<strong>{query}</strong>".</p>
              <p className="text-sm text-muted">Coba periksa kembali ejaan judul, atau cari judul film lainnya.</p>
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

          {/* Season selection — only for series */}
          {selectedTitle.type === 'series' && (
            <div className={styles.formGroup}>
              <label htmlFor="season-select" className="input-label">Season</label>
              <select
                id="season-select"
                className={`input ${styles.selectInput}`}
                value={seasonNumber}
                onChange={e => setSeasonNumber(parseInt(e.target.value))}
                required
              >
                {seasonsList.map(s => (
                  <option key={s.season_number} value={s.season_number}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating */}
          <div className={styles.formGroup}>
            <label htmlFor="rating-input" className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>
                Rating {selectedTitle.type === 'film' ? 'Film' : 'Series'} ini <span className={styles.labelHint}>(global · opsional)</span>
              </span>
              {rating !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setRating(null)
                    setRatingInput('')
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
                  Hapus Rating
                </button>
              )}
            </label>
            <div className={styles.ratingRow}>
              <input
                id="rating-range"
                type="range"
                min={0}
                max={10}
                step={0.1}
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

          {/* Rewatch - otomatis dideteksi dari database */}

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

      {showDuplicateModal && duplicateLog && (
        <div className={styles.modalOverlay} onClick={handleCancelDuplicate} role="dialog" aria-modal="true">
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ fontSize: '1.125rem', margin: 0 }}>Sudah Pernah Dicatat</h3>
              <button type="button" className="btn btn-icon btn-ghost" onClick={handleCancelDuplicate} aria-label="Tutup modal" style={{ minHeight: '32px', minWidth: '32px', padding: '4px' }}>
                <X size={16} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <p>
                Kamu sudah mencatat <strong>{duplicateLog.title.title}</strong> pada{' '}
                <strong>
                  {new Date(duplicateLog.watched_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
                . Ini rewatch baru, atau ingin mengedit catatan lama?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-primary" onClick={handleConfirmRewatch} style={{ width: '100%' }}>
                Catat sebagai rewatch baru
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleConfirmEdit} style={{ width: '100%' }}>
                Edit catatan lama
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancelDuplicate} style={{ width: '100%' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
