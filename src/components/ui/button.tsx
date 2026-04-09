import { clsx } from "clsx";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex cursor-crosshair items-center justify-center gap-2 rounded-[0.85rem] border-2 font-semibold uppercase tracking-[0.08em] transition-all duration-150 ease-in-out disabled:pointer-events-none disabled:opacity-50",
          "hover:scale-105 active:translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/25",
          {
            "border-green-400 bg-[linear-gradient(140deg,#12240e,#09110a)] text-green-300 shadow-[0_0_16px_rgba(57,255,20,.34)] hover:border-green-300 hover:text-green-200 hover:shadow-[0_0_22px_rgba(57,255,20,.52)]":
              variant === "primary",
            "border-cyan-400 bg-[linear-gradient(140deg,#081620,#071019)] text-cyan-300 shadow-[0_0_14px_rgba(0,255,255,.26)] hover:border-cyan-300 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(0,255,255,.46)]":
              variant === "secondary",
            "border-red-500 bg-[linear-gradient(135deg,#290a15,#1a050d)] text-red-300 shadow-[0_0_14px_rgba(255,0,63,.32)] hover:border-red-400 hover:text-red-200 hover:shadow-[0_0_20px_rgba(255,0,63,.5)]":
              variant === "danger",
            "border-zinc-700 bg-black/45 text-zinc-300 hover:border-cyan-400/60 hover:text-cyan-300": variant === "ghost",
          },
          {
            "px-3.5 py-2 text-xs": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
