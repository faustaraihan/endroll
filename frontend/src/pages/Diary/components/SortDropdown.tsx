import React, { useState, useEffect, useRef } from 'react'
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react'
import styles from '../Diary.module.css'

export type SortField = 'date' | 'title' | 'year' | 'rating' | 'runtime' | 'rewatch'
export type SortDirection = 'asc' | 'desc'
export type GroupField = 'none' | 'type' | 'month' | 'decade' | 'rating'

interface SortDropdownProps {
  sortField: SortField
  setSortField: (field: SortField) => void
  sortDirection: SortDirection
  setSortDirection: (dir: SortDirection) => void
  groupBy: GroupField
  setGroupBy: (group: GroupField) => void
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  groupBy,
  setGroupBy
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getSortLabel = (field: SortField) => {
    switch (field) {
      case 'date': return 'Date Watched'
      case 'title': return 'Title'
      case 'year': return 'Release Year'
      case 'rating': return 'Rating'
      case 'runtime': return 'Runtime'
      case 'rewatch': return 'Rewatch'
      default: return 'Sort'
    }
  }

  return (
    <div className={styles.sortDropdownWrap} ref={dropdownRef}>
      <button
        className={styles.sortTriggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ArrowUpDown size={14} />
        <span>{getSortLabel(sortField)}</span>
        <ChevronDown size={14} className={`${styles.sortChevron} ${isOpen ? styles.sortChevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.sortMenu} role="menu">
          <div className={styles.sortMenuSectionHeader}>Sort by</div>
          <button
            className={`${styles.sortMenuItem} ${sortField === 'date' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortField('date'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortField === 'date'}
          >
            <span className={styles.menuCheck}>{sortField === 'date' && <Check size={14} />}</span>
            <span>Date Watched</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${sortField === 'title' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortField('title'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortField === 'title'}
          >
            <span className={styles.menuCheck}>{sortField === 'title' && <Check size={14} />}</span>
            <span>Title</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${sortField === 'year' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortField('year'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortField === 'year'}
          >
            <span className={styles.menuCheck}>{sortField === 'year' && <Check size={14} />}</span>
            <span>Release Year</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${sortField === 'rating' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortField('rating'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortField === 'rating'}
          >
            <span className={styles.menuCheck}>{sortField === 'rating' && <Check size={14} />}</span>
            <span>Rating</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${sortField === 'runtime' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortField('runtime'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortField === 'runtime'}
          >
            <span className={styles.menuCheck}>{sortField === 'runtime' && <Check size={14} />}</span>
            <span>Runtime</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${sortField === 'rewatch' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortField('rewatch'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortField === 'rewatch'}
          >
            <span className={styles.menuCheck}>{sortField === 'rewatch' && <Check size={14} />}</span>
            <span>Rewatch Count</span>
          </button>

          <div className={styles.sortMenuDivider} />

          <button
            className={`${styles.sortMenuItem} ${sortDirection === 'asc' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortDirection('asc'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortDirection === 'asc'}
          >
            <span className={styles.menuCheck}>{sortDirection === 'asc' && <Check size={14} />}</span>
            <span>Ascending</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${sortDirection === 'desc' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setSortDirection('desc'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={sortDirection === 'desc'}
          >
            <span className={styles.menuCheck}>{sortDirection === 'desc' && <Check size={14} />}</span>
            <span>Descending</span>
          </button>

          <div className={styles.sortMenuDivider} />

          <div className={styles.sortMenuSectionHeader}>Group by</div>
          <button
            className={`${styles.sortMenuItem} ${groupBy === 'none' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setGroupBy('none'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={groupBy === 'none'}
          >
            <span className={styles.menuCheck}>{groupBy === 'none' && <Check size={14} />}</span>
            <span>None</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${groupBy === 'type' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setGroupBy('type'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={groupBy === 'type'}
          >
            <span className={styles.menuCheck}>{groupBy === 'type' && <Check size={14} />}</span>
            <span>Type</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${groupBy === 'month' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setGroupBy('month'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={groupBy === 'month'}
          >
            <span className={styles.menuCheck}>{groupBy === 'month' && <Check size={14} />}</span>
            <span>Month Watched</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${groupBy === 'decade' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setGroupBy('decade'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={groupBy === 'decade'}
          >
            <span className={styles.menuCheck}>{groupBy === 'decade' && <Check size={14} />}</span>
            <span>Release Decade</span>
          </button>
          <button
            className={`${styles.sortMenuItem} ${groupBy === 'rating' ? styles.sortMenuItemActive : ''}`}
            onClick={() => { setGroupBy('rating'); setIsOpen(false); }}
            role="menuitemradio"
            aria-checked={groupBy === 'rating'}
          >
            <span className={styles.menuCheck}>{groupBy === 'rating' && <Check size={14} />}</span>
            <span>Rating</span>
          </button>
        </div>
      )}
    </div>
  )
}
