import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25":
              variant === "default",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300":
              variant === "secondary",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800": variant === "ghost",
            "border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900":
              variant === "outline",
            "bg-red-600 text-white hover:bg-red-500": variant === "destructive",
            "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-xl":
              variant === "glass",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };