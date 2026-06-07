import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserProfile, UserStats, WatchLog, WatchlistItem, Streak, Collection, CollectionItem, Title } from '../types'
import {
  mockUser,
  mockStats,
  mockWatchLogs,
  mockWatchlist,
  mockStreak,
  mockCollections,
  mockCollectionItems,
  mockPersonalRatings,
} from '../data/mockData'

interface AppContextValue {
  user: UserProfile
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>
  stats: UserStats
  watchLogs: WatchLog[]
  watchlist: WatchlistItem[]
  streak: Streak
  isLoggedIn: boolean
  setWatchLogs: React.Dispatch<React.SetStateAction<WatchLog[]>>
  setWatchlist: React.Dispatch<React.SetStateAction<WatchlistItem[]>>
  collections: Collection[]
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>
  collectionItems: CollectionItem[]
  setCollectionItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>
  addCollection: (name: string, description?: string, isPrivate?: boolean) => string
  deleteCollection: (id: string) => void
  addTitleToCollection: (collectionId: string, title: Title) => void
  removeTitleFromCollection: (collectionId: string, titleId: string) => void
  personalRatings: Record<string, number>
  setRatingForTitle: (titleId: string, rating: number | null) => void
  seasonRatings: Record<string, number>
  setSeasonRating: (titleId: string, seasonNumber: number, rating: number | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [watchLogs, setWatchLogs] = useState<WatchLog[]>(mockWatchLogs)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist)
  const [collections, setCollections] = useState<Collection[]>(mockCollections)
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>(mockCollectionItems)
  const [personalRatings, setPersonalRatings] = useState<Record<string, number>>(mockPersonalRatings)
  const [seasonRatings, setSeasonRatings] = useState<Record<string, number>>({})

  const setRatingForTitle = (titleId: string, rating: number | null) => {
    setPersonalRatings(prev => {
      const next = { ...prev }
      if (rating === null) {
        delete next[titleId]
      } else {
        next[titleId] = rating
      }
      return next
    })
  }

  // seasonRatings key: `${titleId}:${seasonNumber}`
  const setSeasonRating = (titleId: string, seasonNumber: number, rating: number | null) => {
    const key = `${titleId}:${seasonNumber}`
    setSeasonRatings(prev => {
      const next = { ...prev }
      if (rating === null) delete next[key]
      else next[key] = rating
      return next
    })
  }

  // Calculate dynamic average rating
  const ratingsArray = Object.values(personalRatings)
  const dynamicAverageRating = ratingsArray.length > 0
    ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
    : undefined

  const addCollection = (name: string, description?: string, isPrivate = false) => {
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
    setCollections(prev => [...prev, newCol])
    return newId
  }

  const deleteCollection = (id: string) => {
    if (id === 'col-favorites') return
    setCollections(prev => prev.filter(c => c.id !== id))
    setCollectionItems(prev => prev.filter(item => item.collection_id !== id))
  }

  const addTitleToCollection = (collectionId: string, title: Title) => {
    const exists = collectionItems.some(
      item => item.collection_id === collectionId && item.title.tmdb_id === title.tmdb_id
    )
    if (exists) return

    const newItem: CollectionItem = {
      id: crypto.randomUUID(),
      collection_id: collectionId,
      title_id: title.id,
      title,
      sort_order: collectionItems.filter(item => item.collection_id === collectionId).length,
      added_at: new Date().toISOString(),
    }

    setCollectionItems(prev => [...prev, newItem])

    setCollections(prev =>
      prev.map(col => {
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
    )
  }

  const removeTitleFromCollection = (collectionId: string, titleId: string) => {
    setCollectionItems(prev =>
      prev.filter(item => !(item.collection_id === collectionId && item.title.id === titleId))
    )

    setCollections(prev =>
      prev.map(col => {
        if (col.id === collectionId) {
          const newCount = Math.max(0, col.items_count - 1)
          const remaining = collectionItems.filter(
            item => item.collection_id === collectionId && item.title.id !== titleId
          )
          const newCover = remaining.length > 0 ? remaining[remaining.length - 1].title : undefined
          return {
            ...col,
            items_count: newCount,
            cover_title_id: newCover?.id,
            cover_title: newCover,
          }
        }
        return col
      })
    )
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        stats: {
          ...mockStats,
          average_rating: dynamicAverageRating,
        },
        watchLogs,
        watchlist,
        streak: mockStreak,
        isLoggedIn: true,
        setWatchLogs,
        setWatchlist,
        collections,
        setCollections,
        collectionItems,
        setCollectionItems,
        addCollection,
        deleteCollection,
        addTitleToCollection,
        removeTitleFromCollection,
        personalRatings,
        setRatingForTitle,
        seasonRatings,
        setSeasonRating,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
