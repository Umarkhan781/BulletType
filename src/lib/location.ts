/**
 * Location helpers. Browser geolocation is never requested.
 * Cached labels may still be read for historical admin activity rows.
 */

export type UserLocation = {
  latitude: number;
  longitude: number;
  location_label: string | null;
};

const CACHE_KEY = "bullettype-user-location-v1";

function readCache(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserLocation;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Location access is disabled. Never prompt the browser.
 * Kept as a no-op so existing callers stay safe.
 */
export async function requestUserLocation(): Promise<UserLocation | null> {
  return null;
}

/** Cached location only (no prompt). */
export function getCachedUserLocation(): UserLocation | null {
  return readCache();
}
