"use client";

import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { COOKIE_CONSENT_EVENT } from "@/lib/cookies";
import {
  THEME_OPTIONS,
  resolveStoredTheme,
  saveThemePreference,
} from "@/lib/themes";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = resolveStoredTheme(theme);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const onConsent = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (value === "allow") {
        saveThemePreference(selected);
      }
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, [selected]);

  return (
    <div ref={rootRef} className="relative" data-theme-switcher="">
      <button
        type="button"
        aria-label="Appearance"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <Palette className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Themes"
          className="absolute right-0 z-[70] mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 text-[var(--card-foreground)] shadow-xl"
        >
          {THEME_OPTIONS.map((option) => {
            const active = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setTheme(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  active
                    ? "bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden="true"
                />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
