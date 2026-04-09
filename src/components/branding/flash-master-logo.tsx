import { clsx } from "clsx";
import { useId } from "react";

type LogoSize = "sm" | "md" | "lg";

const sizeConfig: Record<LogoSize, { mark: string; title: string; subtitle: string; gap: string }> = {
  sm: { mark: "h-8 w-8", title: "text-[0.74rem]", subtitle: "text-[7px]", gap: "gap-2" },
  md: { mark: "h-10 w-10", title: "text-[0.9rem]", subtitle: "text-[8px]", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", title: "text-[1.05rem]", subtitle: "text-[9px]", gap: "gap-3" },
};

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
  const gradientSeed = useId();
  const shellId = `${gradientSeed}-shell`;
  const coreId = `${gradientSeed}-core`;
  const shineId = `${gradientSeed}-shine`;
  const cfg = sizeConfig[size];

  return (
    <div className={clsx("inline-flex items-center", cfg.gap, className)}>
      <span
        className={clsx(
          "brand-pulse relative grid place-items-center overflow-hidden rounded-[1rem] border border-cyan-300/60 bg-[linear-gradient(145deg,#04111e,#071b30)] shadow-[0_0_18px_rgba(0,255,255,.25)]",
          cfg.mark
        )}
      >
        <svg viewBox="0 0 64 64" className="h-[82%] w-[82%]" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={shellId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00f5ff" />
              <stop offset="0.52" stopColor="#2f7ec4" />
              <stop offset="1" stopColor="#39ff14" />
            </linearGradient>
            <linearGradient id={coreId} x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#071427" />
              <stop offset="1" stopColor="#0d2038" />
            </linearGradient>
            <radialGradient id={shineId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 18) rotate(145) scale(24 22)">
              <stop stopColor="#8cf8ff" stopOpacity="0.38" />
              <stop offset="1" stopColor="#8cf8ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="M32 5L52.8 16.4V39.6L32 59L11.2 39.6V16.4L32 5Z"
            fill={`url(#${coreId})`}
            stroke={`url(#${shellId})`}
            strokeWidth="2.2"
          />
          <path
            d="M16.5 20.5H40.5V25.5H22.5V30.8H36.4V35.5H22.5V45.5H16.5V20.5Z"
            fill="#c8f9ff"
          />
          <path
            d="M32.8 45.5V20.5H38.2L45.3 31L52.2 20.5H57.5V45.5H51.8V30.4L45.4 39.8H45L38.6 30.4V45.5H32.8Z"
            fill="#8affca"
          />
          <path
            d="M32 8.8L49.4 18.3V38L32 54.1L14.6 38V18.3L32 8.8Z"
            stroke="#98e9ff"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <ellipse cx="32" cy="33" rx="20" ry="18" fill={`url(#${shineId})`} />
          <circle cx="52" cy="14" r="1.5" fill="#b4feff" opacity="0.8" />
          <circle cx="14" cy="48" r="1.3" fill="#7effbe" opacity="0.75" />
          <circle cx="9.5" cy="20" r="1" fill="#9ce8ff" opacity="0.55" />
          <circle cx="54.5" cy="44" r="1" fill="#90ffcc" opacity="0.5" />
          <rect x="6" y="6" width="52" height="52" rx="11" stroke="#8cefff" strokeOpacity="0.2" />
        </svg>
      </span>

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className={clsx("inline-flex items-end gap-2 font-mono font-black uppercase tracking-[0.16em]", cfg.title)} aria-label="Flash Master">
            <span className="text-transparent bg-[linear-gradient(90deg,#c8f9ff,#00f5ff,#7cecff)] bg-clip-text [text-shadow:0_0_16px_rgba(0,245,255,.32)]">
              Flash
            </span>
            <span className="text-transparent bg-[linear-gradient(90deg,#8affca,#39ff14,#a0ffc8)] bg-clip-text [text-shadow:0_0_16px_rgba(57,255,20,.28)]">
              Master
            </span>
          </span>
          <span className="mt-1 h-[2px] w-full rounded-full bg-[linear-gradient(90deg,rgba(0,245,255,.15),rgba(57,255,20,.5),rgba(0,245,255,.15))]" />
          <span className={clsx("mt-1 font-mono font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]", cfg.subtitle)}>
            Tactical Quiz Arena
          </span>
        </span>
      )}
    </div>
  );
}
