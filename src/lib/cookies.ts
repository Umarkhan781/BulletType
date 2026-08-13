/**
 * Cookie helpers for consent + typing preferences.
 * Preference cookies are written only after the user allows cookies.
 * The consent cookie itself is essential so the banner is not shown again.
 */

export const COOKIE_CONSENT_KEY = "bt-cookie-consent";
export const TYPING_PREFS_KEY = "bt-typing-prefs";
export const THEME_COOKIE_KEY = "bt-theme";
export const COOKIE_CONSENT_EVENT = "bt-cookie-consent";
export const COOKIE_POPUP_EVENT = "bt-open-cookie-popup";

export function openCookiePopup() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_POPUP_EVENT));
}

export type CookieConsentValue = "allow" | "deny";

export type PracticeMode = "time" | "words" | "custom" | "quote";

export type ExpertDifficultyPref = "normal" | "hard" | "extreme";

export type WordsDifficultyPref = "small" | "regular" | "thick";

export type PracticeTypingPrefs = {
  mode: PracticeMode;
  timeValue: number;
  wordCount: number;
  wordsDifficulty: WordsDifficultyPref;
  punctuation: boolean;
  numbers: boolean;
  expert: boolean;
  expertDifficulty: ExpertDifficultyPref;
  customSeconds: number;
  customWords: number;
  customKind: "time" | "words";
};

const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const PREFS_MAX_AGE = 60 * 60 * 24 * 180; // 6 months

function isBrowser() {
  return typeof document !== "undefined";
}

function cookieSuffix(maxAge: number) {
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  return `; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (decodeURIComponent(part.slice(0, eq)) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

export function setCookie(name: string, value: string, maxAgeSec: number) {
  if (!isBrowser()) return;
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    cookieSuffix(maxAgeSec);
}

export function deleteCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function parseCookieConsent(
  raw: string | undefined | null
): CookieConsentValue | null {
  if (raw === "allow" || raw === "deny") return raw;
  return null;
}

export function parseTypingPrefs(
  raw: string | undefined | null
): PracticeTypingPrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PracticeTypingPrefs>;
    if (
      parsed.mode !== "time" &&
      parsed.mode !== "words" &&
      parsed.mode !== "custom" &&
      parsed.mode !== "quote"
    ) {
      return null;
    }
    const timeValue = Number(parsed.timeValue);
    const wordCount = Number(parsed.wordCount);
    const customSeconds = Number(parsed.customSeconds);
    const customWords = Number(parsed.customWords);
    if (
      !Number.isFinite(timeValue) ||
      !Number.isFinite(wordCount) ||
      !Number.isFinite(customSeconds) ||
      !Number.isFinite(customWords)
    ) {
      return null;
    }
    return {
      mode: parsed.mode,
      timeValue,
      wordCount,
      wordsDifficulty:
        parsed.wordsDifficulty === "small" || parsed.wordsDifficulty === "thick"
          ? parsed.wordsDifficulty
          : "regular",
      punctuation: Boolean(parsed.punctuation),
      numbers: Boolean(parsed.numbers),
      expert: Boolean(parsed.expert),
      expertDifficulty:
        parsed.expertDifficulty === "hard" ||
        parsed.expertDifficulty === "extreme"
          ? parsed.expertDifficulty
          : "normal",
      customSeconds,
      customWords,
      customKind: parsed.customKind === "words" ? "words" : "time",
    };
  } catch {
    return null;
  }
}

export function getCookieConsent(): CookieConsentValue | null {
  const fromCookie = parseCookieConsent(getCookie(COOKIE_CONSENT_KEY));
  if (fromCookie) return fromCookie;
  if (typeof window === "undefined") return null;
  try {
    return parseCookieConsent(sessionStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return null;
  }
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() === "allow";
}

export function setCookieConsent(value: CookieConsentValue) {
  try {
    sessionStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // private mode may block sessionStorage
  }
  setCookie(COOKIE_CONSENT_KEY, value, CONSENT_MAX_AGE);
  if (value === "deny") {
    deleteCookie(TYPING_PREFS_KEY);
    deleteCookie(THEME_COOKIE_KEY);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value })
    );
  }
}

export function saveTypingPrefs(prefs: PracticeTypingPrefs) {
  if (!hasCookieConsent()) return;
  try {
    setCookie(TYPING_PREFS_KEY, JSON.stringify(prefs), PREFS_MAX_AGE);
  } catch {
    // ignore quota / private-mode failures
  }
}

export function loadTypingPrefs(): PracticeTypingPrefs | null {
  if (!hasCookieConsent()) return null;
  return parseTypingPrefs(getCookie(TYPING_PREFS_KEY));
}
