import React, { useState, useRef } from 'react'
import { User, Settings as SettingsIcon, Shield, Database, Download, Upload, AlertTriangle, Plus, Trash2, X } from 'lucide-react'
import { useApp, useToast } from '../../contexts'
import type { Title, WatchLog } from '../../types'
import styles from './Settings.module.css'

export default function Settings() {
  const {
    user,
    setUser,
    watchLogs,
    setWatchLogs,
    watchlist,
    setWatchlist,
    setCollections,
    personalRatings,
    setRatingForTitle
  } = useApp()

  const { addToast } = useToast()

  // Profile forms local state
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio || '')
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user.preferences.favorite_genres || [])

  // Journaling Preferences local state
  const [ratingStep, setRatingStep] = useState(user.preferences.rating_step || 0.5)
  const [startOfWeek, setStartOfWeek] = useState(user.preferences.start_of_week || 'Monday')
  const [theme, setTheme] = useState(user.preferences.theme || 'dark')

  // Password reset simulation state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Cinema Board (Favorites) State
  const [favoritesBoard, setFavoritesBoard] = useState<string[]>(
    user.preferences.favorites_board || ['', '', '', '']
  )
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null) // For movie selection modal

  // References for inputs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // List of all genres for the selection tags
  const allGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
    'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 
    'TV Movie', 'Thriller', 'War', 'Western'
  ]

  // Renders unique logged titles from watch logs for the Cinema Board selector
  const loggedTitlesMap = new Map<string, Title>()
  watchLogs.forEach(log => {
    if (log.title) {
      loggedTitlesMap.set(log.title.id, log.title)
    }
  })
  const loggedTitles = Array.from(loggedTitlesMap.values())

  // Genre selection toggle
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  // Profile Info Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      addToast('Username cannot be empty.', 'error')
      return
    }
    setUser(prev => ({
      ...prev,
      username: username.trim(),
      bio: bio.trim(),
      preferences: {
        ...prev.preferences,
        favorite_genres: selectedGenres
      }
    }))
    addToast('Profile identity updated.', 'success')
  }

  // Preferences Save
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        rating_step: ratingStep,
        start_of_week: startOfWeek,
        theme: theme
      }
    }))
    addToast('Preferences saved.', 'success')
  }

  // Cinema Board Slot Update
  const handleSelectFavorite = (titleId: string) => {
    if (activeSlotIndex === null) return
    const updated = [...favoritesBoard]
    updated[activeSlotIndex] = titleId
    setFavoritesBoard(updated)
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        favorites_board: updated
      }
    }))
    addToast(`Slot ${activeSlotIndex + 1} updated.`, 'success')
    setActiveSlotIndex(null)
  }

  const handleRemoveFavorite = (index: number) => {
    const updated = [...favoritesBoard]
    updated[index] = ''
    setFavoritesBoard(updated)
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        favorites_board: updated
      }
    }))
    addToast(`Slot ${index + 1} cleared.`, 'info')
  }

  // Data Export utilities
  const handleExportJSON = () => {
    const data = {
      app: 'Endroll',
      export_date: new Date().toISOString(),
      user: {
        username: user.username,
        bio: user.bio,
        preferences: user.preferences
      },
      watchLogs,
      watchlist,
      personalRatings
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `endroll_backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    addToast('JSON backup downloaded successfully.', 'success')
  }

  const handleExportCSV = () => {
    const headers = ['Title', 'Type', 'Year', 'Rating10', 'WatchedDate', 'Notes', 'Rewatch']
    const rows = watchLogs.map(log => [
      `"${log.title.title.replace(/"/g, '""')}"`,
      log.title.type,
      log.title.release_year || '',
      personalRatings[log.title_id] || '',
      log.watched_at.split('T')[0],
      `"${(log.notes || '').replace(/"/g, '""')}"`,
      log.rewatch_count > 0 ? 'yes' : 'no'
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `endroll_history_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    addToast('CSV export downloaded (Letterboxd format compatible).', 'success')
  }

  // Data Import Utilities (reads JSON or CSV files)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (!content) return

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content)
          if (parsed.watchLogs && Array.isArray(parsed.watchLogs)) {
            setWatchLogs(parsed.watchLogs)
            addToast(`Successfully imported ${parsed.watchLogs.length} logs from JSON.`, 'success')
          } else {
            addToast('Invalid JSON backup format.', 'error')
          }
          if (parsed.watchlist && Array.isArray(parsed.watchlist)) {
            setWatchlist(parsed.watchlist)
          }
          if (parsed.personalRatings) {
            Object.entries(parsed.personalRatings).forEach(([tid, r]) => {
              setRatingForTitle(tid, r as number)
            })
          }
        } else if (file.name.endsWith('.csv')) {
          // Robust line by line parser
          const lines = content.split(/\r?\n/)
          if (lines.length < 2) {
            addToast('CSV is empty or invalid.', 'error')
            return
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
          const newLogs: WatchLog[] = []

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i]
            if (!line.trim()) continue

            // Basic comma split that ignores commas inside quotes
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',')
            const row = matches.map(v => v.trim().replace(/^["']|["']$/g, '').replace(/""/g, '"'))

            const titleIdx = headers.indexOf('title')
            const typeIdx = headers.indexOf('type')
            const yearIdx = headers.indexOf('year')
            const ratingIdx = headers.indexOf('rating10')
            const dateIdx = headers.indexOf('watcheddate')
            const notesIdx = headers.indexOf('notes')
            const rewatchIdx = headers.indexOf('rewatch')

            if (titleIdx === -1) continue

            const filmTitle = row[titleIdx] || 'Unknown Title'
            const type = (row[typeIdx] || 'film') as 'film' | 'series'
            const year = parseInt(row[yearIdx] || '0', 10) || undefined
            const rating = parseFloat(row[ratingIdx] || '') || undefined
            const date = row[dateIdx] || new Date().toISOString().split('T')[0]
            const notes = row[notesIdx] || ''
            const rewatch = row[rewatchIdx] === 'yes'

            const titleId = `t-imported-${i}`
            const logId = `l-imported-${i}`

            const importedTitle: Title = {
              id: titleId,
              title: filmTitle,
              type,
              release_year: year,
              genres: [],
              cast: []
            }

            const log: WatchLog = {
              id: logId,
              user_id: user.id,
              title_id: titleId,
              title: importedTitle,
              watched_at: new Date(date).toISOString(),
              notes,
              rewatch_count: rewatch ? 1 : 0
            }

            newLogs.push(log)
            if (rating !== undefined) {
              setRatingForTitle(titleId, rating)
            }
          }

          if (newLogs.length > 0) {
            setWatchLogs(prev => [...prev, ...newLogs])
            addToast(`Successfully imported ${newLogs.length} logs from CSV.`, 'success')
          } else {
            addToast('No valid rows found in CSV.', 'error')
          }
        }
      } catch (err) {
        console.error(err)
        addToast('Failed to parse the file. Please check its structure.', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Clear input
  }

  // Destructive resets
  const handleClearData = () => {
    if (window.confirm('WARNING: This will permanently erase all watch history and watchlist items. This action cannot be undone. Are you sure?')) {
      setWatchLogs([])
      setWatchlist([])
      addToast('All personal journal data wiped.', 'info')
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? All logs, collections, and settings will be permanently erased.')) {
      addToast('Simulating account deletion... Data wiped.', 'info')
      setWatchLogs([])
      setWatchlist([])
      setCollections([])
    }
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      addToast('Please fill out all password fields.', 'error')
      return
    }
    addToast('Password updated successfully.', 'success')
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSub}>
          Personalize your journaling options, manage your Cinema Board favorites, and export or import your data.
        </p>
      </header>

      {/* ── Main Two-Column Layout ── */}
      <div className={styles.mainGrid}>
        
        {/* ── Left Column: Identity & Cinema Board ── */}
        <div className={styles.column}>
          
          {/* Cinema Identity */}
          <section className={styles.card} aria-label="Cinema Identity">
            <h2 className={styles.cardTitle}>
              <User className={styles.cardTitleIcon} size={18} />
              Cinema Identity
            </h2>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Fausta"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="bio">Film Philosophy (Bio)</label>
                <textarea
                  id="bio"
                  className={styles.textarea}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short sentence summarizing your taste or watch philosophy..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Favorite Genres</label>
                <div className={styles.genreTagGrid}>
                  {allGenres.map(g => {
                    const isActive = selectedGenres.includes(g)
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`${styles.genreTag} ${isActive ? styles.genreTagActive : ''}`}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Profile
                </button>
              </div>
            </form>
          </section>

          {/* Cinema Board (Favorites) */}
          <section className={styles.card} aria-label="Cinema Board Favorites">
            <div>
              <h2 className={styles.cardTitle}>
                <Plus className={styles.cardTitleIcon} size={18} />
                Cinema Board
              </h2>
              <p className="text-xs text-muted mt-1">
                Pin up to 4 films or series to showcase on your journal. Click a slot to edit.
              </p>
            </div>

            <div className={styles.favoritesGrid}>
              {favoritesBoard.map((titleId, idx) => {
                const titleObj = titleId ? loggedTitles.find(t => t.id === titleId) : null
                const posterUrl = titleObj?.poster_path
                  ? `https://image.tmdb.org/t/p/w342${titleObj.poster_path}`
                  : null

                if (titleObj) {
                  return (
                    <div key={idx} className={`${styles.favoriteSlot} ${styles.favoriteSlotFilled}`}>
                      {posterUrl ? (
                        <img src={posterUrl} alt={titleObj.title} className={styles.favoritePoster} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 z-0">
                          {titleObj.title}
                        </div>
                      )}
                      <div className={styles.favoriteOverlay}>
                        <span className={styles.slotIndex}>#{idx + 1}</span>
                        <div className={styles.favoriteTitle}>{titleObj.title}</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={styles.changeBtn}
                            onClick={() => {
                              setActiveSlotIndex(idx)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-rose-500"
                            onClick={() => handleRemoveFavorite(idx)}
                            title="Remove from board"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    className={styles.favoriteSlot}
                    onClick={() => setActiveSlotIndex(idx)}
                  >
                    <span className={styles.favoriteSlotNumber}>+{idx + 1}</span>
                    <span className={styles.favoriteSlotEmptyText}>Add Pinned</span>
                  </button>
                )
              })}
            </div>
          </section>

        </div>

        {/* ── Right Column: Preferences, Portability & Account ── */}
        <div className={styles.column}>

          {/* Preferences */}
          <section className={styles.card} aria-label="Journal Preferences">
            <h2 className={styles.cardTitle}>
              <SettingsIcon className={styles.cardTitleIcon} size={18} />
              Journal Preferences
            </h2>
            <form onSubmit={handleSavePreferences} className="flex flex-col gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="ratingStep">Rating Slider Snap Precision</label>
                <select
                  id="ratingStep"
                  className={styles.select}
                  value={ratingStep}
                  onChange={(e) => setRatingStep(parseFloat(e.target.value))}
                >
                  <option value={0.5}>Nearest 0.5 points (Default)</option>
                  <option value={1.0}>Nearest 1.0 points</option>
                  <option value={0.1}>Free form (0.1 increments)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="startOfWeek">Streak Calendar Start</label>
                <select
                  id="startOfWeek"
                  className={styles.select}
                  value={startOfWeek}
                  onChange={(e) => setStartOfWeek(e.target.value)}
                >
                  <option value="Monday">Monday (Standard)</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="theme">Accent Color Theme</label>
                <select
                  id="theme"
                  className={styles.select}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="dark">Cinematic Violet (Default)</option>
                  <option value="midnight">Midnight Obsidian</option>
                  <option value="emerald">Deep Emerald</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Preferences
                </button>
              </div>
            </form>
          </section>

          {/* Data Portability */}
          <section className={styles.card} aria-label="Data Portability">
            <h2 className={styles.cardTitle}>
              <Database className={styles.cardTitleIcon} size={18} />
              Data & Backup
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <span className={styles.label}>Export Data</span>
                <p className="text-xs text-muted mt-1 mb-2">
                  Download a copy of your film journal.
                </p>
                <div className={styles.portabilityRow}>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} /> Export Backup (JSON)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              <div>
                <span className={styles.label}>Import Data</span>
                <p className="text-xs text-muted mt-1 mb-2">
                  Upload a previously exported Endroll JSON or a Letterboxd-compatible CSV.
                </p>
                <div className={styles.portabilityRow}>
                  <label className={styles.fileInputLabel}>
                    <Upload size={14} />
                    Choose Backup File (.json, .csv)
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,.csv"
                      onChange={handleImportFile}
                      className={styles.fileInput}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.dangerGroup}>
                <span className={styles.dangerTitle}>Danger Zone</span>
                <p className={styles.dangerText}>
                  This will wipe all local data logs, watchlist entries, and custom collections.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleClearData}
                    className="btn btn-sm btn-ghost text-rose-500 border border-rose-950 hover:bg-rose-950/20"
                  >
                    <AlertTriangle size={14} /> Clear Journal Data
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className={styles.card} aria-label="Account Security">
            <h2 className={styles.cardTitle}>
              <Shield className={styles.cardTitleIcon} size={18} />
              Account Security
            </h2>
            
            <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label}>Account Email</label>
                <input
                  type="text"
                  className={styles.input}
                  value={user.email}
                  disabled
                  title="Contact support to change email"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="currPass">Current Password</label>
                <input
                  id="currPass"
                  type="password"
                  className={styles.input}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="newPass">New Password</label>
                <input
                  id="newPass"
                  type="password"
                  className={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="btn btn-ghost btn-sm text-rose-500 hover:bg-rose-950/20"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </section>

        </div>

      </div>

      {/* ── Cinema Board Movie Selection Modal ── */}
      {activeSlotIndex !== null && (
        <div className={styles.modalOverlay} onClick={() => setActiveSlotIndex(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Choose a title to pin</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setActiveSlotIndex(null)}
              >
                <X size={18} />
              </button>
            </div>

            {loggedTitles.length === 0 ? (
              <p className={styles.noTitlesText}>
                No watched titles found. Go log some films first!
              </p>
            ) : (
              <ul className={styles.modalList} role="list">
                {loggedTitles.map(t => {
                  const isActive = favoritesBoard[activeSlotIndex] === t.id
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectFavorite(t.id)}
                        className={`${styles.modalItem} ${isActive ? styles.modalItemActive : ''}`}
                      >
                        <span>{t.title}</span>
                        {t.release_year && (
                          <span className="text-xs text-muted">({t.release_year})</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className={styles.actionsRow}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveSlotIndex(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
