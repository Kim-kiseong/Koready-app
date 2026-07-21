// src/app/mvp2_BuddyRoute_description/mock.ts

// ===============================
// Swagger DTO
// ===============================

export type SourceType =
  | "KTO_ORIGINAL"
  | "AI_GENERATED"
  | "MANUAL_EDITED";

export type AvailableTab =
  | "DESCRIPTION"
  | "ROUTE"
  | "MATE";

export interface PlaceImage {
  imageUrl: string;
  order: number;
  altText: string;
}

export interface PlaceDescription {
  impactTitle: string;
  impactSubtitle: string;
  introParagraphs: string[];
  enjoyPoints: string[];
  sourceType: SourceType;
}

export interface RelatedPlace {
  placeId: number;
  title: string;
  imageUrl: string;
  shortDescription: string;
}

export interface PlaceDetailResponse {
  placeId: number;

  title: string;

  serviceRegionCode: string;

  locationText: string;

  address: string;

  latitude: number;

  longitude: number;

  operatingHours?: string;

  operatingPeriod?: string;

  closedDays?: string;

  usageFee?: string;

  parkingInfo?: string;

  images: PlaceImage[];

  tags: string[];

  isSaved: boolean;

  description: PlaceDescription;

  relatedPlaces: RelatedPlace[];

}

// ===============================
// Mock Data
// ===============================

export const mockData: PlaceDetailResponse = {
  placeId: 1001,

  title: "김천 김밥축제",

  serviceRegionCode: "GYEONGBUK",

  locationText: "경상북도 김천시",

  address: "경상북도 김천시 직지사길 130 (대항면 운수리)",

  latitude: 36.1398,

  longitude: 128.1136,

  operatingHours: "10:00 ~ 18:00",

  operatingPeriod: "2025.10.03 ~ 2025.10.05",

  closedDays: "행사기간 중 휴무 없음",

  usageFee: "무료",

  parkingInfo: "축제장 임시주차장 이용",

  images: [
    {
      imageUrl: "https://picsum.photos/id/1050/800/800",
      order: 1,
      altText: "메인 이미지",
    },
    {
      imageUrl: "https://picsum.photos/id/1025/800/800",
      order: 2,
      altText: "행사장",
    },
    {
      imageUrl: "https://picsum.photos/id/1040/800/800",
      order: 3,
      altText: "김밥 만들기 체험",
    },
    {
      imageUrl: "https://picsum.photos/id/1068/800/800",
      order: 4,
      altText: "축제 풍경",
    },
  ],

  tags: ["지역축제", "음식", "시즌추천"],

  isSaved: false,

  description: {
    impactTitle: "김천에서 만나는 가장 맛있는 한 줄 여행",

    impactSubtitle: "김천 김밥축제는 김밥을 주제로 먹고, 만들고, 즐길 수 있는 지역축제예요.",

    introParagraphs: [
      "김밥은 한국에서 가장 익숙한 음식 중 하나지만, 평소에 먹던 김밥과는 조금 다른 김천만의 재미있는 김밥 문화를 만날 수 있어요.",
    ],

    enjoyPoints: [
      "다양한 김밥 부스에서 김밥 맛보기",
      "김밥 만들기 체험 참여하기",
      "김밥 포토존에서 사진 찍기",
      "지역 특산물·먹거리 부스 구경하기",
      "축제장 주변 로컬 명소 함께 둘러보기",
    ],

    sourceType: "KTO_ORIGINAL",
  },

  relatedPlaces: [
    {
      placeId: 101,

      title: "직지사",

      imageUrl: "https://picsum.photos/id/1036/300/300",

      shortDescription:
        "김천을 대표하는 사찰로, 조용한 산책과 전통적인 분위기를 함께 느낄 수 있어요. 축제 전후로 가볍게 들르기 좋아요.",
    },

    {
      placeId: 102,

      title: "사명대사공원",

      imageUrl: "https://picsum.photos/id/1041/300/300",

      shortDescription:
        "넓은 공원과 산책로가 있어 축제 후 쉬어 가기 좋은 장소예요. 사진 찍기에도 좋아요.",
    },

    {
      placeId: 103,

      title: "김천시립박물관",

      imageUrl: "https://picsum.photos/id/1057/300/300",

      shortDescription:
        "김천의 역사와 지역 문화를 알아볼 수 있는 공간이에요. 로컬 여행 코스로 함께 넣기 좋아요.",
    },
  ],

};