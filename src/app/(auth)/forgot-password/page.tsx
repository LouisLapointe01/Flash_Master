"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="animate-float-slow pointer-events-none absolute -left-20 top-8 h-60 w-60 rounded-full bg-[#1bbfcf]/20 blur-3xl" />
      <div className="animate-float-slow pointer-events-none absolute -right-20 bottom-4 h-56 w-56 rounded-full bg-[#0f7a83]/18 blur-3xl" />

      <div className="game-panel animate-in-up w-full max-w-lg rounded-[2rem] border border-[var(--line)] p-8">
        <div className="mb-8 text-center">
          <FlashMasterLogo size="lg" className="mx-auto justify-center" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Réinitialiser votre mot de passe</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="rounded-[1rem] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
              Vérifiez votre boîte de réception.
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-medium text-[var(--secondary)] hover:text-[var(--primary)]"
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[1rem] bg-[linear-gradient(135deg,#0f7a83,#1697a1)] py-3 font-semibold text-white shadow-[0_20px_36px_-22px_rgba(15,122,131,.95)] transition hover:-translate-y-[1px] hover:brightness-110 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Mail size={18} />
                {loading ? "Envoi..." : "Envoyer le lien"}
              </span>
            </button>

            <p className="text-center text-sm">
              <Link href="/login" className="font-medium text-[var(--secondary)] hover:text-[var(--primary)]">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
