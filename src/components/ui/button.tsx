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
          "inline-flex items-center justify-center gap-2 rounded-[1rem] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
          "active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3d5f8f]/18",
          {
            "bg-[linear-gradient(140deg,#2f4868,#3d5f8f)] text-[#fffaf1] shadow-[0_18px_36px_-24px_rgba(38,53,73,.88)] hover:-translate-y-[1px] hover:brightness-110":
              variant === "primary",
            "border border-[#d8ccba] bg-[#fffdf8] text-[#3a3833] shadow-[0_10px_24px_-18px_rgba(42,34,21,.42)] hover:-translate-y-[1px] hover:border-[#bcae95] hover:bg-white":
              variant === "secondary",
            "bg-[linear-gradient(135deg,#b65252,#93403f)] text-white shadow-[0_16px_32px_-20px_rgba(122,49,49,.72)] hover:-translate-y-[1px] hover:brightness-110":
              variant === "danger",
            "text-[#514e46] hover:bg-[#efe7db] hover:text-[#2f2b25]": variant === "ghost",
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
