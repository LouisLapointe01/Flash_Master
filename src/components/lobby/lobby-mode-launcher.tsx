"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { ChevronRight, Swords, Target, Users } from "lucide-react";

type LobbyMode = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  badge: string;
  icon: typeof Swords;
};

const LOBBY_MODES: LobbyMode[] = [
  {
    key: "ranked",
    title: "Ranked",
    subtitle: "Matchmaking classe, points de rang, progression de ligue.",
    href: "/ranked",
    badge: "Competitif",
    icon: Swords,
  },
  {
    key: "training",
    title: "Entrainement",
    subtitle: "Revision libre par categorie et sous-categorie.",
    href: "/training",
    badge: "Practice",
    icon: Target,
  },
  {
    key: "social",
    title: "Duel social",
    subtitle: "Defis prives avec tes amis et tes associations.",
    href: "/social",
    badge: "Friends",
    icon: Users,
  },
];

export function LobbyModeLauncher() {
  const router = useRouter();
  const [selectedModeKey, setSelectedModeKey] = useState(LOBBY_MODES[0].key);

  const selectedMode = useMemo(
    () => LOBBY_MODES.find((mode) => mode.key === selectedModeKey) ?? LOBBY_MODES[0],
    [selectedModeKey]
  );

  function launchSelectedMode() {
    router.push(`${selectedMode.href}?source=lobby`);
  }

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-3">
        {LOBBY_MODES.map((mode) => {
          const active = mode.key === selectedModeKey;

          return (
            <button
              key={mode.key}
              type="button"
              onClick={() => setSelectedModeKey(mode.key)}
              className={clsx(
                "interactive-card w-full rounded-[1rem] border p-4 text-left transition-all duration-150 ease-in-out",
                active
                  ? "border-green-400 bg-green-400/10 shadow-[0_0_20px_rgba(57,255,20,.22)]"
                  : "border-[var(--line)] bg-[var(--surface-soft)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">{mode.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{mode.subtitle}</p>
                </div>
                <mode.icon size={16} className={active ? "text-green-300" : "text-[var(--secondary)]"} />
              </div>

              <span
                className={clsx(
                  "mt-3 inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.08em]",
                  active
                    ? "border-green-300 bg-green-400/15 text-green-300"
                    : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
                )}
              >
                {mode.badge}
              </span>
            </button>
          );
        })}
      </section>

      <aside className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] p-5 text-center lg:text-left">
        <p className="font-mono text-[11px] font-black uppercase tracking-[0.08em] text-[var(--text-muted)]">Mode selectionne</p>
        <p className="mt-2 font-mono text-2xl font-black uppercase tracking-[0.1em] text-[var(--foreground)]">
          {selectedMode.title}
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{selectedMode.subtitle}</p>

        <button
          type="button"
          onClick={launchSelectedMode}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border-2 border-green-300 bg-[linear-gradient(145deg,#39ff14,#00ffaa)] px-8 py-5 font-mono text-3xl font-black uppercase tracking-[0.16em] text-black shadow-[0_0_24px_rgba(57,255,20,.52)] transition-all duration-150 ease-in-out hover:scale-105 active:translate-y-1 active:scale-95"
        >
          Jouer
          <ChevronRight size={20} />
        </button>
      </aside>
    </div>
  );
}
