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
