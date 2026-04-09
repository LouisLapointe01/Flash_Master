import { clsx } from "clsx";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            "w-full rounded-[0.9rem] border bg-[var(--surface-soft)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-all duration-150 ease-in-out",
            "placeholder:text-[var(--text-muted)]",
            "focus:border-[var(--line-strong)] focus:ring-4 focus:ring-cyan-400/20",
            error ? "border-red-400" : "border-[var(--line)]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
