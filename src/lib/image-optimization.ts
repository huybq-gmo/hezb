export const maxImageSourceBytes = 20 * 1024 * 1024;
export const maxImageStoredBytes = 5 * 1024 * 1024;
const maxImageDimension = 1800;
const resizeSteps = [1800, 1500, 1200, 1000];
const qualitySteps = [0.82, 0.72, 0.62, 0.52];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unable to read this image.')); };
    image.src = url;
  });
}

export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) throw new Error('Unable to read this image.');
  const needsResize = sourceWidth > maxImageDimension || sourceHeight > maxImageDimension;
  let smallest: Blob | null = null;
  for (const dimension of resizeSteps) {
    const scale = Math.min(1, dimension / sourceWidth, dimension / sourceHeight);
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) continue;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);
    for (const quality of qualitySteps) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (!blob) continue;
      if (!smallest || blob.size < smallest.size) smallest = blob;
      if (blob.size <= maxImageStoredBytes && (needsResize || blob.size < file.size)) {
        const name = file.name.replace(/\.[^.]+$/, '') || 'image';
        return new File([blob], `${name}.webp`, { type: 'image/webp', lastModified: Date.now() });
      }
    }
  }
  if (!smallest || (!needsResize && smallest.size >= file.size)) return file;
  const name = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([smallest], `${name}.webp`, { type: 'image/webp', lastModified: Date.now() });
}
