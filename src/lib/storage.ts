export type MediaBucket = 'blog-media' | 'member-media' | 'project-media';

export function storagePathFromPublicUrl(value: string, bucket: MediaBucket): string | null {
  try {
    const pathname = new URL(value, 'https://storage.invalid').pathname;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    const encodedPath = pathname.slice(markerIndex + marker.length);
    const path = decodeURIComponent(encodedPath);
    if (!path || path.split('/').some((segment) => segment === '.' || segment === '..' || !segment)) return null;
    return path;
  } catch {
    return null;
  }
}

export function storagePathsFromPublicUrls(values: string[], bucket: MediaBucket): string[] {
  return Array.from(new Set(values.map((value) => storagePathFromPublicUrl(value, bucket)).filter((path): path is string => Boolean(path))));
}

export function storagePathsFromText(values: string[], bucket: MediaBucket): string[] {
  const urls = values.flatMap((value) => value.match(/(?:https?:\/\/[^\s)]+|\/storage\/v1\/object\/public\/[^\s)]+)/g) ?? []);
  return storagePathsFromPublicUrls(urls, bucket);
}
