"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Github,
  Headphones,
  Lock,
  Mail,
  MessagesSquare,
  Shield,
  Twitter,
} from "lucide-react";
import { SiteDialog, WhatsAppIcon } from "@/components/layout/SiteDialog";

const EMAIL = "umar092939495@gmail.com";
const WHATSAPP_DISPLAY = "+923405026367";
const WHATSAPP_HREF = "https://wa.me/923405026367";
const MAILTO = `mailto:${EMAIL}`;

const linkClass =
  "inline-flex items-center gap-1.5 rounded-sm text-[11px] leading-none text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function SiteFooter() {
  const [dialog, setDialog] = useState<"contact" | "support" | null>(null);
  const close = useCallback(() => setDialog(null), []);

  return (
    <>
      <footer className="bg-[var(--background)] px-4 pt-2 pb-[clamp(1.25rem,2.8vh,2rem)] sm:px-6">
        <nav
          aria-label="Footer"
          className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:gap-x-5"
        >
          <button
            type="button"
            className={linkClass}
            onClick={() => setDialog("contact")}
          >
            <Mail className="h-3 w-3" aria-hidden="true" />
            Contact
          </button>
          <button
            type="button"
            className={linkClass}
            onClick={() => setDialog("support")}
          >
            <Headphones className="h-3 w-3" aria-hidden="true" />
            Support
          </button>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <MessagesSquare className="h-3 w-3" aria-hidden="true" />
            Discord
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Github className="h-3 w-3" aria-hidden="true" />
            GitHub
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Twitter className="h-3 w-3" aria-hidden="true" />
            Twitter
          </a>
          <Link href="/terms" className={linkClass}>
            <FileText className="h-3 w-3" aria-hidden="true" />
            Terms
          </Link>
          <Link href="/security" className={linkClass}>
            <Shield className="h-3 w-3" aria-hidden="true" />
            Security
          </Link>
          <Link href="/privacy" className={linkClass}>
            <Lock className="h-3 w-3" aria-hidden="true" />
            Privacy
          </Link>
        </nav>
      </footer>

      <SiteDialog open={dialog === "contact"} title="Contact" onClose={close}>
        <div className="space-y-2.5">
          <a
            href={MAILTO}
            className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
            <span>
              <span className="block text-[11px] text-[var(--muted-foreground)]">
                Email
              </span>
              <span className="break-all text-[13px] font-medium">{EMAIL}</span>
            </span>
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
            <span>
              <span className="block text-[11px] text-[var(--muted-foreground)]">
                WhatsApp
              </span>
              <span className="text-[13px] font-medium">{WHATSAPP_DISPLAY}</span>
            </span>
          </a>
        </div>
      </SiteDialog>

      <SiteDialog open={dialog === "support"} title="Support" onClose={close}>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
          <span>
            <span className="block text-[11px] text-[var(--muted-foreground)]">
              WhatsApp Support
            </span>
            <span className="text-[13px] font-medium">{WHATSAPP_DISPLAY}</span>
          </span>
        </a>
      </SiteDialog>
    </>
  );
}
