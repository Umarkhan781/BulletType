-- ============================================================
-- Realtime "Active Users" (who's on the site right now)
-- Supabase → SQL Editor → paste all → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_presence (
  presence_key text PRIMARY KEY,
  user_id text,
  visitor_id text,
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_presence_last_seen_idx
  ON public.site_presence (last_seen_at DESC);

ALTER TABLE public.site_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read presence" ON public.site_presence;
DROP POLICY IF EXISTS "Anyone can write presence" ON public.site_presence;
DROP POLICY IF EXISTS "Anyone can update presence" ON public.site_presence;
DROP POLICY IF EXISTS "Anyone can delete presence" ON public.site_presence;

-- Admin page + public site need to read counts
CREATE POLICY "Anyone can read presence"
  ON public.site_presence
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can write presence"
  ON public.site_presence
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update presence"
  ON public.site_presence
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Optional: clean rows older than 1 day (run manually or via cron later)
-- DELETE FROM public.site_presence WHERE last_seen_at < now() - interval '1 day';
