import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { UserProfile } from '../types'
import { mockUser } from '../data/mockData'

export interface UserSlice {
  user: UserProfile
  isLoggedIn: boolean
  setUser: (user: UserProfile | ((prev: UserProfile) => UserProfile)) => void
  setIsLoggedIn: (isLoggedIn: boolean) => void
}

export const createUserSlice: StateCreator<StoreState, [], [], UserSlice> = (set) => ({
  user: mockUser,
  isLoggedIn: true,
  setUser: (userOrUpdater) => set((state) => ({
    user: typeof userOrUpdater === 'function' ? userOrUpdater(state.user) : userOrUpdater
  })),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
})
