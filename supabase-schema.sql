-- ============================================
-- Endroll — Supabase Database Schema
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Titles (films & series from TMDB)
CREATE TABLE public.titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id integer UNIQUE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('film', 'series')),
  poster_path text,
  release_year integer,
  runtime_minutes integer,
  genres text[] DEFAULT '{}',
  director text,
  cast_list text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Watch logs (diary entries)
CREATE TABLE public.watch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  watched_at date NOT NULL,
  rating decimal(3,1) CHECK (rating >= 0.0 AND rating <= 10.0),
  notes text,
  rewatch_count integer NOT NULL DEFAULT 0,
  mood_tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, title_id, watched_at, rewatch_count)
);

-- Watchlist
CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  priority smallint CHECK (priority >= 1 AND priority <= 3),
  UNIQUE (user_id, title_id)
);

-- Collections
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_title_id uuid REFERENCES public.titles(id) ON DELETE SET NULL,
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Collection items
CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, title_id)
);

-- Streaks
CREATE TABLE public.streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak_weeks integer NOT NULL DEFAULT 0,
  longest_streak_weeks integer NOT NULL DEFAULT 0,
  last_log_week date
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_watch_logs_user_id ON public.watch_logs(user_id);
CREATE INDEX idx_watch_logs_title_id ON public.watch_logs(title_id);
CREATE INDEX idx_watch_logs_watched_at ON public.watch_logs(watched_at DESC);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX idx_titles_tmdb_id ON public.titles(tmdb_id);
CREATE INDEX idx_titles_type ON public.titles(type);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Users: only see & edit own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Titles: everyone can read (shared cache)
CREATE POLICY "titles_select_all" ON public.titles
  FOR SELECT USING (true);

CREATE POLICY "titles_insert_all" ON public.titles
  FOR INSERT WITH CHECK (true);

-- Watch logs: only own entries
CREATE POLICY "watch_logs_select_own" ON public.watch_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "watch_logs_insert_own" ON public.watch_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watch_logs_update_own" ON public.watch_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "watch_logs_delete_own" ON public.watch_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Watchlist: only own
CREATE POLICY "watchlist_select_own" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_update_own" ON public.watchlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Collections: own private, all can see non-private
CREATE POLICY "collections_select_own" ON public.collections
  FOR SELECT USING (auth.uid() = user_id OR is_private = false);

CREATE POLICY "collections_insert_own" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "collections_update_own" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "collections_delete_own" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection items: inherit from collection
CREATE POLICY "collection_items_select_own" ON public.collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
      AND (c.user_id = auth.uid() OR c.is_private = false)
    )
  );

CREATE POLICY "collection_items_insert_own" ON public.collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "collection_items_update_own" ON public.collection_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "collection_items_delete_own" ON public.collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- Streaks: only own
CREATE POLICY "streaks_select_own" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "streaks_insert_own" ON public.streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streaks_update_own" ON public.streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
