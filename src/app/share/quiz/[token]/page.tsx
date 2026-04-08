import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShareQuizPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(count), profiles(display_name)")
    .eq("share_token", token)
    .single();

  if (!quiz) {
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
  if (user) {
    redirect(`/quizzes/${quiz.id}`);
  }

  const questionCount = Array.isArray(quiz.quiz_questions) && quiz.quiz_questions.length > 0 && "count" in quiz.quiz_questions[0]
    ? (quiz.quiz_questions[0] as { count: number }).count : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl inline-block">
          <HelpCircle size={48} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-500 mt-2">{quiz.description}</p>}
          <p className="text-sm text-gray-400 mt-2">
            Par {(quiz as { profiles?: { display_name: string } }).profiles?.display_name ?? "—"} · {questionCount} questions
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Connectez-vous pour copier <ArrowRight size={16} />
          </Link>
          <Link href="/register" className="block text-sm text-purple-600 hover:text-purple-700">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
