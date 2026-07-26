import type { EventDateFilterId, EventRegionId, FeaturedEventCategory, GuideCategoryId } from '@/api/home';
import type { PurposeId, TravelStyleId } from '@/api/onboarding';
import type { LanguageCode } from '@/api/types';

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
  destination: {
    title: string;
    subtitle: string;
    next: string;
  };
  complete: {
    title: string;
    subtitle: string;
    next: string;
  };
  home: {
    locationPlaceholder: string;
    searchPlaceholder: string;
    featuredTitlePrefix: string;
    featuredTitleConnector: string;
    featuredTitleSuffix: string;
    guidesSectionTitle: string;
    seeAll: string;
    languageKo: string;
    languageEn: string;
    categories: Record<FeaturedEventCategory, string>;
  };
  guideList: {
    title: string;
    description: string;
    categories: Record<GuideCategoryId, string>;
  };
  languageModal: {
    title: string;
    subtitle: Record<LanguageCode, string>;
    cancel: string;
    confirm: string;
  };
  address: {
    title: string;
    searchPlaceholder: string;
    addHome: string;
    currentAddressBadge: string;
  };
  addressSearch: {
    title: string;
  };
  addressEdit: {
    title: string;
    delete: string;
  };
  deleteAddressModal: {
    suffix: string;
    cancel: string;
    confirm: string;
  };
  eventList: {
    titleSuffix: string;
    total: string;
    countUnit: string;
    sortTitle: string;
    sortRecommended: string;
    sortDeadline: string;
  };
  eventFilter: {
    title: string;
    reset: string;
    regionLabel: string;
    regionAll: string;
    regionOptions: Record<EventRegionId, string>;
    dateLabel: string;
    dateAll: string;
    dateOptions: Record<EventDateFilterId, string>;
    dateCustomButton: string;
    typeLabel: string;
    typeOptions: Record<TravelStyleId, string>;
    cancel: string;
    apply: string;
  };
  placeDetail: {
    loading: string;
    tabs: {
      description: string;
      route: string;
      mate: string;
    };
    enjoyTitle: string;
    nearbyTitle: string;
    routePlaceholder: string;
    matePlaceholder: string;
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
  destination: {
    title: '관심 있는 여행지를 \n3개까지 선택해 주세요',
    subtitle: '여행 취향을 반영해 더 알맞은 여행지를 추천해 드릴게요.',
    next: '다음',
  },
  complete: {
    title: '취향 설정이 완료되었어요',
    subtitle: '선택한 여행지를 바탕으로\n맞춤 여행지를 추천해드릴게요!',
    next: '다음',
  },
  home: {
    locationPlaceholder: '위치 정보 없음',
    searchPlaceholder: '오늘은 어떤 여행을 해보실래요?',
    featuredTitlePrefix: '한국',
    featuredTitleConnector: '에 왔으면,',
    featuredTitleSuffix: "월엔 '이건' 해야지!",
    guidesSectionTitle: '호리가 알려주는 한국 여행 가이드',
    seeAll: '전체보기',
    languageKo: '한국어',
    languageEn: 'English',
    categories: {
      POPULAR: '인기',
      LOCAL_FESTIVAL: '지역 축제',
      EXHIBITION_GALLERY: '전시/미술관',
      NATURE_SPOT: '자연 명소',
    },
  },
  guideList: {
    title: '한국 여행 가이드',
    description: '교통 이용부터 결제, 안전, 언어까지 필요한 정보를 영상으로 확인해보세요.',
    categories: {
      TRANSPORT: '교통',
      ORDER: '주문',
      SAFETY: '안전',
      LANGUAGE: '언어',
    },
  },
  languageModal: {
    title: '언어를 변경할까요?',
    subtitle: {
      EN: '앱 언어를 English로 전환할까요? \n변경 후 일부 화면은 다시 불러올 수 있어요.',
      KO: '앱 언어를 한국어로 전환할까요? \n변경 후 일부 화면은 다시 불러올 수 있어요.',
    },
    cancel: '취소',
    confirm: '변경하기',
  },
  address: {
    title: '주소 설정',
    searchPlaceholder: '도로명, 건물명, 지번으로 검색해 보세요',
    addHome: '우리집 추가',
    currentAddressBadge: '현재 설정된 주소',
  },
  addressSearch: {
    title: '주소 검색',
  },
  addressEdit: {
    title: '주소 편집',
    delete: '삭제',
  },
  deleteAddressModal: {
    suffix: '주소를 삭제하시나요?',
    cancel: '닫기',
    confirm: '삭제',
  },
  eventList: {
    titleSuffix: '월에 가볼 만한 곳',
    total: '전체',
    countUnit: '개',
    sortTitle: '정렬',
    sortRecommended: '추천순',
    sortDeadline: '마감순',
  },
  eventFilter: {
    title: '필터',
    reset: '초기화',
    regionLabel: '지역',
    regionAll: '전체',
    regionOptions: {
      SEOUL: '서울',
      INCHEON: '인천',
      GYEONGGI: '경기',
      GANGWON: '강원',
      CHUNGCHEONG: '충청',
      JEOLLA: '전라',
      GYEONGSANG: '경상',
      JEJU: '제주',
    },
    dateLabel: '날짜',
    dateAll: '전체',
    dateOptions: {
      THIS_WEEK: '이번 주',
      THIS_MONTH: '이번 달',
      NEXT_MONTH: '다음 달',
    },
    dateCustomButton: '날짜 선택',
    typeLabel: '관광 유형',
    typeOptions: {
      LOCAL_FOOD: '로컬맛집',
      LOCAL_FESTIVAL: '지역축제',
      TRADITIONAL_MARKET: '전통시장',
      CULTURE_EXPERIENCE: '문화체험',
      NATURE_SPOT: '자연명소',
      EXHIBITION_GALLERY: '전시/미술관',
      DRAMA_FILMING_SITE: '드라마 촬영지',
    },
    cancel: '취소',
    apply: '적용하기',
  },
  placeDetail: {
    loading: '정보를 불러오는 중이에요.',
    tabs: {
      description: '설명',
      route: '이동',
      mate: '메이트',
    },
    enjoyTitle: '이렇게 즐겨보세요',
    nearbyTitle: '같이 가보면 좋은 명소',
    routePlaceholder: '이동 정보는 준비 중이에요.',
    matePlaceholder: '메이트 기능은 준비 중이에요.',
  },
};
