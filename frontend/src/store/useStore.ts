import { create } from 'zustand'
import { createAuthSlice, type AuthSlice } from './authSlice'
import { createUserSlice, type UserSlice } from './userSlice'
import { createDiarySlice, type DiarySlice } from './diarySlice'
import { createWatchlistSlice, type WatchlistSlice } from './watchlistSlice'
import { createCollectionsSlice, type CollectionsSlice } from './collectionsSlice'
import { createExploreSlice, type ExploreSlice } from './exploreSlice'

export type StoreState = AuthSlice & UserSlice & DiarySlice & WatchlistSlice & CollectionsSlice & ExploreSlice

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUserSlice(...a),
  ...createDiarySlice(...a),
  ...createWatchlistSlice(...a),
  ...createCollectionsSlice(...a),
  ...createExploreSlice(...a),
}))
