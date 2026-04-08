"use client";

import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Bell, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

interface TopbarProps {
  displayName: string;
}

function getPageContext(pathname: string) {
  if (pathname.startsWith("/dashboard")) {
    return { title: "Tableau de bord", subtitle: "Vision globale et actions rapides" };
  }
  if (pathname.startsWith("/decks") && pathname.includes("/study")) {
    return { title: "Mode etude", subtitle: "Concentration maximale, une carte a la fois" };
  }
  if (pathname.startsWith("/decks") && pathname.includes("/edit")) {
    return { title: "Edition deck", subtitle: "Structure et qualite pedagogique" };
  }
  if (pathname.startsWith("/decks")) {
    return { title: "Decks", subtitle: "Collections memorisables" };
  }
  if (pathname.startsWith("/quizzes") && pathname.includes("/play")) {
    return { title: "Session quiz", subtitle: "Evaluation sans biais visuel" };
  }
  if (pathname.startsWith("/quizzes") && pathname.includes("/edit")) {
    return { title: "Edition quiz", subtitle: "Questions, rythme, progression" };
  }
  if (pathname.startsWith("/quizzes")) {
    return { title: "Quizzes", subtitle: "Parcours de verification" };
  }
  if (pathname.startsWith("/ranked")) {
    return { title: "Mode classe", subtitle: "Progression competitive par paliers" };
  }
  if (pathname.startsWith("/check")) {
    return { title: "Check communaute", subtitle: "Validation des questions avant integration" };
  }
  if (pathname.startsWith("/social")) {
    return { title: "Social", subtitle: "Amis, associations et parties privees" };
  }
  if (pathname.startsWith("/stats")) {
    return { title: "Statistiques", subtitle: "Suivi intelligent des performances" };
  }
  if (pathname.startsWith("/explore")) {
    return { title: "Explorer", subtitle: "Decouvertes de la communaute" };
  }
  if (pathname.startsWith("/suggestions")) {
    return { title: "Suggestions", subtitle: "Collaboration et ameliorations" };
  }
  if (pathname.startsWith("/notifications")) {
    return { title: "Notifications", subtitle: "Activite recente et alertes" };
  }
  if (pathname.startsWith("/settings")) {
    return { title: "Parametres", subtitle: "Profil, preferences et securite" };
  }
  return { title: "Flash Master", subtitle: "Navigation intelligente" };
}

export function Topbar({ displayName }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [unreadCount, setUnreadCount] = useState(0);
  const page = getPageContext(pathname);

  useEffect(() => {
    async function fetchUnread() {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      setUnreadCount(count ?? 0);
    }
    fetchUnread();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="game-panel animate-in-up relative z-20 mx-3 mt-3 flex min-h-16 items-center justify-between gap-3 rounded-[1.35rem] border border-[#dbd2c4] px-4 py-3 lg:mx-6 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden rounded-[1rem] border border-[#ddd2be] bg-white/88 p-2.5 lg:block">
          <FlashMasterLogo size="sm" withWordmark={false} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[0.01em] text-[#252b34] lg:text-base">{page.title}</p>
          <p className="truncate text-xs text-[#6b675f]">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[#d8cdb8] bg-white/88 px-2.5 py-1.5 text-xs font-semibold text-[#4f4738] sm:inline-flex">
          <Sparkles size={12} className="text-[#8f6d2f]" />
          {displayName}
        </div>

        <div className="hidden min-w-[220px] items-center rounded-full border border-[#dfd5c4] bg-white/86 px-3 py-1.5 text-xs text-[#756e60] lg:inline-flex">
          Command center
        </div>

        <Link
          href="/notifications"
          className="relative rounded-[0.95rem] border border-[#d8cdb8] bg-white/86 p-2 text-[#675f52] transition hover:border-[#b8ab95] hover:text-[#3f3a31]"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#de5d5d] text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/settings"
          className="rounded-[0.95rem] border border-[#d8cdb8] bg-white/86 p-2 text-[#675f52] transition hover:border-[#b8ab95] hover:text-[#3f3a31]"
          title="Parametres"
        >
          <Settings size={18} />
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-[0.95rem] border border-[#d8cdb8] bg-white/86 p-2 text-[#675f52] transition hover:border-[#d18c8c] hover:text-[#9f3c3c]"
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
