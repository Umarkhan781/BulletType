import { supabase } from "@/lib/supabase";
import { getOrCreateVisitorId } from "@/lib/guestIdentity";
import { isLocalDevHost } from "@/lib/devHost";

/** Consider someone "online" if they heartbeated within this window */
export const ONLINE_WINDOW_MS = 90_000; // 90 seconds
/** How often non-admin pages send a heartbeat */
export const HEARTBEAT_INTERVAL_MS = 25_000;

function presenceKey(userId?: string | null) {
  if (userId) return `u:${userId}`;
  return `v:${getOrCreateVisitorId()}`;
}

/**
 * Send one realtime presence ping (logged-in or guest).
 * Call only from non-admin pages.
 */
export async function sendPresenceHeartbeat(
  userId?: string | null
): Promise<{ error?: string }> {
  if (typeof window === "undefined") return {};
  if (isLocalDevHost()) return {};

  const now = new Date().toISOString();
  const key = presenceKey(userId);
  const visitorId = getOrCreateVisitorId();

  // Preferred: dedicated presence table (realtime online count)
  const { error: presenceError } = await supabase.from("site_presence").upsert(
    {
      presence_key: key,
      user_id: userId || null,
      visitor_id: visitorId,
      last_seen_at: now,
    },
    { onConflict: "presence_key" }
  );

  if (!presenceError) {
    // Keep profile last_seen in sync for logged-in users (optional analytics)
    if (userId) {
      void supabase
        .from("profiles")
        .update({ last_seen_at: now })
        .eq("id", userId);
    }
    return {};
  }

  // Fallback if site_presence not created yet: profiles only (logged-in)
  if (userId) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ last_seen_at: now })
      .eq("id", userId);
    if (profileError) {
      return { error: profileError.message };
    }
    return { error: presenceError.message };
  }

  return { error: presenceError.message };
}

/**
 * Count people currently on the site (heartbeat within ONLINE_WINDOW_MS).
 * Does not use visit totals or unique-visitor history.
 */
export async function countRealtimeActiveUsers(): Promise<{
  count: number;
  error?: string;
  source: "site_presence" | "profiles" | "none";
}> {
  const since = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();

  const presence = await supabase
    .from("site_presence")
    .select("*", { count: "exact", head: true })
    .gte("last_seen_at", since);

  if (!presence.error && typeof presence.count === "number") {
    return { count: presence.count, source: "site_presence" };
  }

  // Fallback: logged-in users only via profiles.last_seen_at
  const profiles = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("last_seen_at", since);

  if (!profiles.error && typeof profiles.count === "number") {
    return {
      count: profiles.count,
      source: "profiles",
      error: presence.error?.message,
    };
  }

  return {
    count: 0,
    source: "none",
    error:
      presence.error?.message ||
      profiles.error?.message ||
      "Presence unavailable",
  };
}

/**
 * Start heartbeats while the user is on a non-admin page.
 * Returns a cleanup function.
 */
export function startPresenceTracking(userId?: string | null): () => void {
  if (typeof window === "undefined") return () => {};

  let stopped = false;

  const tick = () => {
    if (stopped) return;
    void sendPresenceHeartbeat(userId);
  };

  // Immediate ping so admin sees them quickly
  tick();
  const id = window.setInterval(tick, HEARTBEAT_INTERVAL_MS);

  // Extra ping when tab becomes visible again
  const onVisible = () => {
    if (document.visibilityState === "visible") tick();
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    stopped = true;
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
