import { LobbyModeLauncher } from "@/components/lobby/lobby-mode-launcher";
import Link from "next/link";
import { BarChart3, Bell, Compass, HelpCircle, Layers, MessageSquare, Settings, ShieldCheck } from "lucide-react";

const DASHBOARD_BRICKS = [
  {
    href: "/quizzes",
    title: "Mes quizzes",
    description: "Creer, modifier et lancer tes parcours de questions.",
    icon: HelpCircle,
  },
  {
    href: "/decks",
    title: "Mes decks",
    description: "Organiser tes cartes de revision et sessions d'etude.",
    icon: Layers,
  },
  {
    href: "/check",
    title: "Soumettre une question",
    description: "Propose une question et envoie-la en verification communautaire.",
    icon: ShieldCheck,
  },
  {
    href: "/stats",
    title: "Statistiques",
    description: "Suis ton evolution, ton rythme et tes performances recentes.",
    icon: BarChart3,
  },
  {
    href: "/explore",
    title: "Explorer",
    description: "Decouvre du contenu et des tendances de la communaute.",
    icon: Compass,
  },
  {
    href: "/notifications",
    title: "Notifications",
    description: "Consulte les alertes, validations et activites importantes.",
    icon: Bell,
  },
  {
    href: "/suggestions",
    title: "Suggestions",
    description: "Propose des idees d'evolution et collabore sur la roadmap.",
    icon: MessageSquare,
  },
  {
    href: "/settings",
    title: "Parametres",
    description: "Gere ton profil, tes preferences et ton espace joueur.",
    icon: Settings,
  },
] as const;

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="game-panel animate-in-up p-6 lg:p-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="hud-chip">Menu principal</p>
          <h1 className="page-title mt-4">Flash Master</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--text-muted)] lg:text-base">
            Choisis ton mode de jeu, puis clique sur Jouer pour lancer le lobby.
          </p>

          <LobbyModeLauncher />
        </div>
      </section>

      <section className="game-panel animate-in-up p-5 lg:p-6" style={{ animationDelay: "80ms" }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="hud-chip">Briques rapides</p>
            <h2 className="mt-2 font-mono text-lg font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
              Autres modules
            </h2>
          </div>
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Apres le launcher</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_BRICKS.map((brick) => (
            <Link
              key={brick.href}
              href={brick.href}
              className="interactive-card rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
                    {brick.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{brick.description}</p>
                </div>
                <brick.icon size={16} className="shrink-0 text-[var(--secondary)]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
