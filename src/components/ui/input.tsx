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
          <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#58554c]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            "w-full rounded-[1rem] border bg-white/92 px-4 py-2.5 text-sm text-[#2b2a25] outline-none transition",
            "placeholder:text-[#8e8473]",
            "focus:border-[#3d5f8f] focus:ring-4 focus:ring-[#3d5f8f]/13",
            error ? "border-red-300" : "border-[#d8ccba]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
