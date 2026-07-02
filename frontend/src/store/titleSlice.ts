import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { SearchResult } from '@/types'
import {
  mockTrendingThisWeek,
  mockNowPlaying,
  mockTopRatedClassics,
  mockUpcomingClassics,
  mockSearchResults,
} from '@/data/mockData'

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

export interface TitleSlice {
  exploreData: ExploreData
  setExploreData: (data: ExploreData) => void
}

export const createTitleSlice: StateCreator<StoreState, [], [], TitleSlice> = (set) => ({
  exploreData: staticExploreData,
  setExploreData: (data) => set({ exploreData: data }),
})
