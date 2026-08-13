import { supabase } from "@/lib/supabase";
import { getCachedUserLocation, type UserLocation } from "@/lib/location";
import { getGuestIdentity } from "@/lib/guestIdentity";

export type ActionType =
  | "page_view"
  | "login"
  | "signup"
  | "logout"
  | "test_complete"
  | "profile_update"
  | "avatar_update";

export type UserActionRow = {
  id: number;
  occurred_at: string;
  action_type: string;
  user_id: string | null;
  visitor_id: string | null;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  path: string | null;
  details: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  user_agent: string | null;
};

function defaultAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

async function resolveActor(userId?: string | null): Promise<{
  user_id: string | null;
  visitor_id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}> {
  const guest = getGuestIdentity();
  const visitor_id = guest.visitorId;
  let email: string | null = null;
  let display_name: string | null = null;
  let username: string | null = null;
  let avatar_url: string | null = null;
  let uid = userId ?? null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user;
    if (sessionUser) {
      uid = sessionUser.id;
      email = sessionUser.email ?? null;
      const meta = sessionUser.user_metadata || {};
      if (typeof meta.full_name === "string") display_name = meta.full_name;
      if (typeof meta.username === "string") username = meta.username;
      if (typeof meta.avatar_url === "string") avatar_url = meta.avatar_url;
    }
  } catch {
    // ignore
  }

  if (uid) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, username, avatar_url, email")
      .eq("id", uid)
      .maybeSingle();

    if (profile) {
      display_name = profile.full_name || display_name;
      username = profile.username || username;
      avatar_url = profile.avatar_url || avatar_url;
      email = profile.email || email;

      // Backfill email onto profile when we know it
      if (email && !profile.email) {
        void supabase.from("profiles").update({ email }).eq("id", uid);
      }
    }
  } else {
    // Guest: stable random username for this browser (does not change on refresh)
    username = guest.username;
    display_name = guest.displayName;
  }

  if (!display_name) {
    display_name = username || (uid ? "Registered user" : guest.displayName);
  }
  if (!username && !uid) {
    username = guest.username;
  }
  if (!avatar_url) {
    avatar_url = defaultAvatar(uid || guest.username || visitor_id);
  }

  return {
    user_id: uid,
    visitor_id,
    email,
    display_name,
    username,
    avatar_url,
  };
}

/**
 * Log a user/guest action for admin Recent Actions history.
 * Never requests browser location. Cached labels (if any) stay optional.
 */
export async function logUserAction(options: {
  actionType: ActionType | string;
  path?: string | null;
  details?: string | null;
  userId?: string | null;
}): Promise<{ error?: string }> {
  if (typeof window === "undefined") return {};

  // Never log pure admin browsing as customer activity
  const path =
    options.path ??
    (typeof window !== "undefined" ? window.location.pathname : null);
  if (path === "/adminumar7811" || path?.startsWith("/adminumar7811/")) {
    return {};
  }

  const loc: UserLocation | null = getCachedUserLocation();

  const actor = await resolveActor(options.userId);

  const row = {
    occurred_at: new Date().toISOString(),
    action_type: options.actionType,
    user_id: actor.user_id,
    visitor_id: actor.visitor_id,
    email: actor.email,
    display_name: actor.display_name,
    username: actor.username,
    avatar_url: actor.avatar_url,
    path,
    details: options.details ?? null,
    latitude: loc?.latitude ?? null,
    longitude: loc?.longitude ?? null,
    location_label: loc?.location_label ?? null,
    user_agent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 300)
        : null,
  };

  const { error } = await supabase.from("user_actions").insert(row);
  if (error) {
    console.warn("[activity] log failed:", error.message);
    return { error: error.message };
  }
  return {};
}

export async function fetchRecentActions(limit = 80): Promise<{
  rows: UserActionRow[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from("user_actions")
    .select("*")
    // Site visits belong to the Traffic cards. Hide legacy visit rows so the
    // activity table contains one row per user action.
    .neq("action_type", "site_visit")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { rows: [], error: error.message };
  }
  return { rows: (data || []) as UserActionRow[] };
}

export function formatActionLabel(actionType: string): string {
  switch (actionType) {
    case "page_view":
      return "Viewed page";
    case "site_visit":
      return "Visited site";
    case "login":
      return "Logged in";
    case "signup":
      return "Signed up";
    case "logout":
      return "Logged out";
    case "test_complete":
      return "Completed typing test";
    case "profile_update":
      return "Updated profile";
    case "avatar_update":
      return "Updated avatar";
    default:
      return actionType.replace(/_/g, " ");
  }
}
