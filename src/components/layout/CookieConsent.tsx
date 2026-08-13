"use client";

import { useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookies";

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
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (consent !== "none") return null;

  return (
    <div
      role="dialog"
      data-cookie-consent=""
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-3.5">
        <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          We use cookies to remember your preferences and improve your experience.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setCookieConsent("allow")}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[13px] font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Allow Cookies
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("deny")}
            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Continue Without Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
