"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "./topbar";
import { PageTransition } from "./page-transition";

interface DashboardShellProps {
  displayName: string;
  children: React.ReactNode;
}

export function DashboardShell({ displayName, children }: DashboardShellProps) {
  const pathname = usePathname();
  const inArenaMode = pathname.includes("/play");

  if (inArenaMode) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,.14) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <main className="relative z-10 min-h-screen px-2 py-3 lg:px-6 lg:py-4">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-400/16 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-purple-500/14 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[60%] h-64 w-64 -translate-x-1/2 rounded-full bg-green-400/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen min-w-0 flex-col">
        <Topbar displayName={displayName} />
        <main className="soft-scroll flex-1 overflow-y-auto px-4 pb-10 pt-4 lg:px-8 lg:pb-12 lg:pt-6">
          <div className="mx-auto w-full max-w-[1220px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
