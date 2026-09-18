import { create } from 'axios';
import { API_V1_BASE_URL } from '@/constants/env';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';
import { prefetchImageUrls } from '@/utils/image-prefetch';

import {
  normalizePlaceDescription,
  type PlaceDetail,
} from './place';
import { buildApiCacheKey, clearApiCache, getCachedOrFetch } from './cache';
import type { PicksCard } from './picks';
import type {
  PlaceListItem,
  SavedPlaceItem,
  SavedPlaceSource,
  SavedPlacesResponse,
  SavedPlaceToggleResponse,
} from './types';

type SavedPlacesEnvelope = {
  success: true;
  code: string;
  message: string;
  data: SavedPlacesResponse;
  traceId: string;
};

type SavedPlaceToggleEnvelope = {
  success: true;
  code: string;
  message: string;
  data: SavedPlaceToggleResponse;
  traceId: string;
};

const savedClient = create({
  baseURL: API_V1_BASE_URL,
  timeout: 15_000,
});

savedClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  config.headers.set('Accept-Language', useLanguageStore.getState().language);
  return config;
});

const SERVICE_REGION_NAME_BY_CODE: Record<string, string> = {
  SEOUL: '서울',
  GYEONGGI: '경기도',
  GANGWON: '강원도',
  CHUNGCHEONG: '충청도',
  JEOLLA: '전라도',
  GYEONGSANG: '경상도',
  JEJU: '제주도',
};

const SAVED_PLACES_CACHE_TTL_MS = 2 * 60_000;

let savedPlaceCache: SavedPlaceItem[] = [];
let savedPlaceCacheOwnerPublicId: string | null = null;

function ensureSavedPlaceCacheOwner() {
  const currentPublicId = useAuthStore.getState().user?.publicId ?? null;

  if (savedPlaceCacheOwnerPublicId === currentPublicId) {
    return;
  }

  savedPlaceCache = [];
  savedPlaceCacheOwnerPublicId = currentPublicId;
}

function cloneSavedPlaceItem(place: SavedPlaceItem): SavedPlaceItem {
  return {
    ...place,
    festivalOccurrence: place.festivalOccurrence
      ? { ...place.festivalOccurrence }
      : null,
    tags: [...place.tags],
  };
}

function localizeSavedPlaceItem(place: SavedPlaceItem): SavedPlaceItem {
  return {
    ...cloneSavedPlaceItem(place),
    serviceRegionName: getDefaultRegionName(place.serviceRegionCode),
    title: place.title,
  };
}

function sortSavedPlaces(places: SavedPlaceItem[]): SavedPlaceItem[] {
  return [...places].sort((left, right) => {
    const leftTime = Date.parse(left.savedAt);
    const rightTime = Date.parse(right.savedAt);
    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }
    return right.placeId - left.placeId;
  });
}

function getSavedPlaceImageUriFromDetail(place: PlaceDetail) {
  const source = place.images[0]?.source;

  if (!source || typeof source !== 'object' || Array.isArray(source) || !('uri' in source)) {
    return '';
  }

  return typeof source.uri === 'string' ? source.uri : '';
}

function getDefaultRegionName(regionCode: string) {
  return SERVICE_REGION_NAME_BY_CODE[regionCode] ?? regionCode;
}

function createMockSavedPlaceCursor(place: SavedPlaceItem) {
  return `${place.savedAt}|${place.placeId}`;
}

function paginateSavedPlaces(
  places: SavedPlaceItem[],
  cursor: string | null | undefined,
  size: number,
): SavedPlacesResponse {
  const sortedPlaces = sortSavedPlaces(places);
  const startIndex = cursor
    ? Math.max(
        sortedPlaces.findIndex((item) => createMockSavedPlaceCursor(item) === cursor) + 1,
        0,
      )
    : 0;
  const items = sortedPlaces.slice(startIndex, startIndex + size);
  const hasMore = startIndex + items.length < sortedPlaces.length;
  const nextCursor = hasMore && items.length > 0 ? createMockSavedPlaceCursor(items[items.length - 1]) : null;

  return {
    items: items.map(localizeSavedPlaceItem),
    nextCursor,
    hasMore,
  };
}

function getLocalSavedPlaces(): SavedPlaceItem[] {
  ensureSavedPlaceCacheOwner();
  const { savedByPlaceId, savedPlacesByPlaceId } = useSavedPlaceStore.getState();
  const merged = new Map<number, SavedPlaceItem>();

  for (const item of savedPlaceCache) {
    if (savedByPlaceId[String(item.placeId)] === false) {
      continue;
    }
    merged.set(item.placeId, cloneSavedPlaceItem(item));
  }

  for (const item of Object.values(savedPlacesByPlaceId)) {
    if (savedByPlaceId[String(item.placeId)] === false) {
      continue;
    }
    merged.set(item.placeId, cloneSavedPlaceItem(item));
  }

  return sortSavedPlaces([...merged.values()]);
}

function mergeSavedPlaceIntoCache(place: SavedPlaceItem, preserveExistingSavedAt = true) {
  ensureSavedPlaceCacheOwner();
  const nextPlace = cloneSavedPlaceItem(place);
  const index = savedPlaceCache.findIndex((item) => item.placeId === nextPlace.placeId);

  if (index >= 0) {
    const existing = savedPlaceCache[index];
    savedPlaceCache[index] = {
      ...existing,
      ...nextPlace,
      saved: true,
      savedAt: preserveExistingSavedAt ? existing.savedAt : nextPlace.savedAt,
      source: preserveExistingSavedAt ? existing.source ?? nextPlace.source : nextPlace.source,
    };
  } else {
    savedPlaceCache.push({ ...nextPlace, saved: true });
  }

  savedPlaceCache = sortSavedPlaces(savedPlaceCache);
}

function mergeSavedPlacesIntoCache(places: SavedPlaceItem[]) {
  for (const place of places) {
    mergeSavedPlaceIntoCache(place, true);
  }
}

function removeSavedPlaceFromCache(placeId: string | number) {
  ensureSavedPlaceCacheOwner();
  const key = Number(placeId);
  if (!Number.isFinite(key)) {
    return;
  }
  savedPlaceCache = savedPlaceCache.filter((item) => item.placeId !== key);
}

function buildAddressSummary(address: string) {
  const cleaned = address.split('(')[0].trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return cleaned;
}

function sanitizeSavedTags(tags: unknown[]) {
  return tags
    .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    .map((tag) => tag.trim());
}

export function buildSavedPlaceFromPickCard(
  card: Pick<PicksCard, 'placeId' | 'title' | 'locationText' | 'imageUrl' | 'saved' | 'tags' | 'shortDescription' | 'serviceRegionCode' | 'travelStyle'>,
  source: SavedPlaceSource,
): SavedPlaceItem {
  const tags = sanitizeSavedTags(card.tags);
  return {
    placeId: card.placeId,
    title: card.title,
    serviceRegionCode: card.serviceRegionCode,
    serviceRegionName: getDefaultRegionName(card.serviceRegionCode),
    addressSummary: card.locationText,
    imageUrl: card.imageUrl,
    festivalOccurrence: null,
    travelStyle: card.travelStyle,
    tags,
    shortDescription: card.shortDescription,
    scheduleText: null,
    saved: true,
    savedAt: new Date().toISOString(),
    source,
  };
}

export function buildSavedPlaceFromPlaceDetail(
  place: PlaceDetail,
  source: SavedPlaceSource,
): SavedPlaceItem {
  const imageUrl = getSavedPlaceImageUriFromDetail(place);
  const numericPlaceId = place.numericId ?? Number(place.id);
  const safeTags = Array.isArray(place.tags)
    ? sanitizeSavedTags(place.tags)
    : [];
  const safeDescription = normalizePlaceDescription(place.description);
  const serviceRegionCode = place.serviceRegionCode ?? 'SEOUL';
  const shortDescription =
    safeDescription.oneLineDescription ||
    safeDescription.shortIntroduction ||
    safeDescription.introParagraphs.find((paragraph) => paragraph.trim().length > 0) ||
    null;

  return {
    placeId: Number.isFinite(numericPlaceId) ? numericPlaceId : 0,
    title: place.title,
    serviceRegionCode,
    serviceRegionName: getDefaultRegionName(serviceRegionCode),
    addressSummary: buildAddressSummary(place.address),
    imageUrl,
    festivalOccurrence: null,
    travelStyle: place.travelStyle ?? '',
    tags: safeTags,
    scheduleText: null,
    shortDescription,
    overview: safeDescription.shortIntroduction ?? safeDescription.introParagraphs.find((paragraph) => paragraph.trim().length > 0) ?? null,
    saved: true,
    savedAt: new Date().toISOString(),
    source,
  };
}

export function buildSavedPlaceFromPlaceListItem(
  place: PlaceListItem,
  source: SavedPlaceSource,
): SavedPlaceItem {
  return {
    placeId: place.placeId,
    title: place.title,
    serviceRegionCode: place.serviceRegionCode,
    serviceRegionName: place.serviceRegionName,
    addressSummary: place.addressSummary,
    imageUrl: place.imageUrl,
    festivalOccurrence: place.festivalOccurrence,
    travelStyle: place.travelStyle,
    tags: sanitizeSavedTags(place.tags),
    scheduleText: place.festivalOccurrence?.dateRangeText ?? null,
    shortDescription: place.shortDescription,
    overview: place.overview,
    saved: true,
    savedAt: new Date().toISOString(),
    source,
  };
}

export function rememberSavedPlace(place: SavedPlaceItem) {
  mergeSavedPlaceIntoCache(place, true);
}

export function forgetSavedPlace(placeId: string | number) {
  removeSavedPlaceFromCache(placeId);
}

export async function fetchSavedPlaceStatus(
  placeId: string | number,
): Promise<boolean> {
  const numericPlaceId = Number(placeId);
  const requesterPublicId = useAuthStore.getState().user?.publicId ?? null;

  if (!Number.isFinite(numericPlaceId) || !requesterPublicId) {
    return false;
  }

  let cursor: string | null = null;
  const visitedCursors = new Set<string>();

  try {
    while (true) {
      if (useAuthStore.getState().user?.publicId !== requesterPublicId) {
        return false;
      }

      const page: SavedPlacesResponse = (
        await savedClient.get<SavedPlacesEnvelope>('/users/me/saved-places', {
          params: { size: 50, ...(cursor ? { cursor } : {}) },
        })
      ).data.data;

      if (useAuthStore.getState().user?.publicId !== requesterPublicId) {
        return false;
      }

      if (page.items.some((item) => item.placeId === numericPlaceId && item.saved !== false)) {
        return true;
      }

      if (!page.hasMore || !page.nextCursor || visitedCursors.has(page.nextCursor)) {
        return false;
      }

      visitedCursors.add(page.nextCursor);
      cursor = page.nextCursor;
    }
  } catch {
    return false;
  }
}

export async function fetchSavedPlaces(
  cursor: string | null = null,
  size = 20,
): Promise<SavedPlacesResponse> {
  const viewerPublicId = useAuthStore.getState().user?.publicId ?? 'guest';
  const language = useLanguageStore.getState().language;
  const cacheKey = buildApiCacheKey('saved-places:list', [viewerPublicId, language, cursor, size]);

  const result = await getCachedOrFetch(cacheKey, SAVED_PLACES_CACHE_TTL_MS, async () => {
    try {
      const response = await savedClient.get<SavedPlacesEnvelope>('/users/me/saved-places', {
        params: { size, ...(cursor ? { cursor } : {}) },
      });
      const items = response.data.data.items.map(cloneSavedPlaceItem);
      mergeSavedPlacesIntoCache(items);
      return {
        ...response.data.data,
        items,
      };
    } catch {
      const fallback = paginateSavedPlaces(getLocalSavedPlaces(), cursor, size);
      return {
        ...fallback,
        items: fallback.items,
      };
    }
  });

  prefetchImageUrls(result.items.map((item) => item.imageUrl));
  return result;
}

export async function savePlace(
  placeId: number | string,
  source: SavedPlaceSource,
  snapshot?: SavedPlaceItem | null,
): Promise<SavedPlaceToggleResponse> {
  const numericPlaceId = Number(placeId);
  const fallbackSavedAt = snapshot?.savedAt ?? new Date().toISOString();

  try {
    const response = await savedClient.put<SavedPlaceToggleEnvelope>(`/users/me/saved-places/${placeId}`, {
      source,
    });
    const result = response.data.data;

    if (snapshot) {
      mergeSavedPlaceIntoCache(
        {
          ...snapshot,
          saved: true,
          savedAt: result.savedAt,
          source,
        },
        true,
      );
    }

    clearApiCache('saved-places:');
    clearApiCache('places:');
    clearApiCache('home');
    return result;
  } catch {
    if (snapshot) {
      mergeSavedPlaceIntoCache(snapshot, true);
    }

    clearApiCache('saved-places:');
    clearApiCache('places:');
    clearApiCache('home');
    return {
      placeId: Number.isFinite(numericPlaceId) ? numericPlaceId : snapshot?.placeId ?? 0,
      saved: true,
      savedAt: fallbackSavedAt,
    };
  }
}

export async function unsavePlace(placeId: number | string): Promise<void> {
  try {
    await savedClient.delete(`/users/me/saved-places/${placeId}`);
  } catch {
    // Keep the optimistic local removal.
  } finally {
    removeSavedPlaceFromCache(placeId);
    clearApiCache('saved-places:');
    clearApiCache('places:');
    clearApiCache('home');
  }
}
