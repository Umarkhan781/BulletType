"use client";

import { useSyncExternalStore } from "react";
import {
  closeCookiePopup,
  getConsentSnapshot,
  getServerConsentSnapshot,
  setCookieConsent,
  subscribeConsentStore,
  type CookieConsentValue,
} from "@/lib/cookies";
import { cn } from "@/lib/utils";

export function CookieConsent() {
  const { decision, popupOpen } = useSyncExternalStore(
    subscribeConsentStore,
    getConsentSnapshot,
    getServerConsentSnapshot
  );

  if (!popupOpen) return null;

  const choose = (value: CookieConsentValue) => {
    setCookieConsent(value);
  };

  return (
    <div
      role="dialog"
      data-cookie-consent=""
      aria-live="polite"
      aria-label="Cookie preferences"
      className="pointer-events-auto fixed bottom-[clamp(3.25rem,7vh,5rem)] right-3 z-[90] w-[min(17.5rem,calc(100vw-1.5rem))] sm:right-5"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[var(--card-foreground)] shadow-lg shadow-black/20">
        <p className="mb-2.5 text-[11px] leading-snug text-[var(--muted-foreground)]">
          We use cookies to remember your preferences and improve your experience.
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => choose("allow")}
            className={cn(
              "h-7 rounded-md px-2.5 text-[11px] font-medium transition-colors",
              "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              decision === "allow" && "ring-2 ring-[var(--ring)]"
            )}
          >
            Allow
          </button>
          <button
            type="button"
            onClick={() => choose("deny")}
            className={cn(
              "h-7 rounded-md border border-[var(--border)] px-2.5 text-[11px] font-medium transition-colors",
              "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_12%,var(--muted))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              decision === "deny" && "ring-2 ring-[var(--ring)]"
            )}
          >
            Decline
          </button>
          {decision !== null && (
            <button
              type="button"
              aria-label="Close cookie popup"
              onClick={() => closeCookiePopup()}
              className="ml-auto h-7 rounded-md px-2 text-[11px] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
