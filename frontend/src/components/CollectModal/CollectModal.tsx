import { useState, useEffect, useRef } from 'react'
import { X, Plus, Check, FolderHeart, Folder } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Title } from '../../types'
import styles from './CollectModal.module.css'

interface CollectModalProps {
  title: Title | null
  onClose: () => void
}

export function CollectModal({ title, onClose }: CollectModalProps) {
  const collections = useStore(state => state.collections)
  const collectionItems = useStore(state => state.collectionItems)
  const addCollection = useStore(state => state.addCollection)
  const addTitleToCollection = useStore(state => state.addTitleToCollection)
  const removeTitleFromCollection = useStore(state => state.removeTitleFromCollection)

  const [newCollectionName, setNewCollectionName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Escape menutup modal, fokus masuk ke dalam saat terbuka
  useEffect(() => {
    if (!title) return
    modalRef.current?.querySelector<HTMLElement>('button, input')?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [title, onClose])

  if (!title) return null

  const isCollected = (collectionId: string) => {
    return collectionItems.some(
      item => item.collection_id === collectionId && item.title.tmdb_id === title.tmdb_id
    )
  }

  const handleToggle = (collectionId: string) => {
    if (isCollected(collectionId)) {
      // Find the item to get its exact ID in the collection
      const item = collectionItems.find(
        item => item.collection_id === collectionId && item.title.tmdb_id === title.tmdb_id
      )
      if (item) {
        removeTitleFromCollection(collectionId, item.title.id)
      }
    } else {
      addTitleToCollection(collectionId, title)
    }
  }

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return
    const newColId = addCollection(newCollectionName.trim(), 'A custom collection.')
    addTitleToCollection(newColId, title)
    setNewCollectionName('')
    setShowCreateForm(false)
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collect-modal-title"
      >
        <header className={styles.header}>
          <div>
            <h3 id="collect-modal-title" className={styles.modalTitle}>Add to Collection</h3>
            <p className={styles.modalSub}>
              Select a collection for <strong>{title.title}</strong>
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </header>

        <div className={styles.list}>
          {collections.map(col => {
            const checked = isCollected(col.id)
            const isFav = col.id === 'col-favorites'
            return (
              <label key={col.id} className={`${styles.item} ${checked ? styles.itemActive : ''}`}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checked}
                  onChange={() => handleToggle(col.id)}
                />
                <div className={styles.iconWrap}>
                  {isFav ? (
                    <FolderHeart size={16} className={styles.favIcon} />
                  ) : (
                    <Folder size={16} className={styles.folderIcon} />
                  )}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>
                    {col.name} {isFav && <span className={styles.favBadge}>Favorite</span>}
                  </span>
                  <span className={styles.count}>
                    {col.items_count} {col.items_count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className={styles.checkboxIndicator}>
                  {checked && <Check size={14} className={styles.checkIcon} />}
                </div>
              </label>
            )
          })}
        </div>

        <div className={styles.footer}>
          {!showCreateForm ? (
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={14} /> Create New Collection
            </button>
          ) : (
            <form onSubmit={handleCreateCollection} className={styles.createForm}>
              <input
                type="text"
                className={`input ${styles.createInput}`}
                placeholder="New collection name…"
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                autoFocus
                required
              />
              <div className={styles.formActions}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create & Add
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
