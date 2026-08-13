import {
  THEME_COOKIE_KEY,
  deleteCookie,
  getCookie,
  hasCookieConsent,
  setCookie,
} from "@/lib/cookies";

export const APPEARANCE_THEMES = [
  "dark",
  "light",
  "ocean",
  "forest",
  "sunset",
  "lavender",
  "midnight",
  "rose",
  "emerald",
  "mono",
] as const;

export type AppearanceTheme = (typeof APPEARANCE_THEMES)[number];

const THEME_MAX_AGE = 60 * 60 * 24 * 365;

export const THEME_OPTIONS: {
  id: AppearanceTheme;
  label: string;
  swatch: string;
}[] = [
  { id: "dark", label: "Dark", swatch: "#2f3136" },
  { id: "light", label: "Light", swatch: "#f4f4f5" },
  { id: "ocean", label: "Ocean", swatch: "#123047" },
  { id: "forest", label: "Forest", swatch: "#173024" },
  { id: "sunset", label: "Sunset", swatch: "#3a2218" },
  { id: "lavender", label: "Lavender", swatch: "#2b2140" },
  { id: "midnight", label: "Midnight Blue", swatch: "#10182d" },
  { id: "rose", label: "Rose", swatch: "#3a1c24" },
  { id: "emerald", label: "Emerald", swatch: "#123028" },
  { id: "mono", label: "Mono", swatch: "#1c1c1c" },
];

const THEME_SET = new Set<string>(APPEARANCE_THEMES);

export function isAppearanceTheme(value: unknown): value is AppearanceTheme {
  return typeof value === "string" && THEME_SET.has(value);
}

export function parseAppearanceTheme(
  raw: string | undefined | null
): AppearanceTheme | null {
  if (!raw) return null;
  const value = raw === "midnight-blue" ? "midnight" : raw;
  return isAppearanceTheme(value) ? value : null;
}

export function isDarkAppearance(theme: AppearanceTheme) {
  return theme !== "light";
}

export function applyAppearance(theme: AppearanceTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (isDarkAppearance(theme)) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function saveThemePreference(theme: AppearanceTheme) {
  if (!hasCookieConsent()) return;
  setCookie(THEME_COOKIE_KEY, theme, THEME_MAX_AGE);
}

export function loadThemePreference(): AppearanceTheme | null {
  if (!hasCookieConsent()) return null;
  return parseAppearanceTheme(getCookie(THEME_COOKIE_KEY));
}

export function clearThemePreference() {
  deleteCookie(THEME_COOKIE_KEY);
}

export function resolveStoredTheme(
  stored: unknown,
  fallback: AppearanceTheme = "forest"
): AppearanceTheme {
  if (stored === "system") return "forest";
  if (stored === "midnight-blue") return "midnight";
  return isAppearanceTheme(stored) ? stored : fallback;
}
