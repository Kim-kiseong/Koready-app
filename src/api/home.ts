import type { TravelStyleId } from '@/api/onboarding';

export type FeaturedEventCategory =
  | 'POPULAR'
  | 'LOCAL_FESTIVAL'
  | 'EXHIBITION_GALLERY'
  | 'NATURE_SPOT';

export const FEATURED_EVENT_CATEGORIES: readonly FeaturedEventCategory[] = [
  'POPULAR',
  'LOCAL_FESTIVAL',
  'EXHIBITION_GALLERY',
  'NATURE_SPOT',
];

export type FeaturedEvent = {
  id: string;
  title: string;
  dateRangeLabel: string;
  imageKey: 'JEONJU_IPAP_FESTIVAL' | 'DAMYANG_BAMBOO_FESTIVAL';
};

const MOCK_FEATURED_EVENTS: Record<FeaturedEventCategory, FeaturedEvent[]> = {
  POPULAR: [
    {
      id: 'jeonju-ipap-festival',
      title: '[전주] 이팝나무 축제',
      dateRangeLabel: '4.25(토)~4.26(일)',
      imageKey: 'JEONJU_IPAP_FESTIVAL',
    },
    {
      id: 'damyang-bamboo-festival',
      title: '[담양] 대나무 축제',
      dateRangeLabel: '5.1(금)~5.5(화)',
      imageKey: 'DAMYANG_BAMBOO_FESTIVAL',
    },
    {
      id: 'jeonju-ipap-festival-2',
      title: '[전주] 이팝나무 축제',
      dateRangeLabel: '4.25(토)~4.26(일)',
      imageKey: 'JEONJU_IPAP_FESTIVAL',
    },
  ],
  LOCAL_FESTIVAL: [],
  EXHIBITION_GALLERY: [],
  NATURE_SPOT: [],
};

// TODO: replace with client.get('/home/featured-events', { params: { category } })
export async function fetchFeaturedEvents(category: FeaturedEventCategory): Promise<FeaturedEvent[]> {
  return MOCK_FEATURED_EVENTS[category];
}

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

// TODO: replace with client.get('/home/guides')
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

// TODO: replace with client.get('/home/guide-videos', { params: { category } })
export async function fetchGuideVideos(category: GuideCategoryId): Promise<GuideVideo[]> {
  return MOCK_GUIDE_VIDEOS[category];
}

export type EventListingCategory = 'LOCAL_FESTIVAL' | 'NATURE_SPOT' | 'EXHIBITION_GALLERY';

export type EventSortOrder = 'RECOMMENDED' | 'DEADLINE';

export type EventListing = {
  id: string;
  title: string;
  location: string;
  dateRangeLabel: string;
  category: EventListingCategory;
  month: number;
  // ISO end date, used only for "마감순" sorting — not shown directly (dateRangeLabel is the display copy).
  deadline: string;
  imageKey:
    | 'SEOUL_SPRING_FLOWER_FESTIVAL'
    | 'DAMYANG_BAMBOO_FOREST_WALK'
    | 'NATIONAL_MUSEUM_OF_MODERN_ART'
    | 'HAEUNDAE_SAND_FESTIVAL';
};

const MOCK_EVENT_LISTINGS: EventListing[] = [
  {
    id: 'seoul-spring-flower-festival',
    title: '서울 봄꽃축제',
    location: '서울',
    dateRangeLabel: '4.1(목)~5.5(월)',
    category: 'LOCAL_FESTIVAL',
    month: 5,
    deadline: '2026-05-05',
    imageKey: 'SEOUL_SPRING_FLOWER_FESTIVAL',
  },
  {
    id: 'damyang-bamboo-forest-walk',
    title: '대나무숲 산책',
    location: '담양',
    dateRangeLabel: '5.1(금)~5.5(화)',
    category: 'NATURE_SPOT',
    month: 5,
    deadline: '2026-05-05',
    imageKey: 'DAMYANG_BAMBOO_FOREST_WALK',
  },
  {
    id: 'national-museum-of-modern-art',
    title: '국립현대미술관',
    location: '서울',
    dateRangeLabel: '5.3(일)~6.15(월)',
    category: 'EXHIBITION_GALLERY',
    month: 5,
    deadline: '2026-06-15',
    imageKey: 'NATIONAL_MUSEUM_OF_MODERN_ART',
  },
  {
    id: 'haeundae-sand-festival',
    title: '해운대 모래축제',
    location: '부산',
    dateRangeLabel: '4.1(목)~5.5(월)',
    category: 'LOCAL_FESTIVAL',
    month: 5,
    deadline: '2026-05-05',
    imageKey: 'HAEUNDAE_SAND_FESTIVAL',
  },
];

export type EventRegionId =
  | 'SEOUL'
  | 'INCHEON'
  | 'GYEONGGI'
  | 'GANGWON'
  | 'CHUNGCHEONG'
  | 'JEOLLA'
  | 'GYEONGSANG'
  | 'JEJU';

export const EVENT_REGION_IDS: readonly EventRegionId[] = [
  'SEOUL',
  'INCHEON',
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

// Mock listings only cover a handful of cities — this stands in for a real region lookup.
const EVENT_REGION_BY_LOCATION: Record<string, EventRegionId> = {
  서울: 'SEOUL',
  담양: 'JEOLLA',
  부산: 'GYEONGSANG',
};

function matchesDateFilter(deadline: string, filter: EventDateFilterId): boolean {
  const target = new Date(deadline);
  const now = new Date();
  if (filter === 'THIS_WEEK') {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return target >= now && target <= weekEnd;
  }
  if (filter === 'THIS_MONTH') {
    return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
  }
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return target.getFullYear() === nextMonth.getFullYear() && target.getMonth() === nextMonth.getMonth();
}

// TODO: replace with client.get('/home/event-listings', { params: { month, sort, ...filters } })
export async function fetchEventListings(
  month: number,
  sort: EventSortOrder = 'RECOMMENDED',
  filters: EventFilters = DEFAULT_EVENT_FILTERS,
): Promise<EventListing[]> {
  let events = MOCK_EVENT_LISTINGS.filter((event) => event.month === month);
  if (filters.region !== 'ALL') {
    events = events.filter((event) => EVENT_REGION_BY_LOCATION[event.location] === filters.region);
  }
  if (filters.type !== 'ALL') {
    events = events.filter((event) => event.category === filters.type);
  }
  if (filters.date !== 'ALL') {
    events = events.filter((event) => matchesDateFilter(event.deadline, filters.date as EventDateFilterId));
  }
  if (sort === 'DEADLINE') {
    events = [...events].sort((a, b) => a.deadline.localeCompare(b.deadline));
  }
  return events;
}
