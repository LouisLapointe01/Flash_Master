"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserPremiumStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: subscription }, { data: actionPoints }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, expires_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("action_points")
      .select("balance, daily_cap, last_refill_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isPremium =
    subscription?.plan === "premium" && subscription?.status === "active";

  return {
    isPremium,
    subscription: subscription ?? null,
    actionPoints: actionPoints ?? null,
  };
}

export async function consumeActionPoints(cost: number = 1): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase.rpc("consume_action_points", {
    p_cost: cost,
  });

  if (error) return false;
  return data === true;
}
