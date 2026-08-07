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
  theme: "system",
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
    }
  )
);