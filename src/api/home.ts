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

const HOME_CACHE_TTL_MS = 5 * 60_000;
const MONTHLY_RECOMMENDATIONS_CACHE_TTL_MS = 10 * 60_000;

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
    { id: 'safety-emergency', title: '긴급상황에서\n도움 요청하는 방법', tags: ['안전', '긴급'], imageKey: 'SAFETY_EMERGENCY', category: 'SAFETY' },
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

// Shows the year whenever it isn't self-evidently "now": either the
// occurrence's calendar year genuinely differs from today's real year (a
// next-year item from a wrapped-forward month tab always qualifies here — see
// fetchEventListings — regardless of which tab it's on, so two tabs never
// disagree about whether a next-year item needs the label), or the occurrence
// is ENDED. ENDED needs its own check even when the year does match today's:
// a reference item fetchEventListings' RECOMMENDED branch pulls in from last
// year when the wrapped year has nothing yet can itself land back in the
// real current year once that wrap rolls over, and "7.24~8.9" alone reads as
// an upcoming date, not one that already happened, without something marking
// it. Compared per date (not just the pair) so a range that itself crosses a
// year boundary (e.g. Dec 28 – Jan 3) still shows it on whichever side needs it.
function formatFeaturedEventDateRangeLabel(
  festivalOccurrence: Pick<FestivalOccurrence, 'startDate' | 'endDate' | 'status'> | null | undefined,
  language: LanguageCode,
) {
  if (!festivalOccurrence?.startDate || !festivalOccurrence.endDate) {
    return '';
  }

  const thisYear = new Date().getFullYear();
  const alwaysShowYear = festivalOccurrence.status === 'ENDED';

  const formatKoreanDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);
    const showYear = alwaysShowYear || date.getUTCFullYear() !== thisYear;
    const parts = new Intl.DateTimeFormat('ko-KR', {
      ...(showYear ? { year: '2-digit' as const } : {}),
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'UTC',
    }).formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return year ? `${year}.${month}.${day}(${weekday})` : `${month}.${day}(${weekday})`;
  };

  const formatEnglishDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);
    const showYear = alwaysShowYear || date.getUTCFullYear() !== thisYear;
    const parts = new Intl.DateTimeFormat('en-US', {
      ...(showYear ? { year: 'numeric' as const } : {}),
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'UTC',
    }).formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return year ? `${month} ${day}, ${year} (${weekday})` : `${month} ${day} (${weekday})`;
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

// DEADLINE-only (see fetchEventListings) — RECOMMENDED uses
// sortRecommendedWithDatedPriority instead, at the PlaceCard level where
// festivalOccurrence.status is still available; by the time items are mapped
// to EventListing/FeaturedEvent, only dateRangeLabel survives, which is all
// this needs to regroup DEADLINE's already-merged (dated items ahead of
// undated) list. Array.sort is stable, so DEADLINE's own soonest-end-date
// ordering within each group is preserved, just regrouped by date presence.
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
const MONTHLY_RECOMMENDATIONS_PAGE_SIZE = 20;
// The backend rejects size > 50 (INVALID_REQUEST) — this is the largest pool
// fetchEventListings can pull from when hunting for dated items below.
const MONTHLY_RECOMMENDATIONS_MAX_SIZE = 50;
const FEATURED_EVENTS_SIZE = 5;

// RECOMMENDED priority scheme (confirmed with product): within the combined
// pool built by withDatedHarvest below, dated items (has festivalOccurrence)
// rank ahead of undated ones; ENDED dated items are kept (not dropped) but
// pushed behind the still-relevant (ONGOING/UPCOMING) dated ones. Within each
// of those three groups, whatever order the input array already has is left
// untouched — Array.filter preserves order, so no re-sort is needed. That
// input order matters: see withDatedHarvest for why a dated item may be in
// real RECOMMENDED (score) order, or — for one the backend ranks far outside
// even a 50-item page — DEADLINE order as the only available fallback.
function sortRecommendedWithDatedPriority(items: PlaceCard[]): PlaceCard[] {
  const datedActive = items.filter(
    (item) => item.festivalOccurrence && item.festivalOccurrence.status !== 'ENDED',
  );
  const datedEnded = items.filter((item) => item.festivalOccurrence?.status === 'ENDED');
  const undated = items.filter((item) => !item.festivalOccurrence);
  return [...datedActive, ...datedEnded, ...undated];
}

// Harvests EVERY dated item for the month, any status included. Confirmed via
// spot checks (Nov 2026: totalCount 1083 under RECOMMENDED, but 0 of the top
// 50 have a festivalOccurrence at all — two real festivals that month,
// 구미라면 축제 and 포항국제불빛축제, only turn up here) that sort=DEADLINE's
// response consists solely of dated items and its totalCount always equals
// the true count of festival occurrences for the month/filter combo — unlike
// RECOMMENDED, which mixes dated and undated together in one ranking and can
// bury a low-curationPriority/quality-score dated item arbitrarily far past
// whatever page size gets requested, with no way to ask for more (the backend
// rejects size > 50) or otherwise learn where it actually ranks.
async function fetchAllDatedPlaceCards(
  params: Omit<MonthlyRecommendationsParams, 'sort' | 'size' | 'cursor'>,
): Promise<PlaceCard[]> {
  try {
    const result = await fetchMonthlyRecommendations({
      ...params,
      sort: 'DEADLINE',
      size: MONTHLY_RECOMMENDATIONS_MAX_SIZE,
    });
    return result.items;
  } catch {
    return [];
  }
}

// Appends whatever fetchAllDatedPlaceCards found that ISN'T already present in
// primaryItems (the RECOMMENDED page) — de-duplicated by placeId so a dated
// item that happened to rank inside primaryItems isn't repeated. Order matters
// for sortRecommendedWithDatedPriority above: primaryItems' own dated items
// keep their real RECOMMENDED (score) position since they're left at the
// front; the appended remainder has no real score signal (outside even the
// 50-item page), so it falls back to fetchAllDatedPlaceCards' own DEADLINE
// order among itself — the two effectively become two priority tiers within
// whichever "dated" bucket sortRecommendedWithDatedPriority sorts them into.
function withDatedHarvest(primaryItems: PlaceCard[], datedHarvest: PlaceCard[]): PlaceCard[] {
  const primaryIds = new Set(primaryItems.map((item) => item.placeId));
  const harvestOnly = datedHarvest.filter((item) => !primaryIds.has(item.placeId));
  return [...primaryItems, ...harvestOnly];
}

// DEADLINE-only: RECOMMENDED ranks by "ONGOING/UPCOMING/ENDED status before
// quality score" (see sortRecommendedWithDatedPriority above), which routinely
// buries a real festival below the MONTHLY_RECOMMENDATIONS_PAGE_SIZE cutoff
// entirely — e.g. April 2026 has 6 dated festivals but RECOMMENDED's own top
// 20 (even top 50) only surfaces 2 of them. DEADLINE, though, was confirmed
// (live Swagger + spot checks) to always rank every dated item in a month
// ahead of every undated one, regardless of how many there are — so it's used
// here purely as a way to harvest the full list of dated places for the
// month/filter combo, independent of whatever the primary sort's own ranking
// would have included. ENDED is excluded (unlike the RECOMMENDED path, which
// keeps it, just deprioritized) since "마감순" showing an already-over event as
// urgent would be actively misleading.
async function fetchDatedPlaceCards(
  params: Omit<MonthlyRecommendationsParams, 'sort' | 'size' | 'cursor'>,
): Promise<PlaceCard[]> {
  try {
    const result = await fetchMonthlyRecommendations({
      ...params,
      sort: 'DEADLINE',
      size: MONTHLY_RECOMMENDATIONS_MAX_SIZE,
    });
    return result.items.filter((item) => item.festivalOccurrence && item.festivalOccurrence.status !== 'ENDED');
  } catch {
    return [];
  }
}

// Puts every dated item (soonest-ending first, from fetchDatedPlaceCards)
// ahead of primaryItems' own undated ones, de-duplicating by placeId so a
// dated item that also happened to rank inside primaryItems isn't repeated.
// primaryItems can still carry the backend's own ENDED occurrences (GET
// /monthly-recommendations keeps a month's festivals visible with status
// ENDED after they close, per the live Swagger spec), which fetchDatedPlaceCards
// already excludes on its side — dropped here too, rather than just left
// unprioritized, since sortDatedFirst downstream keys off dateRangeLabel alone
// and would otherwise still pull an already-over festival back to the front.
function mergeDatedFirst(primaryItems: PlaceCard[], datedItems: PlaceCard[]): PlaceCard[] {
  const datedIds = new Set(datedItems.map((item) => item.placeId));
  const remainingPrimaryItems = primaryItems.filter(
    (item) => !datedIds.has(item.placeId) && item.festivalOccurrence?.status !== 'ENDED',
  );
  return [...datedItems, ...remainingPrimaryItems];
}

// Always RECOMMENDED (there's no sort toggle on the home screen), so this
// always goes through sortRecommendedWithDatedPriority — see its comment for
// the priority scheme, and withDatedHarvest for why a second (DEADLINE)
// request is still needed even at the max page size.
export async function fetchFeaturedEvents(
  category: FeaturedEventCategory,
  month?: number,
  year?: number,
): Promise<FeaturedEvent[]> {
  const now = new Date();
  const baseParams = {
    year: year ?? now.getFullYear(),
    month: month ?? now.getMonth() + 1,
    travelStyles: category === 'POPULAR' ? undefined : [category],
  } satisfies Omit<MonthlyRecommendationsParams, 'sort' | 'size' | 'cursor'>;

  try {
    const [result, datedHarvest] = await Promise.all([
      fetchMonthlyRecommendations({ ...baseParams, sort: 'RECOMMENDED', size: MONTHLY_RECOMMENDATIONS_MAX_SIZE }),
      fetchAllDatedPlaceCards(baseParams),
    ]);
    const combined = withDatedHarvest(result.items, datedHarvest);
    return sortRecommendedWithDatedPriority(combined).map(toFeaturedEvent).slice(0, FEATURED_EVENTS_SIZE);
  } catch {
    return [];
  }
}

// EventListScreen's full grid — region/date/type filtering happens
// server-side via GET /monthly-recommendations either way. Both sort modes
// pair the max-page primary request with their own dated-item harvest (see
// withDatedHarvest / mergeDatedFirst) — necessary in both directions, just for
// different reasons: RECOMMENDED's own top 50 can contain zero dated items at
// all for a low-traffic month (see sortRecommendedWithDatedPriority), and
// DEADLINE's default page (20) can still miss dated items ranked 21st or
// later by soonest-ending. They differ in what happens once harvested:
// RECOMMENDED keeps ENDED (pushed behind ONGOING/UPCOMING, never dropped) and
// orders dated items by real score where known, DEADLINE order otherwise;
// DEADLINE excludes ENDED entirely and always orders by soonest-ending.
export async function fetchEventListings(
  month: number,
  sort: EventSortOrder = 'RECOMMENDED',
  filters: EventFilters = DEFAULT_EVENT_FILTERS,
): Promise<EventListing[]> {
  const hasCustomDateRange = Boolean(filters.dateRange.startDate && filters.dateRange.endDate);
  // EventListScreen's month pills wrap forward from the current month across
  // 12 tabs (see orderedMonths there) — e.g. from September, the "1월" tab
  // means next January, not the one that already happened this year. A month
  // number earlier than the current one is therefore next year's; the current
  // month itself and everything after it stay this year.
  const now = new Date();
  const year = month >= now.getMonth() + 1 ? now.getFullYear() : now.getFullYear() + 1;
  const baseParams = {
    year,
    month,
    serviceRegionCode: filters.region === 'ALL' ? undefined : filters.region,
    dateFilterType: hasCustomDateRange ? 'CUSTOM' : filters.date === 'ALL' ? undefined : filters.date,
    customStartDate: hasCustomDateRange ? filters.dateRange.startDate! : undefined,
    customEndDate: hasCustomDateRange ? filters.dateRange.endDate! : undefined,
    travelStyles: filters.type === 'ALL' ? undefined : [filters.type],
  } satisfies Omit<MonthlyRecommendationsParams, 'sort' | 'size' | 'cursor'>;

  try {
    if (sort === 'RECOMMENDED') {
      const [result, datedHarvest] = await Promise.all([
        fetchMonthlyRecommendations({ ...baseParams, sort: 'RECOMMENDED', size: MONTHLY_RECOMMENDATIONS_MAX_SIZE }),
        fetchAllDatedPlaceCards(baseParams),
      ]);
      let combined = withDatedHarvest(result.items, datedHarvest);

      // year is only ever bumped to next year when the tab wrapped forward
      // (see above) — for a month that far out, the backend often hasn't
      // registered next year's occurrence yet (visibleFrom/6-month-out rule),
      // leaving nothing dated to show. Falls back to last year's same month
      // as a labeled reference (formatFeaturedEventDateRangeLabel prints its
      // year since it's never "this year") rather than showing nothing — it
      // always lands in sortRecommendedWithDatedPriority's ENDED bucket since
      // a year-old occurrence is definitionally over. Only when genuinely
      // empty, not merely thin, so a month that already has real next-year
      // festivals never gets stale ones mixed in beside them.
      const hasDatedItem = combined.some((item) => item.festivalOccurrence);
      if (!hasDatedItem && year !== now.getFullYear()) {
        const previousYearHarvest = await fetchAllDatedPlaceCards({ ...baseParams, year: year - 1 });
        combined = withDatedHarvest(combined, previousYearHarvest);
      }

      const reordered = sortRecommendedWithDatedPriority(combined).slice(0, MONTHLY_RECOMMENDATIONS_PAGE_SIZE);
      return reordered.map(toEventListing);
    }

    const [result, datedItems] = await Promise.all([
      fetchMonthlyRecommendations({ ...baseParams, sort: 'DEADLINE', size: MONTHLY_RECOMMENDATIONS_PAGE_SIZE }),
      fetchDatedPlaceCards(baseParams),
    ]);
    const merged = mergeDatedFirst(result.items, datedItems).slice(0, MONTHLY_RECOMMENDATIONS_PAGE_SIZE);
    return sortDatedFirst(merged.map(toEventListing));
  } catch {
    return [];
  }
}
