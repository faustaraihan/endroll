import { create } from 'zustand'
import { createAuthSlice, type AuthSlice } from './authSlice'
import { createUserSlice, type UserSlice } from './userSlice'
import { createDiarySlice, type DiarySlice } from './diarySlice'
import { createWatchlistSlice, type WatchlistSlice } from './watchlistSlice'
import { createCollectionSlice, type CollectionSlice } from './collectionSlice'
import { createTitleSlice, type TitleSlice } from './titleSlice'

export type StoreState = AuthSlice & UserSlice & DiarySlice & WatchlistSlice & CollectionSlice & TitleSlice

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUserSlice(...a),
  ...createDiarySlice(...a),
  ...createWatchlistSlice(...a),
  ...createCollectionSlice(...a),
  ...createTitleSlice(...a),
}))
