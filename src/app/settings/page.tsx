"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const s = useSettingsStore();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        {/* Theme */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Appearance</h2>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["dark", "Dark"],
                ["light", "Light"],
                ["ocean", "Ocean"],
                ["forest", "Forest"],
                ["sunset", "Sunset"],
                ["lavender", "Lavender"],
                ["midnight", "Midnight Blue"],
                ["rose", "Rose"],
                ["emerald", "Emerald"],
                ["mono", "Mono"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                variant={s.theme === id ? "default" : "outline"}
                size="sm"
                onClick={() => s.setTheme(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        {/* Font */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Typography</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-500 mb-2 block">Font Size: {s.fontSize}px</label>
              <input
                type="range"
                min={16}
                max={36}
                value={s.fontSize}
                onChange={(e) => s.setFontSize(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-500 mb-2 block">Font Family</label>
              <div className="flex flex-wrap gap-2">
                {["JetBrains Mono", "Fira Code", "Geist Mono", "Roboto Mono"].map((f) => (
                  <Button
                    key={f}
                    variant={s.fontFamily === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => s.setFontFamily(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-500 mb-2 block">Cursor Style</label>
              <div className="flex gap-2">
                {(["block", "underline", "line"] as const).map((c) => (
                  <Button
                    key={c}
                    variant={s.cursorStyle === c ? "default" : "outline"}
                    size="sm"
                    onClick={() => s.setCursorStyle(c)}
                    className="capitalize"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Test defaults */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Test Defaults</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-500 mb-2 block">Default Timer</label>
              <div className="flex gap-2">
                {([15, 30, 60, 120] as const).map((t) => (
                  <Button
                    key={t}
                    variant={s.defaultTimer === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => s.setDefaultTimer(t)}
                  >
                    {t}s
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Punctuation</span>
              <button
                onClick={s.togglePunctuation}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  s.punctuation ? "bg-blue-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    s.punctuation && "translate-x-5"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Numbers</span>
              <button
                onClick={s.toggleNumbers}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  s.numbers ? "bg-blue-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    s.numbers && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Sound */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Sound</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Keyboard Sounds</span>
              <button
                onClick={s.toggleKeyboardSounds}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  s.keyboardSounds ? "bg-blue-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    s.keyboardSounds && "translate-x-5"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Error Sounds</span>
              <button
                onClick={s.toggleErrorSounds}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  s.errorSounds ? "bg-blue-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    s.errorSounds && "translate-x-5"
                  )}
                />
              </button>
            </div>
            <div>
              <label className="text-sm text-zinc-500 mb-2 block">Volume: {Math.round(s.volume * 100)}%</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.volume}
                onChange={(e) => s.setVolume(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
