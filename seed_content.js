/* eslint-disable @typescript-eslint/no-require-imports */
// Seed script for generic public decks/quizzes.
// Run from project root: node seed_content.js

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const OWNER_EMAIL = "naviscrew31@gmail.com";
const SEED_TAG = "seed-generic-v1";

const CATALOG = [
    {
        category: "Informatique",
        categoryPath: ["Technologie", "Informatique"],
        levels: [
            {
                level: "facile",
                flashcards: [
                    { front: "Que signifie CPU ?", back: "Central Processing Unit", explanation: "Le processeur principal de l'ordinateur." },
                    { front: "Que signifie RAM ?", back: "Random Access Memory", explanation: "Memoire temporaire utilisee pendant l'execution." },
                    { front: "Que fait un systeme d'exploitation ?", back: "Il gere le materiel et les logiciels", explanation: "Exemples: Windows, macOS, Linux." },
                    { front: "Quelle touche sert souvent a copier ?", back: "Ctrl + C", explanation: "Raccourci clavier standard sous Windows/Linux." },
                    { front: "Qu'est-ce qu'un navigateur web ?", back: "Un logiciel pour visiter des sites internet", explanation: "Exemples: Chrome, Firefox, Edge." },
                ],
                questions: [
                    {
                        question: "Quel composant execute les instructions ?",
                        answers: [
                            { text: "CPU", correct: true },
                            { text: "Ecran", correct: false },
                            { text: "Clavier", correct: false },
                            { text: "Souris", correct: false },
                        ],
                    },
                    {
                        question: "RAM est une memoire...",
                        answers: [
                            { text: "Temporaire", correct: true },
                            { text: "Permanente", correct: false },
                            { text: "Optique", correct: false },
                            { text: "Reseau", correct: false },
                        ],
                    },
                    {
                        question: "Quel logiciel permet de naviguer sur internet ?",
                        answers: [
                            { text: "Un navigateur", correct: true },
                            { text: "Un compilateur", correct: false },
                            { text: "Un antivirus", correct: false },
                            { text: "Un BIOS", correct: false },
                        ],
                    },
                ],
            },
            {
                level: "moyen",
                flashcards: [
                    { front: "Quelle est la difference entre HDD et SSD ?", back: "SSD est plus rapide et sans piece mecanique", explanation: "Le HDD est mecanique, plus lent mais souvent moins cher." },
                    { front: "Que signifie HTTP ?", back: "HyperText Transfer Protocol", explanation: "Protocole de communication du web." },
                    { front: "A quoi sert une adresse IP ?", back: "Identifier un appareil sur un reseau", explanation: "IPv4 et IPv6 sont des formats d'adresse." },
                    { front: "Qu'est-ce qu'un commit Git ?", back: "Un enregistrement d'un etat du code", explanation: "Chaque commit contient un historique de changements." },
                    { front: "Quelle commande installe les dependances Node ?", back: "npm install", explanation: "Lit package.json et installe les paquets." },
                ],
                questions: [
                    {
                        question: "Quel stockage est generalement le plus rapide ?",
                        answers: [
                            { text: "SSD", correct: true },
                            { text: "HDD", correct: false },
                            { text: "DVD", correct: false },
                            { text: "Disquette", correct: false },
                        ],
                    },
                    {
                        question: "HTTP est un...",
                        answers: [
                            { text: "Protocole web", correct: true },
                            { text: "Langage de programmation", correct: false },
                            { text: "Type de disque", correct: false },
                            { text: "Modele CPU", correct: false },
                        ],
                    },
                    {
                        question: "Quel outil sert au versionning de code ?",
                        answers: [
                            { text: "Git", correct: true },
                            { text: "Photoshop", correct: false },
                            { text: "Excel", correct: false },
                            { text: "Slack", correct: false },
                        ],
                    },
                ],
            },
            {
                level: "difficile",
                flashcards: [
                    { front: "Qu'est-ce que la complexite Big-O ?", back: "Une mesure de croissance du cout algorithmique", explanation: "Ex: O(n), O(log n), O(n^2)." },
                    { front: "TCP vs UDP ?", back: "TCP fiable, UDP rapide mais sans garantie", explanation: "TCP confirme la reception; UDP non." },
                    { front: "Qu'est-ce qu'une transaction SQL ?", back: "Un bloc d'operations atomiques", explanation: "Respecte ACID si le moteur le permet." },
                    { front: "A quoi sert un index en base de donnees ?", back: "Accelerer les lectures", explanation: "Peut ralentir ecritures et occuper de l'espace." },
                    { front: "Qu'est-ce qu'une API REST ?", back: "Interface HTTP basee sur des ressources", explanation: "Utilise souvent GET/POST/PUT/DELETE." },
                ],
                questions: [
                    {
                        question: "La notation O(log n) est typique de...",
                        answers: [
                            { text: "Recherche dichotomique", correct: true },
                            { text: "Double boucle complete", correct: false },
                            { text: "Tri bulle pire cas", correct: false },
                            { text: "Parcours lineaire", correct: false },
                        ],
                    },
                    {
                        question: "Quel protocole garantit l'ordre et la livraison ?",
                        answers: [
                            { text: "TCP", correct: true },
                            { text: "UDP", correct: false },
                            { text: "ICMP", correct: false },
                            { text: "ARP", correct: false },
                        ],
                    },
                    {
                        question: "A quoi sert principalement un index SQL ?",
                        answers: [
                            { text: "Accelerer les requetes", correct: true },
                            { text: "Crypter la table", correct: false },
                            { text: "Compresser les images", correct: false },
                            { text: "Supprimer les doublons automatiquement", correct: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        category: "Biologie",
        categoryPath: ["Science", "Biologie"],
        levels: [
            {
                level: "facile",
                flashcards: [
                    { front: "Quelle est l'unite de base du vivant ?", back: "La cellule", explanation: "Tous les organismes sont composes de cellules." },
                    { front: "Quel organe pompe le sang ?", back: "Le coeur", explanation: "Il alimente les tissus via la circulation." },
                    { front: "Que transportent les globules rouges ?", back: "L'oxygene", explanation: "Grace a l'hemoglobine." },
                    { front: "Que produisent les plantes par photosynthese ?", back: "Du glucose et de l'oxygene", explanation: "A partir de CO2, eau et lumiere." },
                    { front: "Quel est le support de l'information genetique ?", back: "L'ADN", explanation: "Molecule en double helice." },
                ],
                questions: [
                    {
                        question: "L'unite du vivant est...",
                        answers: [
                            { text: "La cellule", correct: true },
                            { text: "Le neurone", correct: false },
                            { text: "Le chromosome", correct: false },
                            { text: "Le noyau", correct: false },
                        ],
                    },
                    {
                        question: "Quel organe fait circuler le sang ?",
                        answers: [
                            { text: "Le coeur", correct: true },
                            { text: "Le foie", correct: false },
                            { text: "Le rein", correct: false },
                            { text: "Le pancréas", correct: false },
                        ],
                    },
                    {
                        question: "Que portent surtout les globules rouges ?",
                        answers: [
                            { text: "L'oxygene", correct: true },
                            { text: "Le calcium", correct: false },
                            { text: "Le glucose", correct: false },
                            { text: "Les hormones", correct: false },
                        ],
                    },
                ],
            },
            {
                level: "moyen",
                flashcards: [
                    { front: "Qu'est-ce qu'un enzyme ?", back: "Un catalyseur biologique", explanation: "Il accelere une reaction chimique." },
                    { front: "Que signifie homeostasie ?", back: "Maintien de l'equilibre interne", explanation: "Ex: regulation de la temperature corporelle." },
                    { front: "Fonction principale des mitochondries ?", back: "Produire de l'energie (ATP)", explanation: "Souvent appelees centrales energetiques." },
                    { front: "Difference entre ADN et ARN ?", back: "ADN double brin, ARN generalement simple brin", explanation: "Leurs roles biologiques different aussi." },
                    { front: "Qu'est-ce qu'une synapse ?", back: "Jonction entre neurones", explanation: "Permet la transmission de signaux." },
                ],
                questions: [
                    {
                        question: "Un enzyme sert principalement a...",
                        answers: [
                            { text: "Accelerer une reaction", correct: true },
                            { text: "Stocker l'ADN", correct: false },
                            { text: "Transporter l'oxygene", correct: false },
                            { text: "Detruire les cellules", correct: false },
                        ],
                    },
                    {
                        question: "Les mitochondries produisent surtout...",
                        answers: [
                            { text: "ATP", correct: true },
                            { text: "ADN", correct: false },
                            { text: "Hemoglobine", correct: false },
                            { text: "Insuline", correct: false },
                        ],
                    },
                    {
                        question: "L'homeostasie correspond a...",
                        answers: [
                            { text: "L'equilibre interne", correct: true },
                            { text: "La division cellulaire", correct: false },
                            { text: "La photosynthese", correct: false },
                            { text: "L'immunite acquise", correct: false },
                        ],
                    },
                ],
            },
            {
                level: "difficile",
                flashcards: [
                    { front: "Qu'est-ce que la transcription genetique ?", back: "Synthese d'ARN a partir d'ADN", explanation: "Premiere etape de l'expression genetique." },
                    { front: "Role des ribosomes ?", back: "Synthese des proteines", explanation: "Ils traduisent l'ARNm." },
                    { front: "Qu'est-ce qu'un potentiel d'action ?", back: "Variation rapide du potentiel membranaire neuronal", explanation: "Permet la transmission nerveuse." },
                    { front: "Que decrit la selection naturelle ?", back: "Survie/reproduction preferentielles de traits avantageux", explanation: "Mecanisme central de l'evolution." },
                    { front: "Difference immunite innee/adaptative ?", back: "Innee rapide non specifique, adaptative specifique avec memoire", explanation: "L'adaptative implique lymphocytes B/T." },
                ],
                questions: [
                    {
                        question: "La transcription produit principalement...",
                        answers: [
                            { text: "ARN", correct: true },
                            { text: "ADN", correct: false },
                            { text: "Lipides", correct: false },
                            { text: "ATP", correct: false },
                        ],
                    },
                    {
                        question: "Les ribosomes sont le site de...",
                        answers: [
                            { text: "La synthese proteique", correct: true },
                            { text: "La replication ADN", correct: false },
                            { text: "La glycolyse", correct: false },
                            { text: "La mitose", correct: false },
                        ],
                    },
                    {
                        question: "L'immunite adaptative est surtout...",
                        answers: [
                            { text: "Specifique avec memoire", correct: true },
                            { text: "Immediate et non specifique", correct: false },
                            { text: "Limitee aux plantes", correct: false },
                            { text: "Absente chez l'humain", correct: false },
                        ],
                    },
                ],
            },
        ],
    },
];

function loadLocalEnvIfNeeded() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return;
    }

    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) {
        return;
    }

    const content = fs.readFileSync(envPath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
            continue;
        }

        const index = trimmed.indexOf("=");
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

function getSupabaseClient() {
    loadLocalEnvIfNeeded();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            "Variables manquantes: NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY"
        );
    }

    return createClient(url, serviceRoleKey);
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

async function ensurePublicBucket(supabase, bucketId) {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        throw new Error(`Impossible de lister les buckets: ${listError.message}`);
    }

    const existing = (buckets || []).find((bucket) => bucket.id === bucketId);
    if (!existing) {
        const { error: createError } = await supabase.storage.createBucket(bucketId, {
            public: true,
            fileSizeLimit: "5MB",
        });

        if (createError) {
            throw new Error(`Creation du bucket ${bucketId} echouee: ${createError.message}`);
        }

        return "created";
    }

    if (!existing.public) {
        const { error: updateError } = await supabase.storage.updateBucket(bucketId, {
            public: true,
            fileSizeLimit: "5MB",
        });

        if (updateError) {
            throw new Error(`Mise a jour du bucket ${bucketId} echouee: ${updateError.message}`);
        }

        return "updated";
    }

    return "exists";
}

async function ensureOwnerUser(supabase, email) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
        throw new Error(`Impossible de lire les utilisateurs auth: ${error.message}`);
    }

    const user = data.users.find((item) => (item.email || "").toLowerCase() === email.toLowerCase());
    if (!user) {
        throw new Error(`Utilisateur introuvable dans Auth pour: ${email}`);
    }

    const displayName = email.split("@")[0];
    const { error: profileError } = await supabase.from("profiles").upsert(
        {
            id: user.id,
            display_name: displayName,
        },
        { onConflict: "id" }
    );

    if (profileError) {
        throw new Error(`Impossible de garantir le profil proprietaire: ${profileError.message}`);
    }

    return user.id;
}

async function ensureDeckWithCards(supabase, ownerId, category, categoryPath, levelConfig) {
    const levelLabel = capitalize(levelConfig.level);
    const title = `${category} - ${levelLabel}`;
    const taxonomyPath = [...(categoryPath ?? [category]), levelLabel];

    const basePayload = {
        owner_id: ownerId,
        title,
        description: `Deck ${category} niveau ${levelLabel} (contenu generique de test).`,
        tags: [category.toLowerCase(), levelConfig.level, SEED_TAG],
        category,
        category_path: taxonomyPath,
        visibility: "public",
        block_suggestions: false,
    };

    const { data: existingDeck, error: findDeckError } = await supabase
        .from("decks")
        .select("id")
        .eq("owner_id", ownerId)
        .eq("title", title)
        .maybeSingle();

    if (findDeckError && findDeckError.code !== "PGRST116") {
        throw new Error(`Recherche deck echouee (${title}): ${findDeckError.message}`);
    }

    let deckId;

    if (existingDeck?.id) {
        deckId = existingDeck.id;
        const { error: updateDeckError } = await supabase
            .from("decks")
            .update(basePayload)
            .eq("id", deckId);

        if (updateDeckError) {
            throw new Error(`Mise a jour deck echouee (${title}): ${updateDeckError.message}`);
        }

        const { error: cleanupCardsError } = await supabase
            .from("flashcards")
            .delete()
            .eq("deck_id", deckId);

        if (cleanupCardsError) {
            throw new Error(`Nettoyage des flashcards echoue (${title}): ${cleanupCardsError.message}`);
        }
    } else {
        const { data: insertedDeck, error: insertDeckError } = await supabase
            .from("decks")
            .insert(basePayload)
            .select("id")
            .single();

        if (insertDeckError || !insertedDeck) {
            throw new Error(`Creation deck echouee (${title}): ${insertDeckError?.message || "deck manquant"}`);
        }
        deckId = insertedDeck.id;
    }

    const cardsToInsert = levelConfig.flashcards.map((card, index) => ({
        deck_id: deckId,
        front_text: card.front,
        back_text: card.back,
        explanation: card.explanation,
        category_path: taxonomyPath,
        position: index,
    }));

    const { error: insertCardsError } = await supabase.from("flashcards").insert(cardsToInsert);
    if (insertCardsError) {
        throw new Error(`Insertion flashcards echouee (${title}): ${insertCardsError.message}`);
    }

    return { deckId, title };
}

async function ensureQuizWithQuestions(supabase, ownerId, category, categoryPath, levelConfig) {
    const levelLabel = capitalize(levelConfig.level);
    const title = `${category} - ${levelLabel}`;
    const taxonomyPath = [...(categoryPath ?? [category]), levelLabel];

    const basePayload = {
        owner_id: ownerId,
        title,
        description: `Quiz ${category} niveau ${levelLabel} (contenu generique de test).`,
        tags: [category.toLowerCase(), levelConfig.level, SEED_TAG],
        category,
        category_path: taxonomyPath,
        visibility: "public",
        block_suggestions: false,
    };

    const { data: existingQuiz, error: findQuizError } = await supabase
        .from("quizzes")
        .select("id")
        .eq("owner_id", ownerId)
        .eq("title", title)
        .maybeSingle();

    if (findQuizError && findQuizError.code !== "PGRST116") {
        throw new Error(`Recherche quiz echouee (${title}): ${findQuizError.message}`);
    }

    let quizId;

    if (existingQuiz?.id) {
        quizId = existingQuiz.id;
        const { error: updateQuizError } = await supabase
            .from("quizzes")
            .update(basePayload)
            .eq("id", quizId);

        if (updateQuizError) {
            throw new Error(`Mise a jour quiz echouee (${title}): ${updateQuizError.message}`);
        }

        const { error: cleanupQuestionsError } = await supabase
            .from("quiz_questions")
            .delete()
            .eq("quiz_id", quizId);

        if (cleanupQuestionsError) {
            throw new Error(`Nettoyage des questions echoue (${title}): ${cleanupQuestionsError.message}`);
        }
    } else {
        const { data: insertedQuiz, error: insertQuizError } = await supabase
            .from("quizzes")
            .insert(basePayload)
            .select("id")
            .single();

        if (insertQuizError || !insertedQuiz) {
            throw new Error(`Creation quiz echouee (${title}): ${insertQuizError?.message || "quiz manquant"}`);
        }

        quizId = insertedQuiz.id;
    }

    for (let i = 0; i < levelConfig.questions.length; i += 1) {
        const quizQuestion = levelConfig.questions[i];

        const { data: insertedQuestion, error: insertQuestionError } = await supabase
            .from("quiz_questions")
            .insert({
                quiz_id: quizId,
                question_text: quizQuestion.question,
                category_path: taxonomyPath,
                position: i,
            })
            .select("id")
            .single();

        if (insertQuestionError || !insertedQuestion) {
            throw new Error(
                `Creation question echouee (${title}, Q${i + 1}): ${insertQuestionError?.message || "question manquante"}`
            );
        }

        const answersPayload = quizQuestion.answers.map((answer, index) => ({
            question_id: insertedQuestion.id,
            answer_text: answer.text,
            is_correct: answer.correct,
            position: index,
        }));

        const { error: insertAnswersError } = await supabase.from("quiz_answers").insert(answersPayload);
        if (insertAnswersError) {
            throw new Error(
                `Creation reponses echouee (${title}, Q${i + 1}): ${insertAnswersError.message}`
            );
        }
    }

    return { quizId, title };
}

async function run() {
    const supabase = getSupabaseClient();

    const avatarBucketStatus = await ensurePublicBucket(supabase, "avatars");
    const cardImagesBucketStatus = await ensurePublicBucket(supabase, "card-images");
    console.log(`Bucket avatars: ${avatarBucketStatus}`);
    console.log(`Bucket card-images: ${cardImagesBucketStatus}`);

    const ownerId = await ensureOwnerUser(supabase, OWNER_EMAIL);

    let deckCount = 0;
    let quizCount = 0;

    for (const categoryConfig of CATALOG) {
        for (const levelConfig of categoryConfig.levels) {
            const categoryPath = categoryConfig.categoryPath ?? [categoryConfig.category];
            await ensureDeckWithCards(supabase, ownerId, categoryConfig.category, categoryPath, levelConfig);
            await ensureQuizWithQuestions(supabase, ownerId, categoryConfig.category, categoryPath, levelConfig);
            deckCount += 1;
            quizCount += 1;
        }
    }

    console.log(`Seed termine: ${deckCount} decks publics et ${quizCount} quiz publics sont disponibles pour tous.`);
}

run().catch((error) => {
    console.error("Erreur seed:", error.message || error);
    process.exitCode = 1;
});
