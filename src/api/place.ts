import { isAxiosError } from 'axios';
import { Asset } from 'expo-asset';
import type { ImageSource } from 'expo-image';

import { HomeImages } from '@/constants/home-images';
import type {
  PlaceListItem,
  PlaceListResponse,
  PlaceSortOrder,
} from './types';

import { client } from './client';

export type PlaceDetailTab = 'DESCRIPTION' | 'ROUTE' | 'MATE';

export type PlaceImage = {
  source: ImageSource;
  order: number;
  altText: string;
};

export type PlaceDescription = {
  impactTitle: string;
  impactSubtitle: string;
  introParagraphs: string[];
  enjoyPoints: string[];
};

export type RelatedPlace = {
  id: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
};

export type PlaceDetail = {
  id: string;
  routeId?: string;
  numericId?: number;
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
  images: PlaceImage[];
  description: PlaceDescription;
  relatedPlaces: RelatedPlace[];
};

export const DEFAULT_PLACE_DESCRIPTION: PlaceDescription = {
  impactTitle: '김천에서 만나는 가장 맛있는 한 줄 여행',
  impactSubtitle: '김천 김밥축제는 김밥을 주제로 먹고, 만들고, 즐길 수 있는 지역축제예요.',
  introParagraphs: [
    '김밥은 한국에서 가장 익숙한 음식 중 하나지만, 평소에 먹던 김밥과는 조금 다른 김천만의 재미있는 김밥 문화를 만날 수 있어요.',
  ],
  enjoyPoints: [
    '다양한 김밥 부스에서 김밥 맛보기',
    '김밥 만들기 체험 참여하기',
    '김밥 포토존에서 사진 찍기',
    '지역 특산물과 먹거리 부스 구경하기',
    '축제장 주변 로컬 명소 함께 둘러보기',
  ],
};

const DEFAULT_PLACE_DETAIL: Omit<PlaceDetail, 'id' | 'title'> = {
  routeId: 'gimcheon-gimbap-festival',
  numericId: 1101,
  address: '경상북도 김천시 직지사길 130 (대항면 운수리)',
  tags: ['지역축제', '음식', '시즌추천'],
  isSaved: false,
  images: [
    { source: { uri: 'https://picsum.photos/id/1050/1200/1200' }, order: 1, altText: '축제 메인 이미지' },
    { source: { uri: 'https://picsum.photos/id/1025/1200/1200' }, order: 2, altText: '축제장 풍경' },
    { source: { uri: 'https://picsum.photos/id/1040/1200/1200' }, order: 3, altText: '김밥 만들기 체험' },
    { source: { uri: 'https://picsum.photos/id/1068/1200/1200' }, order: 4, altText: '축제 현장' },
  ],
  description: DEFAULT_PLACE_DESCRIPTION,
  relatedPlaces: [
    {
      id: 'jikkjisa',
      title: '직지사',
      imageUrl: 'https://picsum.photos/id/1036/300/300',
      shortDescription: '김천을 대표하는 사찰로, 조용한 산책과 전통적인 분위기를 함께 느낄 수 있어요. 축제 전후로 가볍게 들르기 좋아요',
    },
    {
      id: 'samyung-park',
      title: '사명대사공원',
      imageUrl: 'https://picsum.photos/id/1041/300/300',
      shortDescription: '넓은 공원과 산책로가 있어 축제 후 쉬어 가기 좋은 장소예요. 사진 찍기에도 좋아요.',
    },
    {
      id: 'gimcheon-museum',
      title: '김천시립박물관',
      imageUrl: 'https://picsum.photos/id/1057/300/300',
      shortDescription: '김천의 역사와 지역 문화를 알아볼 수 있는 공간이에요. 로컬 여행 코스로 함께 넣기 좋아요.',
    },
  ],
};

const GIMCHEON_GIMBAP_FESTIVAL_DETAIL: PlaceDetail = {
  ...DEFAULT_PLACE_DETAIL,
  id: '1101',
  routeId: 'gimcheon-gimbap-festival',
  numericId: 1101,
  title: '김천 김밥축제',
  address: '경상북도 김천시 직지사길 130 (대항면 운수리)',
};

const JEONJU_IPAP_FESTIVAL_DETAIL: PlaceDetail = {
  ...DEFAULT_PLACE_DETAIL,
  id: 'jeonju-ipap-festival',
  routeId: 'jeonju-ipap-festival',
  numericId: 1102,
  title: '[전주] 이팝나무 축제',
  address: '전북특별자치도 전주시 완산구 일대',
  images: [
    { source: HomeImages.JEONJU_IPAP_FESTIVAL, order: 1, altText: '전주 이팝나무 축제' },
    ...DEFAULT_PLACE_DETAIL.images.slice(1),
  ],
};

const DAMYANG_BAMBOO_FESTIVAL_DETAIL: PlaceDetail = {
  ...DEFAULT_PLACE_DETAIL,
  id: 'damyang-bamboo-festival',
  routeId: 'damyang-bamboo-festival',
  numericId: 1103,
  title: '[담양] 대나무 축제',
  address: '전라남도 담양군 담양읍 죽녹원로 119',
  images: [
    { source: HomeImages.DAMYANG_BAMBOO_FESTIVAL, order: 1, altText: '담양 대나무 축제' },
    ...DEFAULT_PLACE_DETAIL.images.slice(1),
  ],
};

const JIKKJISA_DETAIL: PlaceDetail = {
  ...DEFAULT_PLACE_DETAIL,
  id: 'jikkjisa',
  routeId: 'jikkjisa',
  numericId: 1104,
  title: '직지사',
  address: '경상북도 김천시 대항면 직지사길 95',
  tags: ['사찰', '역사', '산책'],
  images: [
    { source: { uri: 'https://picsum.photos/id/1036/300/300' }, order: 1, altText: '직지사' },
    ...DEFAULT_PLACE_DETAIL.images.slice(1),
  ],
};

const SAMYUNG_PARK_DETAIL: PlaceDetail = {
  ...DEFAULT_PLACE_DETAIL,
  id: 'samyung-park',
  routeId: 'samyung-park',
  numericId: 1105,
  title: '사명대사공원',
  address: '경상북도 김천시 대항면 운수리 31-1',
  tags: ['공원', '산책', '사진'],
  images: [
    { source: { uri: 'https://picsum.photos/id/1041/300/300' }, order: 1, altText: '사명대사공원' },
    ...DEFAULT_PLACE_DETAIL.images.slice(1),
  ],
};

const GIMCHEON_MUSEUM_DETAIL: PlaceDetail = {
  ...DEFAULT_PLACE_DETAIL,
  id: 'gimcheon-museum',
  routeId: 'gimcheon-museum',
  numericId: 1106,
  title: '김천시립박물관',
  address: '경상북도 김천시 대항면 직지사길 130',
  tags: ['박물관', '역사', '문화'],
  images: [
    { source: { uri: 'https://picsum.photos/id/1057/300/300' }, order: 1, altText: '김천시립박물관' },
    ...DEFAULT_PLACE_DETAIL.images.slice(1),
  ],
};

const MOCK_PLACE_DETAILS: Record<string, PlaceDetail> = {
  '1101': GIMCHEON_GIMBAP_FESTIVAL_DETAIL,
  'gimcheon-gimbap-festival': GIMCHEON_GIMBAP_FESTIVAL_DETAIL,
  '1102': JEONJU_IPAP_FESTIVAL_DETAIL,
  'jeonju-ipap-festival': JEONJU_IPAP_FESTIVAL_DETAIL,
  '1103': DAMYANG_BAMBOO_FESTIVAL_DETAIL,
  'damyang-bamboo-festival': DAMYANG_BAMBOO_FESTIVAL_DETAIL,
  '1104': JIKKJISA_DETAIL,
  jikkjisa: JIKKJISA_DETAIL,
  '1105': SAMYUNG_PARK_DETAIL,
  'samyung-park': SAMYUNG_PARK_DETAIL,
  '1106': GIMCHEON_MUSEUM_DETAIL,
  'gimcheon-museum': GIMCHEON_MUSEUM_DETAIL,
};

function getMockPlaceListItem(placeId: string) {
  return [
    ...MOCK_SEOUL_PLACES,
    ...MOCK_GYEONGGI_PLACES,
    ...MOCK_CHUNGCHEONG_PLACES,
    ...MOCK_JEOLLA_PLACES,
    ...MOCK_GANGWON_PLACES,
    ...MOCK_GYEONGSANG_PLACES,
    ...MOCK_JEJU_PLACES,
  ].find((place) => String(place.placeId) === placeId);
}

function buildGenericPlaceDetailFromListItem(place: MockPlaceListItem): PlaceDetail {
  return {
    id: String(place.placeId),
    routeId: String(place.placeId),
    numericId: place.placeId,
    title: place.title,
    address: place.addressSummary,
    tags: [...place.tags],
    isSaved: place.saved,
    images: [
      {
        source: { uri: place.imageUrl },
        order: 1,
        altText: `${place.title} 대표 이미지`,
      },
      ...DEFAULT_PLACE_DETAIL.images.slice(1),
    ],
    description: {
      impactTitle: `${place.title}에서 만나는 ${place.serviceRegionName}의 매력`,
      impactSubtitle: '현재는 화면 확인용 mock 데이터로 연결되어 있어요.',
      introParagraphs: [
        `${place.title}은(는) ${place.serviceRegionName} 여행 흐름을 살펴보기 좋은 대표 장소예요.`,
      ],
      enjoyPoints: [
        '대표 포인트 둘러보기',
        '주변 동선과 지도 위치 확인하기',
        '사진 찍기 좋은 구도 살펴보기',
      ],
    },
    relatedPlaces: [],
  };
}

export type FetchPlacesParams = {
  serviceRegionCode: string;
  travelStyles?: string[];
  sort?: PlaceSortOrder;
  cursor?: string | null;
  size?: number;
  dateFrom?: string | null;
  dateTo?: string | null;
};

type MockPlaceListItem = PlaceListItem & {
  qualityScore: number;
  internalId: number;
};

const SEOUL_REGION_NAME = '서울';
const DEFAULT_PLACE_LIST_SIZE = 10;

function getAssetUri(asset: number) {
  return Asset.fromModule(asset).uri;
}

function clonePlaceListItem(place: PlaceListItem): PlaceListItem {
  return {
    ...place,
    tags: [...place.tags],
  };
}

function createMockPlaceListCursor(place: PlaceListItem) {
  return String(place.placeId);
}

function filterMockPlaces(
  places: MockPlaceListItem[],
  serviceRegionCode: string,
  travelStyles: string[],
  dateFrom?: string | null,
  dateTo?: string | null,
) {
  const normalizedTravelStyles = new Set(
    travelStyles.map((value) => value.trim()).filter(Boolean),
  );

  return places.filter((place) => {
    if (place.serviceRegionCode !== serviceRegionCode) {
      return false;
    }

    if (normalizedTravelStyles.size === 0) {
      return isWithinRequestedDateRange(place, dateFrom, dateTo);
    }

    return normalizedTravelStyles.has(place.travelStyle) && isWithinRequestedDateRange(place, dateFrom, dateTo);
  });
}

function isWithinRequestedDateRange(
  place: MockPlaceListItem,
  dateFrom?: string | null,
  dateTo?: string | null,
) {
  if (!dateFrom && !dateTo) {
    return true;
  }

  const occurrence = place.festivalOccurrence;
  if (!occurrence) {
    return false;
  }

  if (dateFrom && occurrence.endDate < dateFrom) {
    return false;
  }

  if (dateTo && occurrence.startDate > dateTo) {
    return false;
  }

  return true;
}

function sortMockPlaces(places: MockPlaceListItem[], sort: PlaceSortOrder) {
  return [...places].sort((left, right) => {
    if (sort === 'DEADLINE') {
      const leftDeadline = left.festivalOccurrence?.endDate ?? null;
      const rightDeadline = right.festivalOccurrence?.endDate ?? null;

      if (leftDeadline && rightDeadline && leftDeadline !== rightDeadline) {
        return leftDeadline.localeCompare(rightDeadline);
      }

      if (leftDeadline && !rightDeadline) {
        return -1;
      }

      if (!leftDeadline && rightDeadline) {
        return 1;
      }

      if (leftDeadline && rightDeadline) {
        return right.internalId - left.internalId;
      }
    }

    if (left.qualityScore !== right.qualityScore) {
      return right.qualityScore - left.qualityScore;
    }

    return right.internalId - left.internalId;
  });
}

function paginateMockPlaces(
  places: PlaceListItem[],
  cursor: string | null | undefined,
  size: number,
): PlaceListResponse {
  const startIndex = cursor
    ? Math.max(
        places.findIndex((item) => createMockPlaceListCursor(item) === cursor) + 1,
        0,
      )
    : 0;

  const items = places.slice(startIndex, startIndex + size);
  const hasMore = startIndex + items.length < places.length;
  const nextCursor = hasMore && items.length > 0 ? createMockPlaceListCursor(items[items.length - 1]) : null;

  return {
    items: items.map(clonePlaceListItem),
    nextCursor,
    hasMore,
  };
}

const MOCK_SEOUL_PLACES: MockPlaceListItem[] = [
  {
    placeId: 2101,
    title: '서울 봄꽃축제',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 중구 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/seoul-spring-flower-festival.jpg')),
    festivalOccurrence: {
      occurrenceId: 2101001,
      eventYear: 2027,
      startDate: '2027-04-02',
      endDate: '2027-04-05',
      status: 'UPCOMING',
      dateRangeText: '4.2 - 4.5',
    },
    travelStyle: 'LOCAL_FESTIVAL',
    tags: ['축제', '봄', '사진'],
    shortDescription: '서울 도심에서 만나는 대표 봄꽃 축제예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 2101,
  },
  {
    placeId: 2102,
    title: '경복궁',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 종로구 사직로 161',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeonju-hanok-village.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['문화', '역사', '궁궐'],
    shortDescription: '서울 여행에서 빠질 수 없는 대표 궁궐이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 2102,
  },
  {
    placeId: 2103,
    title: '국립중앙박물관',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 용산구 서빙고로 137',
    imageUrl: getAssetUri(require('@/assets/images/events/national-museum-of-modern-art.jpg')),
    festivalOccurrence: null,
    travelStyle: 'EXHIBITION_MUSEUM',
    tags: ['전시', '미술관', '문화'],
    shortDescription: '한국 문화와 역사를 차분하게 둘러보기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 2103,
  },
  {
    placeId: 2104,
    title: '서울식물원',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 강서구 마곡동로 161',
    imageUrl: getAssetUri(require('@/assets/images/destinations/nonsan-sunshine-land.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['자연', '힐링', '산책'],
    shortDescription: '도심 속에서 식물과 함께 쉬어갈 수 있는 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 2104,
  },
  {
    placeId: 2105,
    title: '성수동 서울숲',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 성동구 성수동 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['공원', '산책', '도심'],
    shortDescription: '산책과 휴식을 함께 즐기기 좋은 서울의 대표 녹지예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 2105,
  },
  {
    placeId: 2106,
    title: '예술의 전당',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 서초구 남부순환로 2406',
    imageUrl: getAssetUri(require('@/assets/images/events/haeundae-sand-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'EXHIBITION_MUSEUM',
    tags: ['공연', '전시', '예술'],
    shortDescription: '공연과 전시를 한 번에 즐길 수 있는 복합 문화공간이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 2106,
  },
  {
    placeId: 2107,
    title: 'N서울타워(남산타워)',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 용산구 남산공원길 105',
    imageUrl: getAssetUri(require('@/assets/images/destinations/yeosu-cable-car.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['전망', '야경', '랜드마크'],
    shortDescription: '서울 전경을 내려다볼 수 있는 대표 전망 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 2107,
  },
  {
    placeId: 2108,
    title: '홍이네떡볶이',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 중구 광장시장 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '간식', '분식'],
    shortDescription: '서울에서 가볍게 즐기기 좋은 분식 맛집이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 91,
    internalId: 2108,
  },
  {
    placeId: 2109,
    title: '원조민속순대타운',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 중구 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/damyang-bamboo-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '순대', '전통'],
    shortDescription: '현지 분위기를 느끼며 든든하게 한 끼 하기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 90,
    internalId: 2109,
  },
  {
    placeId: 2110,
    title: '수락 휴',
    serviceRegionCode: 'SEOUL',
    serviceRegionName: SEOUL_REGION_NAME,
    addressSummary: '서울 노원구 수락산로 799',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeju-hallasan.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['자연명소', '휴식', '힐링'],
    shortDescription: '도심에서 조금 벗어나 자연을 느끼기 좋은 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 89,
    internalId: 2110,
  },
];

const GYEONGGI_REGION_NAME = '경기도';

const MOCK_GYEONGGI_PLACES: MockPlaceListItem[] = [
  {
    placeId: 3201,
    title: '수원화성',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 수원시 장안구 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeonju-hanok-village.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['문화', '역사', '세계유산'],
    shortDescription: '성곽의 멋과 도시 산책을 함께 즐길 수 있는 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 3201,
  },
  {
    placeId: 3202,
    title: '양평 두물머리',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 양평군 양서면 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/damyang-bamboo-forest-walk.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['자연', '산책', '일출'],
    shortDescription: '남한강과 북한강이 만나는 풍경이 아름다운 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 3202,
  },
  {
    placeId: 3203,
    title: '광명동굴',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 광명시 가학로85번길 142',
    imageUrl: getAssetUri(require('@/assets/images/events/national-museum-of-modern-art.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['동굴', '체험', '전시'],
    shortDescription: '시원한 동굴 안에서 특별한 전시와 체험을 즐길 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 97,
    internalId: 3203,
  },
  {
    placeId: 3204,
    title: '한국민속촌',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 용인시 기흥구 민속촌로 90',
    imageUrl: getAssetUri(require('@/assets/images/home/jeonju-ipap-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['전통', '체험', '문화'],
    shortDescription: '한국의 전통 생활문화를 한 번에 만날 수 있는 공간이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 3204,
  },
  {
    placeId: 3205,
    title: '국립현대미술관 과천',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 과천시 광명로 313',
    imageUrl: getAssetUri(require('@/assets/images/events/haeundae-sand-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'EXHIBITION_MUSEUM',
    tags: ['전시', '미술관', '문화'],
    shortDescription: '전시와 건축을 함께 즐기기 좋은 예술 공간이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 3205,
  },
  {
    placeId: 3206,
    title: '파주 임진각',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 파주시 문산읍 임진각로 177',
    imageUrl: getAssetUri(require('@/assets/images/home/ktx-guide.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['평화', '역사', '랜드마크'],
    shortDescription: '임진각의 상징적인 증기기관차와 함께 둘러보기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 3206,
  },
  {
    placeId: 3207,
    title: '연천 오일장',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 연천군 전곡읍 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'TRADITIONAL_MARKET',
    tags: ['시장', '먹거리', '로컬'],
    shortDescription: '현지 분위기를 느끼며 장보는 재미가 있는 전통 시장이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 3207,
  },
  {
    placeId: 3208,
    title: '빵과당신',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 양주시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['베이커리', '디저트', '로컬맛집'],
    shortDescription: '여유 있게 들러 즐기기 좋은 베이커리 스폿이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 3208,
  },
  {
    placeId: 3209,
    title: '루덴시아',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 파주시 조리읍 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/yeosu-cable-car.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['테마파크', '건축', '사진'],
    shortDescription: '유럽풍 건물과 포토존이 매력적인 테마 공간이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 91,
    internalId: 3209,
  },
  {
    placeId: 3210,
    title: '벗골도토리막국수',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 가평군 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/damyang-bamboo-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '면요리', '식사'],
    shortDescription: '시원하고 담백한 한 그릇으로 가볍게 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 90,
    internalId: 3210,
  },
  {
    placeId: 3211,
    title: '남양주 봉선사',
    serviceRegionCode: 'GYEONGGI',
    serviceRegionName: GYEONGGI_REGION_NAME,
    addressSummary: '경기도 남양주시 진접읍 봉선사로 32',
    imageUrl: getAssetUri(require('@/assets/images/events/seoul-spring-flower-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['사찰', '자연', '산책'],
    shortDescription: '고요한 사찰 풍경과 산책길이 어우러진 힐링 장소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 89,
    internalId: 3211,
  },
];

const CHUNGCHEONG_REGION_NAME = '충청도';

const MOCK_CHUNGCHEONG_PLACES: MockPlaceListItem[] = [
  {
    placeId: 4301,
    title: '공주 공산성',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청남도 공주시 금성동 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeonju-hanok-village.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['성곽', '역사', '산책'],
    shortDescription: '공주의 오래된 성곽과 산책 분위기를 함께 느낄 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 4301,
  },
  {
    placeId: 4302,
    title: '안면도 꽃지해변',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청남도 태안군 안면읍 승언리 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/haeundae-sand-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['해변', '일몰', '바다'],
    shortDescription: '붉게 물드는 노을 풍경이 아름다운 해변이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 4302,
  },
  {
    placeId: 4303,
    title: '천안 독립기념관',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청남도 천안시 동남구 목천읍 삼방로 95',
    imageUrl: getAssetUri(require('@/assets/images/events/national-museum-of-modern-art.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['기념관', '역사', '전시'],
    shortDescription: '넓은 부지와 웅장한 전시 공간이 인상적인 문화 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 97,
    internalId: 4303,
  },
  {
    placeId: 4304,
    title: '부여 궁남지',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청남도 부여군 부여읍 동남리 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/yeosu-cable-car.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['연못', '정원', '산책'],
    shortDescription: '연못과 정원이 어우러진 고즈넉한 풍경이 매력적이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 4304,
  },
  {
    placeId: 4305,
    title: '온양온천',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청남도 아산시 온천동 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['온천', '휴식', '힐링'],
    shortDescription: '오랜 역사를 가진 온천 분위기를 편하게 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 4305,
  },
  {
    placeId: 4306,
    title: '영동 와인터널',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청북도 영동군 영동읍 매천리 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/ktx-guide.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['와인', '체험', '관광'],
    shortDescription: '터널 안에서 색다른 와인 체험을 즐길 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 4306,
  },
  {
    placeId: 4307,
    title: '옥천 강대박',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청북도 옥천군 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '고기', '식사'],
    shortDescription: '충청도 한 끼를 떠올리게 하는 로컬 맛집 분위기예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 4307,
  },
  {
    placeId: 4308,
    title: '충주 아쿠아리움',
    serviceRegionCode: 'CHUNGCHEONG',
    serviceRegionName: CHUNGCHEONG_REGION_NAME,
    addressSummary: '충청북도 충주시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['아쿠아리움', '체험', '가족'],
    shortDescription: '가족 단위로 즐기기 좋은 체험형 장소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 4308,
  },
];

const JEOLLA_REGION_NAME = '전라도';

const MOCK_JEOLLA_PLACES: MockPlaceListItem[] = [
  {
    placeId: 6401,
    title: '전주 한옥마을',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전북특별자치도 전주시 완산구 교동 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeonju-hanok-village.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['한옥', '전통', '산책'],
    shortDescription: '전주의 대표 전통 가옥 풍경을 가장 먼저 떠올리게 하는 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 6401,
  },
  {
    placeId: 6402,
    title: '목포 해상케이블카',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전라남도 목포시 해양대학로 240 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/yeosu-cable-car.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['케이블카', '바다', '전망'],
    shortDescription: '바다와 도시 풍경을 함께 내려다보기 좋은 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 6402,
  },
  {
    placeId: 6403,
    title: '담양 죽녹원',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전라남도 담양군 담양읍 죽녹원로 119',
    imageUrl: getAssetUri(require('@/assets/images/events/damyang-bamboo-forest-walk.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['대나무', '산책', '숲'],
    shortDescription: '대나무 숲길을 천천히 걷기 좋은 전라도 대표 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 97,
    internalId: 6403,
  },
  {
    placeId: 6404,
    title: '광주 국립아시아문화전당',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '광주광역시 동구 문화전당로 38',
    imageUrl: getAssetUri(require('@/assets/images/events/national-museum-of-modern-art.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['전시', '문화', '도심'],
    shortDescription: '도심 속에서 전시와 문화 경험을 함께 즐길 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 6404,
  },
  {
    placeId: 6405,
    title: '순천만 국가정원',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전라남도 순천시 국가정원1호길 47',
    imageUrl: getAssetUri(require('@/assets/images/destinations/nonsan-sunshine-land.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['정원', '습지', '산책'],
    shortDescription: '넓은 정원과 걷기 좋은 풍경을 함께 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 6405,
  },
  {
    placeId: 6406,
    title: '광양 매화마을',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전라남도 광양시 다압면 매화마을 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/seoul-spring-flower-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['매화', '꽃', '봄'],
    shortDescription: '봄철 꽃 풍경이 아름다운 전라도 대표 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 6406,
  },
  {
    placeId: 6407,
    title: '보성 녹차밭',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전라남도 보성군 보성읍 녹차로 763-67',
    imageUrl: getAssetUri(require('@/assets/images/home/damyang-bamboo-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['녹차', '언덕', '풍경'],
    shortDescription: '초록빛 언덕 풍경이 인상적인 녹차 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 6407,
  },
  {
    placeId: 6408,
    title: '고창 고인돌 유적',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전북특별자치도 고창군 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['유적', '역사', '세계유산'],
    shortDescription: '전라도의 오래된 역사를 느낄 수 있는 유적지예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 6408,
  },
  {
    placeId: 6409,
    title: '무주 구천동계곡',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전북특별자치도 무주군 설천면 구천동로 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeju-hallasan.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['계곡', '자연', '산책'],
    shortDescription: '맑은 계곡과 산세를 따라 시원하게 걷기 좋은 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 91,
    internalId: 6409,
  },
  {
    placeId: 6410,
    title: '영광 법성포 굴비거리',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전라남도 영광군 법성면 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['굴비', '시장', '먹거리'],
    shortDescription: '전라도 미식을 떠올릴 때 빠지지 않는 로컬 먹거리 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 90,
    internalId: 6410,
  },
  {
    placeId: 6411,
    title: '남원 명문 제과',
    serviceRegionCode: 'JEOLLA',
    serviceRegionName: JEOLLA_REGION_NAME,
    addressSummary: '전북특별자치도 남원시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['빵', '디저트', '로컬'],
    shortDescription: '전라도 여행 중 가볍게 들르기 좋은 디저트 스폿이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 89,
    internalId: 6411,
  },
];

const GANGWON_REGION_NAME = '강원도';

const MOCK_GANGWON_PLACES: MockPlaceListItem[] = [
  {
    placeId: 4201,
    title: '설악산 국립공원',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 속초시, 인제군 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeju-hallasan.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['자연', '산', '국립공원'],
    shortDescription: '강원도 대표 산악 풍경을 가장 먼저 떠올리게 하는 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 4201,
  },
  {
    placeId: 4202,
    title: '강릉 경포해변',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 강릉시 경포동 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/haeundae-sand-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['바다', '해변', '휴양'],
    shortDescription: '잔잔한 바다 풍경과 산책 분위기를 함께 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 4202,
  },
  {
    placeId: 4203,
    title: '안목해변 커피거리',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 강릉시 창해로14번길 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/yeosu-cable-car.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['카페', '바다', '산책'],
    shortDescription: '바다를 보며 커피 한 잔을 즐기기 좋은 해변 거리예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 97,
    internalId: 4203,
  },
  {
    placeId: 4204,
    title: '속초 관광수산시장',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 속초시 중앙로147번길 12',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'TRADITIONAL_MARKET',
    tags: ['시장', '먹거리', '로컬'],
    shortDescription: '강원도 먹거리를 한 번에 둘러보기 좋은 전통 시장이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 4204,
  },
  {
    placeId: 4205,
    title: '정동심곡 바다부채길',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 강릉시 강동면 심곡리 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/damyang-bamboo-forest-walk.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['해안', '산책', '절경'],
    shortDescription: '깎아지른 해안 절벽을 따라 걷는 풍경이 인상적인 길이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 4205,
  },
  {
    placeId: 4206,
    title: '화천 산천어 축제',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 화천군 화천읍 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/seoul-spring-flower-festival.jpg')),
    festivalOccurrence: {
      occurrenceId: 4206001,
      eventYear: 2026,
      startDate: '2026-12-20',
      endDate: '2026-12-31',
      status: 'UPCOMING',
      dateRangeText: '12.20 - 12.31',
    },
    travelStyle: 'LOCAL_FESTIVAL',
    tags: ['축제', '체험', '겨울'],
    shortDescription: '겨울 강원도의 대표 축제 분위기를 즐기기 좋은 장소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 4206,
  },
  {
    placeId: 4207,
    title: '대관령 양떼 목장',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 평창군 대관령면 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/nonsan-sunshine-land.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['목장', '자연', '힐링'],
    shortDescription: '탁 트인 초원 풍경과 여유로운 산책을 함께 느낄 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 4207,
  },
  {
    placeId: 4208,
    title: '영월 청령포',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 영월군 영월읍 청령포로 133',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['유적', '풍경', '역사'],
    shortDescription: '강과 절벽이 만들어낸 고요한 풍경이 매력적인 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 4208,
  },
  {
    placeId: 4209,
    title: '춘천 유포리 막국수',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 춘천시 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/damyang-bamboo-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['막국수', '로컬맛집', '식사'],
    shortDescription: '담백하고 시원한 강원도 대표 면요리를 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 91,
    internalId: 4209,
  },
  {
    placeId: 4210,
    title: '원주 반계리 은행나무',
    serviceRegionCode: 'GANGWON',
    serviceRegionName: GANGWON_REGION_NAME,
    addressSummary: '강원특별자치도 원주시 문막읍 반계리 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/jeonju-ipap-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['명소', '가을', '사진'],
    shortDescription: '가을이면 특히 더 아름답게 빛나는 대표 은행나무 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 90,
    internalId: 4210,
  },
];

const GYEONGSANG_REGION_NAME = '경상도';

const MOCK_GYEONGSANG_PLACES: MockPlaceListItem[] = [
  {
    placeId: 6301,
    title: '경주 첨성대',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상북도 경주시 인왕동 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/jeonju-ipap-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['유적', '역사', '산책'],
    shortDescription: '경주의 상징적인 야경과 고즈넉한 분위기를 함께 느낄 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 6301,
  },
  {
    placeId: 6302,
    title: '경주 석굴암',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상북도 경주시 불국로 873-243',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['세계유산', '문화', '사찰'],
    shortDescription: '경주의 깊은 역사와 불교 문화를 대표하는 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 6302,
  },
  {
    placeId: 6303,
    title: '부산 광안대교',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '부산광역시 수영구 광안동 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/yeosu-cable-car.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['야경', '바다', '드라이브'],
    shortDescription: '부산 바다 위를 가로지르는 야경 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 97,
    internalId: 6303,
  },
  {
    placeId: 6304,
    title: '대구 서문시장',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '대구광역시 중구 대신동 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'TRADITIONAL_MARKET',
    tags: ['시장', '먹거리', '로컬'],
    shortDescription: '대구의 활기찬 먹거리와 시장 분위기를 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 6304,
  },
  {
    placeId: 6305,
    title: '울산 태화강 국가정원',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '울산광역시 중구 태화강국가정원 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/damyang-bamboo-forest-walk.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['정원', '강변', '산책'],
    shortDescription: '도심 속에서 여유로운 자연 산책을 즐기기 좋은 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 6305,
  },
  {
    placeId: 6306,
    title: '안동 하회마을',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상북도 안동시 풍천면 하회리 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/jeonju-ipap-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['전통마을', '유산', '한옥'],
    shortDescription: '전통 가옥과 고즈넉한 마을 풍경을 함께 느낄 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 6306,
  },
  {
    placeId: 6307,
    title: '통영 동피랑 벽화마을',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상남도 통영시 동피랑길 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/boryeong-mud-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'CULTURE_EXPERIENCE',
    tags: ['벽화', '골목', '사진'],
    shortDescription: '알록달록한 골목과 바다 풍경을 함께 즐길 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 6307,
  },
  {
    placeId: 6308,
    title: '김천 김밥축제',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상북도 김천시 직지사길 130 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/seoul-spring-flower-festival.jpg')),
    festivalOccurrence: {
      occurrenceId: 6308001,
      eventYear: 2026,
      startDate: '2026-11-07',
      endDate: '2026-11-09',
      status: 'UPCOMING',
      dateRangeText: '11.07 - 11.09',
    },
    travelStyle: 'LOCAL_FESTIVAL',
    tags: ['축제', '음식', '체험'],
    shortDescription: '경상도 대표 축제 분위기를 가장 먼저 떠올리기 좋은 장소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 6308,
  },
  {
    placeId: 6309,
    title: '영양 자작나무숲',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상북도 영양군 수비면 죽파리 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/nonsan-sunshine-land.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['숲', '산책', '자연'],
    shortDescription: '하얀 자작나무가 만들어내는 고요한 산책 풍경이 매력적이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 91,
    internalId: 6309,
  },
  {
    placeId: 6310,
    title: '하동 술상 전어마을',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상남도 하동군 술상리 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/damyang-bamboo-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '해산물', '미식'],
    shortDescription: '가을 제철 먹거리와 지역 미식을 함께 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 90,
    internalId: 6310,
  },
  {
    placeId: 6311,
    title: '함양 대봉스카이랜드',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상남도 함양군 병곡면 대봉산 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/ktx-guide.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['모노레일', '산', '체험'],
    shortDescription: '산 풍경을 색다르게 즐길 수 있는 체험형 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 89,
    internalId: 6311,
  },
  {
    placeId: 6312,
    title: '상주 카페 골감',
    serviceRegionCode: 'GYEONGSANG',
    serviceRegionName: GYEONGSANG_REGION_NAME,
    addressSummary: '경상북도 상주시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['카페', '디저트', '휴식'],
    shortDescription: '조용한 분위기에서 쉬어가기 좋은 카페형 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 88,
    internalId: 6312,
  },
];

const JEJU_REGION_NAME = '제주도';

const MOCK_JEJU_PLACES: MockPlaceListItem[] = [
  {
    placeId: 5301,
    title: '한라산',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 제주시, 서귀포시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeju-hallasan.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['자연', '산', '국립공원'],
    shortDescription: '제주의 중심을 이루는 대표 산세를 만날 수 있어요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 99,
    internalId: 5301,
  },
  {
    placeId: 5302,
    title: '성산일출봉',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 서귀포시 성산읍 성산리',
    imageUrl: getAssetUri(require('@/assets/images/events/haeundae-sand-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['바다', '일출', '명소'],
    shortDescription: '제주의 동쪽에서 해 뜨는 풍경이 아름다운 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 98,
    internalId: 5302,
  },
  {
    placeId: 5303,
    title: '우도',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 제주시 우도면 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/default.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['섬', '풍경', '여행'],
    shortDescription: '작은 섬 안에 여유로운 풍경이 가득한 제주의 섬이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 97,
    internalId: 5303,
  },
  {
    placeId: 5304,
    title: '숙성도 제주본점',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 제주시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/seoul-gwangjang-market.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '고기', '식사'],
    shortDescription: '제주에서 고기 맛집을 찾을 때 떠올리기 좋은 곳이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 96,
    internalId: 5304,
  },
  {
    placeId: 5305,
    title: '아베베베이커리',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 제주시 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/jeonju-ipap-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['베이커리', '디저트', '로컬'],
    shortDescription: '달콤한 디저트와 함께 가볍게 들르기 좋은 스폿이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 95,
    internalId: 5305,
  },
  {
    placeId: 5306,
    title: '협재 해수욕장',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 제주시 한림읍 협재리 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/haeundae-sand-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['바다', '해변', '산책'],
    shortDescription: '맑은 바다와 산책 분위기를 함께 즐기기 좋아요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 94,
    internalId: 5306,
  },
  {
    placeId: 5307,
    title: '카멜리아힐',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 서귀포시 안덕면 일대',
    imageUrl: getAssetUri(require('@/assets/images/events/seoul-spring-flower-festival.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['꽃', '정원', '사진'],
    shortDescription: '계절마다 다른 꽃 풍경을 만날 수 있는 정원이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 93,
    internalId: 5307,
  },
  {
    placeId: 5308,
    title: '제주올레길',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 전역',
    imageUrl: getAssetUri(require('@/assets/images/events/damyang-bamboo-forest-walk.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['트레킹', '산책', '풍경'],
    shortDescription: '제주의 자연을 가장 길게 천천히 즐길 수 있는 길이에요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 92,
    internalId: 5308,
  },
  {
    placeId: 5309,
    title: '천지연폭포',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 서귀포시 천지동 일대',
    imageUrl: getAssetUri(require('@/assets/images/home/ktx-guide.jpg')),
    festivalOccurrence: null,
    travelStyle: 'NATURE',
    tags: ['폭포', '자연', '명소'],
    shortDescription: '시원한 폭포와 숲길을 함께 즐길 수 있는 명소예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 91,
    internalId: 5309,
  },
  {
    placeId: 5310,
    title: '장인의 집',
    serviceRegionCode: 'JEJU',
    serviceRegionName: JEJU_REGION_NAME,
    addressSummary: '제주특별자치도 서귀포시 일대',
    imageUrl: getAssetUri(require('@/assets/images/destinations/jeonju-hanok-village.jpg')),
    festivalOccurrence: null,
    travelStyle: 'LOCAL_FOOD',
    tags: ['로컬맛집', '식사', '한상'],
    shortDescription: '정갈한 제주 한 끼를 즐기기 좋은 식당 분위기예요.',
    overview: null,
    saved: false,
    savedAt: null,
    qualityScore: 90,
    internalId: 5310,
  },
];

const MOCK_PLACES_BY_REGION: Record<string, MockPlaceListItem[]> = {
  SEOUL: MOCK_SEOUL_PLACES,
  GYEONGGI: MOCK_GYEONGGI_PLACES,
  CHUNGCHEONG: MOCK_CHUNGCHEONG_PLACES,
  JEOLLA: MOCK_JEOLLA_PLACES,
  GANGWON: MOCK_GANGWON_PLACES,
  GYEONGSANG: MOCK_GYEONGSANG_PLACES,
  JEJU: MOCK_JEJU_PLACES,
};

function buildMockPlaceList(params: FetchPlacesParams): PlaceListResponse {
  const size = params.size && params.size > 0 ? params.size : DEFAULT_PLACE_LIST_SIZE;
  const travelStyles = params.travelStyles ?? [];
  const sourcePlaces = MOCK_PLACES_BY_REGION[params.serviceRegionCode] ?? [];
  const filtered = filterMockPlaces(
    sourcePlaces,
    params.serviceRegionCode,
    travelStyles,
    params.dateFrom,
    params.dateTo,
  );
  const sorted = sortMockPlaces(filtered, params.sort ?? 'RECOMMENDED');
  return paginateMockPlaces(sorted, params.cursor, size);
}

export async function fetchPlaces(params: FetchPlacesParams): Promise<PlaceListResponse> {
  return buildMockPlaceList(params);
}

type PlaceDetailApiImage = {
  imageUrl: string;
  order: number;
  altText: string;
};

type PlaceDetailApiRelatedPlace = {
  placeId: number;
  title: string;
  imageUrl: string;
  shortDescription: string;
};

type PlaceDetailApiResponse = {
  placeId: number;
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
  images: PlaceDetailApiImage[];
  description: PlaceDescription | null;
  relatedPlaces: PlaceDetailApiRelatedPlace[];
};

type PlaceDetailEnvelope = {
  success: true;
  code: string;
  message: string;
  data: PlaceDetailApiResponse;
  traceId: string;
};

function mapPlaceDetailResponse(response: PlaceDetailApiResponse): PlaceDetail {
  return {
    id: String(response.placeId),
    routeId: String(response.placeId),
    numericId: response.placeId,
    title: response.title,
    address: response.address,
    tags: response.tags,
    isSaved: response.isSaved,
    images: [...response.images]
      .sort((a, b) => a.order - b.order)
      .map((image) => ({
        source: { uri: image.imageUrl },
        order: image.order,
        altText: image.altText,
      })),
    description: response.description ?? DEFAULT_PLACE_DESCRIPTION,
    relatedPlaces: response.relatedPlaces.map((related) => ({
      id: String(related.placeId),
      title: related.title,
      imageUrl: related.imageUrl,
      shortDescription: related.shortDescription,
    })),
  };
}

function buildFallbackPlaceDetail(placeId: string): PlaceDetail {
  const explicitDetail = MOCK_PLACE_DETAILS[placeId];
  if (explicitDetail) {
    return explicitDetail;
  }

  const listItem = getMockPlaceListItem(placeId);
  if (listItem) {
    return buildGenericPlaceDetailFromListItem(listItem);
  }

  return {
    ...DEFAULT_PLACE_DETAIL,
    id: placeId,
    routeId: placeId,
    numericId: Number.isFinite(Number(placeId)) ? Number(placeId) : undefined,
    title: '추천 장소',
    address: '상세 정보를 준비 중이에요.',
    relatedPlaces: [],
  };
}

// GET /places/{placeId} — real place ids (from GET /home, GET /monthly-recommendations,
// GET /places) are numeric. Demo ids like 'jeonju-ipap-festival' used by the mock fixtures
// elsewhere in the app (dev-mock session, MateTab sample data, ...) aren't real backend
// rows, so those — and any id the backend 404s on — fall back to the local mock below
// instead of surfacing an error.
export async function fetchPlaceDetail(placeId: string): Promise<PlaceDetail> {
  const numericId = Number(placeId);
  if (Number.isFinite(numericId) && numericId > 0) {
    try {
      const response = await client.get<PlaceDetailEnvelope>(`/places/${numericId}`);
      return mapPlaceDetailResponse(response.data.data);
    } catch (error) {
      if (!isAxiosError(error)) throw error;
    }
  }

  return buildFallbackPlaceDetail(placeId);
}
