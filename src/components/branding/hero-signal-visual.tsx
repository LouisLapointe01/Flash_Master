import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

type Accent = "cyan" | "green" | "violet";

const accentStyles: Record<Accent, {
  shell: string;
  badge: string;
  bar: string;
  line: string;
}> = {
  cyan: {
    shell: "border-cyan-400/35 bg-[linear-gradient(140deg,rgba(0,255,255,.1),rgba(5,16,28,.68))]",
    badge: "border-cyan-300/50 bg-cyan-400/10 text-cyan-200",
    bar: "bg-[linear-gradient(180deg,#00f5ff,#2c7ec2)]",
    line: "bg-[linear-gradient(90deg,rgba(0,245,255,.06),rgba(0,245,255,.45),rgba(0,245,255,.06))]",
  },
  green: {
    shell: "border-green-400/35 bg-[linear-gradient(140deg,rgba(57,255,20,.08),rgba(5,16,28,.68))]",
    badge: "border-green-300/50 bg-green-400/10 text-green-200",
    bar: "bg-[linear-gradient(180deg,#39ff14,#26b344)]",
    line: "bg-[linear-gradient(90deg,rgba(57,255,20,.08),rgba(57,255,20,.4),rgba(57,255,20,.08))]",
  },
  violet: {
    shell: "border-purple-400/35 bg-[linear-gradient(140deg,rgba(191,0,255,.1),rgba(5,16,28,.68))]",
    badge: "border-purple-300/50 bg-purple-500/10 text-purple-200",
    bar: "bg-[linear-gradient(180deg,#bf00ff,#4d7dff)]",
    line: "bg-[linear-gradient(90deg,rgba(191,0,255,.08),rgba(191,0,255,.4),rgba(191,0,255,.08))]",
  },
};

interface HeroSignalVisualProps {
  tag: string;
  title: string;
  icon: LucideIcon;
  accent?: Accent;
  points?: number[];
  chips?: string[];
  className?: string;
}

export function HeroSignalVisual({
  tag,
  title,
  icon: Icon,
  accent = "cyan",
  points,
  chips,
  className,
}: HeroSignalVisualProps) {
  const styles = accentStyles[accent];
  const bars = (points && points.length > 0 ? points : [34, 58, 42, 68, 52, 72, 61]).map((value) =>
    Math.max(10, Math.min(100, value))
  );

  return (
    <div className={clsx("section-hero-visual", styles.shell, className)}>
      <div className="cover-art-meta">
        <span className="cover-art-tag">{tag}</span>
        <span className={clsx("inline-flex h-7 w-7 items-center justify-center rounded-[0.65rem] border", styles.badge)}>
          <Icon size={14} />
        </span>
      </div>

      <div className="relative z-[1] mt-3 space-y-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--foreground)]">{title}</p>

        <div className="relative h-20 overflow-hidden rounded-[0.85rem] border border-[var(--line)] bg-black/20 px-2 pb-2">
          <div className={clsx("absolute inset-x-2 top-2 h-[1px]", styles.line)} />
          <div className="absolute inset-x-2 top-6 h-[1px] bg-[var(--line)]/35" />
          <div className="absolute inset-x-2 top-10 h-[1px] bg-[var(--line)]/22" />
          <div className="absolute inset-x-2 top-14 h-[1px] bg-[var(--line)]/16" />

          <div className="absolute inset-x-2 bottom-2 flex items-end gap-1">
            {bars.map((bar, index) => (
              <div
                key={`${title}-bar-${index}`}
                className={clsx("w-full rounded-sm opacity-90", styles.bar)}
                style={{ height: `${bar}%` }}
              />
            ))}
          </div>
        </div>

        {chips && chips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {chips.slice(0, 3).map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[var(--line)] bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
