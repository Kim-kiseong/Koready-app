export type PlaceDetailTab = 'DESCRIPTION' | 'ROUTE' | 'MATE';

import type { ImageSource } from 'expo-image';

import { HomeImages } from '@/constants/home-images';

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
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
  images: PlaceImage[];
  description: PlaceDescription;
  relatedPlaces: RelatedPlace[];
};

const DEFAULT_PLACE_DETAIL: Omit<PlaceDetail, 'id' | 'title'> = {
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

const MOCK_PLACE_DETAILS: Record<string, PlaceDetail> = {
  'jeonju-ipap-festival': {
    ...DEFAULT_PLACE_DETAIL,
    id: 'jeonju-ipap-festival',
    title: '[전주] 이팝나무 축제',
    address: '전북특별자치도 전주시 완산구 일대',
    images: [
      { source: HomeImages.JEONJU_IPAP_FESTIVAL, order: 1, altText: '전주 이팝나무 축제' },
      ...DEFAULT_PLACE_DETAIL.images.slice(1),
    ],
  },
  'damyang-bamboo-festival': {
    ...DEFAULT_PLACE_DETAIL,
    id: 'damyang-bamboo-festival',
    title: '[담양] 대나무 축제',
    address: '전라남도 담양군 담양읍 죽녹원로 119',
    images: [
      { source: HomeImages.DAMYANG_BAMBOO_FESTIVAL, order: 1, altText: '담양 대나무 축제' },
      ...DEFAULT_PLACE_DETAIL.images.slice(1),
    ],
  },
  jikkjisa: {
    ...DEFAULT_PLACE_DETAIL,
    id: 'jikkjisa',
    title: '직지사',
    address: '경상북도 김천시 대항면 직지사길 95',
    tags: ['사찰', '역사', '산책'],
    images: [
      { source: { uri: 'https://picsum.photos/id/1036/300/300' }, order: 1, altText: '직지사' },
      ...DEFAULT_PLACE_DETAIL.images.slice(1),
    ],
  },
  'samyung-park': {
    ...DEFAULT_PLACE_DETAIL,
    id: 'samyung-park',
    title: '사명대사공원',
    address: '경상북도 김천시 대항면 운수리 31-1',
    tags: ['공원', '산책', '사진'],
    images: [
      { source: { uri: 'https://picsum.photos/id/1041/300/300' }, order: 1, altText: '사명대사공원' },
      ...DEFAULT_PLACE_DETAIL.images.slice(1),
    ],
  },
  'gimcheon-museum': {
    ...DEFAULT_PLACE_DETAIL,
    id: 'gimcheon-museum',
    title: '김천시립박물관',
    address: '경상북도 김천시 대항면 직지사길 130',
    tags: ['박물관', '역사', '문화'],
    images: [
      { source: { uri: 'https://picsum.photos/id/1057/300/300' }, order: 1, altText: '김천시립박물관' },
      ...DEFAULT_PLACE_DETAIL.images.slice(1),
    ],
  },
};

// TODO: replace with client.get<PlaceDetail>(`/places/${placeId}`).
export async function fetchPlaceDetail(placeId: string): Promise<PlaceDetail> {
  return (
    MOCK_PLACE_DETAILS[placeId] ?? {
      ...DEFAULT_PLACE_DETAIL,
      id: placeId,
      title: '김천 김밥축제',
    }
  );
}
