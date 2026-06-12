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

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'date',    label: 'Date Watched' },
  { value: 'title',   label: 'Title' },
  { value: 'year',    label: 'Release Year' },
  { value: 'rating',  label: 'Rating' },
  { value: 'runtime', label: 'Runtime' },
  { value: 'rewatch', label: 'Rewatch Count' },
]

const directionOptions: { value: SortDirection; label: string }[] = [
  { value: 'asc',  label: 'Ascending (A–Z, oldest)' },
  { value: 'desc', label: 'Descending (Z–A, newest)' },
]

const groupOptions: { value: GroupField; label: string }[] = [
  { value: 'none',   label: 'None' },
  { value: 'type',   label: 'Type' },
  { value: 'month',  label: 'Month Watched' },
  { value: 'decade', label: 'Release Decade' },
  { value: 'rating', label: 'Rating' },
]

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
  const triggerRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const currentSortLabel =
    sortOptions.find(o => o.value === sortField)?.label ?? 'Sort'

  const renderItem = <T extends string>(
    option: { value: T; label: string },
    current: T,
    onSelect: (value: T) => void
  ) => (
    <button
      key={option.value}
      className={`${styles.sortMenuItem} ${current === option.value ? styles.sortMenuItemActive : ''}`}
      onClick={() => { onSelect(option.value); setIsOpen(false) }}
      role="menuitemradio"
      aria-checked={current === option.value}
    >
      <span className={styles.menuCheck}>{current === option.value && <Check size={14} />}</span>
      <span>{option.label}</span>
    </button>
  )

  return (
    <div className={styles.sortDropdownWrap} ref={dropdownRef}>
      <button
        ref={triggerRef}
        className={styles.sortTriggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Sort by ${currentSortLabel}`}
      >
        <ArrowUpDown size={14} />
        <span>{currentSortLabel}</span>
        <ChevronDown size={14} className={`${styles.sortChevron} ${isOpen ? styles.sortChevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.sortMenu} role="menu">
          <div className={styles.sortMenuSectionHeader}>Sort by</div>
          {sortOptions.map(o => renderItem(o, sortField, setSortField))}

          <div className={styles.sortMenuDivider} />

          {directionOptions.map(o => renderItem(o, sortDirection, setSortDirection))}

          <div className={styles.sortMenuDivider} />

          <div className={styles.sortMenuSectionHeader}>Group by</div>
          {groupOptions.map(o => renderItem(o, groupBy, setGroupBy))}
        </div>
      )}
    </div>
  )
}
