-- Safer script for Supabase SQL Editor (works even if profiles.id is not uuid).
-- Paste ALL of this and Run.

-- 1) Last activity on profiles (Active Users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx
  ON public.profiles (last_seen_at DESC);

-- 2) Visit log — user_id as TEXT so it works with uuid OR bigint profiles
CREATE TABLE IF NOT EXISTS public.user_visits (
  id bigserial PRIMARY KEY,
  user_id text,
  visitor_id text,
  visited_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_agent text
);

-- Upgrade older table shapes (safe if columns already exist)
ALTER TABLE public.user_visits
  ADD COLUMN IF NOT EXISTS visitor_id text;

ALTER TABLE public.user_visits
  ADD COLUMN IF NOT EXISTS visited_at timestamptz DEFAULT now();

ALTER TABLE public.user_visits
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.user_visits
  ADD COLUMN IF NOT EXISTS user_agent text;

ALTER TABLE public.user_visits
  ADD COLUMN IF NOT EXISTS user_id text;

ALTER TABLE public.user_visits
  ADD COLUMN IF NOT EXISTS host text;

-- If user_id was uuid before, convert to text (ignore error if already text)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_visits'
      AND column_name = 'user_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.user_visits
      ALTER COLUMN user_id TYPE text USING user_id::text;
  END IF;
EXCEPTION
  WHEN others THEN
    NULL; -- ignore conversion issues
END $$;

CREATE INDEX IF NOT EXISTS user_visits_visited_at_idx
  ON public.user_visits (visited_at DESC);

CREATE INDEX IF NOT EXISTS user_visits_user_id_idx
  ON public.user_visits (user_id);

CREATE INDEX IF NOT EXISTS user_visits_visitor_id_idx
  ON public.user_visits (visitor_id);

ALTER TABLE public.user_visits ENABLE ROW LEVEL SECURITY;

-- Remove old policies (safe if missing)
DROP POLICY IF EXISTS "Users can insert own visits" ON public.user_visits;
DROP POLICY IF EXISTS "Users can read own visits" ON public.user_visits;
DROP POLICY IF EXISTS "Authenticated can read all visits for admin" ON public.user_visits;
DROP POLICY IF EXISTS "Anyone can insert visits" ON public.user_visits;
DROP POLICY IF EXISTS "Anyone can read visits" ON public.user_visits;

-- Allow website (mobile/desktop, guest or logged-in) to insert visits
CREATE POLICY "Anyone can insert visits"
  ON public.user_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admin page to read visit counts
CREATE POLICY "Anyone can read visits"
  ON public.user_visits
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profiles: allow users to update their own row WITHOUT uuid=bigint crash
-- Uses text cast so it works if profiles.id is uuid OR bigint
DROP POLICY IF EXISTS "Users can update own profile last_seen" ON public.profiles;
CREATE POLICY "Users can update own profile last_seen"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

-- Profiles: allow reading for admin counts
DROP POLICY IF EXISTS "Authenticated can read profiles for admin" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles for admin" ON public.profiles;
CREATE POLICY "Anyone can read profiles for admin"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);
