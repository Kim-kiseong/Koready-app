export type PurposeId =
  | 'EXCHANGE_STUDENT'
  | 'LANGUAGE_COURSE'
  | 'SHORT_TRIP'
  | 'DEGREE_PROGRAM'
  | 'INTERN_JOB'
  | 'OTHER'
  | 'WORKING_HOLIDAY';

export const PURPOSE_IDS: readonly PurposeId[] = [
  'EXCHANGE_STUDENT',
  'LANGUAGE_COURSE',
  'SHORT_TRIP',
  'DEGREE_PROGRAM',
  'INTERN_JOB',
  'OTHER',
  'WORKING_HOLIDAY',
];

export type TravelStyleId =
  | 'LOCAL_FOOD'
  | 'LOCAL_FESTIVAL'
  | 'TRADITIONAL_MARKET'
  | 'CULTURE_EXPERIENCE'
  | 'NATURE_SPOT'
  | 'EXHIBITION_GALLERY'
  | 'DRAMA_FILMING_SITE';

export const TRAVEL_STYLE_IDS: readonly TravelStyleId[] = [
  'LOCAL_FOOD',
  'LOCAL_FESTIVAL',
  'TRADITIONAL_MARKET',
  'CULTURE_EXPERIENCE',
  'NATURE_SPOT',
  'EXHIBITION_GALLERY',
  'DRAMA_FILMING_SITE',
];

export type LocationSearchResult = {
  zipNo: string;
  roadAddr: string;
  jibunAddr: string;
};

const MOCK_LOCATIONS: LocationSearchResult[] = [
  {
    zipNo: '02845',
    roadAddr: '서울특별시 성북구 보문로34가길 17 (동선동3가)',
    jibunAddr: '서울특별시 성북구 동선동3가 237 성신여자대학교 직장어린이집 및 기숙사',
  },
  {
    zipNo: '06236',
    roadAddr: '서울특별시 강남구 테헤란로 152',
    jibunAddr: '서울특별시 강남구 역삼동 737',
  },
  {
    zipNo: '06236',
    roadAddr: '서울특별시 강남구 테헤란로 231',
    jibunAddr: '서울특별시 강남구 역삼동 803',
  },
  {
    zipNo: '03181',
    roadAddr: '서울특별시 종로구 세종대로 209',
    jibunAddr: '서울특별시 종로구 세종로 82',
  },
  {
    zipNo: '04523',
    roadAddr: '서울특별시 중구 세종대로 110',
    jibunAddr: '서울특별시 중구 태평로1가 31',
  },
];

// TODO: replace with client.get<LocationSearchEnvelope>('/locations/search', { params: { query } })
// once the endpoint exists. Real response is expected to mirror Korea's road-name address
// API shape ({ zipNo, roadAddr, jibunAddr }) — the mock above already uses it, so screen
// code needs no reshaping when this goes live.
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  return MOCK_LOCATIONS.filter((r) => r.roadAddr.includes(q) || r.jibunAddr.includes(q));
}

export type DestinationId =
  | 'NATIONAL_MUSEUM'
  | 'JEONJU_HANOK_VILLAGE'
  | 'GWANGJANG_MARKET'
  | 'HALLASAN'
  | 'YEOSU_CABLE_CAR'
  | 'GAMCHEON_VILLAGE'
  | 'MYEONGDONG'
  | 'NAMI_ISLAND'
  | 'BORYEONG_MUD_FESTIVAL'
  | 'NONSAN_SUNSHINE_LAND';

export type Destination = {
  id: DestinationId;
  name: string;
  tags: [string, string];
};

// TODO: replace with a real GET /destinations response once the endpoint exists.
// `name`/`tags` are Korean copy straight from the design, not run through i18n —
// unlike PURPOSE_IDS/TRAVEL_STYLE_IDS these are real-world place names, not a
// fixed set of app-defined categories, so they'll come from the backend as-is.
export const DESTINATIONS: Destination[] = [
  { id: 'NATIONAL_MUSEUM', name: '국립중앙박물관', tags: ['역사', '전시'] },
  { id: 'JEONJU_HANOK_VILLAGE', name: '전주한옥마을', tags: ['역사', '전시'] },
  { id: 'GWANGJANG_MARKET', name: '서울 광장시장', tags: ['음식', '로컬'] },
  { id: 'HALLASAN', name: '제주 한라산', tags: ['힐링', '휴식'] },
  { id: 'YEOSU_CABLE_CAR', name: '여수 해상케이블카', tags: ['풍경', '낭만'] },
  { id: 'GAMCHEON_VILLAGE', name: '부산 감천문화마을', tags: ['예술', '사진'] },
  { id: 'MYEONGDONG', name: '명동거리', tags: ['쇼핑', '음식'] },
  { id: 'NAMI_ISLAND', name: '남이섬', tags: ['계절', '풍경'] },
  { id: 'BORYEONG_MUD_FESTIVAL', name: '보령머드축제', tags: ['체험', '계절'] },
  { id: 'NONSAN_SUNSHINE_LAND', name: '논산 선샤인랜드', tags: ['탐방', '호기심'] },
];

// TODO: replace with client.get<DestinationListEnvelope>('/destinations')
export async function fetchDestinations(): Promise<Destination[]> {
  return DESTINATIONS;
}

export type OnboardingSubmission = {
  purpose: PurposeId;
  location: {
    displayAddress: string;
    latitude: number | null;
    longitude: number | null;
    source: 'search' | 'current';
  };
  travelStyles: TravelStyleId[];
  destinations: DestinationId[];
};

// TODO: replace with client.post('/onboarding', data) once the endpoint exists.
// Should return an updated session/nextStep so the client knows where to route next.
export async function submitOnboarding(data: OnboardingSubmission): Promise<void> {
  console.log('[mock] submitOnboarding', data);
}
