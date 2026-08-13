"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_POPUP_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookies";
import { cn } from "@/lib/utils";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
}

function getSnapshot(): CookieConsentValue | "none" {
  return getCookieConsent() ?? "none";
}

function getServerSnapshot(): CookieConsentValue | "none" {
  return "allow";
}

export function CookieConsent() {
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [forced, setForced] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const open = () => {
      setDismissed(false);
      setForced(true);
    };
    window.addEventListener(COOKIE_POPUP_EVENT, open);
    return () => window.removeEventListener(COOKIE_POPUP_EVENT, open);
  }, []);

  const visible = (stored === "none" && !dismissed) || forced;
  if (!visible) return null;

  const choose = (value: CookieConsentValue) => {
    setForced(false);
    setDismissed(true);
    setCookieConsent(value);
  };

  return (
    <div
      role="dialog"
      data-cookie-consent=""
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed bottom-[clamp(3.25rem,7vh,5rem)] right-3 z-[80] w-[min(17.5rem,calc(100vw-1.5rem))] sm:right-5"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[var(--card-foreground)] shadow-lg shadow-black/20">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-[11px] leading-snug text-[var(--muted-foreground)]">
            We use cookies to remember your preferences and improve your experience.
          </p>
          <button
            type="button"
            aria-label="Close cookie popup"
            onClick={() => {
              setForced(false);
              setDismissed(true);
            }}
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              choose("allow");
            }}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              stored === "allow"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            )}
          >
            Allow
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              choose("deny");
            }}
            className={cn(
              "rounded-md border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              stored === "deny"
                ? "bg-[var(--muted)] text-[var(--foreground)]"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
