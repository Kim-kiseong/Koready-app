export type TransportMode = 'WALK' | 'SUBWAY' | 'BUS' | 'TRAIN' | 'KTX' | 'SHUTTLE';
export type RouteDifficulty = 'EASY' | 'NORMAL' | 'HARD';
export type DayTripStatus = 'DAY_TRIP_AVAILABLE' | 'DAY_TRIP_HARD' | 'DAY_TRIP_UNAVAILABLE';

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

const ORIGIN: RoutePlace = {
  name: '성신여자대학교',
  address: '서울 성북구 보문로34다길 2',
};

// TODO: Replace this mock factory with local route fixture loading first.
export async function fetchBuddyRoute(
  routeId: string,
  destination: Destination,
): Promise<BuddyRoute> {
  const fetchedAtDate = new Date();
  const fetchedAt = fetchedAtDate.toISOString();
  const expiresAt = new Date(fetchedAtDate.getTime() + 5 * 60_000).toISOString();
  return {
    routeId,
    provider: 'TMAP_TRANSIT',
    origin: ORIGIN,
    destination,
    fetchedAt,
    expiresAt,
    summary: {
      recommendedTransportText: '지하철, KTX,\n축제 셔틀버스',
      estimatedOneWayMinutes: 190,
      estimatedOneWayTimeText: '약 3시간 10분',
      transferCount: 3,
      totalWalkDistanceMeters: 1250,
      totalWalkMinutes: 18,
      difficulty: 'EASY',
      difficultyAlgorithmVersion: 'route-difficulty-v1',
      dayTripStatus: 'DAY_TRIP_AVAILABLE',
      fare: {
        oneWayEstimated: 35100,
        roundTripEstimated: 70200,
        currencyCode: 'KRW',
        coverage: 'FULL_ROUTE',
        disclaimer: '실제 요금과 다를 수 있으며 일부 셔틀 비용은 제외될 수 있습니다.',
      },
      transportModes: ['WALK', 'SUBWAY', 'KTX', 'SHUTTLE'],
      tip: {
        code: 'TIP_GIMCHEON_GUMI_STATION',
        source: 'OPERATOR_CURATED',
        title: 'Buddy Tip',
        body: '서울에서 출발할 시 당일치기는 가능하지만, 오전 출발과 KTX 예매를 추천해요.',
        placement: 'TOP_SUMMARY',
      },
      horiTips: [
        {
          code: 'TIP_DAY_TRIP_RECOMMENDATION',
          source: 'OPERATOR_CURATED',
          title: 'Hori Tip',
          body: '서울에서 출발할 시 당일치기는 가능하지만, 오전 출발과 KTX 예매를 추천해요.',
          placement: 'TOP_SUMMARY',
        },
      ],
    },
    segments: [
      {
        order: 1,
        source: 'TMAP',
        startName: ORIGIN.name,
        endName: '성신여대입구역',
        mode: 'WALK',
        routeName: '도보',
        durationMinutes: 10,
        distanceMeters: 680,
        fare: 0,
        instruction: '',
        serviceAvailable: true,
      },
      {
        order: 2,
        source: 'TMAP',
        startName: '성신여대입구역',
        endName: '서울역',
        mode: 'SUBWAY',
        routeName: '지하철 4호선',
        durationMinutes: 20,
        distanceMeters: 0,
        fare: 0,
        instruction: 'KTX 탑승을 위해 서울역으로 이동해요.',
        serviceAvailable: true,
      },
      {
        order: 3,
        source: 'TMAP',
        startName: '서울역',
        endName: '김천(구미)역',
        mode: 'KTX',
        routeName: 'KTX',
        durationMinutes: 80,
        distanceMeters: 0,
        fare: 35100,
        instruction: '김천역이 아니라 김천(구미)역 도착 기준으로 확인하세요.',
        serviceAvailable: true,
        horiTips: [
          {
            code: 'TIP_GIMCHEON_GUMI_STATION',
            source: 'OPERATOR_CURATED',
            title: 'Hori Tip',
            body: '김천역과 김천(구미)역은 다른 역이에요. KTX를 이용할 때는 반드시 김천(구미)역으로 검색하세요.',
            placement: 'SEGMENT',
          },
        ],
      },
      {
        order: 4,
        source: 'TMAP',
        startName: '김천(구미)역',
        endName: destination.name,
        mode: 'SHUTTLE',
        routeName: '축제 셔틀버스',
        durationMinutes: 50,
        distanceMeters: 0,
        fare: 0,
        instruction: '축제 기간에는 셔틀버스 시간표를 미리 확인하는 것이 좋아요.',
        serviceAvailable: true,
      },
    ],
    warnings: [],
    detailAvailable: true,
  };
}

export async function fetchMockRouteDetail(
  routeId: string,
  destination: Destination,
): Promise<BuddyRoute> {
  const route = await fetchBuddyRoute(routeId, destination);
  return { ...route, routeId };
}

export async function fetchMockRouteDetailForDestination(
  routeId: string,
  destination: Destination,
): Promise<BuddyRoute> {
  const route = await fetchBuddyRoute(routeId, destination);
  return { ...route, routeId };
}
