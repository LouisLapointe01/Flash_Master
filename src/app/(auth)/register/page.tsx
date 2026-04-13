"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="animate-float-slow pointer-events-none absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-[#1bbfcf]/20 blur-3xl" />
      <div className="animate-float-slow pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full bg-[#0f7a83]/18 blur-3xl" />

      <div className="game-panel animate-in-up relative w-full max-w-xl rounded-[2.05rem] border border-[var(--line)] p-8 sm:p-10">
        <div className="mb-8 text-center">
          <FlashMasterLogo size="lg" className="mx-auto justify-center" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Crée ton compte et active ton tableau de progression.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-[1rem] border border-red-400/50 bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Nom d&apos;affichage
            </label>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--line-strong)] focus:ring-4 focus:ring-cyan-400/20"
              placeholder="Votre nom"
            />
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2.5 pr-10 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--line-strong)] focus:ring-4 focus:ring-cyan-400/20"
                placeholder="Minimum 6 caracteres"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[1rem] bg-[linear-gradient(135deg,#0f7a83,#1697a1)] py-3 font-semibold text-white shadow-[0_20px_36px_-22px_rgba(15,122,131,.95)] transition hover:-translate-y-[1px] hover:brightness-110 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus size={18} />
              {loading ? "Creation..." : "Créer mon profil"}
            </span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-bold text-[var(--secondary)] hover:text-[var(--primary)]">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
