export type UploadBucket = "avatars" | "card-images";

type UploadResponse = {
    publicUrl?: string;
    error?: string;
};

export async function uploadImageWithApi(bucket: UploadBucket, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("bucket", bucket);
    formData.append("file", file, file.name);

    const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
    });

    let payload: UploadResponse | null = null;
    try {
        payload = (await response.json()) as UploadResponse;
    } catch {
        payload = null;
    }

    if (!response.ok || !payload?.publicUrl) {
        throw new Error(payload?.error || "Echec de l'upload d'image");
    }

    return payload.publicUrl;
}