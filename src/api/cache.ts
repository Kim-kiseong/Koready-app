type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const apiResponseCache = new Map<string, CacheEntry<unknown>>();
const apiInFlightRequests = new Map<string, Promise<unknown>>();

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
    .join(',')}}`;
}

export function buildApiCacheKey(namespace: string, parts: unknown[] = []) {
  if (parts.length === 0) {
    return namespace;
  }

  return `${namespace}:${parts.map(stableStringify).join(':')}`;
}

export function clearApiCache(namespace?: string) {
  if (!namespace) {
    apiResponseCache.clear();
    apiInFlightRequests.clear();
    return;
  }

  for (const key of apiResponseCache.keys()) {
    if (key.startsWith(namespace)) {
      apiResponseCache.delete(key);
    }
  }

  for (const key of apiInFlightRequests.keys()) {
    if (key.startsWith(namespace)) {
      apiInFlightRequests.delete(key);
    }
  }
}

export function getCachedApiResponse<T>(key: string): T | null {
  const entry = apiResponseCache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    apiResponseCache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCachedApiResponse<T>(key: string, value: T, ttlMs: number) {
  apiResponseCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
}

export async function getCachedOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = getCachedApiResponse<T>(key);
  if (cached) {
    return cached;
  }

  const running = apiInFlightRequests.get(key) as Promise<T> | undefined;
  if (running) {
    return running;
  }

  const request = fetcher().then((value) => {
    setCachedApiResponse(key, value, ttlMs);
    return value;
  });

  apiInFlightRequests.set(key, request);

  try {
    return await request;
  } finally {
    apiInFlightRequests.delete(key);
  }
}
