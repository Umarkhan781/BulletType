import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings, Theme } from "@/types";

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
  theme: "dark",
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
      setTheme: (theme) => set({ theme }),
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
      // v1: product default is dark (was system → followed OS light on many PCs)
      version: 1,
      migrate: (persisted, fromVersion) => {
        const state = (persisted ?? {}) as Partial<SettingsState>;
        if (fromVersion < 1) {
          return {
            ...state,
            theme: "dark",
          } as SettingsState;
        }
        return {
          ...state,
          theme: state.theme === "light" ? "light" : state.theme || "dark",
        } as SettingsState;
      },
    }
  )
);

/** Apply theme class on <html> (dark is default) */
export function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const preferDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  // Default product behavior: treat unknown as dark
  if (theme === "light") {
    root.classList.remove("dark");
  } else if (theme === "system") {
    if (preferDark) root.classList.add("dark");
    else root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}