type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const WEB_STORAGE_PREFIX = 'koready-api-cache:';
const apiResponseCache = new Map<string, CacheEntry<unknown>>();
const apiInFlightRequests = new Map<string, Promise<unknown>>();

function canUseWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getWebStorageKey(key: string) {
  return `${WEB_STORAGE_PREFIX}${key}`;
}

function readWebCacheEntry<T>(key: string): CacheEntry<T> | null {
  if (!canUseWebStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getWebStorageKey(key));
    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.expiresAt !== 'number' || !('value' in entry)) {
      window.localStorage.removeItem(getWebStorageKey(key));
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

function writeWebCacheEntry<T>(key: string, entry: CacheEntry<T>) {
  if (!canUseWebStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(getWebStorageKey(key), JSON.stringify(entry));
  } catch {
    // Storage can be full or blocked by the browser. Memory cache still works.
  }
}

function removeWebCacheEntry(key: string) {
  if (!canUseWebStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(getWebStorageKey(key));
  } catch {
    // Ignore browser storage failures; cache removal from memory already happened.
  }
}

function clearWebCache(namespace?: string) {
  if (!canUseWebStorage()) {
    return;
  }

  try {
    const prefix = namespace ? getWebStorageKey(namespace) : WEB_STORAGE_PREFIX;
    const keysToRemove: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore browser storage failures; stale entries expire naturally by TTL.
  }
}

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
    clearWebCache();
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

  clearWebCache(namespace);
}

export function getCachedApiResponse<T>(key: string): T | null {
  const memoryEntry = apiResponseCache.get(key) as CacheEntry<T> | undefined;
  const entry = memoryEntry ?? readWebCacheEntry<T>(key) ?? undefined;

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    apiResponseCache.delete(key);
    removeWebCacheEntry(key);
    return null;
  }

  if (!memoryEntry) {
    apiResponseCache.set(key, entry as CacheEntry<unknown>);
  }

  return entry.value;
}

export function setCachedApiResponse<T>(key: string, value: T, ttlMs: number) {
  const entry = {
    expiresAt: Date.now() + ttlMs,
    value,
  };

  apiResponseCache.set(key, entry);
  writeWebCacheEntry(key, entry);
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
