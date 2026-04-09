"use client";

import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";
import { ArrowLeft, Moon, Search, SunMedium, Trophy } from "lucide-react";
import { HudBellIcon, HudCogIcon, HudExitIcon } from "./hud-icons";
import { getTierFromPoints } from "@/lib/utils/ranked";
import { GlobalSearch } from "@/components/ui/global-search";

interface TopbarProps {
  displayName: string;
}

type ThemeMode = "dark" | "light";
type RankHudSummary = {
  points: number;
  bestPoints: number;
  tierLabel: string;
};

function getPageContext(pathname: string) {
  if (pathname.startsWith("/dashboard")) {
    return { title: "Lobby principal", subtitle: "Missions, progression et modes de jeu" };
  }
  if (pathname.startsWith("/decks") && pathname.includes("/study")) {
    return { title: "Run d'etude", subtitle: "Focus total, une carte apres l'autre" };
  }
  if (pathname.startsWith("/decks") && pathname.includes("/edit")) {
    return { title: "Forge de deck", subtitle: "Structure, difficulte et clarté" };
  }
  if (pathname.startsWith("/decks")) {
    return { title: "Arsenal decks", subtitle: "Collections memorisables pretes au combat" };
  }
  if (pathname.startsWith("/quizzes") && pathname.includes("/play")) {
    return { title: "Arena quiz", subtitle: "Round chronometre et reflexes en direct" };
  }
  if (pathname.startsWith("/quizzes") && pathname.includes("/edit")) {
    return { title: "Forge quiz", subtitle: "Questions, rythme et paliers de score" };
  }
  if (pathname.startsWith("/quizzes")) {
    return { title: "Modes quiz", subtitle: "Parcours de verification competitifs" };
  }
  if (pathname.startsWith("/ranked")) {
    return { title: "Mode classe", subtitle: "Montee de ligue et paliers de rang" };
  }
  if (pathname.startsWith("/training")) {
    return { title: "Entrainement", subtitle: "Global, categorie, sous-categorie avec compteurs" };
  }
  if (pathname.startsWith("/check")) {
    return { title: "Soumettre question", subtitle: "Revision communautaire avant publication" };
  }
  if (pathname.startsWith("/social")) {
    return { title: "Social", subtitle: "Escouades, amis et duels prives" };
  }
  if (pathname.startsWith("/stats")) {
    return { title: "Statistiques", subtitle: "Courbes de progression et serie active" };
  }
  if (pathname.startsWith("/explore")) {
    return { title: "Explorer", subtitle: "Decouvertes et tendances de la communaute" };
  }
  if (pathname.startsWith("/suggestions")) {
    return { title: "Suggestions", subtitle: "Idees de features et collaboration" };
  }
  if (pathname.startsWith("/notifications")) {
    return { title: "Notifications", subtitle: "Alertes live et activite recente" };
  }
  if (pathname.startsWith("/settings")) {
    return { title: "Parametres", subtitle: "Profil joueur, preferences et securite" };
  }
  return { title: "Flash Master", subtitle: "Navigation tactique" };
}

export function Topbar({ displayName }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [unreadCount, setUnreadCount] = useState(0);
  const [rankHud, setRankHud] = useState<RankHudSummary | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  });
  const page = getPageContext(pathname);
  const showBackToDashboard = pathname !== "/dashboard";

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function bootstrapHeaderData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setUnreadCount(0);
        setRankHud(null);
        return;
      }

      const [{ count }, { data: generalRank }] = await Promise.all([
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("read", false)
          .eq("user_id", user.id),
        supabase
          .from("ranked_profiles")
          .select("points, best_points")
          .eq("user_id", user.id)
          .eq("scope_type", "general")
          .eq("scope_key", "general")
          .maybeSingle(),
      ]);

      if (!active) return;

      const points = (generalRank as { points: number; best_points: number } | null)?.points ?? 1000;
      const bestPoints = (generalRank as { points: number; best_points: number } | null)?.best_points ?? points;
      const tierLabel = getTierFromPoints(points).label;

      setUnreadCount(count ?? 0);
      setRankHud({ points, bestPoints, tierLabel });

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            setUnreadCount((c) => c + 1);
          }
        )
        .subscribe();
    }

    void bootstrapHeaderData();

    return () => {
      active = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("flash-theme", nextTheme);
    } catch {
      // noop
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    <header
      className="topbar-shell animate-in-up relative z-20 mx-3 mt-3 flex min-h-16 items-center justify-between gap-3 px-4 py-3 lg:mx-6 lg:px-6"
      aria-label={`Session ${displayName}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/dashboard" className="topbar-pill hidden p-2 md:block" title="Retour au dashboard">
          <FlashMasterLogo size="sm" withWordmark={false} />
        </Link>
        {showBackToDashboard ? (
          <Link href="/dashboard" className="topbar-action p-2" title="Retour au dashboard">
            <ArrowLeft size={18} />
          </Link>
        ) : null}
        <div className="min-w-0">
          <p className="neon-title truncate font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)] lg:text-base">{page.title}</p>
          <p className="truncate text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="topbar-pill hidden items-center gap-2 px-3 py-1.5 sm:inline-flex"
          title="Recherche globale (Ctrl+K)"
        >
          <Search size={13} className="text-[var(--text-muted)]" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Rechercher</span>
          <kbd className="rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1 py-0.5 text-[9px] font-bold text-[var(--text-muted)]">⌘K</kbd>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="topbar-action p-2 sm:hidden"
          title="Recherche (Ctrl+K)"
        >
          <Search size={18} />
        </button>

        <Link
          href="/settings?view=rank"
          className="topbar-pill inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-[0.08em] text-[var(--foreground)]"
          title="Mon rang"
        >
          <Trophy size={12} className="text-[var(--primary)]" />
          <span>{rankHud ? `${rankHud.tierLabel} · ${rankHud.points} Elo` : "Rookie · 1000 Elo"}</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="topbar-action p-2"
          title={theme === "dark" ? "Passer en theme clair" : "Passer en theme sombre"}
        >
          {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
        </button>

        <Link
          href="/notifications"
          className="topbar-action relative p-2"
          title="Notifications"
        >
          <HudBellIcon size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-red-500 bg-red-600 text-[10px] font-black text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/settings"
          className="topbar-action p-2"
          title="Parametres"
        >
          <HudCogIcon size={18} />
        </Link>

        <button
          onClick={handleLogout}
          className="topbar-action p-2"
          title="Deconnexion"
        >
          <HudExitIcon size={18} />
        </button>
      </div>
    </header>
    </>
  );
}
