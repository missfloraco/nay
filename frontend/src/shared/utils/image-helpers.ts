
/**
 * Converts an image file to WebP format.
 * @param file The original image file.
 * @param quality Quality of the output WebP image (0 to 1). Default is 0.8.
 * @returns Promise that resolves to the converted File object.
 */
export const convertImageToWebP = async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error('Conversion to WebP failed'));
                    }
                },
                'image/webp',
                quality
            );
        };
        img.onerror = (error) => reject(error);
    });
};
