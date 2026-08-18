import { Asset } from 'expo-asset';

import { client } from './client';
import { API_BASE_URL } from '@/constants/env';
import type { ServiceRegionCode, TravelStyleId } from '@/api/onboarding';

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
  imageUrl: string;
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
  imageKey: 'KTX_GUIDE' | 'SUBWAY_TRANSFER' | 'TAXI_CALL' | 'INTERCITY_BUS';
  category: GuideCategoryId;
};

const MOCK_GUIDE_VIDEOS: Record<GuideCategoryId, GuideVideo[]> = {
  TRANSPORT: [
    { id: 'ktx-booking', title: 'KTX\n쉽게 예매하기', tags: ['교통', '결제'], imageKey: 'KTX_GUIDE', category: 'TRANSPORT' },
    { id: 'subway-transfer', title: '지하철\n환승하는 방법', tags: ['교통', '결제'], imageKey: 'SUBWAY_TRANSFER', category: 'TRANSPORT' },
    { id: 'taxi-call', title: '택시\n호출하는 방법', tags: ['교통', '결제'], imageKey: 'TAXI_CALL', category: 'TRANSPORT' },
    { id: 'intercity-bus', title: '시외버스\n예매하기', tags: ['교통', '결제'], imageKey: 'INTERCITY_BUS', category: 'TRANSPORT' },
  ],
  ORDER: [],
  SAFETY: [],
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
  imageUrl: string;
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
  imageUrl: string;
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

// GET /home — currentLocation/preferredLanguage aren't consumed here since
// HomeScreen already sources those from onboarding-store/language-store; this
// exists mainly to back the "POPULAR" featured-events tab with real data.
export async function fetchHome(): Promise<HomeResponse> {
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
