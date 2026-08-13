"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const show = window.requestAnimationFrame(() => {
        setShown(true);
        window.requestAnimationFrame(() => setVisible(true));
      });
      return () => window.cancelAnimationFrame(show);
    }
    const hideVisible = window.requestAnimationFrame(() => setVisible(false));
    const hide = window.setTimeout(() => setShown(false), 150);
    return () => {
      window.cancelAnimationFrame(hideVisible);
      window.clearTimeout(hide);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!shown) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 transition-opacity duration-150 ease-out",
        visible ? "opacity-100" : "opacity-0"
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-site-dialog=""
        className={cn(
          "w-full max-w-[20.5rem] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--card-foreground)] shadow-xl transition duration-150 ease-out",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.97] opacity-0"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-sm font-semibold tracking-tight">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)]",
              "transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.5 13.4L3.4 20.6l4.1-1.07A8.8 8.8 0 1 0 12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.7c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.6 1.5c.1.2 0 .5-.2.6l-.4.4c-.1.1-.1.3 0 .5.4.7 1.1 1.4 1.9 1.9.2.1.4.1.5 0l.4-.4c.2-.2.4-.3.6-.2l1.5.6c.4.1.4.3.4.5v.5c0 .3 0 .5-.5.7-.5.2-1.3.4-2.2 0-1.2-.4-2.6-1.4-3.6-2.5-1-1-1.8-2.3-2.1-3.5-.3-1 0-1.8.4-2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}
