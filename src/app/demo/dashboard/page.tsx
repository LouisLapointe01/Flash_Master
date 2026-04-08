"use client";

import { DEMO_DECKS, DEMO_QUIZZES, DEMO_STUDY_SESSIONS } from "@/lib/demo/data";
import { Layers, HelpCircle, BarChart3, Compass } from "lucide-react";
import Link from "next/link";

export default function DemoDashboard() {
  const cards = [
    { label: "Mes Decks", count: DEMO_DECKS.length, href: "/demo/decks", icon: Layers, color: "bg-indigo-50 text-indigo-600" },
    { label: "Mes Quizzes", count: DEMO_QUIZZES.length, href: "/demo/quizzes", icon: HelpCircle, color: "bg-purple-50 text-purple-600" },
    { label: "Sessions d'étude", count: DEMO_STUDY_SESSIONS.length, href: "/demo/stats", icon: BarChart3, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Bienvenue sur Flash Master</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.color}`}><card.icon size={24} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/demo/decks" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            <Layers size={16} />Voir les Decks
          </Link>
          <Link href="/demo/quizzes" className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium">
            <HelpCircle size={16} />Voir les Quizzes
          </Link>
          <Link href="/demo/stats" className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
            <Compass size={16} />Statistiques
          </Link>
        </div>
      </div>
    </div>
  );
}
