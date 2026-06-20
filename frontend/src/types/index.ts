// Endroll Type Definitions
// Aligned with PRD v1.1 and database schema

export type TitleType = 'film' | 'series'

export type WatchStatus = 'Watching' | 'Completed' | 'Dropped' | 'Paused'

export interface Title {
  id: string
  tmdb_id?: number
  title: string
  type: TitleType
  poster_path?: string
  backdrop_path?: string
  release_year?: number
  runtime_minutes?: number
  genres: string[]
  director?: string
  cast: string[]
  overview?: string
}

export interface WatchLog {
  id: string
  user_id: string
  title_id: string
  title: Title
  watched_at: string // ISO date string
  /** @deprecated Rating kini disimpan secara global di level judul (personalRatings) */
  rating?: number // 0.0 - 10.0, DECIMAL(3,1)
  notes?: string
  rewatch_count: number
  season_number?: number
  episode_number?: number
}

export interface WatchlistItem {
  id: string
  user_id: string
  title_id: string
  title: Title
  added_at: string
  priority?: number
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  cover_title_id?: string
  cover_title?: Title
  is_private: boolean
  created_at: string
  items_count: number
}

export interface CollectionItem {
  id: string
  collection_id: string
  title_id: string
  title: Title
  sort_order: number
  added_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak_weeks: number
  longest_streak_weeks: number
  last_log_week: string // ISO week string e.g. "2026-W22"
}

export interface UserProfile {
  id: string
  email: string
  username: string
  bio?: string
  avatar_url?: string
  created_at: string
  preferences: {
    favorite_genres?: string[]
    theme?: string
    notifications_enabled?: boolean
    rating_step?: number
    start_of_week?: string
    favorites_board?: string[] // array of up to 4 title_ids
    user_pick?: string[] // array of up to 5 title_ids
  }
}

export interface UserStats {
  total_films: number
  total_series: number
  total_watch_hours: number
  average_rating?: number
  favorite_genres: { genre: string; count: number }[]
  favorite_directors: { director: string; count: number; avatar_url?: string }[]
  watches_this_year: number
  watches_this_month: number
  era_distribution?: { era: string; count: number }[]
  favorite_actors?: { name: string; count: number; avatar_url?: string }[]
  monthly_activity?: { month: string; count: number }[]
}

export type ToastType = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  action?: ToastAction
}

export interface SearchResult {
  tmdb_id: number
  title: string
  type: TitleType
  poster_path?: string
  backdrop_path?: string
  release_year?: number
  overview?: string
  genres: string[]
}

export type OnboardingStep =
  | 'welcome'
  | 'register'
  | 'username'
  | 'taste'
  | 'first-film'
  | 'quick-log'
  | 'dashboard'

