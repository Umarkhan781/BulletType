import { supabase } from "@/lib/supabase";

const VISIT_SESSION_KEY = "bullettype-visit-recorded-v2";
const VISITOR_KEY = "bullettype-visitor-id";

/** Start of local calendar day as ISO string */
function startOfLocalDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `tmp-${Date.now()}`;
  }
}

/**
 * Record a site visit once per browser tab session.
 * Works for logged-in and guest users (mobile included).
 * Always refreshes profiles.last_seen_at for logged-in users (active users metric).
 */
export async function recordSiteVisit(userId?: string | null): Promise<void> {
  if (typeof window === "undefined") return;

  const visitorId = getVisitorId();
  const sessionTag = userId ? `user:${userId}` : `guest:${visitorId}`;
  const now = new Date().toISOString();

  // Active-user heartbeat: always update when logged in (even if visit already logged)
  if (userId) {
    const { error: seenError } = await supabase
      .from("profiles")
      .update({ last_seen_at: now })
      .eq("id", userId);
    if (seenError) {
      console.warn("[visits] last_seen_at update failed:", seenError.message);
    }
  }

  // Skip re-inserting a visit row if this tab session already recorded one
  try {
    if (sessionStorage.getItem(VISIT_SESSION_KEY) === sessionTag) {
      return;
    }
  } catch {
    // private mode may block sessionStorage
  }

  // Avoid duplicate daily row for same visitor (best-effort)
  let alreadyToday = false;
  try {
    let query = supabase
      .from("user_visits")
      .select("id", { count: "exact", head: true })
      .gte("visited_at", startOfLocalDayISO());

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.eq("visitor_id", visitorId);
    }

    const { count, error } = await query;
    if (!error && (count || 0) > 0) {
      alreadyToday = true;
    }
  } catch {
    // ignore
  }

  if (!alreadyToday) {
    const { error } = await supabase.from("user_visits").insert({
      user_id: userId || null,
      visitor_id: visitorId,
      visited_at: now,
      user_agent:
        typeof navigator !== "undefined"
          ? navigator.userAgent.slice(0, 300)
          : null,
    });

    // If insert fails (table/policies missing), don't mark session as recorded
    if (error) {
      console.warn("[visits] failed to record visit:", error.message);
      return;
    }
  }

  try {
    sessionStorage.setItem(VISIT_SESSION_KEY, sessionTag);
  } catch {
    // ignore
  }
}

/** @deprecated use recordSiteVisit */
export async function recordUserVisit(userId: string): Promise<void> {
  return recordSiteVisit(userId);
}

export function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function monthsAgoISO(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}
