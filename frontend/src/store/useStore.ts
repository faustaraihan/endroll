import { create } from 'zustand'
import { createUserSlice, type UserSlice } from './userSlice'
import { createWatchSlice, type WatchSlice } from './watchSlice'
import { createCollectionSlice, type CollectionSlice } from './collectionSlice'
import { createTitleSlice, type TitleSlice } from './titleSlice'

export type StoreState = UserSlice & WatchSlice & CollectionSlice & TitleSlice

export const useStore = create<StoreState>()((...a) => ({
  ...createUserSlice(...a),
  ...createWatchSlice(...a),
  ...createCollectionSlice(...a),
  ...createTitleSlice(...a),
}))
