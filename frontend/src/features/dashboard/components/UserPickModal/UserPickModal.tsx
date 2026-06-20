import { useState, useRef, useEffect } from 'react'
import { X, Search as SearchIcon, Check } from 'lucide-react'
import { useStore } from '../../../../store/useStore'
import { Poster } from '../../../titles/components/Poster/Poster'
import { SearchInput } from '../../../../components'
import styles from './UserPickModal.module.css'

interface UserPickModalProps {
  onClose: () => void
}

export function UserPickModal({ onClose }: UserPickModalProps) {
  const user = useStore(state => state.user)
  const setUser = useStore(state => state.setUser)
  const watchLogs = useStore(state => state.watchLogs)

  // Get unique titles from watchLogs
  const uniqueTitlesMap = new Map<string, typeof watchLogs[0]['title']>()
  watchLogs.forEach(log => {
    if (!uniqueTitlesMap.has(log.title_id)) {
      uniqueTitlesMap.set(log.title_id, log.title)
    }
  })
  const allWatchedTitles = Array.from(uniqueTitlesMap.values())

  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>(user?.preferences?.user_pick || [])

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    modalRef.current?.querySelector<HTMLElement>('input')?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const filteredTitles = allWatchedTitles.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase())
  )

  const toggleSelection = (titleId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(titleId)) {
        return prev.filter(id => id !== titleId)
      }
      if (prev.length >= 5) {
        return prev
      }
      return [...prev, titleId]
    })
  }

  const handleSave = () => {
    if (!user) {
      onClose()
      return
    }
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        user_pick: selectedIds
      }
    })
    onClose()
  }

  const firstName = user?.username ? user.username.split(' ')[0] : 'User'

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} ref={modalRef}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Edit {firstName}'s Picks</h3>
            <p className={styles.modalSub}>Select up to 5 titles from your journal ({selectedIds.length}/5)</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.searchWrap}>
            <SearchInput
              value={query}
              onChange={setQuery}
              onClear={() => setQuery('')}
              placeholder="Search your watched titles..."
            />
          </div>

          <div className={styles.titleGrid}>
            {filteredTitles.map(title => {
              const isSelected = selectedIds.includes(title.id)
              return (
                <button
                  key={title.id}
                  className={`${styles.titleCard} ${isSelected ? styles.selected : ''}`}
                  onClick={() => toggleSelection(title.id)}
                  disabled={!isSelected && selectedIds.length >= 5}
                >
                  <div className={styles.posterWrap}>
                    <Poster title={title.title} src={title.poster_path} alt="" size="sm" />
                    {isSelected && (
                      <div className={styles.checkOverlay}>
                        <Check size={24} color="#fff" />
                      </div>
                    )}
                  </div>
                  <span className={styles.titleName}>{title.title}</span>
                </button>
              )
            })}
            {filteredTitles.length === 0 && (
              <div className={styles.emptyState}>
                <SearchIcon size={24} className={styles.emptyIcon} />
                <p>No watched titles found matching "{query}".</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}
