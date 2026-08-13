import { cn } from "@/lib/utils";

/** Original BulletType keyboard mark — simple, rounded, not copied from other sites. */
export function BulletTypeKeyboardIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect
        x="1.25"
        y="2.25"
        width="37.5"
        height="21.5"
        rx="5"
        className="fill-[var(--primary)]/15 stroke-[var(--primary)]"
        strokeWidth="1.7"
      />
      <rect x="5" y="7" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/90" />
      <rect x="10.6" y="7" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/70" />
      <rect x="16.2" y="7" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/90" />
      <rect x="21.8" y="7" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/70" />
      <rect x="27.4" y="7" width="7.4" height="3.1" rx="0.7" className="fill-[var(--primary)]/90" />
      <rect x="6.4" y="12" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/70" />
      <rect x="12" y="12" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/90" />
      <rect x="17.6" y="12" width="4.8" height="3.1" rx="0.7" className="fill-[var(--primary)]" />
      <rect x="23.4" y="12" width="4.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/80" />
      <rect x="28.8" y="12" width="5.2" height="3.1" rx="0.7" className="fill-[var(--primary)]/70" />
      <rect x="10.4" y="17.1" width="19.2" height="3.05" rx="0.8" className="fill-[var(--primary)]/85" />
    </svg>
  );
}

export function BulletTypeLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BulletTypeKeyboardIcon className="h-8 w-[2.45rem] sm:h-9 sm:w-11" />
      <span className="select-none text-[1.45rem] font-semibold leading-none tracking-tight text-[var(--foreground)] sm:text-[1.65rem]">
        BulletType
      </span>
    </span>
  );
}
