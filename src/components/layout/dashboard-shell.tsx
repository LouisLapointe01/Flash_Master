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
  const inArenaMode = pathname.includes("/play") || pathname.includes("/study");

  if (inArenaMode) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <main className="relative z-10 min-h-screen">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="relative z-10 flex min-h-screen min-w-0 flex-col">
        <Topbar displayName={displayName} />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 lg:px-8 lg:pb-12 lg:pt-6">
          <div className="mx-auto w-full max-w-[1220px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
