import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { canReadSharedContent } from "@/lib/utils/access";
import type { Visibility } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ShareDeckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: deck } = await supabase
    .from("decks")
    .select("*, flashcards(count), profiles(display_name)")
    .eq("share_token", token)
    .single();

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lien invalide</h1>
          <p className="text-gray-500 mt-2">Ce lien de partage n&apos;existe pas ou a expiré.</p>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === deck.owner_id;
  const canRead = canReadSharedContent({
    visibility: (deck.visibility as Visibility) ?? "private",
    isOwner,
    hasValidShareToken: true,
  });

  if (!canRead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acces indisponible</h1>
          <p className="text-gray-500 mt-2">Ce contenu n&apos;est pas partageable via lien.</p>
        </div>
      </div>
    );
  }

  if (user) {
    redirect(`/decks/${deck.id}`);
  }

  const cardCount = Array.isArray(deck.flashcards) && deck.flashcards.length > 0 && "count" in deck.flashcards[0]
    ? (deck.flashcards[0] as { count: number }).count : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl inline-block">
          <Layers size={48} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deck.title}</h1>
          {deck.description && <p className="text-gray-500 mt-2">{deck.description}</p>}
          <p className="text-sm text-gray-400 mt-2">
            Par {(deck as { profiles?: { display_name: string } }).profiles?.display_name ?? "—"} · {cardCount} cartes
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Connectez-vous pour copier <ArrowRight size={16} />
          </Link>
          <Link href="/register" className="block text-sm text-indigo-600 hover:text-indigo-700">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
