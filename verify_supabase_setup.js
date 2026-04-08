/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) {
        throw new Error("Fichier .env.local introuvable");
    }

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const index = trimmed.indexOf("=");
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
}

async function main() {
    loadEnv();

    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log(`env: URL=${hasUrl} ANON=${hasAnon} SERVICE=${hasService}`);

    if (!hasUrl || !hasService) {
        throw new Error("Variables Supabase manquantes pour verifier le projet.");
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const tables = [
        "profiles",
        "decks",
        "flashcards",
        "quizzes",
        "quiz_questions",
        "quiz_answers",
    ];

    for (const table of tables) {
        const { error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });

        console.log(`${table}: ${error ? `ERROR ${error.message}` : "OK"}`);
    }

    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.log(`buckets: ERROR ${bucketError.message}`);
    } else {
        console.log(`buckets: ${buckets.map((b) => b.id).join(", ")}`);
    }

    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });

    if (usersError) {
        console.log(`auth users: ERROR ${usersError.message}`);
    } else {
        const found = users.users.some(
            (u) => (u.email || "").toLowerCase() === "naviscrew31@gmail.com"
        );
        console.log(`auth user naviscrew31@gmail.com: ${found ? "FOUND" : "NOT_FOUND"}`);
    }
}

main().catch((error) => {
    console.error("verification error:", error.message || error);
    process.exitCode = 1;
});
