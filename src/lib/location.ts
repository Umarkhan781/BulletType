/**
 * Optional browser geolocation for activity history.
 * Only stored after the user allows the browser permission prompt.
 */

export type UserLocation = {
  latitude: number;
  longitude: number;
  location_label: string | null;
};

const CACHE_KEY = "bullettype-user-location-v1";
const DENIED_KEY = "bullettype-location-denied-v1";

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

function writeCache(loc: UserLocation) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(loc));
  } catch {
    // ignore
  }
}

/** Reverse-geocode via OpenStreetMap Nominatim (best-effort, no API key). */
async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        // Nominatim usage policy asks for a valid identifying UA via Referer in browsers
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
      display_name?: string;
    };
    const a = data.address;
    if (a) {
      const city = a.city || a.town || a.village;
      const parts = [city, a.state, a.country].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
    return data.display_name?.split(",").slice(0, 3).join(",").trim() || null;
  } catch {
    return null;
  }
}

/**
 * Request location once per session if not denied.
 * Returns null if unsupported, denied, or timed out.
 */
export async function requestUserLocation(options?: {
  /** If true, skip requesting again after deny in this browser */
  respectDeny?: boolean;
}): Promise<UserLocation | null> {
  if (typeof window === "undefined") return null;
  if (!("geolocation" in navigator)) return null;

  const respectDeny = options?.respectDeny !== false;
  try {
    if (respectDeny && localStorage.getItem(DENIED_KEY) === "1") {
      return null;
    }
  } catch {
    // ignore
  }

  const cached = readCache();
  if (cached) return cached;

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 12_000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer);
        resolve(pos);
      },
      (err) => {
        window.clearTimeout(timer);
        // PERMISSION_DENIED = 1
        if (err.code === 1) {
          try {
            localStorage.setItem(DENIED_KEY, "1");
          } catch {
            // ignore
          }
        }
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000,
        timeout: 10_000,
      }
    );
  });

  if (!position) return null;

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const location_label =
    (await reverseGeocode(latitude, longitude)) ||
    `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  const loc: UserLocation = { latitude, longitude, location_label };
  writeCache(loc);
  return loc;
}

/** Cached location only (no prompt). */
export function getCachedUserLocation(): UserLocation | null {
  return readCache();
}
