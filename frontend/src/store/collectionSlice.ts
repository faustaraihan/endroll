import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Collection, CollectionItem, Title } from '../types'
import { mockCollections, mockCollectionItems } from '../data/mockData'

export interface CollectionSlice {
  collections: Collection[]
  collectionItems: CollectionItem[]
  setCollections: (collections: Collection[] | ((prev: Collection[]) => Collection[])) => void
  setCollectionItems: (items: CollectionItem[] | ((prev: CollectionItem[]) => CollectionItem[])) => void
  addCollection: (name: string, description?: string, isPrivate?: boolean) => string
  deleteCollection: (id: string) => void
  addTitleToCollection: (collectionId: string, title: Title) => void
  removeTitleFromCollection: (collectionId: string, titleId: string) => void
}

export const createCollectionSlice: StateCreator<StoreState, [], [], CollectionSlice> = (set, get) => ({
  collections: mockCollections,
  collectionItems: mockCollectionItems,
  setCollections: (collectionsOrUpdater) => set((state) => ({
    collections: typeof collectionsOrUpdater === 'function' ? collectionsOrUpdater(state.collections) : collectionsOrUpdater
  })),
  setCollectionItems: (itemsOrUpdater) => set((state) => ({
    collectionItems: typeof itemsOrUpdater === 'function' ? itemsOrUpdater(state.collectionItems) : itemsOrUpdater
  })),
  addCollection: (name, description, isPrivate = false) => {
    const newId = crypto.randomUUID()
    const newCol: Collection = {
      id: newId,
      user_id: 'u1',
      name,
      description,
      is_private: isPrivate,
      created_at: new Date().toISOString(),
      items_count: 0,
    }
    set(state => ({ collections: [...state.collections, newCol] }))
    return newId
  },
  deleteCollection: (id) => {
    if (id === 'col-favorites') return
    set(state => ({
      collections: state.collections.filter(c => c.id !== id),
      collectionItems: state.collectionItems.filter(item => item.collection_id !== id)
    }))
  },
  addTitleToCollection: (collectionId, title) => {
    const state = get()
    const exists = state.collectionItems.some(
      item => item.collection_id === collectionId && item.title.tmdb_id === title.tmdb_id
    )
    if (exists) return

    const newItem: CollectionItem = {
      id: crypto.randomUUID(),
      collection_id: collectionId,
      title_id: title.id,
      title,
      sort_order: state.collectionItems.filter(item => item.collection_id === collectionId).length,
      added_at: new Date().toISOString(),
    }

    set(state => ({
      collectionItems: [...state.collectionItems, newItem],
      collections: state.collections.map(col => {
        if (col.id === collectionId) {
          return {
            ...col,
            items_count: col.items_count + 1,
            cover_title_id: title.id,
            cover_title: title,
          }
        }
        return col
      })
    }))
  },
  removeTitleFromCollection: (collectionId, titleId) => {
    set(state => {
      const remainingItems = state.collectionItems.filter(item => !(item.collection_id === collectionId && item.title.id === titleId))
      
      return {
        collectionItems: remainingItems,
        collections: state.collections.map(col => {
          if (col.id === collectionId) {
            const newCount = Math.max(0, col.items_count - 1)
            const remainingForCol = remainingItems.filter(item => item.collection_id === collectionId)
            const newCover = remainingForCol.length > 0 ? remainingForCol[remainingForCol.length - 1].title : undefined
            return {
              ...col,
              items_count: newCount,
              cover_title_id: newCover?.id,
              cover_title: newCover,
            }
          }
          return col
        })
      }
    })
  }
})
