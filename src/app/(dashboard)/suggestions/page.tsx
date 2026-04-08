"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { acceptSuggestion, rejectSuggestion } from "@/lib/actions/suggestions";
import { DiffViewer } from "@/components/suggestions/diff-viewer";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, ChevronDown, ChevronUp, Send, Inbox, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import type { Suggestion } from "@/lib/types";
import Link from "next/link";
import { clsx } from "clsx";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

type Tab = "received" | "sent";

export default function SuggestionsPage() {
  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<Suggestion[]>([]);
  const [sent, setSent] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Received: suggestions targeting my decks/quizzes
      const { data: myDecks } = await supabase.from("decks").select("id").eq("owner_id", user.id);
      const { data: myQuizzes } = await supabase.from("quizzes").select("id").eq("owner_id", user.id);

      const deckIds = myDecks?.map((d) => d.id) ?? [];
      const quizIds = myQuizzes?.map((q) => q.id) ?? [];

      if (deckIds.length > 0 || quizIds.length > 0) {
        let query = supabase
          .from("suggestions")
          .select("*, profiles(display_name)")
          .order("created_at", { ascending: false });

        if (deckIds.length > 0 && quizIds.length > 0) {
          query = query.or(`target_deck_id.in.(${deckIds.join(",")}),target_quiz_id.in.(${quizIds.join(",")})`);
        } else if (deckIds.length > 0) {
          query = query.in("target_deck_id", deckIds);
        } else {
          query = query.in("target_quiz_id", quizIds);
        }

        const { data } = await query;
        setReceived((data as Suggestion[]) ?? []);
      }

      // Sent
      const { data: sentData } = await supabase
        .from("suggestions")
        .select("*, profiles(display_name)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      setSent((sentData as Suggestion[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleAccept(id: string) {
    await acceptSuggestion(id);
    setReceived((prev) => prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s)));
  }

  async function handleReject(id: string) {
    await rejectSuggestion(id);
    setReceived((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)));
  }

  const items = tab === "received" ? received : sent;

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#8c7a5b]" /></div>;

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Suggestions Hub</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Suggestions</h1>
              <p className="mt-1 text-sm text-[#676258]">Flux des propositions recues et envoyees pour les decks et quizzes.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
              <Link href="/suggestions" className="rubric-link rubric-link-active"><MessageSquare size={13} />Suggestions</Link>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTab("received")}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  tab === "received"
                    ? "border-[#54462f] bg-[linear-gradient(140deg,#655438,#4f422e)] text-[#fff9ef]"
                    : "border-[#d4cab8] bg-white text-[#585042] hover:border-[#b9aa90]"
                )}
              >
                <Inbox size={14} /> Recues ({received.length})
              </button>
              <button
                onClick={() => setTab("sent")}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  tab === "sent"
                    ? "border-[#54462f] bg-[linear-gradient(140deg,#655438,#4f422e)] text-[#fff9ef]"
                    : "border-[#d4cab8] bg-white text-[#585042] hover:border-[#b9aa90]"
                )}
              >
                <Send size={14} /> Envoyees ({sent.length})
              </button>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Contribution flow</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">{items.length} proposition(s) dans cet onglet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="game-panel rounded-[1.35rem] border border-[#d9cfbd] py-16 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-[#8c8576]" />
          <p className="text-sm text-[#676258]">Aucune suggestion {tab === "received" ? "recue" : "envoyee"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="game-panel overflow-hidden rounded-[1.2rem] border border-[#d9cfbd]">
              <div
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-[#f7f3ea]"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium text-[#2b303a]">{s.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === "pending" ? "bg-[#f7edd6] text-[#7a5e2f]" :
                      s.status === "accepted" ? "bg-[#e7f2e8] text-[#3f6a46]" : "bg-[#f9e6e6] text-[#8a3d3d]"
                    }`}>
                      {s.status === "pending" ? "En attente" : s.status === "accepted" ? "Acceptee" : "Refusee"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[#676258]">
                    Par {s.profiles?.display_name ?? "—"} · {s.description}
                  </p>
                </div>
                {expanded === s.id ? <ChevronUp size={16} className="text-[#8c8576]" /> : <ChevronDown size={16} className="text-[#8c8576]" />}
              </div>

              {expanded === s.id && (
                <div className="border-t border-[#e5ddce] p-4">
                  <DiffViewer diff={s.diff_payload} />
                  {tab === "received" && s.status === "pending" && (
                    <div className="mt-4 flex gap-2 border-t border-[#e5ddce] pt-4">
                      <Button size="sm" onClick={() => handleAccept(s.id)}>
                        <Check size={14} /> Accepter
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(s.id)}>
                        <X size={14} /> Refuser
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
