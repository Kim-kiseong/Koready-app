import type { LanguageCode } from '@/api/types';

const REGION_LABELS: Record<LanguageCode, Record<string, string>> = {
  KO: {
    SEOUL: '서울',
    GYEONGGI: '경기도',
    GANGWON: '강원도',
    CHUNGCHEONG: '충청도',
    JEOLLA: '전라도',
    GYEONGSANG: '경상도',
    JEJU: '제주도',
  },
  EN: {
    SEOUL: 'Seoul',
    GYEONGGI: 'Gyeonggi',
    GANGWON: 'Gangwon',
    CHUNGCHEONG: 'Chungcheong',
    JEOLLA: 'Jeolla',
    GYEONGSANG: 'Gyeongsang',
    JEJU: 'Jeju',
  },
};

const TRAVEL_STYLE_LABELS: Record<LanguageCode, Record<string, string>> = {
  KO: {
    LOCAL_FOOD: '로컬 맛집',
    LOCAL_FESTIVAL: '지역 축제',
    TRADITIONAL_MARKET: '전통시장',
    CULTURE_EXPERIENCE: '문화체험',
    NATURE: '자연 명소',
    EXHIBITION_MUSEUM: '전시/미술관',
    DRAMA_LOCATION: '드라마 촬영지',
  },
  EN: {
    LOCAL_FOOD: 'Local Food',
    LOCAL_FESTIVAL: 'Local Festival',
    TRADITIONAL_MARKET: 'Traditional Market',
    CULTURE_EXPERIENCE: 'Cultural Experience',
    NATURE: 'Nature',
    EXHIBITION_MUSEUM: 'Exhibitions & Museums',
    DRAMA_LOCATION: 'Drama Filming Sites',
  },
};

export function formatPlaceRegionName(serviceRegionCode: string, language: LanguageCode) {
  return REGION_LABELS[language][serviceRegionCode] ?? serviceRegionCode;
}

export function formatPlaceTravelStyle(travelStyle: string, language: LanguageCode) {
  return TRAVEL_STYLE_LABELS[language][travelStyle] ?? travelStyle;
}

export function formatPlaceTitle(title: string, language: LanguageCode) {
  return title;
}

// The admin-curated onboarding candidate set (GET
// /onboarding/place-candidate-sets/current) comes back with its `title` and
// `curatorMessage` already localized by the backend, but `tags` are raw
// Korean text regardless of the user's language — this maps the ones
// confirmed to appear in the published set. An unmapped tag falls back to
// the original Korean string (rather than disappearing), since a partial
// dictionary is safer than silently dropping content an admin curated.
const PLACE_TAG_LABELS_EN: Record<string, string> = {
  궁궐: 'Palace',
  역사: 'History',
  서울: 'Seoul',
  전통시장: 'Traditional Market',
  길거리음식: 'Street Food',
  박물관: 'Museum',
  한국사: 'Korean History',
  전시: 'Exhibition',
  전통문화: 'Traditional Culture',
  촬영지: 'Filming Location',
  체험: 'Experience',
};

export function formatPlaceTag(tag: string, language: LanguageCode) {
  if (language === 'KO') return tag;
  return PLACE_TAG_LABELS_EN[tag] ?? tag;
}
