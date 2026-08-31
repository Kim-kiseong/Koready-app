import { isAxiosError } from 'axios';

import { client } from './client';
import { fetchMyLocations } from './address';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { formatTransportModeLabel } from '@/utils/transport-labels';

export type TransportMode =
  | 'WALK'
  | 'BUS'
  | 'SUBWAY'
  | 'EXPRESS_BUS'
  | 'TRAIN'
  | 'AIRPLANE'
  | 'FERRY'
  | 'SHUTTLE_BUS';

export type RouteDifficulty = 'EASY' | 'NORMAL' | 'HARD';
export type DayTripStatus = 'DAY_TRIP_AVAILABLE' | 'STAY_RECOMMENDED';
export type RouteSource = 'TMAP' | 'KOREADY_CURATED';
export type HoriTipSource = 'OPERATOR_CURATED';
export type HoriTipPlacement = 'TOP_SUMMARY' | 'AFTER_SEGMENT';
export type FareCoverage = 'FULL_ROUTE' | 'AVAILABLE_SEGMENTS_ONLY' | 'UNAVAILABLE';

export type RoutePlace = {
  name: string;
  address: string | null;
};

export type RouteTip = {
  code: string;
  source: HoriTipSource;
  title: 'Hori Tip';
  body: string;
  placement: HoriTipPlacement;
};

export type RouteFare = {
  oneWayEstimated: number | null;
  roundTripEstimated: number | null;
  currencyCode: 'KRW';
  coverage: FareCoverage;
  disclaimer: string;
};

export type RouteSummary = {
  recommendedTransportText: string;
  estimatedOneWayMinutes: number;
  estimatedOneWayTimeText: string;
  transferCount: number;
  totalWalkDistanceMeters: number;
  totalWalkMinutes: number;
  difficulty: RouteDifficulty;
  difficultyAlgorithmVersion: string;
  dayTripStatus: DayTripStatus;
  fare: RouteFare;
  transportModes: TransportMode[];
  horiTips: RouteTip[];
};

export type RouteSegment = {
  order: number;
  source: RouteSource;
  startName: string;
  endName: string;
  mode: TransportMode;
  routeName?: string | null;
  durationMinutes: number;
  distanceMeters: number;
  fare: number | null;
  instruction: string;
  serviceAvailable: boolean;
  horiTips: RouteTip[];
};

export type RouteWarning = {
  code: 'PARTIAL_FARE' | 'CURATED_SEGMENT' | 'PROVIDER_DATA_LIMITED';
  message: string;
  segmentOrder?: number | null;
};

export type BuddyRoute = {
  routeId: string;
  provider: 'TMAP_TRANSIT';
  origin: RoutePlace;
  destination: RoutePlace;
  fetchedAt: string;
  expiresAt: string;
  summary: RouteSummary;
  segments: RouteSegment[];
  warnings: RouteWarning[];
  detailAvailable: boolean;
};

export type RouteRequest = {
  originLocationId: number | null;
  destinationPlaceId: number | null;
  departureAt?: string | null;
};

export type RouteEnvelope = {
  success: true;
  code: string;
  message: string;
  data: BuddyRoute;
  traceId: string;
};

type Destination = Pick<RoutePlace, 'name' | 'address'>;

const ROUTE_CACHE = new Map<string, BuddyRoute>();

function isDevMockSession() {
  return __DEV__ && useAuthStore.getState().accessToken === DEV_MOCK_ACCESS_TOKEN;
}

function logRouteFailure(call: string, error: unknown, context?: Record<string, unknown>) {
  if (isAxiosError(error)) {
    console.warn(`[route] ${call} failed, using fallback`, {
      ...context,
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message ?? error.message,
    });
    return;
  }

  console.warn(`[route] ${call} failed, using fallback`, { ...context, error });
}

const FALLBACK_ORIGIN_KO: RoutePlace = {
  name: '현재 설정된 주소',
  address: '현재 설정된 주소',
};

const FALLBACK_ORIGIN_EN: RoutePlace = {
  name: 'Current saved address',
  address: 'Current saved address',
};

const FALLBACK_DESTINATION_KO: Destination = {
  name: '목적지',
  address: '목적지',
};

const FALLBACK_DESTINATION_EN: Destination = {
  name: 'Destination',
  address: 'Destination',
};

function resolveOrigin(language: 'KO' | 'EN'): RoutePlace {
  const { location } = useOnboardingStore.getState();
  const savedAddresses = useAddressStore.getState().savedAddresses;
  const resolvedOriginLocationId = resolveCachedOriginLocationId();
  const savedAddress =
    resolvedOriginLocationId == null
      ? undefined
      : savedAddresses.find((item) => item.locationId === resolvedOriginLocationId);

  if (savedAddress) {
    const name = savedAddress.customLabel ?? savedAddress.displayName;
    return {
      name,
      address: savedAddress.roadAddress ?? savedAddress.address ?? name,
    };
  }

  if (location?.displayAddress) {
    return {
      name: location.displayAddress,
      address: location.displayAddress,
    };
  }

  return language === 'EN' ? FALLBACK_ORIGIN_EN : FALLBACK_ORIGIN_KO;
}

function resolveCachedOriginLocationId(): number | null {
  const { currentLocationId } = useOnboardingStore.getState();
  const savedAddresses = useAddressStore.getState().savedAddresses;
  const defaultSavedAddress = savedAddresses.find((item) => item.default);

  if (defaultSavedAddress) {
    return defaultSavedAddress.locationId;
  }

  if (currentLocationId != null) {
    const currentSavedAddress = savedAddresses.find((item) => item.locationId === currentLocationId);
    if (currentSavedAddress) {
      return currentLocationId;
    }
  }

  if (savedAddresses.length > 0) {
    return savedAddresses[0].locationId;
  }

  return currentLocationId;
}

async function resolveOriginLocationId(): Promise<number | null> {
  try {
    const refreshedAddresses = await fetchMyLocations();
    useAddressStore.getState().replaceSavedAddresses(refreshedAddresses);

    if (refreshedAddresses.length === 0) {
      return null;
    }

    const { currentLocationId } = useOnboardingStore.getState();
    const defaultSavedAddress = refreshedAddresses.find((item) => item.default);
    if (defaultSavedAddress) {
      return defaultSavedAddress.locationId;
    }

    if (currentLocationId != null) {
      const currentSavedAddress = refreshedAddresses.find((item) => item.locationId === currentLocationId);
      if (currentSavedAddress) {
        return currentLocationId;
      }
    }

    return refreshedAddresses[0].locationId;
  } catch {
    return resolveCachedOriginLocationId();
  }
}

function resolveDestination(destination: Destination | undefined, language: 'KO' | 'EN'): Destination {
  if (destination) return destination;
  return language === 'EN' ? FALLBACK_DESTINATION_EN : FALLBACK_DESTINATION_KO;
}

function formatRouteDurationText(minutes: number, language: 'KO' | 'EN') {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) {
    return language === 'EN' ? `About ${mins} min` : `약 ${mins}분`;
  }

  if (mins <= 0) {
    return language === 'EN' ? `About ${hours} hr` : `약 ${hours}시간`;
  }

  return language === 'EN' ? `About ${hours} hr ${mins} min` : `약 ${hours}시간 ${mins}분`;
}

function formatRecommendedTransportText(language: 'KO' | 'EN') {
  return language === 'EN'
    ? 'Subway + KTX + Festival Shuttle Bus'
    : '지하철 + KTX + 축제 셔틀버스';
}

function createMockRoute(
  routeId: string,
  destination?: Destination,
  options?: {
    originLocationId?: number | null;
    destinationPlaceId?: number | null;
    departureAt?: string | null;
  },
): BuddyRoute {
  const fetchedAtDate = new Date();
  const fetchedAt = fetchedAtDate.toISOString();
  const expiresAt = new Date(fetchedAtDate.getTime() + 5 * 60_000).toISOString();
  const language = useLanguageStore.getState().language;
  const isEnglish = language === 'EN';
  const origin = resolveOrigin(language);
  const resolvedDestination = resolveDestination(destination, language);
  const sungshinStation = isEnglish ? "Sungshin Women's Univ. Station" : '성신여대입구역';
  const seoulStation = isEnglish ? 'Seoul Station' : '서울역';
  const gimcheonGumiStation = isEnglish ? 'Gimcheon(Gumi) Station' : '김천(구미)역';
  const dayTripTipBody = isEnglish
    ? 'A day trip from Seoul is possible, but we recommend leaving in the morning and booking your KTX in advance.'
    : '서울에서 출발할 시 당일치기는 가능하지만, 오전 출발과 KTX 예매를 추천해요.';
  const transferTipBody = isEnglish
    ? 'Gimcheon Station and Gimcheon(Gumi) Station are different stations. When booking your KTX, make sure to search for Gimcheon(Gumi) Station.'
    : '김천역과 김천(구미)역은 다른 역이에요. KTX를 이용할 때는 반드시 김천(구미)역으로 검색하세요.';
  const transferInstruction = isEnglish
    ? 'Make sure your destination is Gimcheon(Gumi) Station, not Gimcheon Station.'
    : '김천역이 아니라 김천(구미)역 도착 기준으로 확인하세요.';
  const resolvedRouteId = routeId || [
    options?.originLocationId ?? 'origin',
    options?.destinationPlaceId ?? 'destination',
  ].join('_');

  const route: BuddyRoute = {
    routeId: resolvedRouteId.startsWith('route_') ? resolvedRouteId : `route_${resolvedRouteId}`,
    provider: 'TMAP_TRANSIT',
    origin,
    destination: resolvedDestination,
    fetchedAt,
    expiresAt,
    summary: {
      recommendedTransportText: formatRecommendedTransportText(language),
      estimatedOneWayMinutes: 190,
      estimatedOneWayTimeText: formatRouteDurationText(190, language),
      transferCount: 3,
      totalWalkDistanceMeters: 1250,
      totalWalkMinutes: 18,
      difficulty: 'HARD',
      difficultyAlgorithmVersion: 'route-difficulty-v1',
      dayTripStatus: 'DAY_TRIP_AVAILABLE',
      fare: {
        oneWayEstimated: 35100,
        roundTripEstimated: 70200,
        currencyCode: 'KRW',
        coverage: 'FULL_ROUTE',
        disclaimer: isEnglish
          ? 'May differ from actual fares; some shuttle costs may be excluded.'
          : '실제 요금과 다를 수 있으며 일부 셔틀 비용은 제외될 수 있습니다.',
      },
      transportModes: ['WALK', 'SUBWAY', 'TRAIN', 'SHUTTLE_BUS'],
      horiTips: [
        {
          code: 'TIP_DAY_TRIP_RECOMMENDATION',
          source: 'OPERATOR_CURATED',
          title: 'Hori Tip',
          body: dayTripTipBody,
          placement: 'TOP_SUMMARY',
        },
      ],
    },
    segments: [
      {
        order: 1,
        source: 'TMAP',
        startName: origin.name,
        endName: sungshinStation,
        mode: 'WALK',
        routeName: formatTransportModeLabel('WALK', language),
        durationMinutes: 10,
        distanceMeters: 680,
        fare: 0,
        instruction: '',
        serviceAvailable: true,
        horiTips: [],
      },
      {
        order: 2,
        source: 'TMAP',
        startName: sungshinStation,
        endName: seoulStation,
        mode: 'SUBWAY',
        routeName: isEnglish ? 'Subway Line 4' : '지하철 4호선',
        durationMinutes: 20,
        distanceMeters: 0,
        fare: 0,
        instruction: isEnglish
          ? 'Move to Seoul Station to board the KTX.'
          : 'KTX 탑승을 위해 서울역으로 이동해요.',
        serviceAvailable: true,
        horiTips: [],
      },
      {
        order: 3,
        source: 'TMAP',
        startName: seoulStation,
        endName: gimcheonGumiStation,
        mode: 'TRAIN',
        routeName: 'KTX',
        durationMinutes: 80,
        distanceMeters: 0,
        fare: 35100,
        instruction: transferInstruction,
        serviceAvailable: true,
        horiTips: [
          {
            code: 'TIP_GIMCHEON_GUMI_STATION',
            source: 'OPERATOR_CURATED',
            title: 'Hori Tip',
            body: transferTipBody,
            placement: 'AFTER_SEGMENT',
          },
        ],
      },
      {
        order: 4,
        source: 'TMAP',
        startName: gimcheonGumiStation,
        endName: resolvedDestination.name,
        mode: 'SHUTTLE_BUS',
        routeName: formatTransportModeLabel('SHUTTLE_BUS', language),
        durationMinutes: 50,
        distanceMeters: 0,
        fare: 0,
        instruction: isEnglish
          ? 'During the festival, it is a good idea to check the shuttle bus timetable in advance.'
          : '축제 기간에는 셔틀버스 시간표를 미리 확인하는 것이 좋아요.',
        serviceAvailable: true,
        horiTips: [],
      },
    ],
    warnings: [],
    detailAvailable: true,
  };

  ROUTE_CACHE.set(`${language}:${route.routeId}`, route);
  return route;
}

function normalizeRouteResponse(route: BuddyRoute): BuddyRoute {
  return {
    ...route,
    origin: { ...route.origin },
    destination: { ...route.destination },
    summary: {
      ...route.summary,
      fare: { ...route.summary.fare },
      transportModes: [...route.summary.transportModes],
      horiTips: route.summary.horiTips.map((tip) => ({ ...tip })),
    },
    segments: route.segments
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((segment) => ({
        ...segment,
        horiTips: segment.horiTips.map((tip) => ({ ...tip })),
      })),
    warnings: route.warnings.map((warning) => ({ ...warning })),
  };
}

function buildRouteCacheKey(routeId: string) {
  return `${useLanguageStore.getState().language}:${routeId}`;
}

export async function createBuddyRoute(
  request: RouteRequest,
  destination?: Destination,
): Promise<BuddyRoute> {
  const routeId = [
    request.originLocationId ?? 'origin',
    request.destinationPlaceId ?? 'destination',
  ].join('_');
  const fallbackRoute = () =>
    createMockRoute(routeId.startsWith('route_') ? routeId : `route_${routeId}`, destination, {
      originLocationId: request.originLocationId,
      destinationPlaceId: request.destinationPlaceId,
      departureAt: request.departureAt ?? null,
    });

  try {
    if (isDevMockSession()) {
      return fallbackRoute();
    }

    const originLocationId = await resolveOriginLocationId();
    if (originLocationId == null) {
      if (__DEV__) {
        return fallbackRoute();
      }

      throw new Error('ACTIVE_SAVED_LOCATION_REQUIRED');
    }

    if (request.destinationPlaceId == null) {
      if (__DEV__) {
        return fallbackRoute();
      }

      throw new Error('DESTINATION_PLACE_ID_REQUIRED');
    }

    const payload: RouteRequest = {
      originLocationId,
      destinationPlaceId: request.destinationPlaceId,
    };

    if (request.departureAt != null) {
      payload.departureAt = request.departureAt;
    }

    const response = await client.post<RouteEnvelope>('/routes', payload);
    return normalizeRouteResponse(response.data.data);
  } catch (error) {
    if (__DEV__) {
      // Every real /routes failure (auth, validation, network — anything) used
      // to be swallowed here with no trace, always landing on the exact same
      // hardcoded createMockRoute() output regardless of what actually broke.
      logRouteFailure('POST /routes', error, { originLocationId: request.originLocationId, destinationPlaceId: request.destinationPlaceId });
      return fallbackRoute();
    }

    throw error;
  }
}

export async function fetchBuddyRouteDetail(
  routeId: string,
  destination?: Destination,
): Promise<BuddyRoute> {
  const fallbackRoute = () => {
    const cacheKey = buildRouteCacheKey(routeId);
    const cachedRoute = ROUTE_CACHE.get(cacheKey);

    if (cachedRoute) {
      return cachedRoute;
    }

    return createMockRoute(routeId, destination);
  };

  if (isDevMockSession()) {
    return fallbackRoute();
  }

  try {
    const response = await client.get<RouteEnvelope>(`/routes/${encodeURIComponent(routeId)}`);
    return normalizeRouteResponse(response.data.data);
  } catch (error) {
    if (__DEV__) {
      logRouteFailure(`GET /routes/${routeId}`, error);
      return fallbackRoute();
    }

    throw error;
  }
}

export async function fetchBuddyRoute(
  placeId: string,
  destination?: Destination,
  options?: {
    destinationPlaceId?: number | null;
    departureAt?: string | null;
  },
): Promise<BuddyRoute> {
  const destinationPlaceId =
    options?.destinationPlaceId ?? (Number.isFinite(Number(placeId)) ? Number(placeId) : null);

  if (destinationPlaceId == null) {
    throw new Error('DESTINATION_PLACE_ID_REQUIRED');
  }

  return createBuddyRoute(
    {
      originLocationId: resolveCachedOriginLocationId() ?? destinationPlaceId,
      destinationPlaceId,
      departureAt: options?.departureAt ?? null,
    },
    destination,
  );
}

export async function fetchMockRouteDetail(
  routeId: string,
  destination?: Destination,
): Promise<BuddyRoute> {
  return fetchBuddyRouteDetail(routeId, destination);
}

export async function fetchMockRouteDetailForDestination(
  routeId: string,
  destination?: Destination,
): Promise<BuddyRoute> {
  return fetchBuddyRouteDetail(routeId, destination);
}
