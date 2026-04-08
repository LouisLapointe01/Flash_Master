"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  HelpCircle,
  BarChart3,
  Compass,
  MessageSquare,
  ShieldCheck,
  Swords,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/quizzes", label: "Quiz", icon: HelpCircle },
  { href: "/ranked", label: "Classe", icon: Swords },
  { href: "/check", label: "Check", icon: ShieldCheck },
  { href: "/social", label: "Social", icon: Users },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/explore", label: "Explorer", icon: Compass },
  { href: "/suggestions", label: "Suggestions", icon: MessageSquare },
];

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomDockNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 pb-[max(0.3rem,env(safe-area-inset-bottom))] lg:inset-x-auto lg:bottom-auto lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:px-0 lg:pb-0">
      <nav className="dock-nav pointer-events-auto">
        {navItems.map((item) => {
          const active = isItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx("dock-nav-item relative overflow-hidden", active && "dock-nav-item-active")}
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="dock-active-pill"
                  transition={{ type: "spring", stiffness: 520, damping: 36 }}
                  className="dock-nav-active-pill"
                />
              )}

              <motion.span
                className="relative z-10 inline-flex items-center gap-1.5"
                whileTap={{ scale: 0.96 }}
                animate={active ? { y: [0, -1, 0] } : { y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="dock-nav-label">{item.label}</span>
              </motion.span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}