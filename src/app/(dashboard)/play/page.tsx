"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { Minus, Play, Plus, Swords, Target, Users } from "lucide-react";

type LaunchMode = "ranked" | "training";
type QueueMode = "solo_q" | "duo_q" | "flex";

type QueueConfig = {
    key: QueueMode;
    label: string;
    subtitle: string;
    partySlots: number;
    maxPlayers: number;
};

const RANKED_QUEUES: QueueConfig[] = [
    {
        key: "solo_q",
        label: "Solo Q",
        subtitle: "File solo competitive",
        partySlots: 1,
        maxPlayers: 2,
    },
    {
        key: "duo_q",
        label: "Duo Q",
        subtitle: "Entre a deux en file classee",
        partySlots: 2,
        maxPlayers: 4,
    },
    {
        key: "flex",
        label: "Flex 5v5",
        subtitle: "Escouade complete en 5 contre 5",
        partySlots: 5,
        maxPlayers: 10,
    },
];

const TRAINING_MAX_PARTY = 5;

function getTierKey(points: number) {
    if (points >= 3500) return "grandmaster";
    if (points >= 2850) return "master";
    if (points >= 2300) return "diamond";
    if (points >= 1850) return "platinum";
    if (points >= 1450) return "gold";
    if (points >= 1100) return "silver";
    if (points >= 800) return "bronze";
    return "rookie";
}

function getQueueConfig(queueMode: QueueMode) {
    return RANKED_QUEUES.find((queue) => queue.key === queueMode) ?? RANKED_QUEUES[0];
}

export default function PlayPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [mode, setMode] = useState<LaunchMode>("ranked");
    const [queueMode, setQueueMode] = useState<QueueMode>("solo_q");
    const [partySize, setPartySize] = useState(1);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const queueConfig = getQueueConfig(queueMode);
    const maxSlots = mode === "ranked" ? queueConfig.partySlots : TRAINING_MAX_PARTY;

    const effectivePartySize = Math.min(Math.max(1, partySize), maxSlots);

    async function createLobby() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Session introuvable. Reconnecte-toi.");
        }

        const { data: profileData } = await supabase
            .from("ranked_profiles")
            .select("points")
            .eq("user_id", user.id)
            .eq("scope_type", "general")
            .eq("scope_key", "general")
            .maybeSingle();

        const points = (profileData as { points: number } | null)?.points ?? 1000;
        const tierKey = getTierKey(points);

        const rankedConfig = getQueueConfig(queueMode);
        const maxPlayers = mode === "ranked" ? rankedConfig.maxPlayers : Math.max(2, effectivePartySize * 2);
        const scopeKey =
            mode === "ranked"
                ? `queue:${queueMode}|party:${effectivePartySize}`
                : `training|party:${effectivePartySize}`;

        const { data: lobbyData, error: lobbyError } = await supabase
            .from("game_lobbies")
            .insert({
                mode,
                status: "forming",
                scope_type: "general",
                scope_key: scopeKey,
                max_players: maxPlayers,
                target_duration_seconds: mode === "ranked" ? 900 : 1200,
                pause_budget_seconds: 90,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (lobbyError || !lobbyData?.id) {
            throw new Error(lobbyError?.message ?? "Impossible de creer le lobby.");
        }

        const { error: joinError } = await supabase.from("game_lobby_players").insert({
            lobby_id: lobbyData.id,
            user_id: user.id,
            points_snapshot: points,
            tier_key: tierKey,
            is_ready: false,
        });

        if (joinError) {
            throw new Error(joinError.message);
        }

        router.push(`/ranked/lobby/${lobbyData.id}`);
    }

    async function handleLaunch() {
        setBusy(true);
        setError(null);

        try {
            if (effectivePartySize === 1) {
                if (mode === "ranked") {
                    router.push("/ranked?queue=solo_q");
                } else {
                    router.push("/training?focus=hotspots");
                }
                return;
            }

            await createLobby();
        } catch (launchError) {
            setError(launchError instanceof Error ? launchError.message : "Impossible de lancer la partie.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="play-premium space-y-4">
            <section className="play-command-stage game-panel precision-hud-panel animate-in-up p-5 lg:p-6">
                <div className="play-command-grid">
                    <div>
                        <p className="hud-chip">Play Console</p>
                        <h1 className="page-title mt-2">Jouer</h1>
                        <p className="mt-2 text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Composer · Verrouiller · Lancer</p>
                    </div>

                    <div className="play-status-core">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[var(--text-muted)]">Mode actif</p>
                        <p className="mt-1 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
                            {mode === "ranked" ? `${queueConfig.label}` : "Training"}
                        </p>
                        <p className="mt-3 text-[11px] uppercase tracking-[0.09em] text-[var(--text-muted)]">Escouade</p>
                        <p className="mt-1 font-mono text-base font-black text-[var(--foreground)]">{effectivePartySize}/{maxSlots}</p>
                    </div>
                </div>
            </section>

            <section className="game-panel precision-hud-panel animate-in-up p-4" style={{ animationDelay: "60ms" }}>
                <div className="grid gap-3 lg:grid-cols-2">
                    <button
                        type="button"
                        data-cursor="interactive"
                        onClick={() => setMode("ranked")}
                        className={clsx(
                            "play-mode-card precision-grid-dot p-4 text-left",
                            mode === "ranked" && "is-active is-ranked"
                        )}
                    >
                        <p className="inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
                            <Swords size={14} /> Classe
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Solo Q / Duo Q / Flex</p>
                    </button>

                    <button
                        type="button"
                        data-cursor="interactive"
                        onClick={() => setMode("training")}
                        className={clsx(
                            "play-mode-card precision-grid-dot p-4 text-left",
                            mode === "training" && "is-active is-training"
                        )}
                    >
                        <p className="inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
                            <Target size={14} /> Training
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Precision focus</p>
                    </button>
                </div>
            </section>

            {mode === "ranked" ? (
                <section className="game-panel precision-hud-panel animate-in-up p-4" style={{ animationDelay: "90ms" }}>
                    <div className="grid gap-3 lg:grid-cols-3">
                        {RANKED_QUEUES.map((queue) => (
                            <button
                                key={queue.key}
                                type="button"
                                data-cursor="interactive"
                                onClick={() => {
                                    setQueueMode(queue.key);
                                    setPartySize(1);
                                }}
                                className={clsx(
                                    "play-queue-card precision-grid-dot p-4 text-left",
                                    queueMode === queue.key && "is-active"
                                )}
                            >
                                <p className="font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">{queue.label}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{queue.partySlots} slots · {queue.maxPlayers} joueurs</p>
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="game-panel precision-hud-panel animate-in-up p-4" style={{ animationDelay: "120ms" }}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        <Users size={13} /> Escouade
                    </p>

                    <div className="inline-flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPartySize((current) => Math.max(1, current - 1))}
                            disabled={busy || effectivePartySize <= 1}
                        >
                            <Minus size={13} />
                        </Button>
                        <span className="min-w-12 text-center font-mono text-sm font-black text-[var(--foreground)]">
                            {effectivePartySize}/{maxSlots}
                        </span>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPartySize((current) => Math.min(maxSlots, current + 1))}
                            disabled={busy || effectivePartySize >= maxSlots}
                        >
                            <Plus size={13} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: maxSlots }).map((_, index) => {
                        const filled = index < effectivePartySize;
                        const isMe = index === 0;
                        return (
                            <div
                                key={`slot-${index + 1}`}
                                className={clsx(
                                    "play-slot-card precision-grid-dot p-3",
                                    filled && "is-filled"
                                )}
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Slot {index + 1}</p>
                                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{filled ? (isMe ? "Toi" : "Allie") : "Libre"}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="play-launch-bar mt-4 flex flex-wrap items-center justify-between gap-3 p-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                        {effectivePartySize === 1
                            ? mode === "ranked"
                                ? "Solo instant"
                                : "Training instant"
                            : "Creation du lobby"}
                    </p>

                    <Button className="play-launch-cta" size="lg" disabled={busy} onClick={() => void handleLaunch()}>
                        <Play size={16} /> {busy ? "Lancement..." : "Lancer"}
                    </Button>
                </div>

                {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
            </section>
        </div>
    );
}
