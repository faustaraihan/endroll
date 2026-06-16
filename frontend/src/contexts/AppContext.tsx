import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'
import type { UserProfile, WatchLog, WatchlistItem, Streak, Collection, CollectionItem, Title, SearchResult, UserStats } from '../types'
import {
  mockUser,
  mockWatchLogs,
  mockWatchlist,
  mockStreak,
  mockCollections,
  mockCollectionItems,
  mockPersonalRatings,
  mockTitles,
  mockTrendingThisWeek,
  mockNowPlaying,
  mockTopRatedClassics,
  mockUpcomingClassics,
  mockSearchResults,
} from '../data/mockData'

export interface ExploreData {
  trending: SearchResult[]
  nowPlaying: SearchResult[]
  classics: SearchResult[]
  upcoming: SearchResult[]
  searchResults: SearchResult[]
}

const staticExploreData: ExploreData = {
  trending: mockTrendingThisWeek,
  nowPlaying: mockNowPlaying,
  classics: mockTopRatedClassics,
  upcoming: mockUpcomingClassics,
  searchResults: mockSearchResults,
}

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
  dailyActivity: Record<string, number>
  exploreData: ExploreData
  getTitleById: (id: string) => Title | undefined
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

  // Combine all known titles into a map for fast lookup
  const allKnownTitles = useMemo(() => {
    const map = new Map<string, Title>()
    // Add explicitly mocked titles
    mockTitles.forEach(t => {
      map.set(t.id, t)
      if (t.tmdb_id) map.set(String(t.tmdb_id), t)
    })

    // Add titles from explore lists
    const exploreLists = [
      ...mockTrendingThisWeek,
      ...mockNowPlaying,
      ...mockTopRatedClassics,
      ...mockUpcomingClassics,
      ...mockSearchResults
    ]
    exploreLists.forEach(r => {
      const idStr = String(r.tmdb_id)
      if (!map.has(idStr)) {
        map.set(idStr, {
          id: idStr,
          tmdb_id: r.tmdb_id,
          title: r.title,
          type: r.type,
          poster_path: r.poster_path,
          release_year: r.release_year,
          genres: r.genres,
          cast: [],
          overview: r.overview,
        })
      }
    })

    // Add from watchLogs
    watchLogs.forEach(l => {
      map.set(l.title.id, l.title)
      if (l.title.tmdb_id) map.set(String(l.title.tmdb_id), l.title)
    })
    
    // Add from watchlist
    watchlist.forEach(w => {
      map.set(w.title.id, w.title)
      if (w.title.tmdb_id) map.set(String(w.title.tmdb_id), w.title)
    })

    return map
  }, [watchLogs, watchlist])

  const getTitleById = useCallback((id: string) => {
    return allKnownTitles.get(id)
  }, [allKnownTitles])

  const dynamicStreak = useMemo(() => {
    if (watchLogs.length === 0) {
      return {
        id: mockStreak.id,
        user_id: user.id,
        current_streak_weeks: 0,
        longest_streak_weeks: 0,
        last_log_week: '',
      }
    }

    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
    const getMondayTime = (dateStr: string) => {
      const d = new Date(dateStr)
      const day = d.getDay()
      const diff = day === 0 ? 6 : day - 1
      d.setDate(d.getDate() - diff)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    }

    const loggedWeeks = Array.from(new Set(watchLogs.map(l => getMondayTime(l.watched_at))))
      .sort((a, b) => a - b)

    let longest = 0
    let current = 0
    let previousWeek = -1

    for (const week of loggedWeeks) {
      if (previousWeek === -1) {
        current = 1
      } else {
        const diff = Math.round((week - previousWeek) / MS_PER_WEEK)
        if (diff === 1) {
          current++
        } else if (diff > 1) {
          current = 1
        }
      }
      if (current > longest) longest = current
      previousWeek = week
    }

    const today = new Date('2026-06-16')
    const thisWeek = getMondayTime(today.toISOString())
    const lastLoggedWeek = loggedWeeks[loggedWeeks.length - 1]
    const diffFromNow = Math.round((thisWeek - lastLoggedWeek) / MS_PER_WEEK)

    let activeCurrentStreak = current
    if (diffFromNow > 1) {
      if (diffFromNow === 2 && today.getDay() === 1) {
        // Still in grace period
      } else {
        activeCurrentStreak = 0
      }
    }

    return {
      id: mockStreak.id,
      user_id: user.id,
      current_streak_weeks: activeCurrentStreak,
      longest_streak_weeks: longest,
      last_log_week: new Date(lastLoggedWeek).toISOString().split('T')[0],
    }
  }, [watchLogs, user.id])

  // Dynamic dailyActivity
  const dailyActivity = useMemo(() => {
    const activity: Record<string, number> = {}
    
    watchLogs.forEach(log => {
      const dateKey = log.watched_at.split('T')[0]
      activity[dateKey] = (activity[dateKey] || 0) + 1 + log.rewatch_count
    })
    return activity
  }, [watchLogs])

  // Dynamic stats
  const dynamicStats = useMemo(() => {
    let totalFilms = 0
    let totalSeries = 0
    let watchMinutes = 0
    
    const genreCounts: Record<string, number> = {}
    const directorCounts: Record<string, number> = {}
    const actorCounts: Record<string, number> = {}
    const eraCounts: Record<string, number> = {}
    const monthlyCounts: Record<string, number> = {}
    let watchesThisYear = 0
    let watchesThisMonth = 0

    const today = new Date('2026-06-16')
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    const uniqueTitleIds = new Set<string>()

    watchLogs.forEach(log => {
      const title = allKnownTitles.get(log.title_id)
      const watches = 1 + log.rewatch_count
      
      if (!uniqueTitleIds.has(log.title_id)) {
        uniqueTitleIds.add(log.title_id)
        if (title) {
          if (title.type === 'film') totalFilms++
          if (title.type === 'series') totalSeries++
        }
      }

      if (title) {
        if (title.runtime_minutes) {
          watchMinutes += (title.runtime_minutes * watches)
        }

        title.genres.forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + watches
        })

        if (title.director) {
          directorCounts[title.director] = (directorCounts[title.director] || 0) + watches
        }

        title.cast.forEach(actor => {
          actorCounts[actor] = (actorCounts[actor] || 0) + watches
        })

        if (title.release_year) {
          const decade = Math.floor(title.release_year / 10) * 10
          const eraStr = `${decade.toString().slice(-2)}s`
          eraCounts[eraStr] = (eraCounts[eraStr] || 0) + watches
        }
      }

      const d = new Date(log.watched_at)
      if (d.getFullYear() === currentYear) {
        watchesThisYear += watches
        if (d.getMonth() === currentMonth) {
          watchesThisMonth += watches
        }
      }

      const monthKey = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + watches
    })

    const favorite_genres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const favorite_directors = Object.entries(directorCounts)
      .map(([director, count]) => ({ director, count, avatar_url: undefined }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const favorite_actors = Object.entries(actorCounts)
      .map(([name, count]) => ({ name, count, avatar_url: undefined }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const era_distribution = Object.entries(eraCounts)
      .map(([era, count]) => ({ era, count }))
      .sort((a, b) => a.era.localeCompare(b.era))

    const monthly_activity = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      monthly_activity.push({ month: monthKey, count: monthlyCounts[monthKey] || 0 })
    }

    return {
      total_films: totalFilms,
      total_series: totalSeries,
      total_watch_hours: Math.floor(watchMinutes / 60),
      average_rating: dynamicAverageRating,
      favorite_genres,
      favorite_directors,
      favorite_actors,
      era_distribution,
      monthly_activity,
      watches_this_year: watchesThisYear,
      watches_this_month: watchesThisMonth,
    }
  }, [watchLogs, allKnownTitles, dynamicAverageRating])

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
        stats: dynamicStats,
        watchLogs,
        watchlist,
        streak: dynamicStreak,
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
        dailyActivity,
        exploreData: staticExploreData,
        getTitleById,
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
