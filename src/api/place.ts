export type PlaceDetailTab = 'DESCRIPTION' | 'ROUTE' | 'MATE';

import axios from 'axios';
import type { ImageSource } from 'expo-image';

import { HomeImages } from '@/constants/home-images';

import { client } from './client';

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
  description: {
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
  },
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
  description: PlaceDescription;
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
    description: response.description,
    relatedPlaces: response.relatedPlaces.map((related) => ({
      id: String(related.placeId),
      title: related.title,
      imageUrl: related.imageUrl,
      shortDescription: related.shortDescription,
    })),
  };
}

function buildFallbackPlaceDetail(placeId: string): PlaceDetail {
  return (
    MOCK_PLACE_DETAILS[placeId] ?? {
      ...DEFAULT_PLACE_DETAIL,
      id: placeId,
      routeId: placeId,
      numericId: Number.isFinite(Number(placeId)) ? Number(placeId) : undefined,
      title: '김천 김밥축제',
    }
  );
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
      if (!axios.isAxiosError(error)) throw error;
    }
  }

  return buildFallbackPlaceDetail(placeId);
}
