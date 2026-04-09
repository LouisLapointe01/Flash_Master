"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  HudCloseIcon,
  HudCogIcon,
  HudDeckIcon,
  HudExploreIcon,
  HudHomeIcon,
  HudQuizIcon,
  HudStatsIcon,
  HudSuggestIcon,
  HudBellIcon,
} from "./hud-icons";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

const navItems = [
  { href: "/dashboard", label: "LOBBY", icon: HudHomeIcon },
  { href: "/decks", label: "DECKS", icon: HudDeckIcon },
  { href: "/quizzes", label: "QUIZ", icon: HudQuizIcon },
  { href: "/stats", label: "STATS", icon: HudStatsIcon },
  { href: "/explore", label: "EXPLORE", icon: HudExploreIcon },
  { href: "/suggestions", label: "IDEAS", icon: HudSuggestIcon },
  { href: "/notifications", label: "ALERT", icon: HudBellIcon },
  { href: "/settings", label: "SETUP", icon: HudCogIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/75 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r-2 border-cyan-400/45 bg-black/55 shadow-[0_0_26px_rgba(0,255,255,.22)] backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-24 items-center justify-between border-b border-cyan-400/25 px-5">
          <Link href="/dashboard" className="rounded-2xl p-1 transition hover:bg-cyan-400/10">
            <FlashMasterLogo size="md" />
          </Link>
          <button onClick={onClose} className="text-zinc-400 hover:text-cyan-300 lg:hidden">
            <HudCloseIcon size={20} />
          </button>
        </div>

        <nav className="soft-scroll flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "interactive-card group flex items-center gap-3 rounded-[0.92rem] border-2 px-3.5 py-3 font-mono text-sm font-bold uppercase tracking-[0.08em] transition-all duration-150 ease-in-out",
                  isActive
                    ? "border-green-400 bg-green-400/12 text-green-300 shadow-[0_0_16px_rgba(57,255,20,.34)]"
                    : "border-cyan-400/30 bg-black/30 text-cyan-200 hover:border-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100"
                )}
              >
                <item.icon size={18} className={clsx(isActive ? "text-green-300" : "text-cyan-300 group-hover:text-cyan-100")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-cyan-400/25 px-4 py-4">
          <div className="rounded-[0.9rem] border border-purple-500/35 bg-purple-500/10 px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-purple-200">
            <p className="font-bold">Mode focus</p>
            <p className="mt-1 text-[11px] text-zinc-300">No distraction. Push rank and keep streak.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
