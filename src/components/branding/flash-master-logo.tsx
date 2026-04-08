import { clsx } from "clsx";

type LogoSize = "sm" | "md" | "lg";

const sizeConfig: Record<LogoSize, { mark: string; title: string; subtitle: string; gap: string }> = {
  sm: { mark: "h-8 w-8", title: "text-sm", subtitle: "text-[9px]", gap: "gap-2" },
  md: { mark: "h-10 w-10", title: "text-base", subtitle: "text-[10px]", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", title: "text-lg", subtitle: "text-[11px]", gap: "gap-3" },
};

const playfulTilt = [-8, -3, 2, 6, -5, 4, -2, 5, -4, 2, -6, 3];
const WORDMARK = "FLASH MASTER";

interface FlashMasterLogoProps {
  size?: LogoSize;
  withWordmark?: boolean;
  className?: string;
}

export function FlashMasterLogo({
  size = "md",
  withWordmark = true,
  className,
}: FlashMasterLogoProps) {
  const cfg = sizeConfig[size];

  return (
    <div className={clsx("inline-flex items-center", cfg.gap, className)}>
      <span
        className={clsx(
          "brand-pulse logo-capi-mark relative grid place-items-center overflow-hidden rounded-[1.1rem] border border-[#c6d8e8] bg-[linear-gradient(145deg,#ffffff,#f2f8ff)] shadow-[0_14px_34px_-22px_rgba(15,23,42,.58)]",
          cfg.mark
        )}
      >
        <svg viewBox="0 0 52 52" className="h-[82%] w-[82%]" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="capi-body" x1="12" y1="14" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6f5232" />
              <stop offset="1" stopColor="#4f381f" />
            </linearGradient>
            <linearGradient id="capi-accent" x1="14" y1="33" x2="38" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f2d28a" />
              <stop offset="1" stopColor="#d3ab63" />
            </linearGradient>
          </defs>

          <circle cx="26" cy="26" r="18" stroke="#3fa8d0" strokeWidth="1.2" strokeDasharray="2.6 3.6" opacity="0.34" className="logo-orbit" />

          <path
            d="M14.8 31.2C14.8 23.5 20.2 17.8 27.3 17.8H31.1C37.9 17.8 43.2 23.2 43.2 29.8C43.2 36.6 37.8 42 31.1 42H24.2C18.9 42 14.8 37.2 14.8 31.2Z"
            fill="url(#capi-body)"
          />
          <ellipse cx="36.3" cy="26.9" rx="3.6" ry="2.9" fill="#624729" />
          <circle cx="37.3" cy="25.8" r="0.55" fill="#f4ead8" />

          <ellipse cx="22.6" cy="16.6" rx="2.35" ry="2.7" fill="#5a4025" />
          <ellipse cx="28.1" cy="15.8" rx="2.45" ry="2.85" fill="#5a4025" />
          <ellipse cx="22.6" cy="16.6" rx="1.1" ry="1.25" fill="#8b6742" />
          <ellipse cx="28.1" cy="15.8" rx="1.15" ry="1.3" fill="#8b6742" />

          <circle cx="31.7" cy="25.2" r="1.2" fill="#21170f" />
          <circle cx="31.95" cy="24.95" r="0.28" fill="#ffffff" />

          <path
            d="M24.3 32.5C24.9 33.4 25.9 34 27.2 34H31.8"
            stroke="#f0d49b"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M18.9 39.2H22.5M27.1 39.6H30.7"
            stroke="#3b2b18"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M10.9 22.6L14.1 24.1M12 27.4L15.6 28"
            stroke="#0f7a83"
            strokeWidth="1.55"
            strokeLinecap="round"
            opacity="0.78"
          />
          <circle cx="10.1" cy="20.8" r="1.05" fill="#14a7b3" />
        </svg>
      </span>

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className={clsx("logo-playful inline-flex items-end text-[#18324a]", cfg.title)} aria-label="Flash Master">
            {WORDMARK.split("").map((char, index) => {
              if (char === " ") {
                return <span key={`gap-${index}`} className="mx-1.5" aria-hidden="true" />;
              }

              const yOffset = (index % 3) - 1;
              const rotation = playfulTilt[index % playfulTilt.length];

              return (
                <span
                  key={`${char}-${index}`}
                  className="logo-playful-glyph"
                  style={{ transform: `translateY(${yOffset}px) rotate(${rotation}deg)` }}
                  aria-hidden="true"
                >
                  {char}
                </span>
              );
            })}
          </span>
          <span className={clsx("mt-1 font-semibold uppercase tracking-[0.18em] text-[#5c7990]", cfg.subtitle)}>
            Capibara Study Club
          </span>
        </span>
      )}
    </div>
  );
}
