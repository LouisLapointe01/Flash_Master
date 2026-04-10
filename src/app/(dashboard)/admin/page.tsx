"use client";

import { HudStatsIcon, HudCogIcon } from "@/components/layout/hud-icons";

export default function AdminPage() {
  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Administration</h1>
        <p className="text-zinc-500 mt-1">Gérez la plateforme et surveillez les statistiques globales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-zinc-950 p-2 text-primary">
              <HudStatsIcon size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Utilisateurs</h3>
          </div>
          <p className="text-3xl font-black">1,284</p>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">+12% cette semaine</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-zinc-950 p-2 text-secondary">
              <HudStatsIcon size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Questions</h3>
          </div>
          <p className="text-3xl font-black">8,432</p>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">Sync Active</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-zinc-950 p-2 text-tertiary">
              <HudStatsIcon size={20} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Premium</h3>
          </div>
          <p className="text-3xl font-black">342</p>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">1.99€/mois</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <HudCogIcon size={20} className="text-zinc-500" />
          Outils de modération
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p className="font-bold text-sm">Signalements de contenu</p>
              <p className="text-xs text-zinc-500">3 nouveaux signalements en attente.</p>
            </div>
            <button className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-700 transition">Voir</button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p className="font-bold text-sm">Journal d&apos;erreurs</p>
              <p className="text-xs text-zinc-500">Tout fonctionne normalement.</p>
            </div>
            <button className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-700 transition">Consulter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
