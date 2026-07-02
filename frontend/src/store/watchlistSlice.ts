import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { WatchlistItem } from '@/types'
import { mockWatchlist } from '@/data/mockData'

export interface WatchlistSlice {
  watchlist: WatchlistItem[]
  setWatchlist: (watchlist: WatchlistItem[] | ((prev: WatchlistItem[]) => WatchlistItem[])) => void
}

export const createWatchlistSlice: StateCreator<StoreState, [], [], WatchlistSlice> = (set) => ({
  watchlist: mockWatchlist,
  setWatchlist: (watchlistOrUpdater) => set((state) => ({
    watchlist: typeof watchlistOrUpdater === 'function' ? watchlistOrUpdater(state.watchlist) : watchlistOrUpdater
  })),
})
