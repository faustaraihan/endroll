import { useState, useMemo } from 'react'
import { Film, Plus, LayoutGrid, List, AlignJustify } from 'lucide-react'

import { useStore } from '../../store/useStore'
import { EmptyState, PageHeader } from '../../components'
import styles from './Diary.module.css'
import type { WatchLog } from '../../types'

import { SortDropdown } from './components/SortDropdown'
import type { SortField, SortDirection, GroupField } from './components/SortDropdown'
import { DiaryEntry } from './components/DiaryEntry'

type FilterType = 'all' | 'film' | 'series'
type ViewMode = 'list' | 'grid' | 'compact'

interface GroupedSection {
  key: string
  title: string
  logs: WatchLog[]
}

export default function Diary() {
  const watchLogs = useStore(state => state.watchLogs)
  const personalRatings = useStore(state => state.personalRatings)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [groupBy, setGroupBy] = useState<GroupField>('none')
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const baseLogs = useMemo(() => {
    return watchLogs
      .filter(log => filter === 'all' || log.title.type === filter)
      .filter(log => log.episode_number === undefined || log.episode_number === null)
  }, [watchLogs, filter])

  const sortedLogs = useMemo(() => {
    // 2. Group by title.id to find representatives (latest log per title)
    const groups: Record<string, WatchLog[]> = {}
    for (const log of baseLogs) {
      const key = log.title.id
      if (!groups[key]) groups[key] = []
      groups[key].push(log)
    }

    const watchLogIndexMap = new Map<string, number>()
    watchLogs.forEach((log, index) => {
      watchLogIndexMap.set(log.id, index)
    })

    const groupedLogs = Object.values(groups).map(group => {
      const sortedGroup = [...group].sort((a, b) => {
        const dateDiff = new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
        if (dateDiff !== 0) return dateDiff
        const idxA = watchLogIndexMap.get(a.id) ?? 0
        const idxB = watchLogIndexMap.get(b.id) ?? 0
        return idxA - idxB
      })
      return sortedGroup[0]
    })

    // 3. Sort the representatives
    return groupedLogs.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date': {
          comparison = new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime()
          break
        }
        case 'title': {
          comparison = a.title.title.localeCompare(b.title.title)
          break
        }
        case 'year': {
          const yearA = a.title.release_year ?? 0
          const yearB = b.title.release_year ?? 0
          comparison = yearA - yearB
          break
        }
        case 'rating': {
          const rA = (a.title.type === 'film' ? (a.rating ?? personalRatings[a.title.id]) : personalRatings[a.title.id]) ?? 0
          const rB = (b.title.type === 'film' ? (b.rating ?? personalRatings[b.title.id]) : personalRatings[b.title.id]) ?? 0
          comparison = rA - rB
          break
        }
        case 'runtime': {
          const runA = a.title.runtime_minutes ?? 0
          const runB = b.title.runtime_minutes ?? 0
          comparison = runA - runB
          break
        }
        case 'rewatch': {
          comparison = a.rewatch_count - b.rewatch_count
          break
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [baseLogs, watchLogs, sortField, sortDirection, personalRatings])

  const groupedSections = useMemo<GroupedSection[]>(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: '', logs: sortedLogs }]
    }

    const sectionsMap: Record<string, WatchLog[]> = {}
    const sectionLabels: Record<string, string> = {}

    for (const log of sortedLogs) {
      let key = 'other'
      let label = 'Other'

      if (groupBy === 'type') {
        key = log.title.type
        label = log.title.type === 'film' ? 'Film' : 'Series'
      } else if (groupBy === 'month') {
        if (log.watched_at) {
          const d = new Date(log.watched_at)
          const y = d.getFullYear()
          const m = d.getMonth()
          key = `${y}-${String(m + 1).padStart(2, '0')}`
          
          const monthsEn = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ]
          label = `${monthsEn[m]} ${y}`
        }
      } else if (groupBy === 'decade') {
        const year = log.title.release_year
        if (year) {
          const dec = Math.floor(year / 10) * 10
          key = String(dec)
          label = `${dec}s`
        } else {
          key = 'unknown'
          label = 'Unknown Release Year'
        }
      } else if (groupBy === 'rating') {
        const r = (log.title.type === 'film' ? (log.rating ?? personalRatings[log.title.id]) : personalRatings[log.title.id])
        if (r === undefined || r === null) {
          key = '5_unrated'
          label = 'Unrated'
        } else if (r >= 9.0) {
          key = '1_outstanding'
          label = 'Outstanding (9.0 - 10.0)'
        } else if (r >= 7.0) {
          key = '2_good'
          label = 'Good (7.0 - 8.9)'
        } else if (r >= 5.0) {
          key = '3_average'
          label = 'Average (5.0 - 6.9)'
        } else {
          key = '4_poor'
          label = 'Poor (< 5.0)'
        }
      }

      if (!sectionsMap[key]) {
        sectionsMap[key] = []
      }
      sectionsMap[key].push(log)
      sectionLabels[key] = label
    }

    const sections = Object.keys(sectionsMap).map(key => ({
      key,
      title: sectionLabels[key],
      logs: sectionsMap[key]
    }))

    sections.sort((a, b) => {
      if (groupBy === 'month') {
        return sortDirection === 'asc' ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key)
      }
      if (groupBy === 'decade') {
        if (a.key === 'unknown') return 1
        if (b.key === 'unknown') return -1
        const numA = parseInt(a.key, 10)
        const numB = parseInt(b.key, 10)
        return sortDirection === 'asc' ? numA - numB : numB - numA
      }
      if (groupBy === 'rating') {
        return sortDirection === 'asc' ? b.key.localeCompare(a.key) : a.key.localeCompare(b.key)
      }
      if (groupBy === 'type') {
        return sortDirection === 'asc' ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key)
      }
      return 0
    })

    return sections
  }, [sortedLogs, groupBy, sortDirection, personalRatings])

  return (
    <div className={styles.page}>
      {/* ── Sticky header bar ── */}
      <div className={styles.topBar}>
        <PageHeader 
          className={styles.diaryHeader}
          eyebrow="Your journal"
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span>Diary</span>
              <span className={styles.entryCount}>
                {sortedLogs.length} entries
              </span>
            </div>
          }
          rightElement={
            <div className={styles.controls}>
              {/* View Mode Toggle */}
              <div className={styles.viewToggleGroup} role="group" aria-label="View mode">
                <button
                  className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Details view"
                  aria-label="Details view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List size={16} />
                </button>
                <button
                  className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleBtnActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`${styles.viewToggleBtn} ${viewMode === 'compact' ? styles.viewToggleBtnActive : ''}`}
                  onClick={() => setViewMode('compact')}
                  title="Compact view"
                  aria-label="Compact view"
                  aria-pressed={viewMode === 'compact'}
                >
                  <AlignJustify size={16} />
                </button>
              </div>

              {/* Filter pills */}
              <div className={styles.filterGroup} role="group" aria-label="Filter by type">
                {(['all', 'film', 'series'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    className={`${styles.filterPill} ${filter === f ? styles.filterPillActive : ''}`}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                  >
                    {f === 'all' ? 'All' : f === 'film' ? 'Film' : 'Series'}
                  </button>
                ))}
              </div>

              <SortDropdown
                sortField={sortField}
                setSortField={setSortField}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
              />
            </div>
          }
        />
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        {sortedLogs.length === 0 ? (
          <EmptyState
            icon={<Film size={40} strokeWidth={1.5} />}
            title={<>No entries yet.<br />What did you watch recently?</>}
            actionLabel="Log now"
            actionLink="/log"
            actionIcon={<Plus size={16} />}
          />
        ) : (
          <div className={styles.timeline}>
            {groupBy === 'none' ? (
              <ul className={`${styles.diaryList} ${styles[viewMode]}`} role="list">
                {groupedSections[0]?.logs.map((log, i) => (
                  <li key={log.id}>
                    <DiaryEntry
                      log={log}
                      index={i}
                      personalRating={personalRatings[log.title.id]}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.groupedTimeline}>
                {groupedSections.map((section) => (
                  <section key={section.key} className={styles.groupSection}>
                    <h3 className={styles.groupHeader}>
                      <span>{section.title}</span>
                      <span className={styles.groupCount}>{section.logs.length}</span>
                    </h3>
                    <ul className={`${styles.diaryList} ${styles[viewMode]}`} role="list">
                      {section.logs.map((log, i) => (
                        <li key={log.id}>
                          <DiaryEntry
                            log={log}
                            index={i}
                            personalRating={personalRatings[log.title.id]}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
