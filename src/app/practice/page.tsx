import { Suspense } from "react";
import { cookies } from "next/headers";
import { PracticeContent } from "./PracticeContent";
import {
  COOKIE_CONSENT_KEY,
  TYPING_PREFS_KEY,
  parseCookieConsent,
  parseTypingPrefs,
} from "@/lib/cookies";

export default async function PracticePage() {
  const jar = await cookies();
  const consent = parseCookieConsent(jar.get(COOKIE_CONSENT_KEY)?.value ?? null);
  const initialPrefs =
    consent === "allow"
      ? parseTypingPrefs(jar.get(TYPING_PREFS_KEY)?.value ?? null)
      : null;

  return (
    <Suspense
      fallback={<div className="p-20 text-center text-zinc-400">Loading...</div>}
    >
      <PracticeContent initialPrefs={initialPrefs} />
    </Suspense>
  );
}
