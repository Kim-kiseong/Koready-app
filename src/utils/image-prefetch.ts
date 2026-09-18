import { Image } from 'expo-image';

function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function prefetchImageUrls(urls: (string | null | undefined)[]) {
  const remoteUrls = [...new Set(
    urls
      .map((url) => (typeof url === 'string' ? url.trim() : ''))
      .filter((url) => url.length > 0 && isRemoteImageUrl(url)),
  )];

  if (remoteUrls.length === 0) {
    return;
  }

  void Image.prefetch(remoteUrls).catch(() => undefined);
}
