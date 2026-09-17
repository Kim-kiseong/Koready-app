import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { fetchMyLocations } from './address';
import { client } from './client';

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
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  x?: number | string | null;
  y?: number | string | null;
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
  startLatitude?: number | string | null;
  startLongitude?: number | string | null;
  endLatitude?: number | string | null;
  endLongitude?: number | string | null;
  startLat?: number | string | null;
  startLng?: number | string | null;
  endLat?: number | string | null;
  endLng?: number | string | null;
  startX?: number | string | null;
  startY?: number | string | null;
  endX?: number | string | null;
  endY?: number | string | null;
  path?: (RouteCoordinate | [number | string, number | string])[] | null;
  polyline?: (RouteCoordinate | [number | string, number | string])[] | string | null;
  mode: TransportMode;
  routeName?: string | null;
  durationMinutes: number;
  distanceMeters: number;
  fare: number | null;
  instruction: string;
  serviceAvailable: boolean;
  horiTips: RouteTip[];
};

export type RouteCoordinate = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  x?: number | string | null;
  y?: number | string | null;
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

export async function createBuddyRoute(
  request: RouteRequest,
  _destination?: Destination,
): Promise<BuddyRoute> {
  void _destination;
  const originLocationId = await resolveOriginLocationId();
  if (originLocationId == null) {
    throw new Error('ACTIVE_SAVED_LOCATION_REQUIRED');
  }

  if (request.destinationPlaceId == null) {
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
}

export async function fetchBuddyRouteDetail(routeId: string, _destination?: Destination): Promise<BuddyRoute> {
  void _destination;
  const response = await client.get<RouteEnvelope>(`/routes/${encodeURIComponent(routeId)}`);
  return normalizeRouteResponse(response.data.data);
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
