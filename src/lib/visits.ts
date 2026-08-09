import { supabase } from "@/lib/supabase";

const VISIT_SESSION_KEY = "bullettype-visit-recorded";

/** Start of local calendar day as ISO string */
function startOfLocalDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Record a user visit once per browser session (and at most once per day in DB).
 * Updates profiles.last_seen_at and inserts into user_visits when available.
 */
export async function recordUserVisit(userId: string): Promise<void> {
  if (typeof window !== "undefined") {
    const already = sessionStorage.getItem(VISIT_SESSION_KEY);
    if (already === userId) return;
    sessionStorage.setItem(VISIT_SESSION_KEY, userId);
  }

  const now = new Date().toISOString();

  // Heartbeat for "Active Users" (last_seen_at)
  await supabase
    .from("profiles")
    .update({ last_seen_at: now })
    .eq("id", userId);

  // Daily visit log (ignore errors if table/column not set up yet)
  try {
    const { count } = await supabase
      .from("user_visits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfLocalDayISO());

    if (!count) {
      await supabase.from("user_visits").insert({
        user_id: userId,
        visited_at: now,
      });
    }
  } catch {
    // table may not exist yet
  }
}

export function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function monthsAgoISO(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}
