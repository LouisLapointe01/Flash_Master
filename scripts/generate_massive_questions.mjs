// scripts/generate_massive_questions.mjs
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const OWNER_EMAIL = "naviscrew31@gmail.com"; // L'email de ton compte admin
const SEED_TAG = "ai-generated-v1";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCrgXBrm9rjJONddUi7bMVDKyTF6ihva2Q";

// Initialisation Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });

function loadLocalEnvIfNeeded() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf8");
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const index = trimmed.indexOf("=");
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
}

function getSupabaseClient() {
    loadLocalEnvIfNeeded();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) throw new Error("Variables manquantes: NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY");
    return createClient(url, serviceRoleKey);
}

// ============================================
// TAXONOMIE (A étendre autant que voulu)
// ============================================
const CATEGORIES = [
    { name: "Sciences", subcategories: ["Astronomie", "Biologie", "Physique"] },
    { name: "Histoire", subcategories: ["Antiquité", "Histoire de France", "Guerres Mondiales"] },
    { name: "Géographie", subcategories: ["Monde", "France", "Climat"] },
    { name: "Arts", subcategories: ["Peinture", "Cinéma", "Musique"] },
    { name: "Société", subcategories: ["Gastronomie", "Sport", "Jeux Vidéo"] }
];

async function generateQuestions(category, subcategory, count = 10) {
    console.log(`[Gemini] Génération de ${count} questions (15 options) pour ${category} - ${subcategory}...`);
    const prompt = `Génère exactement ${count} questions de quiz en français sur le thème "${category} - ${subcategory}".
    Difficulté : 25% Facile, 60% Moyen, 15% Difficile.
    IMPORTANT : Pour chaque question, génère exactement 15 options de réponse.
    Le format de retour DOIT être un tableau JSON :
    {
      "difficulty": "facile" | "moyen" | "difficile",
      "question": "Texte de la question",
      "options": ["Option Correcte", "Fausse 1", "Fausse 2", "Fausse 3", "Fausse 4", "Fausse 5", "Fausse 6", "Fausse 7", "Fausse 8", "Fausse 9", "Fausse 10", "Fausse 11", "Fausse 12", "Fausse 13", "Fausse 14"],
      "answer": "Option Correcte",
      "explanation": "Explication courte"
    }`;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error(`[Erreur Gemini] Échec pour ${category} - ${subcategory}:`, e.message);
        return [];
    }
}

async function ensureOwnerUser(supabase, email) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error(`Impossible de lire les utilisateurs auth: ${error.message}`);
    const user = data.users.find((item) => (item.email || "").toLowerCase() === email.toLowerCase());
    if (!user) throw new Error(`Utilisateur introuvable dans Auth pour: ${email}`);
    return user.id;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

async function insertIntoSupabase(supabase, ownerId, category, subcategory, questions) {
    if (!questions || questions.length === 0) return;
    
    const levels = ["facile", "moyen", "difficile"];
    
    for (const level of levels) {
        const levelQuestions = questions.filter(q => q.difficulty === level);
        if (levelQuestions.length === 0) continue;

        const levelLabel = capitalize(level);
        const title = `${category}: ${subcategory} - ${levelLabel}`;
        const taxonomyPath = [category, subcategory, levelLabel];

        // 1. Deck
        const { data: deck, error: deckErr } = await supabase.from("decks").insert({
            owner_id: ownerId,
            title: title,
            description: `Deck généré par IA - ${category} > ${subcategory} (${levelLabel})`,
            tags: [category.toLowerCase(), level, SEED_TAG],
            category: category,
            category_path: taxonomyPath,
            visibility: "public"
        }).select("id").single();
        
        if (deckErr) { console.error("Erreur Deck:", deckErr.message); continue; }

        // 2. Quiz
        const { data: quiz, error: quizErr } = await supabase.from("quizzes").insert({
            owner_id: ownerId,
            title: title,
            description: `Quiz généré par IA - ${category} > ${subcategory} (${levelLabel})`,
            tags: [category.toLowerCase(), level, SEED_TAG],
            category: category,
            category_path: taxonomyPath,
            visibility: "public"
        }).select("id").single();

        if (quizErr) { console.error("Erreur Quiz:", quizErr.message); continue; }

        // 3. Insertions
        for (let i = 0; i < levelQuestions.length; i++) {
            const q = levelQuestions[i];
            await supabase.from("flashcards").insert({
                deck_id: deck.id,
                front_text: q.question,
                back_text: q.answer,
                explanation: q.explanation,
                category_path: taxonomyPath,
                position: i
            });

            const { data: quizQ, error: qErr } = await supabase.from("quiz_questions").insert({
                quiz_id: quiz.id,
                question_text: q.question,
                category_path: taxonomyPath,
                position: i
            }).select("id").single();

            if (qErr || !quizQ) continue;

            const answersPayload = q.options.map((opt, idx) => ({
                question_id: quizQ.id,
                answer_text: opt,
                is_correct: (opt === q.answer),
                position: idx
            }));
            await supabase.from("quiz_answers").insert(answersPayload);
        }
        console.log(`[Supabase] ✔️ Inséré : ${title} (${levelQuestions.length} Q&A)`);
    }
}

async function main() {
    const supabase = getSupabaseClient();
    let ownerId;
    try {
        ownerId = await ensureOwnerUser(supabase, OWNER_EMAIL);
    } catch(e) {
        console.error("Erreur Auth:", e.message);
        console.log(`Vérifiez que le compte '${OWNER_EMAIL}' existe dans Auth.`);
        return;
    }

    console.log("=== DÉMARRAGE DE LA GÉNÉRATION DE MASSE ===");
    for (const cat of CATEGORIES) {
        for (const sub of cat.subcategories) {
            const BATCH_SIZE = 10; 
            const REPEATS = 1; 
            
            for(let r = 0; r < REPEATS; r++) {
                const generated = await generateQuestions(cat.name, sub, BATCH_SIZE); 
                if (generated && generated.length > 0) {
                    await insertIntoSupabase(supabase, ownerId, cat.name, sub, generated);
                }
                // Pause de 4 secondes pour éviter le rate-limit de la version gratuite (15 req/min)
                await new Promise(resolve => setTimeout(resolve, 4000)); 
            }
        }
    }
    console.log("=== GÉNÉRATION TERMINÉE ===");
}

main().catch(console.error);
