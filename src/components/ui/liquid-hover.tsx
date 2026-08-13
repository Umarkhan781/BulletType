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
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type LiquidHoverContextValue = {
  groupId: string;
  hoverId: string | null;
};

const LiquidHoverContext = createContext<LiquidHoverContextValue | null>(null);

const TAP = { scale: 0.98 };
const TAP_TRANSITION = { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const };
const SPRING = { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.28 };

function itemIdFromTarget(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const item = target.closest("[data-liquid-item]");
  const id = item instanceof HTMLElement ? item.dataset.liquidItem : null;
  return id || null;
}

export function LiquidHoverGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const groupId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const lastId = useRef<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const setId = useCallback((id: string | null) => {
    if (lastId.current === id) return;
    lastId.current = id;
    setHoverId(id);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      const next = media.matches;
      setCanHover(next);
      if (!next) setId(null);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [setId]);

  return (
    <LiquidHoverContext.Provider value={{ groupId, hoverId }}>
      <div
        ref={rootRef}
        data-liquid-group=""
        className={cn("relative", className)}
        onPointerOver={(event) => {
          if (!canHover || event.pointerType === "touch") return;
          const id = itemIdFromTarget(event.target);
          if (id) setId(id);
        }}
        onPointerMove={(event) => {
          if (!canHover || event.pointerType === "touch") return;
          const id = itemIdFromTarget(event.target);
          if (id) setId(id);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "touch") return;
          setId(null);
        }}
        onPointerCancel={() => setId(null)}
        onFocusCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) {
            return;
          }
          setId(itemIdFromTarget(target));
        }}
        onBlurCapture={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && rootRef.current?.contains(next)) return;
          if (canHover && rootRef.current?.matches(":hover")) return;
          setId(null);
        }}
      >
        {children}
      </div>
    </LiquidHoverContext.Provider>
  );
}

export function LiquidHoverItem({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(LiquidHoverContext);
  const reduceMotion = useReducedMotion();
  const hovered = ctx?.hoverId === id;

  return (
    <motion.div
      data-liquid-item={id}
      className={cn("relative inline-flex shrink-0 origin-center", className)}
      whileTap={TAP}
      transition={TAP_TRANSITION}
    >
      {hovered && ctx && (
        <motion.span
          layoutId={`${ctx.groupId}-liquid`}
          className="pointer-events-none absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent),0_0_14px_-6px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
          transition={reduceMotion ? { duration: 0 } : SPRING}
        />
      )}
      <div className="relative z-[1] inline-flex">{children}</div>
    </motion.div>
  );
}
