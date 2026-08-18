import axios from 'axios';
import { Asset } from 'expo-asset';

import { HomeImages } from '@/constants/home-images';
import { API_BASE_URL } from '@/constants/env';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';

import { DEFAULT_PLACE_DESCRIPTION, type PlaceDetail } from './place';
import type { PicksCard } from './picks';
import type {
  SavedPlaceFestivalOccurrence,
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

const savedClient = axios.create({
  baseURL: API_BASE_URL,
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
  GYEONGGI: '경기',
  GANGWON: '강원',
  CHUNGCHEONG: '충청',
  JEOLLA: '전라',
  GYEONGSANG: '경상',
  JEJU: '제주',
};

const PLACE_METADATA_BY_ID: Record<
  number,
  {
    serviceRegionCode: string;
    serviceRegionName: string;
    travelStyle: string;
    festivalOccurrence: SavedPlaceFestivalOccurrence | null;
    scheduleText: string | null;
  }
> = {
  1101: {
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    travelStyle: 'LOCAL_FESTIVAL',
    festivalOccurrence: {
      occurrenceId: 1101001,
      eventYear: 2026,
      startDate: '2026-08-30',
      endDate: '2026-09-01',
      status: 'UPCOMING',
      dateRangeText: '8.30 - 9.1',
    },
    scheduleText: '8.30 - 9.1',
  },
  1102: {
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: '전라',
    travelStyle: 'LOCAL_FESTIVAL',
    festivalOccurrence: {
      occurrenceId: 1102001,
      eventYear: 2026,
      startDate: '2026-09-12',
      endDate: '2026-09-14',
      status: 'UPCOMING',
      dateRangeText: '9.12 - 9.14',
    },
    scheduleText: '9.12 - 9.14',
  },
  1103: {
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: '전라',
    travelStyle: 'LOCAL_FESTIVAL',
    festivalOccurrence: {
      occurrenceId: 1103001,
      eventYear: 2026,
      startDate: '2026-09-20',
      endDate: '2026-09-22',
      status: 'UPCOMING',
      dateRangeText: '9.20 - 9.22',
    },
    scheduleText: '9.20 - 9.22',
  },
  1104: {
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    travelStyle: 'CULTURE_EXPERIENCE',
    festivalOccurrence: null,
    scheduleText: '09:00 ~ 18:00',
  },
  1105: {
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    travelStyle: 'NATURE',
    festivalOccurrence: null,
    scheduleText: '09:00 ~ 18:00',
  },
  1106: {
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    travelStyle: 'EXHIBITION_MUSEUM',
    festivalOccurrence: null,
    scheduleText: '09:30 ~ 17:30',
  },
};

const INITIAL_MOCK_SAVED_PLACES: SavedPlaceItem[] = [
  {
    placeId: 1102,
    title: '[전주] 이팝나무 축제',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: '전라',
    addressSummary: '전북특별자치도 전주시',
    imageUrl: Asset.fromModule(HomeImages.JEONJU_IPAP_FESTIVAL).uri,
    festivalOccurrence: PLACE_METADATA_BY_ID[1102].festivalOccurrence,
    travelStyle: PLACE_METADATA_BY_ID[1102].travelStyle,
    scheduleText: PLACE_METADATA_BY_ID[1102].scheduleText,
    tags: ['지역축제', '감성', '사진'],
    shortDescription: '이팝나무가 활짝 피는 계절에 즐기는 전주의 대표 축제예요.',
    saved: true,
    savedAt: '2026-08-07T06:20:00.000Z',
    source: 'SAVED',
  },
  {
    placeId: 1103,
    title: '[담양] 대나무 축제',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: '전라',
    addressSummary: '전라남도 담양군',
    imageUrl: Asset.fromModule(HomeImages.DAMYANG_BAMBOO_FESTIVAL).uri,
    festivalOccurrence: PLACE_METADATA_BY_ID[1103].festivalOccurrence,
    travelStyle: PLACE_METADATA_BY_ID[1103].travelStyle,
    scheduleText: PLACE_METADATA_BY_ID[1103].scheduleText,
    tags: ['지역축제', '힐링', '사진'],
    shortDescription: '대나무 숲 산책과 지역 먹거리를 함께 즐길 수 있는 축제예요.',
    saved: true,
    savedAt: '2026-08-07T05:18:00.000Z',
    source: 'SAVED',
  },
  {
    placeId: 1101,
    title: '김천 김밥축제',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    addressSummary: '경상북도 김천시',
    imageUrl: 'https://picsum.photos/id/1050/800/800',
    festivalOccurrence: PLACE_METADATA_BY_ID[1101].festivalOccurrence,
    travelStyle: PLACE_METADATA_BY_ID[1101].travelStyle,
    scheduleText: PLACE_METADATA_BY_ID[1101].scheduleText,
    tags: ['지역축제', '감성', '사진'],
    shortDescription: '김밥을 주제로 먹고 만들고 즐길 수 있는 김천의 지역 축제예요.',
    saved: true,
    savedAt: '2026-08-07T03:40:00.000Z',
    source: 'SAVED',
  },
  {
    placeId: 1104,
    title: '직지사',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    addressSummary: '경상북도 김천시',
    imageUrl: 'https://picsum.photos/id/1036/800/800',
    festivalOccurrence: null,
    travelStyle: PLACE_METADATA_BY_ID[1104].travelStyle,
    scheduleText: PLACE_METADATA_BY_ID[1104].scheduleText,
    tags: ['사찰', '역사', '산책'],
    shortDescription: '고즈넉한 분위기에서 천천히 걸으며 쉬어가기 좋은 장소예요.',
    saved: true,
    savedAt: '2026-08-06T22:15:00.000Z',
    source: 'SAVED',
  },
  {
    placeId: 1105,
    title: '사명대사공원',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    addressSummary: '경상북도 김천시',
    imageUrl: 'https://picsum.photos/id/1041/800/800',
    festivalOccurrence: null,
    travelStyle: PLACE_METADATA_BY_ID[1105].travelStyle,
    scheduleText: PLACE_METADATA_BY_ID[1105].scheduleText,
    tags: ['공원', '산책', '사진'],
    shortDescription: '넓은 공원과 산책로가 있어 사진 찍고 쉬기 좋아요.',
    saved: true,
    savedAt: '2026-08-06T20:40:00.000Z',
    source: 'SAVED',
  },
  {
    placeId: 1106,
    title: '김천시립박물관',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: '경상',
    addressSummary: '경상북도 김천시',
    imageUrl: 'https://picsum.photos/id/1057/800/800',
    festivalOccurrence: null,
    travelStyle: PLACE_METADATA_BY_ID[1106].travelStyle,
    scheduleText: PLACE_METADATA_BY_ID[1106].scheduleText,
    tags: ['박물관', '역사', '문화'],
    shortDescription: '김천의 역사와 지역 문화를 둘러볼 수 있는 공간이에요.',
    saved: true,
    savedAt: '2026-08-06T18:05:00.000Z',
    source: 'SAVED',
  },
];

let savedPlaceCache: SavedPlaceItem[] = sortSavedPlaces(
  INITIAL_MOCK_SAVED_PLACES.map(cloneSavedPlaceItem),
);

function cloneSavedPlaceItem(place: SavedPlaceItem): SavedPlaceItem {
  return {
    ...place,
    festivalOccurrence: place.festivalOccurrence
      ? { ...place.festivalOccurrence }
      : null,
    tags: [...place.tags],
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

function getAssetUri(asset: number) {
  return Asset.fromModule(asset).uri;
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
    items: items.map(cloneSavedPlaceItem),
    nextCursor,
    hasMore,
  };
}

function getLocalSavedPlaces(): SavedPlaceItem[] {
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
  const key = Number(placeId);
  if (!Number.isFinite(key)) {
    return;
  }
  savedPlaceCache = savedPlaceCache.filter((item) => item.placeId !== key);
}

function shouldUseMockSavedPlaces() {
  const accessToken = useAuthStore.getState().accessToken;
  return !accessToken || (__DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN);
}

function resolveDetailSavedPlaceMetadata(place: PlaceDetail) {
  const key = place.numericId ?? Number(place.id);
  return PLACE_METADATA_BY_ID[key] ?? {
    serviceRegionCode: 'SEOUL',
    serviceRegionName: '서울',
    travelStyle: 'CULTURE_EXPERIENCE',
    festivalOccurrence: null,
    scheduleText: null,
  };
}

function buildAddressSummary(address: string) {
  const cleaned = address.split('(')[0].trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return cleaned;
}

export function buildSavedPlaceFromPickCard(
  card: Pick<PicksCard, 'placeId' | 'title' | 'locationText' | 'imageUrl' | 'saved' | 'tags' | 'shortDescription' | 'serviceRegionCode' | 'travelStyle'>,
  source: SavedPlaceSource,
): SavedPlaceItem {
  const metadata = PLACE_METADATA_BY_ID[card.placeId];
  return {
    placeId: card.placeId,
    title: card.title,
    serviceRegionCode: card.serviceRegionCode,
    serviceRegionName: getDefaultRegionName(card.serviceRegionCode),
    addressSummary: card.locationText,
    imageUrl: card.imageUrl,
    festivalOccurrence: metadata?.festivalOccurrence ?? null,
    travelStyle: card.travelStyle,
    tags: [...card.tags],
    shortDescription: card.shortDescription,
    scheduleText: metadata?.scheduleText ?? metadata?.festivalOccurrence?.dateRangeText ?? null,
    saved: true,
    savedAt: new Date().toISOString(),
    source,
  };
}

export function buildSavedPlaceFromPlaceDetail(
  place: PlaceDetail,
  source: SavedPlaceSource,
): SavedPlaceItem {
  const metadata = resolveDetailSavedPlaceMetadata(place);
  const imageUrl = getSavedPlaceImageUriFromDetail(place) || getAssetUri(HomeImages.JEONJU_IPAP_FESTIVAL);
  const numericPlaceId = place.numericId ?? Number(place.id);
  const safeTags = Array.isArray(place.tags)
    ? place.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : [];
  const safeDescription = {
    ...DEFAULT_PLACE_DESCRIPTION,
    ...(place.description ?? {}),
  };
  const shortDescription =
    safeDescription.impactSubtitle?.trim() ||
    safeDescription.introParagraphs.find((paragraph) => paragraph.trim().length > 0) ||
    null;

  return {
    placeId: Number.isFinite(numericPlaceId) ? numericPlaceId : 0,
    title: place.title,
    serviceRegionCode: metadata.serviceRegionCode,
    serviceRegionName: metadata.serviceRegionName,
    addressSummary: buildAddressSummary(place.address),
    imageUrl,
    festivalOccurrence: metadata.festivalOccurrence,
    travelStyle: metadata.travelStyle,
    tags: safeTags,
    scheduleText: metadata.scheduleText ?? metadata.festivalOccurrence?.dateRangeText ?? null,
    shortDescription,
    overview: safeDescription.introParagraphs.find((paragraph) => paragraph.trim().length > 0) ?? null,
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

export async function fetchSavedPlaces(
  cursor: string | null = null,
  size = 20,
): Promise<SavedPlacesResponse> {
  if (shouldUseMockSavedPlaces()) {
    return paginateSavedPlaces(getLocalSavedPlaces(), cursor, size);
  }

  try {
    const response = await savedClient.get<SavedPlacesEnvelope>('/users/me/saved-places', {
      params: { size, ...(cursor ? { cursor } : {}) },
    });
    mergeSavedPlacesIntoCache(response.data.data.items);
    return response.data.data;
  } catch {
    return paginateSavedPlaces(getLocalSavedPlaces(), cursor, size);
  }
}

export async function savePlace(
  placeId: number | string,
  source: SavedPlaceSource,
  snapshot?: SavedPlaceItem | null,
): Promise<SavedPlaceToggleResponse> {
  const numericPlaceId = Number(placeId);
  const fallbackSavedAt = snapshot?.savedAt ?? new Date().toISOString();

  if (shouldUseMockSavedPlaces()) {
    if (snapshot) {
      mergeSavedPlaceIntoCache(snapshot, true);
    }
    return {
      placeId: Number.isFinite(numericPlaceId) ? numericPlaceId : snapshot?.placeId ?? 0,
      saved: true,
      savedAt: fallbackSavedAt,
    };
  }

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

    return result;
  } catch {
    if (snapshot) {
      mergeSavedPlaceIntoCache(snapshot, true);
    }

    return {
      placeId: Number.isFinite(numericPlaceId) ? numericPlaceId : snapshot?.placeId ?? 0,
      saved: true,
      savedAt: fallbackSavedAt,
    };
  }
}

export async function unsavePlace(placeId: number | string): Promise<void> {
  if (shouldUseMockSavedPlaces()) {
    removeSavedPlaceFromCache(placeId);
    return;
  }

  try {
    await savedClient.delete(`/users/me/saved-places/${placeId}`);
  } catch {
    // Keep the optimistic local removal.
  } finally {
    removeSavedPlaceFromCache(placeId);
  }
}
