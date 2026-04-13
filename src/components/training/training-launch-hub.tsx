"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flame, Layers, Search, Target } from "lucide-react";
import { clsx } from "clsx";
import type { TrainingScopeOption } from "@/lib/utils/training";

export type TrainingHotspot = {
    key: string;
    label: string;
    mistakes: number;
    sessions: number;
    questionCount: number;
    quizCount: number;
    sampleQuizId: string | null;
};

interface TrainingLaunchHubProps {
    scopes: TrainingScopeOption[];
    hotspots: TrainingHotspot[];
    canLaunchTraining: boolean;
}

export function TrainingLaunchHub({ scopes, hotspots, canLaunchTraining }: TrainingLaunchHubProps) {
    const [keyword, setKeyword] = useState("");
    const [level1, setLevel1] = useState("");
    const [level2, setLevel2] = useState("");
    const [level3, setLevel3] = useState("");

    const hierarchicalScopes = useMemo(() => scopes.filter((scope) => scope.depth > 0), [scopes]);

    const level1Options = useMemo(() => {
        return Array.from(new Set(hierarchicalScopes.map((scope) => scope.path[0]).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    }, [hierarchicalScopes]);

    const level2Options = useMemo(() => {
        if (!level1) return [] as string[];
        return Array.from(
            new Set(
                hierarchicalScopes
                    .filter((scope) => scope.path[0] === level1)
                    .map((scope) => scope.path[1])
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));
    }, [hierarchicalScopes, level1]);

    const level3Options = useMemo(() => {
        if (!level1 || !level2) return [] as string[];
        return Array.from(
            new Set(
                hierarchicalScopes
                    .filter((scope) => scope.path[0] === level1 && scope.path[1] === level2)
                    .map((scope) => scope.path[2])
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));
    }, [hierarchicalScopes, level1, level2]);

    const selectedPath = useMemo(() => {
        if (level3) return [level1, level2, level3];
        if (level2) return [level1, level2];
        if (level1) return [level1];
        return [] as string[];
    }, [level1, level2, level3]);

    const filteredScopes = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return scopes.filter((scope) => {
            if (scope.questionCount <= 0 || !scope.sampleQuizId) return false;

            const matchesPath = selectedPath.length === 0
                ? true
                : selectedPath.every((segment, index) => scope.path[index] === segment);

            if (!matchesPath) return false;

            if (!normalizedKeyword) return true;

            const haystack = `${scope.label} ${scope.path.join(" ")} ${scope.key}`.toLowerCase();
            return haystack.includes(normalizedKeyword);
        });
    }, [keyword, scopes, selectedPath]);

    function resetPyramid() {
        setLevel1("");
        setLevel2("");
        setLevel3("");
    }

    return (
        <div className="space-y-4">
            <section className="precision-hud-panel rounded-[1rem] p-4">
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    <Flame size={13} /> Hotspots
                </p>

                {hotspots.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">Aucun hotspot recent.</p>
                ) : (
                    <div className="grid gap-2 lg:grid-cols-2">
                        {hotspots.map((hotspot) => (
                            <article key={hotspot.key} className="precision-grid-dot rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                                <p className="text-sm font-semibold text-[var(--foreground)]">{hotspot.label}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{hotspot.mistakes} err</p>
                                <div className="mt-2">
                                    {hotspot.sampleQuizId ? (
                                        canLaunchTraining ? (
                                            <Link href={`/quizzes/${hotspot.sampleQuizId}/play?mode=training&scope=${encodeURIComponent(hotspot.key)}`}>
                                                <Button size="sm"><Target size={14} /> Lancer</Button>
                                            </Link>
                                        ) : (
                                            <Button size="sm" variant="secondary" disabled>
                                                <Target size={14} /> Points insuffisants
                                            </Button>
                                        )
                                    ) : (
                                        <Button size="sm" variant="secondary" disabled>
                                            <Target size={14} /> Indisponible
                                        </Button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="precision-hud-panel rounded-[1rem] p-4">
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    <Layers size={13} /> Filtre
                </p>

                <div className="grid gap-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                    <label className="relative block">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder="Mot clef"
                            className="w-full rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--line-strong)]"
                        />
                    </label>

                    <select
                        value={level1}
                        onChange={(event) => {
                            setLevel1(event.target.value);
                            setLevel2("");
                            setLevel3("");
                        }}
                        className="rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--line-strong)]"
                    >
                        <option value="">Categorie</option>
                        {level1Options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <select
                        value={level2}
                        onChange={(event) => {
                            setLevel2(event.target.value);
                            setLevel3("");
                        }}
                        disabled={!level1}
                        className="rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--line-strong)] disabled:opacity-50"
                    >
                        <option value="">Sous-categorie</option>
                        {level2Options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <select
                        value={level3}
                        onChange={(event) => setLevel3(event.target.value)}
                        disabled={!level2}
                        className="rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--line-strong)] disabled:opacity-50"
                    >
                        <option value="">Sous-sous-categorie</option>
                        {level3Options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <Button size="sm" variant="secondary" onClick={resetPyramid}>
                        Clear
                    </Button>
                </div>

                <div className="mt-3 space-y-2">
                    {filteredScopes.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">Aucun scope ne correspond a ta recherche.</p>
                    ) : (
                        filteredScopes.map((scope) => (
                            <article
                                key={scope.key}
                                className={clsx(
                                    "precision-grid-dot flex flex-wrap items-center justify-between gap-3 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface)] p-3",
                                    scope.depth === 0 ? "border-[var(--line-strong)]" : ""
                                )}
                            >
                                <div style={{ paddingLeft: `${scope.depth * 0.75}rem` }} className="min-w-0">
                                    <p className="truncate font-mono text-sm font-black uppercase tracking-[0.07em] text-[var(--foreground)]">
                                        {scope.label}
                                    </p>
                                </div>

                                {scope.sampleQuizId ? (
                                    canLaunchTraining ? (
                                        <Link href={`/quizzes/${scope.sampleQuizId}/play?mode=training&scope=${encodeURIComponent(scope.key)}`}>
                                            <Button size="sm">
                                                <Target size={14} /> Lancer
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button size="sm" variant="secondary" disabled title="Points d'action insuffisants">
                                            <Target size={14} /> Points insuffisants
                                        </Button>
                                    )
                                ) : (
                                    <Button size="sm" variant="secondary" disabled>
                                        <Target size={14} /> Indisponible
                                    </Button>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
