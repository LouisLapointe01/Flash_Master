// scripts/import_dynamic.mjs
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnvIfNeeded() {
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

async function run() {
    loadLocalEnvIfNeeded();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const data = JSON.parse(fs.readFileSync("./data/seed_dynamic_questions.json", "utf8"));
    const OWNER_EMAIL = "naviscrew31@gmail.com";

    // 1. Get Owner ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const owner = users.users.find(u => u.email === OWNER_EMAIL);
    if (!owner) throw new Error("Owner not found");

    console.log(`Importation de ${data.length} questions dynamiques...`);

    for (const item of data) {
        const title = `${item.category}: ${item.subcategory} (${item.difficulty})`;
        
        // 2. Create Deck
        const { data: deck } = await supabase.from("decks").insert({
            owner_id: owner.id,
            title: title,
            category: item.category,
            visibility: "public"
        }).select().single();

        // 3. Create Quiz
        const { data: quiz } = await supabase.from("quizzes").insert({
            owner_id: owner.id,
            title: title,
            category: item.category,
            visibility: "public",
            linked_deck_id: deck.id
        }).select().single();

        // 4. Update Deck with link
        await supabase.from("decks").update({ linked_quiz_id: quiz.id }).eq("id", deck.id);

        // 5. Create Flashcard
        await supabase.from("flashcards").insert({
            deck_id: deck.id,
            front_text: item.question,
            back_text: item.answer,
            explanation: item.explanation
        });

        // 6. Create Quiz Question
        const { data: question } = await supabase.from("quiz_questions").insert({
            quiz_id: quiz.id,
            question_text: item.question
        }).select().single();

        // 7. Create 15 Answers
        const answers = item.options.map((opt, idx) => ({
            question_id: question.id,
            answer_text: opt,
            is_correct: opt === item.answer,
            position: idx
        }));
        await supabase.from("quiz_answers").insert(answers);

        console.log(`✔️ Terminé : ${title}`);
    }
}

run().catch(console.error);
