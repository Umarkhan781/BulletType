/**
 * Persistent guest identity (no signup required).
 * Username is generated once and kept in localStorage so refresh / reopen
 * uses the same name for that browser.
 */

const VISITOR_KEY = "bullettype-visitor-id";
const GUEST_USERNAME_KEY = "bullettype-guest-username";
const GUEST_DISPLAY_KEY = "bullettype-guest-display-name";

const ADJECTIVES = [
  "swift",
  "brave",
  "calm",
  "bright",
  "rapid",
  "clever",
  "lucky",
  "bold",
  "quiet",
  "neon",
  "cosmic",
  "silent",
  "fuzzy",
  "golden",
  "silver",
  "cyber",
  "turbo",
  "mighty",
  "nimble",
  "pixel",
  "frost",
  "solar",
  "lunar",
  "rapid",
  "vivid",
  "steady",
  "keen",
  "zippy",
  "nova",
  "ultra",
];

const NOUNS = [
  "falcon",
  "tiger",
  "panda",
  "comet",
  "otter",
  "eagle",
  "wolf",
  "lynx",
  "fox",
  "hawk",
  "orca",
  "raven",
  "cobra",
  "phoenix",
  "dragon",
  "sprite",
  "ranger",
  "pilot",
  "ninja",
  "rider",
  "typer",
  "keyster",
  "blazer",
  "spark",
  "pulse",
  "arrow",
  "wave",
  "storm",
  "breeze",
  "shadow",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSuffix(len = 4): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < len; i++) {
      out += alphabet[bytes[i]! % alphabet.length];
    }
    return out;
  }
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Create a friendly unique-ish guest username, e.g. swift_falcon_k3p9 */
function generateGuestUsername(): string {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  return `${adj}_${noun}_${randomSuffix(4)}`;
}

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode
  }
}

/** Stable visitor id for this browser (also used by visits/presence). */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = safeGet(VISITOR_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    safeSet(VISITOR_KEY, id);
  }
  return id;
}

/**
 * Guest username for this browser — same forever until they clear site data.
 * Never regenerates on refresh or reopen.
 */
export function getOrCreateGuestUsername(): string {
  if (typeof window === "undefined") return "guest";

  let username = safeGet(GUEST_USERNAME_KEY);
  if (username && /^[a-z0-9_]{3,40}$/i.test(username)) {
    return username.toLowerCase();
  }

  // Ensure visitor id exists first (ties analytics to same person)
  getOrCreateVisitorId();

  username = generateGuestUsername();
  safeSet(GUEST_USERNAME_KEY, username);
  // Display name mirrors username the first time
  if (!safeGet(GUEST_DISPLAY_KEY)) {
    safeSet(GUEST_DISPLAY_KEY, username);
  }
  return username;
}

/** Human label for guest (defaults to their persistent username). */
export function getOrCreateGuestDisplayName(): string {
  if (typeof window === "undefined") return "Guest";
  const existing = safeGet(GUEST_DISPLAY_KEY);
  if (existing && existing.trim()) return existing.trim();
  const username = getOrCreateGuestUsername();
  safeSet(GUEST_DISPLAY_KEY, username);
  return username;
}

export type GuestIdentity = {
  visitorId: string;
  username: string;
  displayName: string;
};

/** Full guest identity, always stable for this browser. */
export function getGuestIdentity(): GuestIdentity {
  const visitorId = getOrCreateVisitorId();
  const username = getOrCreateGuestUsername();
  const displayName = getOrCreateGuestDisplayName();
  return { visitorId, username, displayName };
}
