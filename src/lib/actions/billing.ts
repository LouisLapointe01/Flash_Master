"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Vérifie et consomme un point d'action pour l'utilisateur.
 * Si l'utilisateur est Premium, rien n'est déduit.
 */
export async function consumeActionPoint() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { allowed: false, error: "Non authentifié" };

  // Récupérer le profil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium, action_points, last_points_refresh")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { allowed: false, error: "Profil introuvable" };

  // 1. Si Premium -> Accès illimité
  if (profile.is_premium) return { allowed: true, isPremium: true };

  // 2. Vérifier si recharge nécessaire (toutes les 24h)
  const lastRefresh = new Date(profile.last_points_refresh);
  const now = new Date();
  const diffHours = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);

  if (diffHours >= 24) {
    // Recharge à 50 points
    await supabase
      .from("profiles")
      .update({ action_points: 50, last_points_refresh: now.toISOString() })
      .eq("id", user.id);
    profile.action_points = 50;
  }

  // 3. Vérifier s'il reste des points
  if (profile.action_points <= 0) {
    return { allowed: false, error: "Plus de points d'action. Attendez demain ou passez Premium !" };
  }

  // 4. Consommer 1 point
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ action_points: profile.action_points - 1 })
    .eq("id", user.id);

  if (updateError) return { allowed: false, error: "Erreur lors de la consommation du point" };

  return { allowed: true, remaining: profile.action_points - 1 };
}
