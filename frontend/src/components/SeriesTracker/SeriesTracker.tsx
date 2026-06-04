import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Star, Calendar,
  Check, MoreHorizontal, RefreshCw, X,
} from 'lucide-react'
import { useApp, useToast } from '../../contexts'
import type { Title, WatchLog, WatchStatus } from '../../types'
import { seriesMockData } from '../../data/seriesMockData'
import styles from './SeriesTracker.module.css'

interface SeriesTrackerProps {
  title: Title
}

export function SeriesTracker({ title }: SeriesTrackerProps) {
  const { watchLogs, setWatchLogs, seasonRatings, setSeasonRating } = useApp()
  const { addToast } = useToast()

  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0)
  const [watchStatus, setWatchStatus] = useState<WatchStatus>('Watching')

  // Inline edit for a specific log entry
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editDate, setEditDate] = useState('')

  // Season rating inline edit
  const [isEditingSeasonRating, setIsEditingSeasonRating] = useState(false)
  const [tempSeasonRating, setTempSeasonRating] = useState<number | null>(null)
  const [tempSeasonRatingInput, setTempSeasonRatingInput] = useState('')

  // ··· more menu
  const [moreMenuLogId, setMoreMenuLogId] = useState<string | null>(null)

  const notesRef = useRef<HTMLTextAreaElement>(null)

  // ── Metadata ──
  const metadata = useMemo(() => {
    if (seriesMockData[title.id]) return seriesMockData[title.id]
    return {
      title_id: title.id,
      seasons: [{
        season_number: 1,
        title: 'Season 1',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          episode_number: i + 1,
          title: `Episode ${i + 1}`,
          runtime_minutes: title.runtime_minutes || 45,
        })),
      }],
    }
  }, [title])

  const activeSeason = metadata.seasons[activeSeasonIndex] || metadata.seasons[0]

  // Season rating key: "titleId:seasonNumber"
  const seasonRatingKey = `${title.id}:${activeSeason.season_number}`
  const currentSeasonRating = seasonRatings[seasonRatingKey] ?? null

  const seriesLogs = useMemo(
    () => watchLogs.filter(log => log.title_id === title.id),
    [watchLogs, title.id]
  )

  // Stable index map: lower index = more recently added to watchLogs (prepend on creation)
  const watchLogIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    watchLogs.forEach((log, i) => { map[log.id] = i })
    return map
  }, [watchLogs])

  // Season-level logs for active season.
  // Display order: newest watched_at first; tiebreak by insertion order (lower index = newer = first).
  const activeSeasonLogs = useMemo(
    () => seriesLogs
      .filter(log =>
        log.season_number === activeSeason.season_number &&
        (log.episode_number === undefined || log.episode_number === null)
      )
      .sort((a, b) => {
        const dateDiff = new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        if (dateDiff !== 0) return dateDiff
        // Same date: more recently added (lower index) comes first in display
        return (watchLogIndexMap[a.id] ?? 0) - (watchLogIndexMap[b.id] ?? 0)
      }),
    [seriesLogs, activeSeason, watchLogIndexMap]
  )

  const isSeasonLogged = activeSeasonLogs.length > 0

  // Rank by chronological order (watched_at ascending) — drives "First watch" / "Rewatch #N" labels.
  // Tiebreak: higher index = added earlier = gets the lower rank (treated as the earlier watch).
  const logRankMap = useMemo(() => {
    const sorted = [...activeSeasonLogs].sort((a, b) => {
      const dateDiff = new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime()
      if (dateDiff !== 0) return dateDiff
      // Same date: higher watchLogs index = added earlier = ranks first
      return (watchLogIndexMap[b.id] ?? 0) - (watchLogIndexMap[a.id] ?? 0)
    })
    const map: Record<string, number> = {}
    sorted.forEach((log, i) => { map[log.id] = i })
    return map
  }, [activeSeasonLogs, watchLogIndexMap])

  // Reset on season change
  useEffect(() => {
    setEditingLogId(null)
    setMoreMenuLogId(null)
    setIsEditingSeasonRating(false)
  }, [activeSeasonIndex])

  // Close more menu on outside click
  useEffect(() => {
    if (!moreMenuLogId) return
    const handler = () => setMoreMenuLogId(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [moreMenuLogId])

  // ── Season rating ──
  function openSeasonRatingEdit() {
    setTempSeasonRating(currentSeasonRating)
    setTempSeasonRatingInput(currentSeasonRating != null ? currentSeasonRating.toFixed(1) : '')
    setIsEditingSeasonRating(true)
  }

  function handleSeasonRatingSlider(val: number) {
    const snapped = Math.round(val * 2) / 2
    setTempSeasonRating(snapped)
    setTempSeasonRatingInput(snapped.toFixed(1))
  }

  function handleSeasonRatingInput(val: string) {
    setTempSeasonRatingInput(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num >= 0 && num <= 10) setTempSeasonRating(num)
    else setTempSeasonRating(null)
  }

  function saveSeasonRating() {
    setSeasonRating(title.id, activeSeason.season_number, tempSeasonRating)
    setIsEditingSeasonRating(false)
    addToast(`Season ${activeSeason.season_number} rating saved`, 'success')
  }

  // ── Quick log ──
  function handleQuickLog() {
    const rewatchCount = activeSeasonLogs.length
    setWatchLogs(prev => [{
      id: crypto.randomUUID(),
      user_id: 'u1',
      title_id: title.id,
      title,
      watched_at: new Date().toISOString().slice(0, 10),
      season_number: activeSeason.season_number,
      rewatch_count: rewatchCount,
    }, ...prev])
    addToast(
      rewatchCount === 0
        ? `Season ${activeSeason.season_number} logged`
        : `Season ${activeSeason.season_number} rewatch logged`,
      'success'
    )
  }

  // ── Inline log edit ──
  function openEdit(log: WatchLog) {
    setMoreMenuLogId(null)
    setEditingLogId(log.id)
    setEditNotes(log.notes ?? '')
    setEditDate(log.watched_at)
    setTimeout(() => notesRef.current?.focus(), 60)
  }

  function closeEdit() { setEditingLogId(null) }

  function handleSave() {
    if (!editingLogId) return
    setWatchLogs(prev => prev.map(log =>
      log.id === editingLogId
        ? { ...log, notes: editNotes.trim() || undefined, watched_at: editDate }
        : log
    ))
    addToast('Log updated', 'success')
    setEditingLogId(null)
  }

  function handleDelete(logId: string) {
    setWatchLogs(prev => prev.filter(log => log.id !== logId))
    addToast(`Season ${activeSeason.season_number} log deleted`, 'info')
    if (editingLogId === logId) setEditingLogId(null)
    setMoreMenuLogId(null)
  }

  // Watch label — derived from chronological rank, not stored rewatch_count
  function watchLabel(rank: number) {
    return rank === 0 ? 'First watch' : `Rewatch #${rank}`
  }

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <h2 className={styles.sectionTitle}>Series Tracker</h2>
        <div className={styles.statusSelectWrap}>
          <label htmlFor="series-status-select" className={styles.statusLabel}>Status</label>
          <select
            id="series-status-select"
            value={watchStatus}
            onChange={e => {
              setWatchStatus(e.target.value as WatchStatus)
              addToast(`Status set to ${e.target.value}`, 'success')
            }}
            className={styles.statusSelect}
          >
            <option value="Watching">Watching</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </header>

      {/* ── Season Tabs ── */}
      <div className={styles.tabsContainer} role="tablist" aria-label="Seasons">
        {metadata.seasons.map((season, index) => {
          const hasLog = seriesLogs.some(log =>
            log.season_number === season.season_number &&
            (log.episode_number === undefined || log.episode_number === null)
          )
          return (
            <button
              key={season.season_number}
              role="tab"
              aria-selected={activeSeasonIndex === index}
              className={`${styles.tabBtn} ${activeSeasonIndex === index ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveSeasonIndex(index)}
            >
              {hasLog && <span className={styles.tabDot} aria-hidden="true" />}
              {season.title}
            </button>
          )
        })}
      </div>

      {/* ── Season Card ── */}
      <div className={styles.seasonCard}>

        {/* Season title + Rating */}
        <div className={styles.seasonHeader}>
          <div className={styles.seasonTitleGroup}>
            <h3 className={styles.seasonTitle}>{activeSeason.title}</h3>
            <span className={styles.seasonSub}>{activeSeason.episodes.length} episodes</span>
          </div>

          {/* Rating — global per season */}
          <div className={styles.seasonRatingBlock}>
            {!isEditingSeasonRating ? (
              <button
                className={styles.seasonRatingDisplay}
                onClick={openSeasonRatingEdit}
                aria-label={currentSeasonRating != null
                  ? `Season rating: ${currentSeasonRating.toFixed(1)} — click to edit`
                  : 'Add season rating'}
              >
                <Star
                  size={14}
                  fill={currentSeasonRating != null ? 'var(--color-amber-400)' : 'none'}
                  color="var(--color-amber-400)"
                />
                <span className={styles.seasonRatingValue}>
                  {currentSeasonRating != null ? currentSeasonRating.toFixed(1) : '—'}
                </span>
              </button>
            ) : (
              <div className={styles.seasonRatingEdit}>
                <div className={styles.seasonRatingEditRow}>
                  <Star size={13} fill="var(--color-amber-400)" color="var(--color-amber-400)" />
                  <input
                    type="number"
                    min={0} max={10} step={0.1}
                    className={styles.seasonRatingInput}
                    placeholder="—"
                    value={tempSeasonRatingInput}
                    onChange={e => handleSeasonRatingInput(e.target.value)}
                    autoFocus
                    aria-label="Season rating"
                  />
                  <button className={styles.ratingConfirmBtn} onClick={saveSeasonRating} aria-label="Save rating">
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <button className={styles.ratingCancelBtn} onClick={() => setIsEditingSeasonRating(false)} aria-label="Cancel">
                    <X size={12} />
                  </button>
                </div>
                <input
                  type="range"
                  min={0} max={10} step={0.5}
                  value={tempSeasonRating ?? 5}
                  onChange={e => handleSeasonRatingSlider(parseFloat(e.target.value))}
                  className={styles.seasonRatingSlider}
                  aria-label="Drag to set rating"
                />
                {currentSeasonRating != null && (
                  <button
                    className={styles.clearRatingBtn}
                    onClick={() => {
                      setSeasonRating(title.id, activeSeason.season_number, null)
                      setIsEditingSeasonRating(false)
                    }}
                  >
                    Remove rating
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── IDLE: single CTA ── */}
        {!isSeasonLogged && (
          <button className={styles.doneBtn} onClick={handleQuickLog}>
            <Check size={16} strokeWidth={2.5} />
            Mark as Watched
          </button>
        )}

        {/* ── LOGGED: watch history ── */}
        {isSeasonLogged && (
          <div className={styles.logList}>
            {activeSeasonLogs.map((log, i) => {
              const isLatest = i === 0
              const isEditing = editingLogId === log.id

              return (
                <div key={log.id} className={`${styles.logRow} ${isEditing ? styles.logRowExpanded : ''}`}>
                  {!isEditing && (
                    <>
                      <div className={styles.logRowMain}>
                        {/* Clickable summary → opens edit */}
                        <button
                          className={styles.logSummary}
                          onClick={() => openEdit(log)}
                          aria-label={`Edit: ${watchLabel(logRankMap[log.id])}`}
                        >
                          <span className={styles.logLabel}>
                            <Check size={10} strokeWidth={3} />
                            {watchLabel(logRankMap[log.id])}
                          </span>
                          <span className={styles.logDate}>
                            <Calendar size={10} />
                            {new Date(log.watched_at + 'T00:00:00').toLocaleDateString('en-US', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </button>

                        <div className={styles.logActions}>
                          {isLatest && (
                            <button
                              className={styles.rewatchBtn}
                              onClick={handleQuickLog}
                              aria-label="Log a rewatch"
                            >
                              <RefreshCw size={11} />
                              Rewatch
                            </button>
                          )}

                          {/* ··· menu */}
                          <div className={styles.moreWrap}>
                            <button
                              className={styles.moreBtn}
                              onClick={e => {
                                e.stopPropagation()
                                setMoreMenuLogId(moreMenuLogId === log.id ? null : log.id)
                              }}
                              aria-label="More options"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {moreMenuLogId === log.id && (
                              <div className={styles.moreMenu} onClick={e => e.stopPropagation()} role="menu">
                                <button className={styles.moreItem} role="menuitem" onClick={() => openEdit(log)}>
                                  Edit details
                                </button>
                                <button
                                  className={`${styles.moreItem} ${styles.moreItemDanger}`}
                                  role="menuitem"
                                  onClick={() => handleDelete(log.id)}
                                >
                                  Delete log
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {log.notes && (
                        <p className={styles.logNotes}>"{log.notes}"</p>
                      )}
                    </>
                  )}

                  {/* ── Inline edit panel ── */}
                  {isEditing && (
                    <div className={styles.editPanel}>
                      <div className={styles.editHeader}>
                        <span className={styles.editTitle}>{watchLabel(logRankMap[log.id])}</span>
                        <button className={styles.closeEditBtn} onClick={closeEdit} aria-label="Cancel">
                          <X size={13} />
                        </button>
                      </div>

                      <div className={styles.editField}>
                        <label htmlFor={`date-${log.id}`} className={styles.editLabel}>Date watched</label>
                        <input
                          id={`date-${log.id}`}
                          type="date"
                          className={styles.dateInput}
                          value={editDate}
                          max={new Date().toISOString().slice(0, 10)}
                          onChange={e => setEditDate(e.target.value)}
                        />
                      </div>

                      <div className={styles.editField}>
                        <label htmlFor={`notes-${log.id}`} className={styles.editLabel}>
                          Notes <span className={styles.hint}>(optional)</span>
                        </label>
                        <textarea
                          id={`notes-${log.id}`}
                          ref={notesRef}
                          className={styles.textarea}
                          placeholder="How was this season? Any favorite episodes?"
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          maxLength={1000}
                        />
                        <span className={styles.charCount}>{editNotes.length}/1000</span>
                      </div>

                      <div className={styles.editActions}>
                        <button className={styles.saveBtn} onClick={handleSave}>
                          <Check size={13} />
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
