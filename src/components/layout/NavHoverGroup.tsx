"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavHoverContextValue = {
  groupId: string;
  hoverId: string | null;
  canHover: boolean;
  activate: (id: string, label: string, el: HTMLElement) => void;
  deactivate: () => void;
};

const NavHoverContext = createContext<NavHoverContextValue | null>(null);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SHOW_DELAY_MS = 80;
const HIDE_DELAY_MS = 90;
const TIP_GAP = 8;

export function NavHoverGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const groupId = useId();
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const tipLive = useRef(false);
  const anchorRef = useRef<HTMLElement | null>(null);

  const [canHover, setCanHover] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipLabel, setTipLabel] = useState("");
  const [tipX, setTipX] = useState(0);
  const [tipY, setTipY] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const clearTimers = () => {
    if (showTimer.current != null) window.clearTimeout(showTimer.current);
    if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  };

  const placeFromElement = (el: HTMLElement) => {
    const box = el.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const top = box.bottom + TIP_GAP;
    const margin = 10;
    setTipX(Math.min(window.innerWidth - margin, Math.max(margin, centerX)));
    setTipY(top);
  };

  const activate = useCallback((id: string, label: string, el: HTMLElement) => {
    clearTimers();
    anchorRef.current = el;
    placeFromElement(el);
    setHoverId(id);
    setTipLabel(label);
    if (tipLive.current) {
      setTipOpen(true);
      return;
    }
    showTimer.current = window.setTimeout(() => {
      if (anchorRef.current) placeFromElement(anchorRef.current);
      tipLive.current = true;
      setTipOpen(true);
    }, SHOW_DELAY_MS);
  }, []);

  const deactivate = useCallback(() => {
    clearTimers();
    setHoverId(null);
    hideTimer.current = window.setTimeout(() => {
      tipLive.current = false;
      anchorRef.current = null;
      setTipOpen(false);
    }, HIDE_DELAY_MS);
  }, []);

  useEffect(() => () => clearTimers(), []);

  return (
    <NavHoverContext.Provider
      value={{ groupId, hoverId, canHover, activate, deactivate }}
    >
      <div className={cn("relative", className)} onMouseLeave={deactivate}>
        {children}
        <motion.div
          aria-hidden={!tipOpen}
          className="pointer-events-none fixed z-[90]"
          initial={false}
          animate={{
            opacity: tipOpen ? 1 : 0,
            scale: tipOpen ? 1 : 0.97,
            left: tipX,
            top: tipY,
            y: tipOpen ? 0 : 4,
          }}
          transition={{ duration: 0.16, ease: EASE }}
          style={{ x: "-50%" }}
        >
          <div className="relative whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-medium text-[var(--card-foreground)] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.55)]">
            {tipLabel}
            <span
              className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border-l border-t border-[var(--border)] bg-[var(--card)]"
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </div>
    </NavHoverContext.Provider>
  );
}

export function NavHoverItem({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(NavHoverContext);
  const ref = useRef<HTMLDivElement>(null);

  if (!ctx) {
    return <div className={className}>{children}</div>;
  }

  const hovered = ctx.hoverId === id;

  return (
    <div
      ref={ref}
      className={cn("relative shrink-0", className)}
      onMouseEnter={() => {
        if (!ctx.canHover || !ref.current) return;
        ctx.activate(id, label, ref.current);
      }}
      onFocusCapture={() => {
        if (!ref.current) return;
        ctx.activate(id, label, ref.current);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          ctx.deactivate();
        }
      }}
    >
      {ctx.hoverId === id && (
        <motion.span
          layoutId={`${ctx.groupId}-liquid`}
          className="pointer-events-none absolute inset-0 rounded-xl bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent)]"
          transition={{ type: "spring", stiffness: 460, damping: 36, mass: 0.32 }}
        />
      )}
      <div
        className={cn(
          "relative z-[1] [&_svg]:origin-center [&_svg]:transition-transform [&_svg]:duration-150",
          hovered && "[&_svg]:-translate-y-px [&_svg]:scale-[1.05]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
