import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type UploadBucket = "avatars" | "card-images";

const ALLOWED_BUCKETS: UploadBucket[] = ["avatars", "card-images"];

function isUploadBucket(value: FormDataEntryValue | null): value is UploadBucket {
    return typeof value === "string" && ALLOWED_BUCKETS.includes(value as UploadBucket);
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Utilisateur non authentifie" }, { status: 401 });
    }

    const formData = await request.formData();
    const bucket = formData.get("bucket");
    const fileEntry = formData.get("file");

    if (!isUploadBucket(bucket)) {
        return NextResponse.json({ error: "Bucket invalide" }, { status: 400 });
    }

    if (!(fileEntry instanceof File)) {
        return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
            { error: "Configuration serveur Supabase incomplete" },
            { status: 500 }
        );
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey);

    const rawExt = fileEntry.name.split(".").pop() || "jpg";
    const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const objectPath =
        bucket === "avatars"
            ? `${user.id}/${crypto.randomUUID()}.${safeExt}`
            : `${crypto.randomUUID()}.${safeExt}`;

    const { error: uploadError } = await admin.storage
        .from(bucket)
        .upload(objectPath, await fileEntry.arrayBuffer(), {
            contentType: fileEntry.type || "application/octet-stream",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(objectPath);

    return NextResponse.json({ publicUrl: data.publicUrl, path: objectPath });
}