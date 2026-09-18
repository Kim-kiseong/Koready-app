import { Asset } from 'expo-asset';

import type { ServiceRegionCode, TravelStyleId } from '@/api/onboarding';
import type { LanguageCode } from '@/api/types';
import { API_BASE_URL } from '@/constants/env';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { prefetchImageUrls } from '@/utils/image-prefetch';
import { formatPlaceRegionName } from '@/utils/place-i18n';
import { client } from './client';
import { buildApiCacheKey, getCachedOrFetch } from './cache';

export type FeaturedEventCategory = 'POPULAR' | TravelStyleId;

export const FEATURED_EVENT_CATEGORIES: readonly FeaturedEventCategory[] = [
  'POPULAR',
  'LOCAL_FOOD',
  'LOCAL_FESTIVAL',
  'TRADITIONAL_MARKET',
  'CULTURE_EXPERIENCE',
  'NATURE',
  'EXHIBITION_MUSEUM',
  'DRAMA_LOCATION',
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

const HOME_CACHE_TTL_MS = 30_000;
const MONTHLY_RECOMMENDATIONS_CACHE_TTL_MS = 60_000;

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
    tags: ['KTX', '교통'],
    imageKey: 'KTX_GUIDE',
  },
];

const MOCK_GUIDES_EN: GuideArticle[] = [
  {
    id: 'ktx-easy-booking',
    badge: 'Transportation Guide',
    title: 'How to Book KTX Tickets',
    description:
      'From booking and choosing your seat to payment\nand ticket confirmation—all in one guide.',
    tags: ['KTX', 'Transportation'],
    imageKey: 'KTX_GUIDE',
  },
];

// No backend endpoint for this exists yet (checked against the staging Swagger
// spec: only GET /home and GET /monthly-recommendations are implemented, and
// neither returns article-style guide content). Stays mock until the backend
// adds one — this isn't a simple client.get(...) swap.
export async function fetchTravelGuides(language: LanguageCode): Promise<GuideArticle[]> {
  return language === 'EN' ? MOCK_GUIDES_EN : MOCK_GUIDES;
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

const MOCK_GUIDE_VIDEOS_EN: Record<GuideCategoryId, GuideVideo[]> = {
  TRANSPORT: [
    { id: 'ktx-booking', title: 'Book KTX\nTickets Easily', tags: ['Transport', 'Payment'], imageKey: 'KTX_GUIDE', category: 'TRANSPORT' },
    { id: 'subway-transfer', title: 'How to Transfer\non the Subway', tags: ['Transport', 'Payment'], imageKey: 'SUBWAY_TRANSFER', category: 'TRANSPORT' },
    { id: 'taxi-call', title: 'How to\nCall a Taxi', tags: ['Transport', 'Payment'], imageKey: 'TAXI_CALL', category: 'TRANSPORT' },
    { id: 'intercity-bus', title: 'Book an Intercity\nBus Ticket', tags: ['Transport', 'Payment'], imageKey: 'INTERCITY_BUS', category: 'TRANSPORT' },
  ],
  ORDER: [
    { id: 'order-restaurant', title: 'How to Order at a\nKorean Restaurant', tags: ['Order', 'Dining'], imageKey: 'ORDER_RESTAURANT', category: 'ORDER' },
    { id: 'order-waiting', title: 'How to Reserve\nor Join a Waitlist', tags: ['Order', 'Reservation'], imageKey: 'ORDER_WAITING', category: 'ORDER' },
    { id: 'order-delivery', title: 'How to Order\nFood Delivery', tags: ['Order', 'Delivery'], imageKey: 'ORDER_DELIVERY', category: 'ORDER' },
    { id: 'order-kiosk', title: 'How to Order\nat a Kiosk', tags: ['Order', 'Payment'], imageKey: 'ORDER_KIOSK', category: 'ORDER' },
  ],
  SAFETY: [
    { id: 'safety-emergency', title: 'How to Get Help\nin an Emergency', tags: ['Safety', 'Emergency'], imageKey: 'SAFETY_EMERGENCY', category: 'SAFETY' },
    { id: 'safety-lost', title: 'If You Lose Your\nPassport or Phone', tags: ['Safety', 'Lost & Found'], imageKey: 'SAFETY_LOST', category: 'SAFETY' },
    { id: 'safety-hospital', title: 'How to Visit a Hospital When\nYou’re Sick', tags: ['Safety', 'Hospital'], imageKey: 'SAFETY_HOSPITAL', category: 'SAFETY' },
    { id: 'safety-hiking', title: 'How to Hike\nSafely in Korea', tags: ['Safety', 'Hiking'], imageKey: 'SAFETY_HIKING', category: 'SAFETY' },
  ],
  LANGUAGE: [],
};

// Same as fetchTravelGuides above — no /home/guide-videos-shaped endpoint exists
// on the backend. Stays mock until one does.
export async function fetchGuideVideos(category: GuideCategoryId, language: LanguageCode): Promise<GuideVideo[]> {
  return (language === 'EN' ? MOCK_GUIDE_VIDEOS_EN : MOCK_GUIDE_VIDEOS)[category];
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

export type EventDateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type EventFilters = {
  region: EventRegionId | 'ALL';
  date: EventDateFilterId | 'ALL';
  dateRange: EventDateRange;
  type: TravelStyleId | 'ALL';
};

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  region: 'ALL',
  date: 'ALL',
  dateRange: { startDate: null, endDate: null },
  type: 'ALL',
};

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
  operatingHours?: string | null;
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
  unreadMessageCount?: number;
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
  const viewerPublicId = useAuthStore.getState().user?.publicId ?? 'guest';
  const language = useLanguageStore.getState().language;
  const cacheKey = buildApiCacheKey('home', [viewerPublicId, language]);

  const home = await getCachedOrFetch(cacheKey, HOME_CACHE_TTL_MS, async () => {
    const response = await client.get<HomeEnvelope>('/home');
    return response.data.data;
  });

  prefetchImageUrls(home.monthlyRecommendation.items.map((item) => item.imageUrl));
  return home;
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
  const viewerPublicId = useAuthStore.getState().user?.publicId ?? 'guest';
  const language = useLanguageStore.getState().language;
  const cacheKey = buildApiCacheKey('home:monthly-recommendations', [
    viewerPublicId,
    language,
    params,
  ]);

  const result = await getCachedOrFetch(
    cacheKey,
    MONTHLY_RECOMMENDATIONS_CACHE_TTL_MS,
    async () => {
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
    },
  );

  prefetchImageUrls(result.items.map((item) => item.imageUrl));
  return result;
}

function formatFeaturedEventDateRangeLabel(
  festivalOccurrence: Pick<FestivalOccurrence, 'startDate' | 'endDate'> | null | undefined,
  language: LanguageCode,
) {
  if (!festivalOccurrence?.startDate || !festivalOccurrence.endDate) {
    return '';
  }

  const formatKoreanDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);
    const parts = new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'UTC',
    }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return `${month}.${day}(${weekday})`;
  };

  const formatEnglishDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);
    const parts = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'UTC',
    }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return `${month} ${day} (${weekday})`;
  };

  if (language === 'EN') {
    return `${formatEnglishDate(festivalOccurrence.startDate)} – ${formatEnglishDate(festivalOccurrence.endDate)}`;
  }

  return `${formatKoreanDate(festivalOccurrence.startDate)}~${formatKoreanDate(festivalOccurrence.endDate)}`;
}

function toFeaturedEvent(card: PlaceCard): FeaturedEvent {
  const language = useLanguageStore.getState().language;
  return {
    id: String(card.placeId),
    title: card.title,
    dateRangeLabel:
      formatFeaturedEventDateRangeLabel(card.festivalOccurrence, language) ||
      card.festivalOccurrence?.dateRangeText ||
      '',
    imageUrl: normalizeImageUrl(card.imageUrl, DEFAULT_FEATURED_EVENT_IMAGE_URI),
  };
}

function toEventListing(card: PlaceCard): EventListing {
  const language = useLanguageStore.getState().language;
  return {
    id: String(card.placeId),
    title: card.title,
    location: formatPlaceRegionName(card.serviceRegionCode, language),
    dateRangeLabel:
      formatFeaturedEventDateRangeLabel(card.festivalOccurrence, language) ||
      card.festivalOccurrence?.dateRangeText ||
      '',
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

// Places with a festival date are more actionable (time-sensitive) than ones
// without, so both featured lists below surface them first. This is as far
// as the client can implement the requested priority scheme — see the
// "dated-first, then by save count" note above fetchFeaturedEvents for what's
// missing and why. Array.sort is stable, so the backend's own relative
// ordering within each group (RECOMMENDED's status-then-quality-score,
// DEADLINE's soonest-end-date) is preserved, just regrouped by date presence.
function sortDatedFirst<T extends { dateRangeLabel: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aHasDate = a.dateRangeLabel !== '';
    const bHasDate = b.dateRangeLabel !== '';
    if (aHasDate === bHasDate) return 0;
    return aHasDate ? -1 : 1;
  });
}

// Always goes through GET /monthly-recommendations (never GET /home).
// POPULAR omits travelStyles so it isn't filtered to one style. Swallows
// failures to an empty list so a network hiccup doesn't crash the carousel.
//
// Requested priority scheme was "1) dated content by save count desc, 2)
// undated content by save count desc" (DEADLINE swaps #1 for soonest-ending
// first). Checked the live Swagger spec for GET /monthly-recommendations:
// RECOMMENDED is documented as "ONGOING/UPCOMING/ENDED status before quality
// score" and DEADLINE as "soonest end date" — neither groups by date presence
// first, and PlaceCard has no save/like count field for the client to sort by
// itself. So only the "dated first" half is doable here (sortDatedFirst);
// the save-count sub-ordering needs a backend change (either implement this
// exact scheme server-side, or expose a save/popularity count on PlaceCard).
//
// The "top 5" shown here must be the top 5 of the SAME pool fetchEventListings
// shows in the full grid, dated-first-sorted — not the backend's own top 5
// (which ranks by status/quality score and can leave a dated item, e.g. a
// festival with a lower quality score, out entirely). So this requests the
// full MONTHLY_RECOMMENDATIONS_PAGE_SIZE page (matching fetchEventListings'
// own page size), sorts it the same way, and only then takes the first 5 —
// otherwise a dated item ranked 6th-or-later server-side would never even be
// in the 5 fetched, no matter how the client re-sorts afterward.
const MONTHLY_RECOMMENDATIONS_PAGE_SIZE = 20;
const FEATURED_EVENTS_SIZE = 5;

export async function fetchFeaturedEvents(
  category: FeaturedEventCategory,
  month?: number,
  year?: number,
): Promise<FeaturedEvent[]> {
  const now = new Date();
  try {
    const result = await fetchMonthlyRecommendations({
      year: year ?? now.getFullYear(),
      month: month ?? now.getMonth() + 1,
      travelStyles: category === 'POPULAR' ? undefined : [category],
      sort: 'RECOMMENDED',
      size: MONTHLY_RECOMMENDATIONS_PAGE_SIZE,
    });
    return sortDatedFirst(result.items.map(toFeaturedEvent)).slice(0, FEATURED_EVENTS_SIZE);
  } catch {
    return [];
  }
}

// EventListScreen's full grid — region/date/type filtering and sorting all
// happen server-side now via GET /monthly-recommendations; sortDatedFirst is
// the same client-side regrouping as fetchFeaturedEvents above (see its
// comment for what's server-side-only for now). size is explicit here
// (rather than relying on the backend's own default, which happens to be the
// same 20) so it can never silently drift out of sync with
// MONTHLY_RECOMMENDATIONS_PAGE_SIZE above and break that top-5-of-the-same-
// pool guarantee.
export async function fetchEventListings(
  month: number,
  sort: EventSortOrder = 'RECOMMENDED',
  filters: EventFilters = DEFAULT_EVENT_FILTERS,
): Promise<EventListing[]> {
  const hasCustomDateRange = Boolean(filters.dateRange.startDate && filters.dateRange.endDate);
  try {
    const result = await fetchMonthlyRecommendations({
      year: new Date().getFullYear(),
      month,
      serviceRegionCode: filters.region === 'ALL' ? undefined : filters.region,
      dateFilterType: hasCustomDateRange ? 'CUSTOM' : filters.date === 'ALL' ? undefined : filters.date,
      customStartDate: hasCustomDateRange ? filters.dateRange.startDate! : undefined,
      customEndDate: hasCustomDateRange ? filters.dateRange.endDate! : undefined,
      travelStyles: filters.type === 'ALL' ? undefined : [filters.type],
      sort,
      size: MONTHLY_RECOMMENDATIONS_PAGE_SIZE,
    });
    return sortDatedFirst(result.items.map(toEventListing));
  } catch {
    return [];
  }
}
