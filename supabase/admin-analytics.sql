-- Run this in Supabase SQL Editor so admin visit analytics work correctly.

-- 1) Track last activity on profiles (for Active Users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx
  ON public.profiles (last_seen_at DESC);

-- Allow users to update their own last_seen_at (if you use RLS)
-- Adjust policy names if you already have update policies covering all columns.

-- 2) Visit log (for Visits last 30 days / 12 months)
CREATE TABLE IF NOT EXISTS public.user_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  visited_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_visits_visited_at_idx
  ON public.user_visits (visited_at DESC);

CREATE INDEX IF NOT EXISTS user_visits_user_id_idx
  ON public.user_visits (user_id);

ALTER TABLE public.user_visits ENABLE ROW LEVEL SECURITY;

-- Users can insert their own visit rows
CREATE POLICY "Users can insert own visits"
  ON public.user_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read own visits (optional)
CREATE POLICY "Users can read own visits"
  ON public.user_visits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Optional: allow authenticated users to read all visits for admin page
-- (or restrict to an admin role later)
CREATE POLICY "Authenticated can read all visits for admin"
  ON public.user_visits
  FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: users can update own last_seen_at
CREATE POLICY "Users can update own profile last_seen"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles: allow reading profiles for admin counts (if not already open)
CREATE POLICY "Authenticated can read profiles for admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
