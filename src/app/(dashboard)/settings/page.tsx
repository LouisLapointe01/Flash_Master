"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Upload, Shield, Layers, HelpCircle, Swords, ShieldCheck, Users, Settings, Sparkles } from "lucide-react";
import { compressImage } from "@/lib/utils/image-compression";
import { uploadImageWithApi } from "@/lib/utils/storage-upload";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [blockSuggestions, setBlockSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        const p = data as Profile;
        setProfile(p);
        setDisplayName(p.display_name);
        setBlockSuggestions(p.block_suggestions);
        if (p.avatar_url) setAvatarPreview(p.avatar_url);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatarFile) {
        const compressed = await compressImage(avatarFile);
        avatarUrl = await uploadImageWithApi("avatars", compressed);
      }

      // Update profile
      await supabase.from("profiles").update({
        display_name: displayName,
        avatar_url: avatarUrl,
        block_suggestions: blockSuggestions,
      }).eq("id", user.id);

      // Update email if changed
      if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }

      // Update password if provided
      if (newPassword.length > 0) {
        if (newPassword.length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères");
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setNewPassword("");
      }

      setMessage("Paramètres sauvegardés !");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    // Note: account deletion needs a server-side action with service_role key
    // For now, sign out and inform user
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#8c7a5b]" /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Workspace Settings</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Parametres</h1>
              <p className="mt-1 text-sm text-[#676258]">Profil, securite et preferences de collaboration.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
              <Link href="/settings" className="rubric-link rubric-link-active"><Settings size={13} />Settings</Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Personal controls</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Centre de controle du compte et des droits de suggestion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-[1rem] px-4 py-3 text-sm ${message.includes("Erreur") || message.includes("doit") ? "border border-red-200 bg-red-50 text-red-600" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}

      {/* Avatar */}
      <div className="game-panel rounded-[1.3rem] border border-[#d9cfbd] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#2b303a]">Photo de profil</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#f1ece2]">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" fill unoptimized className="object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#8a8375]">{displayName[0]?.toUpperCase() ?? "?"}</span>
            )}
          </div>
          <label className="cursor-pointer">
            <Button variant="secondary" size="sm" type="button" onClick={() => document.getElementById("avatar-input")?.click()}>
              <Upload size={14} /> Changer
            </Button>
            <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      {/* Profile info */}
      <div className="game-panel rounded-[1.3rem] border border-[#d9cfbd] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#2b303a]">Informations</h2>
        <Input
          id="displayName"
          label="Nom d'affichage"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Nouveau mot de passe (laisser vide pour ne pas changer)"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 6 caractères"
        />
      </div>

      {/* Preferences */}
      <div className="game-panel rounded-[1.3rem] border border-[#d9cfbd] p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2b303a]">
          <Shield size={18} /> Préférences
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={blockSuggestions}
            onChange={(e) => setBlockSuggestions(e.target.checked)}
            className="h-4 w-4 rounded text-[#7a6643]"
          />
          <span className="text-sm text-[#565144]">Bloquer les suggestions sur tous mes decks/quizzes</span>
        </label>
      </div>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
        <Save size={16} /> {saving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>

      {/* Danger zone */}
      <div className="game-panel rounded-[1.3rem] border border-red-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Zone dangereuse</h2>
        {!showDeleteConfirm ? (
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} /> Supprimer mon compte
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600">Êtes-vous sûr ? Cette action est irréversible.</p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
                Confirmer la suppression
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
