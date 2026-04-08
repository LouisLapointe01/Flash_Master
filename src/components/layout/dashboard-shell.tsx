"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "./topbar";
import { BottomDockNav } from "./bottom-dock-nav";
import { PageTransition } from "./page-transition";

interface DashboardShellProps {
  displayName: string;
  children: React.ReactNode;
}

export function DashboardShell({ displayName, children }: DashboardShellProps) {
  const pathname = usePathname();

  const visualTheme = pathname.startsWith("/quizzes")
    ? {
        blobA: "bg-[#2f86ca]/20",
        blobB: "bg-[#df576c]/14",
        blobC: "bg-[#6ea6d4]/14",
      }
    : pathname.startsWith("/decks")
      ? {
          blobA: "bg-[#1bbfcf]/18",
          blobB: "bg-[#0f7a83]/16",
          blobC: "bg-[#96cf7b]/12",
        }
      : pathname.startsWith("/ranked")
        ? {
            blobA: "bg-[#d9ac4a]/18",
            blobB: "bg-[#9f7932]/15",
            blobC: "bg-[#f1d997]/12",
          }
        : pathname.startsWith("/check")
          ? {
              blobA: "bg-[#2f86ca]/16",
              blobB: "bg-[#1bbfcf]/14",
              blobC: "bg-[#9ac7ea]/12",
            }
          : pathname.startsWith("/social")
            ? {
                blobA: "bg-[#de5d5d]/14",
                blobB: "bg-[#2f86ca]/14",
                blobC: "bg-[#f0b5b5]/10",
              }
      : pathname.startsWith("/stats")
        ? {
            blobA: "bg-[#d5aa48]/16",
            blobB: "bg-[#1f6f9d]/15",
            blobC: "bg-[#7dbad0]/12",
          }
        : pathname.startsWith("/explore")
          ? {
              blobA: "bg-[#4a74c3]/16",
              blobB: "bg-[#1bbfcf]/14",
              blobC: "bg-[#86b6de]/12",
            }
          : {
              blobA: "bg-[#1bbfcf]/18",
              blobB: "bg-[#0f7a83]/16",
              blobC: "bg-[#7ec7d8]/10",
            };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className={`animate-float-slow pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full blur-3xl ${visualTheme.blobA}`} />
      <div className={`animate-float-slow pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full blur-3xl ${visualTheme.blobB}`} />
      <div className={`animate-float-slow pointer-events-none absolute left-1/2 top-[55%] h-64 w-64 -translate-x-1/2 rounded-full blur-3xl ${visualTheme.blobC}`} style={{ animationDelay: "120ms" }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[240px] bg-[linear-gradient(180deg,rgba(255,253,247,0.82),rgba(255,253,247,0))]" />

      <div className="relative z-10 flex min-h-screen min-w-0 flex-col">
        <Topbar displayName={displayName} />
        <main className="soft-scroll flex-1 overflow-y-auto px-4 pb-28 pt-4 lg:pl-28 lg:pr-8 lg:pb-20 lg:pt-6">
          <div className="mx-auto w-full max-w-[1220px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <BottomDockNav />
      </div>
    </div>
  );
}
