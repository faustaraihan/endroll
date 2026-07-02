import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { WatchLog } from '@/types'
import { mockWatchLogs, mockPersonalRatings } from '@/data/mockData'

export interface DiarySlice {
  watchLogs: WatchLog[]
  // Rating is stored per-title (global), not per watch-log — owner decision.
  personalRatings: Record<string, number>
  seasonRatings: Record<string, number>
  setWatchLogs: (logs: WatchLog[] | ((prev: WatchLog[]) => WatchLog[])) => void
  setRatingForTitle: (titleId: string, rating: number | null) => void
  setSeasonRating: (titleId: string, seasonNumber: number, rating: number | null) => void
}

export const createDiarySlice: StateCreator<StoreState, [], [], DiarySlice> = (set) => ({
  watchLogs: mockWatchLogs,
  personalRatings: mockPersonalRatings,
  seasonRatings: {},
  setWatchLogs: (logsOrUpdater) => set((state) => ({
    watchLogs: typeof logsOrUpdater === 'function' ? logsOrUpdater(state.watchLogs) : logsOrUpdater
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
