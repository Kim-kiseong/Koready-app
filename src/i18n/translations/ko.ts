import type { PurposeId, TravelStyleId } from '@/api/onboarding';

export interface Translations {
  language: {
    title: string;
    subtitle: string;
    next: string;
  };
  purpose: {
    title: string;
    subtitle: string;
    next: string;
    options: Record<PurposeId, string>;
  };
  location: {
    title: string;
    searchPlaceholder: string;
    currentLocationButton: string;
    currentLocationValue: string;
    roadAddressBadge: string;
    lotNumberBadge: string;
    next: string;
  };
  travelStyle: {
    title: string;
    subtitle: string;
    next: string;
    options: Record<TravelStyleId, string>;
  };
}

export const ko: Translations = {
  language: {
    title: '언어를 선택해주세요',
    subtitle: 'Choose your language',
    next: '다음',
  },
  purpose: {
    title: '한국에 오신 목적이 무엇인가요?',
    subtitle: '여행 목적에 맞는 장소와 경험을 추천해드려요.',
    next: '다음',
    options: {
      EXCHANGE_STUDENT: '교환학생',
      LANGUAGE_COURSE: '어학연수',
      SHORT_TRIP: '단기여행',
      DEGREE_PROGRAM: '학위과정',
      INTERN_JOB: '인턴/취업',
      OTHER: '기타',
      WORKING_HOLIDAY: '워킹홀리데이',
    },
  },
  location: {
    title: '위치 검색',
    searchPlaceholder: '도시 · 학교 · 동네를 검색해보세요',
    currentLocationButton: '현재 위치로 찾기',
    currentLocationValue: '현재 위치',
    roadAddressBadge: '도로명',
    lotNumberBadge: '지번',
    next: '다음',
  },
  travelStyle: {
    title: '어떤 여행을 즐기고 싶으신가요?',
    subtitle: '관심 있는 여행 스타일을 선택해 주세요.',
    next: '다음',
    options: {
      LOCAL_FOOD: '로컬 맛집',
      LOCAL_FESTIVAL: '지역 축제',
      TRADITIONAL_MARKET: '전통시장',
      CULTURE_EXPERIENCE: '문화체험',
      NATURE_SPOT: '자연 명소',
      EXHIBITION_GALLERY: '전시/미술관',
      DRAMA_FILMING_SITE: '드라마 촬영지',
    },
  },
};
