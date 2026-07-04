import { useState } from 'react'
import { FolderPlus, Trash2, Plus, Film, X, Folder, Edit3 } from 'lucide-react'
import { useToast } from '@/contexts'
import { useStore } from '@/store/useStore'
import { PageHeader, FormGroup, BackButton, SearchInput, ConfirmModal } from '@/components'
import { TitleCard } from '@/components/ui/TitleCard'
import type { Title } from '@/types'
import styles from './CollectionsPage.module.css'

export default function CollectionsPage() {
  const collections = useStore(state => state.collections)
  const setCollections = useStore(state => state.setCollections)
  const collectionItems = useStore(state => state.collectionItems)
  const watchLogs = useStore(state => state.watchLogs)
  const addCollection = useStore(state => state.addCollection)
  const deleteCollection = useStore(state => state.deleteCollection)
  const addTitleToCollection = useStore(state => state.addTitleToCollection)
  const removeTitleFromCollection = useStore(state => state.removeTitleFromCollection)

  const { addToast } = useToast()

  // State
  const [selectedColId, setSelectedColId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Confirm delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  
  // Create form state
  const [colName, setColName] = useState('')
  const [colDesc, setColDesc] = useState('')

  // Edit header state
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  // Title search in detail view state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const activeCollection = collections.find(c => c.id === selectedColId)
  const activeItems = collectionItems.filter(item => item.collection_id === selectedColId)

  // Get unique titles from watch logs to add to collection
  const uniqueWatchedTitles = Array.from(
    new Map(watchLogs.map(log => [log.title.tmdb_id, log.title])).values()
  )

  // Filter out titles already in the active collection
  const availableTitles = uniqueWatchedTitles.filter(
    title => !activeItems.some(item => item.title.tmdb_id === title.tmdb_id)
  )

  // Filter available titles by search query
  const filteredAvailable = availableTitles.filter(title =>
    title.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault()
    if (!colName.trim()) return

    const newId = addCollection(colName.trim(), colDesc.trim(), false)
    addToast(`Collection "${colName}" created successfully!`, 'success')
    
    // Reset form
    setColName('')
    setColDesc('')
    setShowCreateModal(false)
    
    // Auto-view the newly created collection
    setSelectedColId(newId)
  }

  function handleDeleteRequest(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation() // Prevent entering detail view
    setDeleteTarget({ id, name })
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    const { id, name } = deleteTarget
    deleteCollection(id)
    addToast(`Collection "${name}" has been deleted.`, 'info')
    if (selectedColId === id) {
      setSelectedColId(null)
    }
    setDeleteTarget(null)
  }

  function handleAddTitle(title: Title) {
    if (!selectedColId) return
    addTitleToCollection(selectedColId, title)
    addToast(`"${title.title}" added to collection.`, 'success')
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  function handleRemoveTitle(titleId: string, titleName: string) {
    if (!selectedColId) return
    removeTitleFromCollection(selectedColId, titleId)
    addToast(`"${titleName}" removed from collection.`, 'info')
  }

  function handleSaveHeader(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedColId || !editName.trim()) return

    setCollections(prev =>
      prev.map(c =>
        c.id === selectedColId
          ? { ...c, name: editName.trim(), description: editDesc.trim() }
          : c
      )
    )
    addToast('Collection updated successfully!', 'success')
    setIsEditingHeader(false)
  }

  return (
    <div className={styles.page}>
      {!selectedColId ? (
        // ─── Grid View: All Collections ───
        <div style={{ animation: 'fade-in 0.3s ease' }}>
          <PageHeader 
            eyebrow="Your library"
            title="Collections"
            description="Group your watchlist by mood, genre, or personal custom lists."
            rightElement={
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <FolderPlus size={16} /> New collection
              </button>
            }
          />

          <div className={styles.grid}>
            {collections.map(col => {
              const colItems = collectionItems.filter(item => item.collection_id === col.id)
              const count = Math.min(colItems.length, 4)
              const gridStyle: React.CSSProperties = {
                gridTemplateColumns: `repeat(${Math.max(count, 1)}, 1fr)`,
              }
              return (
                <div
                  key={col.id}
                  className={styles.card}
                  onClick={() => setSelectedColId(col.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedColId(col.id)}
                  aria-label={`Open collection ${col.name}`}
                >
                  {/* Poster/Cover Art */}
                  <div className={styles.cardCover}>
                    {colItems.length > 0 ? (
                      <div
                        className={styles.coverGrid}
                        style={gridStyle}
                      >
                        {colItems.slice(0, count).map((item) => {
                          return item.title.poster_path ? (
                            <img
                              key={item.id}
                              src={item.title.poster_path}
                              alt={`Poster ${item.title.title}`}
                              className={styles.coverGridImg}
                              loading="lazy"
                            />
                          ) : (
                            <div key={item.id} className={styles.coverGridPlaceholder}>
                              <Film size={16} />
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className={styles.coverPlaceholder}>
                        <Folder size={36} className={styles.placeholderFolder} />
                      </div>
                    )}

                    <div className={styles.cardOverlay}>
                      <span className={styles.itemCountBadge}>
                        {col.items_count} titles
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeaderRow}>
                      <h2 className={styles.cardName}>
                        {col.name}
                      </h2>
                      <button
                        className={styles.deleteCardBtn}
                        onClick={e => handleDeleteRequest(col.id, col.name, e)}
                        aria-label={`Delete collection ${col.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className={styles.cardDesc}>
                      {col.description || 'No description for this collection yet.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Creation Modal Overlay */}
          {showCreateModal && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowCreateModal(false)}
              role="dialog"
              aria-modal="true"
            >
              <div className={styles.createModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>New Collection</h3>
                  <button
                    className={styles.closeModalBtn}
                    onClick={() => setShowCreateModal(false)}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateCollection} className={styles.modalForm}>
                  <FormGroup label="Collection Name" htmlFor="col-name">
                    <input
                      id="col-name"
                      type="text"
                      className="input"
                      placeholder="e.g. Best of Korean Cinema, Rainy Day Watches..."
                      value={colName}
                      onChange={e => setColName(e.target.value)}
                      required
                      autoFocus
                    />
                  </FormGroup>

                  <FormGroup label="Description" hint="(optional)" htmlFor="col-desc">
                    <textarea
                      id="col-desc"
                      className="input"
                      style={{ height: '80px', resize: 'none' }}
                      placeholder="Write a brief description of this collection..."
                      value={colDesc}
                      onChange={e => setColDesc(e.target.value)}
                    />
                  </FormGroup>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Create Collection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ─── Detail View: Inside one Collection ───
        <div style={{ animation: 'fade-in 0.3s ease' }}>
          {/* Header & Back */}
          <BackButton 
            label="Back to Collections" 
            onClick={() => {
              setSelectedColId(null)
              setSearchQuery('')
              setIsSearchFocused(false)
              setIsEditingHeader(false)
            }}
          />

          <header className={styles.detailHeader}>
            {isEditingHeader ? (
              <form onSubmit={handleSaveHeader} className={styles.editHeaderForm}>
                <div className={styles.editFormGroup}>
                  <input
                    type="text"
                    className="input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    placeholder="Collection Name"
                    autoFocus
                  />
                </div>
                <div className={styles.editFormGroup}>
                  <textarea
                    className="input"
                    style={{ height: '60px', resize: 'none', marginTop: '8px' }}
                    value={editDesc}
                    placeholder="Collection Description (optional)"
                    onChange={e => setEditDesc(e.target.value)}
                  />
                </div>
                <div className={styles.editActions}>
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditingHeader(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className={styles.detailInfo}>
                <div className={styles.detailNameRow}>
                  <h1 className={styles.detailTitle}>
                    {activeCollection?.name}
                  </h1>
                  
                  <div className={styles.detailActions}>
                    <button
                      className="btn btn-icon btn-ghost"
                      onClick={() => {
                        if (activeCollection) {
                          setEditName(activeCollection.name)
                          setEditDesc(activeCollection.description || '')
                          setIsEditingHeader(true)
                        }
                      }}
                      title="Edit name and description"
                      aria-label="Edit name and description"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      className="btn btn-icon btn-ghost"
                      style={{ color: 'var(--color-error)' }}
                      onClick={e =>
                        activeCollection &&
                        handleDeleteRequest(activeCollection.id, activeCollection.name, e)
                      }
                      title="Delete this collection"
                      aria-label="Delete collection"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={styles.detailDesc}>
                  {activeCollection?.description || 'No description for this collection yet.'}
                </p>
                <span className={styles.detailMetaCount}>
                  {activeItems.length} titles logged
                </span>
              </div>
            )}

            {/* Quick Add Search Bar */}
            <div className={styles.searchContainer}>
              <SearchInput 
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                placeholder="Add title from your logged diary entries…"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />

              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchQuery && (
                <div className={styles.dropdown}>
                  {filteredAvailable.length === 0 ? (
                    <div className={styles.dropdownEmpty}>
                      No new titles found for "{searchQuery}".
                    </div>
                  ) : (
                    <ul className={styles.dropdownList} role="listbox">
                      {filteredAvailable.map(title => (
                        <li key={title.id}>
                          <button
                            type="button"
                            className={styles.dropdownItem}
                            onMouseDown={() => handleAddTitle(title)}
                          >
                            {title.poster_path ? (
                              <img
                                src={title.poster_path}
                                alt={`Poster ${title.title}`}
                                className={styles.dropdownPoster}
                              />
                            ) : (
                              <div className={styles.dropdownPosterPlaceholder}>
                                <Film size={12} />
                              </div>
                            )}
                            <div className={styles.dropdownItemInfo}>
                              <span className={styles.dropdownItemTitle}>{title.title}</span>
                              <span className={styles.dropdownItemMeta}>
                                {title.release_year} · {title.type === 'movie' ? 'Movie' : 'Series'}
                              </span>
                            </div>
                            <Plus size={14} className={styles.dropdownAddIcon} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Grid of Titles */}
          <div className={styles.detailGridContainer}>
            {activeItems.length === 0 ? (
              <div className={styles.detailEmptyState}>
                <Film size={48} strokeWidth={1} className={styles.emptyIcon} />
                <h3>No titles in this collection yet.</h3>
                <p>Search for a title you've logged in your diary above to add it.</p>
              </div>
            ) : (
              <ul className={styles.posterGrid} role="list">
                {activeItems.map((item, index) => (
                  <li key={item.id}>
                    <TitleCard
                      title={item.title}
                      index={index}
                      onRemove={() => handleRemoveTitle(item.title.id, item.title.title)}
                      removeTooltip="Remove from collection"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete collection?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
