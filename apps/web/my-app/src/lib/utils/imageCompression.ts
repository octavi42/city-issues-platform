export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.7 // 0.0 - 1.0
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const aspect = width / height;
        if (width > height) {
          width = maxWidth;
          height = Math.round(maxWidth / aspect);
        } else {
          height = maxHeight;
          width = Math.round(maxHeight * aspect);
        }
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          // Convert blob back to File
          const compressedFile = new File([blob], file.name, { type: file.type });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
      URL.revokeObjectURL(url);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
} 