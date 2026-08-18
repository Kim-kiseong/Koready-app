import { Asset } from 'expo-asset';

import { client } from './client';
import { API_BASE_URL } from '@/constants/env';
import type { ServiceRegionCode, TravelStyleId } from '@/api/onboarding';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { useAuthStore } from '@/store/auth-store';

// The dev-bypass session's token isn't real — sending it to GET /home or GET
// /monthly-recommendations 401s, which trips client.ts's refresh-then-logout
// cascade (the interceptor clears the session and redirects to /login before
// the caller's own try/catch ever runs). Mirrors the same guard used in
// mate.ts/messages.ts/buddy-profile.ts.
function isDevMockSession() {
  return __DEV__ && useAuthStore.getState().accessToken === DEV_MOCK_ACCESS_TOKEN;
}

export type FeaturedEventCategory =
  | 'POPULAR'
  | 'LOCAL_FESTIVAL'
  | 'EXHIBITION_MUSEUM'
  | 'NATURE';

export const FEATURED_EVENT_CATEGORIES: readonly FeaturedEventCategory[] = [
  'POPULAR',
  'LOCAL_FESTIVAL',
  'EXHIBITION_MUSEUM',
  'NATURE',
];

export type FeaturedEvent = {
  id: string;
  title: string;
  dateRangeLabel: string;
  imageUrl: string | null;
};

const DEFAULT_FEATURED_EVENT_IMAGE_URI = Asset.fromModule(
  require('@/assets/images/destinations/default.jpg'),
).uri;

export type GuideArticle = {
  id: string;
  badge: string;
  title: string;
  description: string;
  tags: string[];
  imageKey: 'KTX_GUIDE';
};

const MOCK_GUIDES: GuideArticle[] = [
  {
    id: 'ktx-easy-booking',
    badge: '이동 가이드',
    title: 'KTX 쉽게 예매하기',
    description: '공식 예매 방법부터 좌석 선택, 결제,\n티켓 확인까지 한 번에!',
    tags: ['KTX', '교통', '공식예매', '외국인 가능'],
    imageKey: 'KTX_GUIDE',
  },
];

// No backend endpoint for this exists yet (checked against the staging Swagger
// spec: only GET /home and GET /monthly-recommendations are implemented, and
// neither returns article-style guide content). Stays mock until the backend
// adds one — this isn't a simple client.get(...) swap.
export async function fetchTravelGuides(): Promise<GuideArticle[]> {
  return MOCK_GUIDES;
}

export type GuideCategoryId = 'TRANSPORT' | 'ORDER' | 'SAFETY' | 'LANGUAGE';

export const GUIDE_CATEGORY_IDS: readonly GuideCategoryId[] = [
  'TRANSPORT',
  'ORDER',
  'SAFETY',
  'LANGUAGE',
];

export type GuideVideo = {
  id: string;
  title: string;
  tags: [string, string];
  imageKey:
    | 'KTX_GUIDE'
    | 'SUBWAY_TRANSFER'
    | 'TAXI_CALL'
    | 'INTERCITY_BUS'
    | 'ORDER_RESTAURANT'
    | 'ORDER_WAITING'
    | 'ORDER_DELIVERY'
    | 'ORDER_KIOSK'
    | 'SAFETY_EMERGENCY'
    | 'SAFETY_LOST'
    | 'SAFETY_HOSPITAL'
    | 'SAFETY_HIKING';
  category: GuideCategoryId;
};

const MOCK_GUIDE_VIDEOS: Record<GuideCategoryId, GuideVideo[]> = {
  TRANSPORT: [
    { id: 'ktx-booking', title: 'KTX\n쉽게 예매하기', tags: ['교통', '결제'], imageKey: 'KTX_GUIDE', category: 'TRANSPORT' },
    { id: 'subway-transfer', title: '지하철\n환승하는 방법', tags: ['교통', '결제'], imageKey: 'SUBWAY_TRANSFER', category: 'TRANSPORT' },
    { id: 'taxi-call', title: '택시\n호출하는 방법', tags: ['교통', '결제'], imageKey: 'TAXI_CALL', category: 'TRANSPORT' },
    { id: 'intercity-bus', title: '시외버스\n예매하기', tags: ['교통', '결제'], imageKey: 'INTERCITY_BUS', category: 'TRANSPORT' },
  ],
  ORDER: [
    { id: 'order-restaurant', title: '한국 식당에서\n주문하는 방법', tags: ['주문', '식당'], imageKey: 'ORDER_RESTAURANT', category: 'ORDER' },
    { id: 'order-waiting', title: '식당 웨이팅\n예약하는 방법', tags: ['주문', '예약'], imageKey: 'ORDER_WAITING', category: 'ORDER' },
    { id: 'order-delivery', title: '배달음식\n주문하는 방법', tags: ['주문', '배달'], imageKey: 'ORDER_DELIVERY', category: 'ORDER' },
    { id: 'order-kiosk', title: '키오스크로\n주문하는 방법', tags: ['주문', '결제'], imageKey: 'ORDER_KIOSK', category: 'ORDER' },
  ],
  SAFETY: [
    { id: 'safety-emergency', title: '긴급상황\n도움 요청하는 방법', tags: ['안전', '긴급'], imageKey: 'SAFETY_EMERGENCY', category: 'SAFETY' },
    { id: 'safety-lost', title: '여권 · 휴대폰\n잃어버렸을 때', tags: ['안전', '분실'], imageKey: 'SAFETY_LOST', category: 'SAFETY' },
    { id: 'safety-hospital', title: '아플 때\n병원 가는 방법', tags: ['안전', '병원'], imageKey: 'SAFETY_HOSPITAL', category: 'SAFETY' },
    { id: 'safety-hiking', title: '등산할 때\n알아둘 안전수칙', tags: ['안전', '등산'], imageKey: 'SAFETY_HIKING', category: 'SAFETY' },
  ],
  LANGUAGE: [],
};

// Same as fetchTravelGuides above — no /home/guide-videos-shaped endpoint exists
// on the backend. Stays mock until one does.
export async function fetchGuideVideos(category: GuideCategoryId): Promise<GuideVideo[]> {
  return MOCK_GUIDE_VIDEOS[category];
}

export type EventSortOrder = 'RECOMMENDED' | 'DEADLINE';

export type EventListing = {
  id: string;
  title: string;
  location: string;
  dateRangeLabel: string;
  category: TravelStyleId;
  imageUrl: string | null;
};

// Matches the backend's ServiceRegionCode enum exactly (see GET
// /monthly-recommendations, GET /places) — the mock UI used to include an
// INCHEON option that the real backend doesn't recognize as a region filter.
export type EventRegionId = ServiceRegionCode;

export const EVENT_REGION_IDS: readonly EventRegionId[] = [
  'SEOUL',
  'GYEONGGI',
  'GANGWON',
  'CHUNGCHEONG',
  'JEOLLA',
  'GYEONGSANG',
  'JEJU',
];

export type EventDateFilterId = 'THIS_WEEK' | 'THIS_MONTH' | 'NEXT_MONTH';

export const EVENT_DATE_FILTER_IDS: readonly EventDateFilterId[] = ['THIS_WEEK', 'THIS_MONTH', 'NEXT_MONTH'];

export type EventFilters = {
  region: EventRegionId | 'ALL';
  date: EventDateFilterId | 'ALL';
  type: TravelStyleId | 'ALL';
};

export const DEFAULT_EVENT_FILTERS: EventFilters = { region: 'ALL', date: 'ALL', type: 'ALL' };

// --- Real backend integration: GET /home, GET /monthly-recommendations ---
// (see the staging Swagger spec — these are the only two home-area endpoints
// that actually exist; there is no /home/featured-events, /home/guides,
// /home/guide-videos, or /home/event-listings on the real backend.)

export type FestivalOccurrence = {
  occurrenceId: number;
  eventYear: number;
  startDate: string;
  endDate: string;
  status: string;
  dateRangeText: string;
};

export type PlaceCard = {
  placeId: number;
  title: string;
  serviceRegionCode: ServiceRegionCode;
  serviceRegionName: string;
  addressSummary: string;
  // Backend contract: null means "no photo uploaded yet" — the frontend is
  // expected to substitute its own default (see api-docs' imageUrl description).
  imageUrl: string | null;
  festivalOccurrence: FestivalOccurrence | null;
  travelStyle: TravelStyleId;
  tags: string[];
  shortDescription: string;
  saved: boolean;
};

export type HomeResponse = {
  currentLocation: {
    locationId: number;
    displayName: string;
    serviceRegionCode: ServiceRegionCode;
  } | null;
  preferredLanguage: 'KO' | 'EN';
  monthlyRecommendation: {
    year: number;
    month: number;
    title: string;
    totalCount: number;
    items: PlaceCard[];
  };
};

type HomeEnvelope = {
  success: true;
  code: string;
  message: string;
  data: HomeResponse;
  traceId: string;
};

const DEV_MOCK_PLACE_CARDS: PlaceCard[] = [
  {
    placeId: 9001,
    title: '[전주] 이팝나무 축제',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: '전라',
    addressSummary: '전북특별자치도 전주시 완산구 일대',
    imageUrl: 'https://picsum.photos/seed/jeonju-ipap/800/1000',
    festivalOccurrence: {
      occurrenceId: 1,
      eventYear: new Date().getFullYear(),
      startDate: '2026-04-25',
      endDate: '2026-04-26',
      status: 'UPCOMING',
      dateRangeText: '4.25(토)~4.26(일)',
    },
    travelStyle: 'LOCAL_FESTIVAL',
    tags: ['지역축제', '봄'],
    shortDescription: '전주 한옥마을 인근 이팝나무 축제예요.',
    saved: false,
  },
  {
    placeId: 9002,
    title: '[담양] 대나무 축제',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: '전라',
    addressSummary: '전라남도 담양군 담양읍 죽녹원로 119',
    imageUrl: 'https://picsum.photos/seed/damyang-bamboo/800/1000',
    festivalOccurrence: {
      occurrenceId: 2,
      eventYear: new Date().getFullYear(),
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      status: 'UPCOMING',
      dateRangeText: '5.1(금)~5.5(화)',
    },
    travelStyle: 'NATURE',
    tags: ['자연', '대나무'],
    shortDescription: '담양 대나무숲을 즐겨보세요.',
    saved: false,
  },
  {
    placeId: 9003,
    title: '국립현대미술관',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: '서울',
    addressSummary: '서울 종로구 삼청로 30',
    imageUrl: 'https://picsum.photos/seed/mmca/800/1000',
    festivalOccurrence: {
      occurrenceId: 3,
      eventYear: new Date().getFullYear(),
      startDate: '2026-05-03',
      endDate: '2026-06-15',
      status: 'ONGOING',
      dateRangeText: '5.3(일)~6.15(월)',
    },
    travelStyle: 'EXHIBITION_MUSEUM',
    tags: ['전시', '미술관'],
    shortDescription: '국립현대미술관 특별전을 감상해보세요.',
    saved: false,
  },
];

// GET /home — currentLocation/preferredLanguage aren't consumed here since
// HomeScreen already sources those from onboarding-store/language-store; this
// exists mainly to back the "POPULAR" featured-events tab with real data.
export async function fetchHome(): Promise<HomeResponse> {
  if (isDevMockSession()) {
    const now = new Date();
    return {
      currentLocation: null,
      preferredLanguage: 'KO',
      monthlyRecommendation: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        title: '이달의 인기 추천',
        totalCount: DEV_MOCK_PLACE_CARDS.length,
        items: DEV_MOCK_PLACE_CARDS,
      },
    };
  }
  const response = await client.get<HomeEnvelope>('/home');
  return response.data.data;
}

export type MonthlyRecommendationsParams = {
  year: number;
  month: number;
  serviceRegionCode?: ServiceRegionCode;
  dateFilterType?: EventDateFilterId | 'CUSTOM';
  customStartDate?: string;
  customEndDate?: string;
  travelStyles?: TravelStyleId[];
  sort?: EventSortOrder;
  cursor?: string;
  size?: number;
};

export type MonthlyRecommendationsResponse = {
  year: number;
  month: number;
  items: PlaceCard[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
};

type MonthlyRecommendationsEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MonthlyRecommendationsResponse;
  traceId: string;
};

// GET /monthly-recommendations — backs both the home screen's non-POPULAR
// featured-events tabs and the full event-list screen (month + region/date/
// travel-style filters + sort, all applied server-side).
export async function fetchMonthlyRecommendations(
  params: MonthlyRecommendationsParams,
): Promise<MonthlyRecommendationsResponse> {
  if (isDevMockSession()) {
    let items = DEV_MOCK_PLACE_CARDS;
    if (params.serviceRegionCode) {
      items = items.filter((card) => card.serviceRegionCode === params.serviceRegionCode);
    }
    if (params.travelStyles?.length) {
      items = items.filter((card) => params.travelStyles!.includes(card.travelStyle));
    }
    if (params.sort === 'DEADLINE') {
      items = [...items].sort((a, b) =>
        (a.festivalOccurrence?.endDate ?? '').localeCompare(b.festivalOccurrence?.endDate ?? ''),
      );
    }
    return {
      year: params.year,
      month: params.month,
      items,
      nextCursor: null,
      hasMore: false,
      totalCount: items.length,
    };
  }
  const response = await client.get<MonthlyRecommendationsEnvelope>('/monthly-recommendations', {
    params: {
      year: params.year,
      month: params.month,
      serviceRegionCode: params.serviceRegionCode,
      dateFilterType: params.dateFilterType,
      customStartDate: params.customStartDate,
      customEndDate: params.customEndDate,
      travelStyles: params.travelStyles,
      sort: params.sort,
      cursor: params.cursor,
      size: params.size,
    },
  });
  return response.data.data;
}

function toFeaturedEvent(card: PlaceCard): FeaturedEvent {
  return {
    id: String(card.placeId),
    title: card.title,
    dateRangeLabel: card.festivalOccurrence?.dateRangeText ?? '',
    imageUrl: normalizeImageUrl(card.imageUrl, DEFAULT_FEATURED_EVENT_IMAGE_URI),
  };
}

function toEventListing(card: PlaceCard): EventListing {
  return {
    id: String(card.placeId),
    title: card.title,
    location: card.serviceRegionName,
    dateRangeLabel: card.festivalOccurrence?.dateRangeText ?? '',
    category: card.travelStyle,
    imageUrl: normalizeImageUrl(card.imageUrl, DEFAULT_FEATURED_EVENT_IMAGE_URI),
  };
}

function normalizeImageUrl(rawUrl: string | null | undefined, fallbackUrl: string) {
  if (!rawUrl) {
    return fallbackUrl;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return fallbackUrl;
  }

  if (/^(https?:|file:|data:)/i.test(trimmed)) {
    return encodeURI(trimmed);
  }

  if (trimmed.startsWith('//')) {
    return encodeURI(`https:${trimmed}`);
  }

  if (trimmed.startsWith('/')) {
    return encodeURI(`${API_BASE_URL}${trimmed}`);
  }

  return encodeURI(`${API_BASE_URL}/${trimmed}`);
}

// POPULAR reuses GET /home's monthlyRecommendation preview (the backend's own
// "recommended this month" set); the other tabs filter GET /monthly-recommendations
// by travelStyle for the current month. Swallows failures to an empty list so a
// network hiccup doesn't crash the home screen's carousel.
export async function fetchFeaturedEvents(category: FeaturedEventCategory): Promise<FeaturedEvent[]> {
  const now = new Date();
  try {
    if (category === 'POPULAR') {
      const home = await fetchHome();
      return home.monthlyRecommendation.items.map(toFeaturedEvent);
    }
    const result = await fetchMonthlyRecommendations({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      travelStyles: [category],
    });
    return result.items.map(toFeaturedEvent);
  } catch {
    return [];
  }
}

// EventListScreen's full grid — region/date/type filtering and sorting all
// happen server-side now via GET /monthly-recommendations.
export async function fetchEventListings(
  month: number,
  sort: EventSortOrder = 'RECOMMENDED',
  filters: EventFilters = DEFAULT_EVENT_FILTERS,
): Promise<EventListing[]> {
  try {
    const result = await fetchMonthlyRecommendations({
      year: new Date().getFullYear(),
      month,
      serviceRegionCode: filters.region === 'ALL' ? undefined : filters.region,
      dateFilterType: filters.date === 'ALL' ? undefined : filters.date,
      travelStyles: filters.type === 'ALL' ? undefined : [filters.type],
      sort,
    });
    return result.items.map(toEventListing);
  } catch {
    return [];
  }
}
