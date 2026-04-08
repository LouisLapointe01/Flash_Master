"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Layers,
  HelpCircle,
  BarChart3,
  Compass,
  MessageSquare,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/explore", label: "Explorer", icon: Compass },
  { href: "/suggestions", label: "Suggestions", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Paramètres", icon: Settings },
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-[#c5d8e9] bg-[linear-gradient(180deg,rgba(255,255,255,.94),rgba(244,249,255,.9))] shadow-[0_24px_50px_-30px_rgba(15,35,64,.85)] backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-24 items-center justify-between border-b border-[#d6e4f0] px-5">
          <Link href="/dashboard" className="rounded-2xl p-1 transition hover:bg-[#eef5fc]">
            <FlashMasterLogo size="md" />
          </Link>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0f7a83] lg:hidden">
            <X size={20} />
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
                  "interactive-card group flex items-center gap-3 rounded-[1.1rem] px-3.5 py-3 text-sm font-semibold transition",
                  isActive
                    ? "neon-outline bg-[#102c43] text-white"
                    : "text-[#2a4e66] hover:bg-[#eaf2fb] hover:text-[#102c43]"
                )}
              >
                <item.icon size={18} className={clsx(isActive ? "text-[#57d4e2]" : "text-[#4b7593] group-hover:text-[#0f7a83]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#d6e4f0] px-4 py-4">
          <div className="game-panel rounded-[1.15rem] px-3 py-3 text-xs text-[#365973]">
            <p className="font-bold tracking-[0.07em] uppercase">Mode Focus</p>
            <p className="mt-1">Une seule priorite a la fois pour une progression chirurgicale.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
