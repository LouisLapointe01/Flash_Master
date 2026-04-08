import { createClient } from "@/lib/supabase/server";
import { Layers, HelpCircle, BarChart3, Compass, ShieldCheck, Swords, Users, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: deckCount }, { count: quizCount }, { count: sessionCount }] = await Promise.all([
    supabase.from("decks").select("*", { count: "exact", head: true }).eq("owner_id", user!.id),
    supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("owner_id", user!.id),
    supabase.from("study_sessions").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  const cards = [
    {
      label: "Mes Decks",
      count: deckCount ?? 0,
      href: "/decks",
      icon: Layers,
      iconColor: "text-[#0e8f8f]",
      chip: "bg-[#dcf5f3] text-[#0a6767]",
    },
    {
      label: "Mes Quizzes",
      count: quizCount ?? 0,
      href: "/quizzes",
      icon: HelpCircle,
      iconColor: "text-[#115f89]",
      chip: "bg-[#e3f1ff] text-[#115f89]",
    },
    {
      label: "Sessions d'etude",
      count: sessionCount ?? 0,
      href: "/stats",
      icon: BarChart3,
      iconColor: "text-[#5d6b18]",
      chip: "bg-[#edf7c9] text-[#5d6b18]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.85rem] border border-[#dbd2c4] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="hud-chip">Studio d&apos;apprentissage</p>
            <h1 className="mt-4 text-3xl font-semibold text-[#242833] lg:text-4xl">Un espace calme pour organiser tes connaissances</h1>
            <p className="mt-2 text-sm text-[#6e6a60] lg:text-base">
              Centralise tes decks, tes quizzes et tes sessions dans un board visuel pensé pour le focus.
            </p>
          </div>
          <FlashMasterLogo size="md" className="rounded-2xl border border-[#ddd2be] bg-white/72 px-3 py-2" />
        </div>
      </div>

      <div className="mind-board animate-in-up" style={{ animationDelay: "70ms" }}>
        <div className="mind-note col-span-12 p-5 lg:col-span-7 lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#766f63]">Vue d&apos;ensemble</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <Link key={card.href} href={card.href} className="interactive-card rounded-[1rem] border border-[#ddd3c2] bg-white/86 p-4">
                <p className="text-3xl font-semibold text-[#2c313d]">{card.count}</p>
                <p className="mt-1 text-sm text-[#5f5a51]">{card.label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mind-note col-span-12 p-5 lg:col-span-5 lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#766f63]">Flux rapide</p>
          <p className="mt-2 text-sm text-[#625d54]">Crée, révise, publie. Tout est à portée en un clic.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/decks/new"
              className="inline-flex items-center gap-2 rounded-full border border-[#d2c6b3] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3a33] transition hover:border-[#b7a98f]"
            >
              <Layers size={14} /> Nouveau deck
            </Link>
            <Link
              href="/quizzes/new"
              className="inline-flex items-center gap-2 rounded-full border border-[#d2c6b3] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3a33] transition hover:border-[#b7a98f]"
            >
              <HelpCircle size={14} /> Nouveau quiz
            </Link>
            <Link
              href="/ranked"
              className="inline-flex items-center gap-2 rounded-full border border-[#d2c6b3] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3a33] transition hover:border-[#b7a98f]"
            >
              <Swords size={14} /> Classe
            </Link>
          </div>
        </div>

        {cards.map((card, index) => (
          <Link
            key={card.href}
            href={card.href}
            className="mind-note interactive-card group col-span-12 p-5 md:col-span-6 lg:col-span-4"
            style={{ transform: `rotate(${index % 2 === 0 ? "-0.35deg" : "0.35deg"})` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-[#2a2f39]">{card.label}</p>
                <p className="mt-1 text-sm text-[#6f685b]">Collection personnelle</p>
              </div>
              <div className={`rounded-[1rem] border border-[#e0d7c9] bg-white/88 p-3 ${card.iconColor}`}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] ${card.chip}`}>
                {card.count}
              </span>
              <ArrowUpRight size={16} className="text-[#72695b]" />
            </div>
          </Link>
        ))}

        <div className="mind-note col-span-12 p-5 md:col-span-6 lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#766f63]">Modules</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/check" className="rounded-full border border-[#d6cab8] bg-white px-3 py-1 text-xs font-semibold text-[#3e3a31]">Check</Link>
            <Link href="/social" className="rounded-full border border-[#d6cab8] bg-white px-3 py-1 text-xs font-semibold text-[#3e3a31]">Social</Link>
            <Link href="/explore" className="rounded-full border border-[#d6cab8] bg-white px-3 py-1 text-xs font-semibold text-[#3e3a31]">Explore</Link>
            <Link href="/stats" className="rounded-full border border-[#d6cab8] bg-white px-3 py-1 text-xs font-semibold text-[#3e3a31]">Stats</Link>
          </div>
          <p className="mt-4 inline-flex items-center gap-1 text-xs text-[#7b7262]">
            <Sparkles size={12} />
            Interface optimisée desktop
          </p>
        </div>

        <div className="mind-note col-span-12 p-5 lg:col-span-8">
          <h2 className="text-lg font-semibold text-[#2b303a]">Actions rapides</h2>
          <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/decks/new"
            className="inline-flex items-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#3d5f8f,#304c73)] px-4 py-2.5 text-sm font-semibold text-[#fffdf8] shadow-[0_18px_34px_-20px_rgba(42,58,83,.82)] transition hover:-translate-y-[1px] hover:brightness-110"
          >
            <Layers size={16} />
            Nouveau Deck
          </Link>
          <Link
            href="/quizzes/new"
            className="inline-flex items-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#4a6a96,#3f5b83)] px-4 py-2.5 text-sm font-semibold text-[#fffdf8] shadow-[0_18px_34px_-20px_rgba(48,69,100,.82)] transition hover:-translate-y-[1px] hover:brightness-110"
          >
            <HelpCircle size={16} />
            Nouveau Quiz
          </Link>
          <Link
            href="/ranked"
            className="inline-flex items-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#b88e45,#8e6f3d)] px-4 py-2.5 text-sm font-semibold text-[#fffaf1] shadow-[0_18px_34px_-20px_rgba(93,71,37,.76)] transition hover:-translate-y-[1px] hover:brightness-110"
          >
            <Swords size={16} />
            Mode Classe
          </Link>
          <Link
            href="/check"
            className="inline-flex items-center gap-2 rounded-[1rem] border border-[#d6cab8] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[#3c3a34] transition hover:-translate-y-[1px] hover:border-[#bbac93] hover:bg-white"
          >
            <ShieldCheck size={16} />
            Check Communaute
          </Link>
          <Link
            href="/social"
            className="inline-flex items-center gap-2 rounded-[1rem] border border-[#d6cab8] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[#3c3a34] transition hover:-translate-y-[1px] hover:border-[#bbac93] hover:bg-white"
          >
            <Users size={16} />
            Social
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-[1rem] border border-[#d6cab8] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[#3c3a34] transition hover:-translate-y-[1px] hover:border-[#bbac93] hover:bg-white"
          >
            <Compass size={16} />
            Explorer la communauté
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
