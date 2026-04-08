"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import {
  LayoutDashboard, Layers, HelpCircle, BarChart3, Bell, Menu, X, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/demo/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/demo/decks", label: "Decks", icon: Layers },
  { href: "/demo/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/demo/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/demo/notifications", label: "Notifications", icon: Bell },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <Link href="/demo/dashboard" className="text-xl font-bold text-indigo-600">Flash Master</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={20} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                <item.icon size={18} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 py-2 text-xs text-amber-600 bg-amber-50 rounded-lg text-center font-medium">
            Mode Démo
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu size={22} /></button>
          <div className="lg:flex-1" />
          <div className="flex items-center gap-3">
            <Link href="/demo/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">2</span>
            </Link>
            <span className="text-sm text-gray-700 font-medium hidden sm:block">Utilisateur Démo</span>
            <button onClick={() => { localStorage.removeItem("flash_master_demo"); router.push("/login"); }}
              className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100" title="Quitter la démo">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
