-- ============================================================
-- Recent Actions activity log (guests + registered users)
-- Supabase → SQL Editor → paste all → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_actions (
  id bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  action_type text NOT NULL,
  user_id text,
  visitor_id text,
  email text,
  display_name text,
  username text,
  avatar_url text,
  path text,
  details text,
  latitude double precision,
  longitude double precision,
  location_label text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS user_actions_occurred_at_idx
  ON public.user_actions (occurred_at DESC);

CREATE INDEX IF NOT EXISTS user_actions_user_id_idx
  ON public.user_actions (user_id);

CREATE INDEX IF NOT EXISTS user_actions_visitor_id_idx
  ON public.user_actions (visitor_id);

ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert actions" ON public.user_actions;
DROP POLICY IF EXISTS "Anyone can read actions" ON public.user_actions;

CREATE POLICY "Anyone can insert actions"
  ON public.user_actions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read actions"
  ON public.user_actions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Optional: store email on profiles for admin history
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;
