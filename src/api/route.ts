import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useLanguageStore } from '@/store/language-store';

import { formatTransportModeLabel, formatTransportModeList } from '@/utils/transport-labels';

export type TransportMode = 'WALK' | 'SUBWAY' | 'BUS' | 'TRAIN' | 'KTX' | 'SHUTTLE';
export type RouteDifficulty = 'EASY' | 'NORMAL' | 'HARD';
export type DayTripStatus = 'DAY_TRIP_AVAILABLE' | 'DAY_TRIP_UNAVAILABLE';

export type RoutePlace = {
  name: string;
  address: string;
};

export type RouteTip = {
  code?: string;
  source?: string;
  title: string;
  body: string;
  placement?: 'TOP_SUMMARY' | 'SEGMENT';
};

export type RouteFare = {
  oneWayEstimated: number;
  roundTripEstimated: number;
  currencyCode: 'KRW';
  coverage: 'FULL_ROUTE' | 'PARTIAL_ROUTE';
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
  tip: RouteTip;
  horiTips: RouteTip[];
};

export type RouteSegment = {
  order: number;
  source: string;
  startName: string;
  endName: string;
  mode: TransportMode;
  routeName: string;
  durationMinutes: number;
  distanceMeters: number;
  fare: number;
  instruction?: string;
  serviceAvailable: boolean;
  tip?: RouteTip;
  horiTips?: RouteTip[];
};

export type RouteWarning = {
  code: string;
  message: string;
  segmentOrder?: number;
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

type Destination = Pick<RoutePlace, 'name' | 'address'>;

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
  const { location, currentLocationId } = useOnboardingStore.getState();
  const savedAddresses = useAddressStore.getState().savedAddresses;
  const savedAddress =
    currentLocationId == null
      ? undefined
      : savedAddresses.find((item) => item.locationId === currentLocationId);

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

function resolveDestination(destination: Destination | undefined, language: 'KO' | 'EN'): Destination {
  if (destination) return destination;
  return language === 'EN' ? FALLBACK_DESTINATION_EN : FALLBACK_DESTINATION_KO;
}

// TODO: Replace this mock factory with local route fixture loading first.
export async function fetchBuddyRoute(
  routeId: string,
  destination?: Destination,
): Promise<BuddyRoute> {
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
    ? "A day trip from Seoul is possible, but we recommend leaving in the morning and booking your KTX in advance."
    : '서울에서 출발할 시 당일치기는 가능하지만, 오전 출발과 KTX 예매를 추천해요.';
  const transferTipBody = isEnglish
    ? 'Gimcheon Station and Gimcheon(Gumi) Station are different stations. When booking your KTX, make sure to search for Gimcheon(Gumi) Station.'
    : '김천역과 김천(구미)역은 다른 역이에요. KTX를 이용할 때는 반드시 김천(구미)역으로 검색하세요.';
  const transferInstruction = isEnglish
    ? 'Make sure your destination is Gimcheon(Gumi) Station, not Gimcheon Station.'
    : '김천역이 아니라 김천(구미)역 도착 기준으로 확인하세요.';
  return {
    routeId,
    provider: 'TMAP_TRANSIT',
    origin,
    destination: resolvedDestination,
    fetchedAt,
    expiresAt,
    summary: {
      recommendedTransportText: formatTransportModeList(['SUBWAY', 'KTX', 'SHUTTLE'], language),
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
      transportModes: ['WALK', 'SUBWAY', 'KTX', 'SHUTTLE'],
      tip: {
        code: 'TIP_GIMCHEON_GUMI_STATION',
        source: 'OPERATOR_CURATED',
        title: 'Buddy Tip',
        body: dayTripTipBody,
        placement: 'TOP_SUMMARY',
      },
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
      },
      {
        order: 3,
        source: 'TMAP',
        startName: seoulStation,
        endName: gimcheonGumiStation,
        mode: 'KTX',
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
            placement: 'SEGMENT',
          },
        ],
      },
      {
        order: 4,
        source: 'TMAP',
        startName: gimcheonGumiStation,
        endName: resolvedDestination.name,
        mode: 'SHUTTLE',
        routeName: formatTransportModeLabel('SHUTTLE', language),
        durationMinutes: 50,
        distanceMeters: 0,
        fare: 0,
        instruction: isEnglish
          ? 'During the festival, it is a good idea to check the shuttle bus timetable in advance.'
          : '축제 기간에는 셔틀버스 시간표를 미리 확인하는 것이 좋아요.',
        serviceAvailable: true,
      },
    ],
    warnings: [],
    detailAvailable: true,
  };
}

export async function fetchMockRouteDetail(
  routeId: string,
  destination?: Destination,
): Promise<BuddyRoute> {
  const route = await fetchBuddyRoute(routeId, destination);
  return { ...route, routeId };
}

export async function fetchMockRouteDetailForDestination(
  routeId: string,
  destination?: Destination,
): Promise<BuddyRoute> {
  const route = await fetchBuddyRoute(routeId, destination);
  return { ...route, routeId };
}
