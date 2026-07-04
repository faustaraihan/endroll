import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  username: string
  avatar_url?: string
}

export interface AuthSlice {
  authUser: AuthUser | null
  isLoading: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set) => ({
  authUser: null,
  isLoading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ authUser: mapUser(session.user), isLoading: false })
    } else {
      set({ isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ authUser: session?.user ? mapUser(session.user) : null })
    })
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  },

  register: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: name, display_name: name } },
    })
    if (error) throw error
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ authUser: null })
  },
})

function mapUser(user: User): AuthUser {
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    email: user.email ?? '',
    name: meta.display_name ?? meta.username ?? user.email?.split('@')[0] ?? 'User',
    username: meta.username ?? user.email?.split('@')[0] ?? `user_${user.id.slice(0, 8)}`,
    avatar_url: meta.avatar_url ?? undefined,
  }
}
