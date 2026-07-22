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
