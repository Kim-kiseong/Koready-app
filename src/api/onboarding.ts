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

export type OnboardingSubmission = {
  purpose: PurposeId;
  location: {
    displayAddress: string;
    latitude: number | null;
    longitude: number | null;
    source: 'search' | 'current';
  };
  travelStyles: TravelStyleId[];
};

// TODO: replace with client.post('/onboarding', data) once the endpoint exists.
// Should return an updated session/nextStep so the client knows where to route next.
export async function submitOnboarding(data: OnboardingSubmission): Promise<void> {
  console.log('[mock] submitOnboarding', data);
}
