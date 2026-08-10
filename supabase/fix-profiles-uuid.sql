-- ============================================================
-- FIX: profiles.id must be UUID (auth.users id), not bigint
--
-- Error this fixes:
--   invalid input syntax for type bigint: "05b1e707-..."
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click Run
-- ============================================================

-- 1) If profiles.id is bigint/int, move the old table aside
DO $$
DECLARE
  id_type text;
BEGIN
  SELECT c.data_type INTO id_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'profiles'
    AND c.column_name = 'id';

  IF id_type IN ('bigint', 'integer', 'smallint', 'numeric') THEN
    -- Keep a backup of the broken table (safe to drop later)
    ALTER TABLE public.profiles RENAME TO profiles_old_bigint_backup;
    RAISE NOTICE 'Renamed public.profiles → profiles_old_bigint_backup';
  END IF;
END $$;

-- 2) Create correct profiles table (no-op if already exists with uuid id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text DEFAULT '',
  country text DEFAULT '',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  total_tests integer NOT NULL DEFAULT 0,
  practice_time integer NOT NULL DEFAULT 0,
  average_wpm integer NOT NULL DEFAULT 0,
  highest_wpm integer NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  daily_streak integer NOT NULL DEFAULT 0,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Ensure columns exist if table was partially created earlier
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_tests integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS practice_time integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS average_wpm integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS highest_wpm integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accuracy numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4) Seed one profile row per auth user (from signup metadata)
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT
  u.id,
  COALESCE(
    NULLIF(trim(u.raw_user_meta_data ->> 'username'), ''),
    split_part(COALESCE(u.email, 'user'), '@', 1)
  ),
  COALESCE(
    NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(trim(u.raw_user_meta_data ->> 'username'), ''),
    split_part(COALESCE(u.email, 'user'), '@', 1)
  ),
  NULLIF(trim(u.raw_user_meta_data ->> 'avatar_url'), '')
FROM auth.users u
ON CONFLICT (id) DO UPDATE
SET
  username = COALESCE(public.profiles.username, EXCLUDED.username),
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
  avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

-- 5) RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles for admin" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read profiles for admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile last_seen" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6) Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), ''),
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), ''),
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    NULLIF(trim(NEW.raw_user_meta_data ->> 'avatar_url'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7) Helpful index
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx ON public.profiles (last_seen_at DESC);

-- Done. Profile edit (full name / username) should work after this.
-- Optional: DROP TABLE public.profiles_old_bigint_backup;  -- only after you verify everything works
