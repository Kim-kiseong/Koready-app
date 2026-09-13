import { client } from './client';
import type {
  BuddyProfile,
  PlaceMate,
  PlaceMatesEnvelope,
  PlaceMatesResponse,
} from './types';

import { normalizeCountryCode } from '@/utils/country';

export type MateRecommendation = {
  profile: BuddyProfile;
  matchReason: string;
  sharedInterests: string[];
};

export type MateRecommendationsResponse = {
  placeId: string;
  placeTitle: string;
  updatedAt: string;
  recommendations: MateRecommendation[];
};

const nowIso = '2026-07-31T02:49:51.377Z';

const NATIONALITY_FLAGS: Record<string, string> = {
  France: '🇫🇷',
  Korea: '🇰🇷',
  'South Korea': '🇰🇷',
  Japan: '🇯🇵',
  중국: '🇨🇳',
  China: '🇨🇳',
  Taiwan: '🇹🇼',
  대만: '🇹🇼',
  USA: '🇺🇸',
  'United States': '🇺🇸',
};

function createProfile(profile: BuddyProfile): BuddyProfile {
  return profile;
}

function cloneBuddyProfile(profile: BuddyProfile): BuddyProfile {
  return {
    ...profile,
    availableLanguages: [...profile.availableLanguages],
    travelStyles: [...profile.travelStyles],
    socialLinks: profile.socialLinks.map((link) => ({ ...link })),
  };
}

function buildResponse(
  placeId: string,
  placeTitle: string,
  recommendations: MateRecommendation[],
): MateRecommendationsResponse {
  return {
    placeId,
    placeTitle,
    updatedAt: nowIso,
    recommendations,
  };
}

const MOCK_MATE_RECOMMENDATIONS: Record<string, MateRecommendationsResponse> = {
  jikkjisa: buildResponse('jikkjisa', '직지사', [
    {
      profile: createProfile({
        profileId: 901,
        profileImageUrl: 'https://picsum.photos/id/1025/300/300',
        nickname: 'Seoyeon',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['EXHIBITION_MUSEUM', 'NATURE', 'CULTURE_EXPERIENCE'],
        bio: '조용한 사찰 산책과 전통적인 분위기를 좋아해요.',
        socialLinks: [],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '직지사의 고즈넉한 분위기를 잘 즐길 수 있는 메이트예요.',
      sharedInterests: ['역사', '산책', '조용한 여행'],
    },
    {
      profile: createProfile({
        profileId: 902,
        profileImageUrl: 'https://picsum.photos/id/1001/300/300',
        nickname: 'Hana',
        nationality: 'Japan',
        availableLanguages: ['JP', 'EN', 'KO'],
        koreanLevel: 'INTERMEDIATE',
        travelStyles: ['EXHIBITION_MUSEUM', 'CULTURE_EXPERIENCE', 'LOCAL_FOOD'],
        bio: '풍경 사진과 사찰 근처 카페를 함께 즐기고 싶어요.',
        socialLinks: [
          { type: 'INSTAGRAM', displayValue: '@hana.photo', url: 'https://instagram.com/hana.photo' },
        ],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '직지사 주변 풍경과 카페 코스를 좋아하는 메이트예요.',
      sharedInterests: ['사진', '카페', '역사'],
    },
    {
      profile: createProfile({
        profileId: 903,
        profileImageUrl: 'https://picsum.photos/id/1021/300/300',
        nickname: 'David',
        nationality: 'United States',
        availableLanguages: ['EN', 'KO'],
        koreanLevel: 'BEGINNER',
        travelStyles: ['NATURE', 'LOCAL_FOOD', 'TRADITIONAL_MARKET'],
        bio: '가벼운 산책과 지역 음식을 함께 즐길 여행 친구를 찾고 있어요.',
        socialLinks: [],
        profilePublic: true,
        snsPublic: false,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '산책과 로컬 음식에 관심 있는 메이트예요.',
      sharedInterests: ['산책', '현지 음식', '자연'],
    },
  ]),
  'samyung-park': buildResponse('samyung-park', '사명대사공원', [
    {
      profile: createProfile({
        profileId: 1001,
        profileImageUrl: 'https://picsum.photos/id/1059/300/300',
        nickname: 'Nari',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['NATURE', 'DRAMA_LOCATION', 'CULTURE_EXPERIENCE'],
        bio: '공원 산책과 잔잔한 풍경을 좋아해요. 천천히 걷는 여행이 잘 맞아요.',
        socialLinks: [],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '산책 코스와 사진 찍는 걸 좋아하는 메이트예요.',
      sharedInterests: ['산책', '사진', '휴식'],
    },
    {
      profile: createProfile({
        profileId: 1002,
        profileImageUrl: 'https://picsum.photos/id/1060/300/300',
        nickname: 'Lucas',
        nationality: 'France',
        availableLanguages: ['EN', 'KO'],
        koreanLevel: 'BEGINNER',
        travelStyles: ['NATURE', 'LOCAL_FOOD', 'TRADITIONAL_MARKET'],
        bio: '공원에서 쉬고 근처 맛집과 카페를 함께 찾아다니는 걸 좋아해요.',
        socialLinks: [],
        profilePublic: true,
        snsPublic: false,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '힐링과 먹거리 중심의 동행을 찾는 메이트예요.',
      sharedInterests: ['자연', '카페', '로컬 음식'],
    },
  ]),
  'gimcheon-museum': buildResponse('gimcheon-museum', '김천시립박물관', [
    {
      profile: createProfile({
        profileId: 1101,
        profileImageUrl: 'https://picsum.photos/id/1015/300/300',
        nickname: 'Jaein',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['EXHIBITION_MUSEUM', 'CULTURE_EXPERIENCE', 'NATURE'],
        bio: '박물관과 전시 공간을 천천히 둘러보는 여행을 좋아해요.',
        socialLinks: [],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '조용한 전시 관람과 역사 이야기를 좋아하는 메이트예요.',
      sharedInterests: ['역사', '전시', '사진'],
    },
    {
      profile: createProfile({
        profileId: 1102,
        profileImageUrl: 'https://picsum.photos/id/1016/300/300',
        nickname: 'Emily',
        nationality: 'United States',
        availableLanguages: ['EN', 'KO'],
        koreanLevel: 'BEGINNER',
        travelStyles: ['EXHIBITION_MUSEUM', 'LOCAL_FOOD', 'CULTURE_EXPERIENCE'],
        bio: '박물관 관람 후 근처 카페에서 쉬는 코스를 좋아해요.',
        socialLinks: [
          { type: 'INSTAGRAM', displayValue: '@emily.in.korea', url: 'https://instagram.com/emily.in.korea' },
        ],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '전시와 카페를 이어서 즐기기 좋은 메이트예요.',
      sharedInterests: ['문화', '카페', '여유'],
    },
  ]),
};

function buildDefaultResponse(placeId: string, placeTitle: string): MateRecommendationsResponse {
  return buildResponse(placeId, placeTitle, [
    {
      profile: createProfile({
        profileId: 2001,
        profileImageUrl: 'https://picsum.photos/id/1000/300/300',
        nickname: 'Robin',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['LOCAL_FOOD', 'NATURE'],
        bio: `${placeTitle} 주변을 함께 천천히 둘러볼 여행 메이트예요.`,
        socialLinks: [],
        profilePublic: true,
        snsPublic: false,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: `${placeTitle}를 함께 즐길 수 있는 기본 mock 메이트예요.`,
      sharedInterests: ['산책', '로컬 음식', '사진'],
    },
  ]);
}

export async function fetchMockMateRecommendations(
  placeId: string,
  placeTitle: string,
): Promise<MateRecommendationsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 120));

  return MOCK_MATE_RECOMMENDATIONS[placeId] ?? buildDefaultResponse(placeId, placeTitle);
}

export function getMockNationalityFlag(nationality: string) {
  return NATIONALITY_FLAGS[nationality] ?? '';
}

function clonePlaceMate(profile: BuddyProfile): PlaceMate {
  return {
    profileId: profile.profileId,
    profileImageUrl: profile.profileImageUrl,
    nickname: profile.nickname,
    nationalityCode: normalizeCountryCode(profile.nationality) || profile.nationality,
    availableLanguages: [...profile.availableLanguages],
    koreanLevel: profile.koreanLevel,
    travelStyles: [...profile.travelStyles],
    bio: profile.bio,
    socialLinks: profile.socialLinks.map((link) => ({ ...link })),
    profilePublic: profile.profilePublic,
    snsPublic: profile.snsPublic,
    allowsMessages: profile.allowsMessages,
    canMessage: profile.canMessage,
    blockedByMe: profile.blockedByMe,
    updatedAt: profile.updatedAt,
  };
}

function toPlaceMatesResponse(response: MateRecommendationsResponse): PlaceMatesResponse {
  return {
    placeId: response.placeId,
    items: response.recommendations.map((recommendation) => clonePlaceMate(recommendation.profile)),
    nextCursor: null,
    hasMore: false,
  };
}

const MOCK_PLACE_MATES: Record<string, PlaceMatesResponse> = Object.fromEntries(
  Object.entries(MOCK_MATE_RECOMMENDATIONS).map(([placeId, response]) => [
    placeId,
    toPlaceMatesResponse(response),
  ]),
) as Record<string, PlaceMatesResponse>;

function clonePlaceMatesResponse(response: PlaceMatesResponse): PlaceMatesResponse {
  return {
    placeId: response.placeId,
    items: response.items.map((item) => ({
      ...item,
      availableLanguages: [...item.availableLanguages],
      travelStyles: [...item.travelStyles],
      socialLinks: item.socialLinks.map((link) => ({ ...link })),
    })),
    nextCursor: response.nextCursor,
    hasMore: response.hasMore,
  };
}

function buildDefaultPlaceMatesResponse(placeId: string): PlaceMatesResponse {
  return toPlaceMatesResponse(buildDefaultResponse(placeId, '김천 김밥축제'));
}

export async function fetchMockPlaceMates(
  placeId: string,
  _cursor?: string | null,
): Promise<PlaceMatesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return clonePlaceMatesResponse(
    MOCK_PLACE_MATES[placeId] ?? buildDefaultPlaceMatesResponse(placeId),
  );
}

export async function fetchPlaceMates(
  placeId: string,
  cursor?: string | null,
): Promise<PlaceMatesResponse> {
  try {
    const response = await client.get<PlaceMatesEnvelope>(`/places/${placeId}/mates`, {
      params: cursor ? { cursor } : undefined,
    });
    return clonePlaceMatesResponse(response.data.data);
  } catch (error) {
    if (__DEV__) {
      return fetchMockPlaceMates(placeId, cursor);
    }

    throw error;
  }
}

export function getMockBuddyProfileById(profileId: number): BuddyProfile | null {
  for (const response of Object.values(MOCK_MATE_RECOMMENDATIONS)) {
    const profile = response.recommendations.find(
      (recommendation) => recommendation.profile.profileId === profileId,
    )?.profile;

    if (profile) {
      return cloneBuddyProfile(profile);
    }
  }

  return null;
}
