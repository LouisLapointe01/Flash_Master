const MAX_SIZE = 500 * 1024; // 500KB
const MAX_DIMENSION = 1200;

export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_SIZE) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8;

      function tryCompress() {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));

            if (blob.size > MAX_SIZE && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
              return;
            }

            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          quality
        );
      }

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
