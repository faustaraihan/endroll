import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { WatchLog, WatchlistItem } from '../types'
import { mockWatchLogs, mockWatchlist, mockPersonalRatings } from '../data/mockData'

export interface WatchSlice {
  watchLogs: WatchLog[]
  watchlist: WatchlistItem[]
  personalRatings: Record<string, number>
  seasonRatings: Record<string, number>
  setWatchLogs: (logs: WatchLog[] | ((prev: WatchLog[]) => WatchLog[])) => void
  setWatchlist: (watchlist: WatchlistItem[] | ((prev: WatchlistItem[]) => WatchlistItem[])) => void
  setRatingForTitle: (titleId: string, rating: number | null) => void
  setSeasonRating: (titleId: string, seasonNumber: number, rating: number | null) => void
}

export const createWatchSlice: StateCreator<StoreState, [], [], WatchSlice> = (set) => ({
  watchLogs: mockWatchLogs,
  watchlist: mockWatchlist,
  personalRatings: mockPersonalRatings,
  seasonRatings: {},
  setWatchLogs: (logsOrUpdater) => set((state) => ({
    watchLogs: typeof logsOrUpdater === 'function' ? logsOrUpdater(state.watchLogs) : logsOrUpdater
  })),
  setWatchlist: (watchlistOrUpdater) => set((state) => ({
    watchlist: typeof watchlistOrUpdater === 'function' ? watchlistOrUpdater(state.watchlist) : watchlistOrUpdater
  })),
  setRatingForTitle: (titleId, rating) => set((state) => {
    const next = { ...state.personalRatings }
    if (rating === null) delete next[titleId]
    else next[titleId] = rating
    return { personalRatings: next }
  }),
  setSeasonRating: (titleId, seasonNumber, rating) => set((state) => {
    const key = `${titleId}:${seasonNumber}`
    const next = { ...state.seasonRatings }
    if (rating === null) delete next[key]
    else next[key] = rating
    return { seasonRatings: next }
  }),
})
