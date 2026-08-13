import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Settings, Theme } from "@/types";
import { hasCookieConsent } from "@/lib/cookies";
import {
  applyAppearance,
  resolveStoredTheme,
  saveThemePreference,
  type AppearanceTheme,
} from "@/lib/themes";

interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setCursorStyle: (style: Settings["cursorStyle"]) => void;
  toggleKeyboardSounds: () => void;
  toggleErrorSounds: () => void;
  setVolume: (vol: number) => void;
  setDefaultTimer: (timer: Settings["defaultTimer"]) => void;
  setWordDifficulty: (diff: Settings["wordDifficulty"]) => void;
  setLanguage: (lang: string) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  updateSettings: (partial: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: "forest",
  fontSize: 24,
  fontFamily: "JetBrains Mono",
  cursorStyle: "block",
  keyboardSounds: false,
  errorSounds: true,
  volume: 0.5,
  defaultTimer: 60,
  wordDifficulty: "beginner",
  language: "english",
  punctuation: false,
  numbers: false,
  showLiveWpm: true,
  showLiveAccuracy: true,
  smoothCaret: true,
  blindMode: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setTheme: (theme) => {
        const next = resolveStoredTheme(theme);
        set({ theme: next });
        applyAppearance(next);
        saveThemePreference(next);
      },
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setCursorStyle: (cursorStyle) => set({ cursorStyle }),
      toggleKeyboardSounds: () =>
        set((s) => ({ keyboardSounds: !s.keyboardSounds })),
      toggleErrorSounds: () =>
        set((s) => ({ errorSounds: !s.errorSounds })),
      setVolume: (volume) => set({ volume }),
      setDefaultTimer: (defaultTimer) => set({ defaultTimer }),
      setWordDifficulty: (wordDifficulty) => set({ wordDifficulty }),
      setLanguage: (language) => set({ language }),
      togglePunctuation: () =>
        set((s) => ({ punctuation: !s.punctuation })),
      toggleNumbers: () => set((s) => ({ numbers: !s.numbers })),
      updateSettings: (partial) => set((s) => ({ ...s, ...partial })),
    }),
    {
      name: "typing-master-settings",
      version: 2,
      migrate: (persisted, fromVersion) => {
        const state = (persisted ?? {}) as Partial<SettingsState>;
        const theme = resolveStoredTheme(state.theme, "forest");
        if (fromVersion < 2) {
          return {
            ...state,
            theme,
          } as SettingsState;
        }
        return {
          ...state,
          theme,
        } as SettingsState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const theme = resolveStoredTheme(state.theme);
        state.theme = theme;
        if (typeof document !== "undefined" && hasCookieConsent()) {
          applyAppearance(theme);
          saveThemePreference(theme);
        }
      },
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof localStorage === "undefined") return null;
          const raw = localStorage.getItem(name);
          if (!raw || hasCookieConsent()) return raw;
          try {
            const parsed = JSON.parse(raw) as {
              state?: Partial<SettingsState>;
              version?: number;
            };
            if (parsed.state) delete parsed.state.theme;
            return JSON.stringify(parsed);
          } catch {
            return raw;
          }
        },
        setItem: (name, value) => {
          if (typeof localStorage === "undefined") return;
          try {
            const parsed = JSON.parse(value) as {
              state?: Partial<SettingsState>;
              version?: number;
            };
            if (!hasCookieConsent() && parsed.state) {
              delete parsed.state.theme;
            }
            localStorage.setItem(name, JSON.stringify(parsed));
          } catch {
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          if (typeof localStorage === "undefined") return;
          localStorage.removeItem(name);
        },
      })),
    }
  )
);

/** Apply theme class + CSS variables on <html> (forest is default) */
export function applyThemeClass(theme: Theme) {
  applyAppearance(resolveStoredTheme(theme));
}

export function currentAppearance(theme: Theme): AppearanceTheme {
  return resolveStoredTheme(theme);
}
