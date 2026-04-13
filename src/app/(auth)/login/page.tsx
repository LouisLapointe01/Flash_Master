"use client";

import { createClient } from "@/lib/supabase/client";
import { useDemo } from "@/lib/demo/context";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff, Play } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { enterDemo } = useDemo();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let authError;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    } catch {
      setError("Impossible de joindre le serveur. Vérifie ta connexion.");
      setLoading(false);
      return;
    }

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function handleDemo() {
    enterDemo();
    router.push("/demo/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="animate-float-slow pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#2f86ca]/24 blur-3xl" />
      <div className="animate-float-slow pointer-events-none absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-[#f0b548]/24 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(50,96,158,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(50,96,158,.14) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="game-panel animate-in-up relative w-full max-w-xl rounded-[2.05rem] border border-[var(--line)] p-8 sm:p-10">
        <div className="mb-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FlashMasterLogo size="lg" />
            <span className="hud-chip">Acces joueur</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Entre dans l&apos;arene d&apos;apprentissage</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Connecte-toi pour reprendre ta progression, tes runs et tes modes classes.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
            <p className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-1 text-center font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Decks</p>
            <p className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-1 text-center font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Quiz</p>
            <p className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-1 text-center font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Classe</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-[1rem] border border-red-400/50 bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--line-strong)] focus:ring-4 focus:ring-cyan-400/20"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5 pr-10 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--line-strong)] focus:ring-4 focus:ring-cyan-400/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-semibold text-[var(--secondary)] hover:text-[var(--primary)]">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[1rem] bg-[linear-gradient(135deg,#0f7a83,#1697a1)] py-3 font-semibold text-white shadow-[0_20px_36px_-22px_rgba(15,122,131,.95)] transition hover:-translate-y-[1px] hover:brightness-110 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <LogIn size={18} />
              {loading ? "Connexion..." : "Lancer ma session"}
            </span>
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--line)]" />
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">ou</span>
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <button
          onClick={handleDemo}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] py-3 font-semibold text-[var(--foreground)] transition hover:-translate-y-[1px] hover:border-[var(--line-strong)]"
        >
          <span className="inline-flex items-center gap-2">
            <Play size={18} />
            Entrer en mode demo
          </span>
        </button>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-bold text-[var(--secondary)] hover:text-[var(--primary)]">
            Créer un profil joueur
          </Link>
        </p>
      </div>
    </div>
  );
}
