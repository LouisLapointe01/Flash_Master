"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  HudDeckIcon,
  HudHomeIcon,
  HudQuizIcon,
  HudRankedIcon,
  HudShieldIcon,
  HudTrainingIcon,
} from "./hud-icons";

const navItems = [
  { href: "/dashboard", label: "Lobby", icon: HudHomeIcon, slot: "01" },
  { href: "/ranked", label: "Ranked", icon: HudRankedIcon, slot: "02" },
  { href: "/training", label: "Training", icon: HudTrainingIcon, slot: "03" },
  { href: "/quizzes", label: "Mes quiz", icon: HudQuizIcon, slot: "04" },
  { href: "/decks", label: "Mes decks", icon: HudDeckIcon, slot: "05" },
  { href: "/check", label: "Soumettre", icon: HudShieldIcon, slot: "06" },
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
                {active && <span className="dock-nav-kbd">{item.slot}</span>}
                <item.icon size={18} className="shrink-0" />
                <span className="dock-nav-label">{item.label}</span>
                <span className="dock-tooltip">{item.label}</span>
              </motion.span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}