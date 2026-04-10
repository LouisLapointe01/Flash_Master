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
  { href: "/dashboard", label: "ACCUEIL", icon: HudHomeIcon },
  { href: "/training", label: "ENTRAINEMENT", icon: HudDeckIcon },
  { href: "/ranked", label: "RANKED", icon: HudQuizIcon },
  { href: "/social", label: "DUEL & AMIS", icon: HudSuggestIcon },
  { href: "/stats", label: "STATS", icon: HudStatsIcon },
  { href: "/settings", label: "REGLAGES", icon: HudCogIcon },
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
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/dashboard" className="transition hover:opacity-80">
            <FlashMasterLogo size="md" />
          </Link>
          <button onClick={onClose} className="text-zinc-500 hover:text-white lg:hidden">
            <HudCloseIcon size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                )}
              >
                <item.icon size={16} className={clsx(isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <div className="rounded-lg bg-zinc-950 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Compte Standard</p>
            <p className="mt-1 text-xs text-zinc-400">50 points / jour</p>
            <Link href="/settings" className="mt-2 block text-[10px] font-bold text-primary hover:underline">PASSER PREMIUM</Link>
          </div>
        </div>
      </aside>
    </>
  );
}
