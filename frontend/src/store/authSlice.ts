import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'

// Login identity (mock). Separate from userSlice.user (UserProfile), which
// holds the richer profile + preferences used across the app for display.
export interface AuthUser {
  id: string
  email: string
  name: string
  username: string
  avatar_url?: string
}

export interface AuthSlice {
  authUser: AuthUser | null
  login: (email: string) => Promise<void>
  register: (email: string, name: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'endroll_mock_user'

function generateUsername(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '') || 'user'
  )
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set) => ({
  // Hydrate synchronously from localStorage — no mount effect, no loading flicker.
  authUser: readStoredUser(),
  login: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const name = email.split('@')[0]
    const user: AuthUser = {
      id: 'mock-uuid-1234',
      email,
      name,
      username: generateUsername(name),
      avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    set({ authUser: user })
  },
  register: async (email, name) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const user: AuthUser = {
      id: 'mock-uuid-5678',
      email,
      name,
      username: generateUsername(name),
      avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    set({ authUser: user })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ authUser: null })
  },
})
