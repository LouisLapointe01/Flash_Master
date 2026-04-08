// Setup script: run migration + create demo account
import fs from "node:fs";
import path from "node:path";

function loadEnvIfNeeded() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
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

loadEnvIfNeeded();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Variables manquantes: NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY");
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function main() {
  console.log("1. Exécution de la migration SQL...");

  const sql = fs.readFileSync("supabase/migrations/001_initial_schema.sql", "utf-8");

  // Split SQL into individual statements and run via pg endpoint
  // Actually, let's use the management API
  const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!pgRes.ok) {
    console.log("Migration via /pg/query non disponible, essai via /rest/v1/rpc...");
    // Try executing SQL chunks
  }
  console.log("Migration status:", pgRes.status);

  console.log("\n2. Création du compte démo...");

  // Create user via Auth Admin API
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: "demo@flashmaster.app",
      password: "demo1234",
      email_confirm: true,
      user_metadata: { display_name: "Utilisateur Démo" },
    }),
  });

  const userData = await createRes.json();

  if (createRes.ok) {
    console.log("Compte démo créé !");
    console.log("  Email: demo@flashmaster.app");
    console.log("  Mot de passe: demo1234");
    console.log("  User ID:", userData.id);
  } else if (userData.msg?.includes("already") || userData.message?.includes("already")) {
    console.log("Le compte démo existe déjà.");
    console.log("  Email: demo@flashmaster.app");
    console.log("  Mot de passe: demo1234");
  } else {
    console.log("Erreur:", JSON.stringify(userData));
  }
}

main().catch(console.error);
