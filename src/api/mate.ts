import type { BuddyProfile } from './types';

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
  'jeonju-ipap-festival': buildResponse('jeonju-ipap-festival', '[전주] 이팝나무 축제', [
    {
      profile: createProfile({
        profileId: 701,
        profileImageUrl: 'https://picsum.photos/id/1027/300/300',
        nickname: 'Mina',
        nationality: 'Japan',
        availableLanguages: ['JP', 'EN', 'KO'],
        koreanLevel: 'INTERMEDIATE',
        travelStyles: ['LOCAL_FOOD', 'PHOTO_SPOT'],
        bio: '한옥마을 골목과 길거리 음식을 천천히 즐기는 여행을 좋아해요.',
        buddyStyles: ['TRADITIONAL_CULTURE', 'FOODIE'],
        socialLinks: [
          { type: 'INSTAGRAM', displayValue: '@mina.walks', url: 'https://instagram.com/mina.walks' },
        ],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '전주의 먹거리와 전통 분위기를 함께 즐기기 좋은 메이트예요.',
      sharedInterests: ['현지 음식', '전통 문화', '사진'],
    },
    {
      profile: createProfile({
        profileId: 702,
        profileImageUrl: 'https://picsum.photos/id/1005/300/300',
        nickname: 'Jisoo',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['WALKING', 'MARKET', 'CAFE'],
        bio: '시장 구경하고 사진 찍는 걸 좋아하는 편이에요. 느린 여행이 잘 맞아요.',
        buddyStyles: ['PHOTOGRAPHY', 'SLOW_TRAVEL'],
        socialLinks: [],
        profilePublic: true,
        snsPublic: false,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '골목 산책과 사진 찍기를 좋아하는 여행자예요.',
      sharedInterests: ['산책', '카페', '사진'],
    },
    {
      profile: createProfile({
        profileId: 703,
        profileImageUrl: 'https://picsum.photos/id/1062/300/300',
        nickname: 'Yuna',
        nationality: 'Taiwan',
        availableLanguages: ['EN', 'KO'],
        koreanLevel: 'BEGINNER',
        travelStyles: ['LOCAL_FOOD', 'HISTORY', 'STREET_FOOD'],
        bio: '새로운 지역의 로컬 맛집과 역사적인 장소를 함께 둘러보는 걸 좋아해요.',
        buddyStyles: ['TRADITIONAL_CULTURE', 'FOODIE'],
        socialLinks: [
          { type: 'BLOG', displayValue: 'travel notes', url: 'https://example.com/yuna-travel' },
        ],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '이팝나무 풍경과 전주 로컬 푸드를 함께 즐기기 좋아요.',
      sharedInterests: ['로컬 맛집', '역사', '산책'],
    },
  ]),
  'damyang-bamboo-festival': buildResponse('damyang-bamboo-festival', '[담양] 대나무 축제', [
    {
      profile: createProfile({
        profileId: 801,
        profileImageUrl: 'https://picsum.photos/id/1011/300/300',
        nickname: 'Sora',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['NATURE', 'HEALING', 'PHOTO_SPOT'],
        bio: '대나무숲과 자연 산책을 좋아해서 느긋한 여행 코스를 찾고 있어요.',
        buddyStyles: ['QUIET_TRAVEL', 'PHOTOGRAPHY'],
        socialLinks: [],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '담양의 자연 풍경과 사진 스폿을 좋아하는 메이트예요.',
      sharedInterests: ['자연', '힐링', '사진'],
    },
    {
      profile: createProfile({
        profileId: 802,
        profileImageUrl: 'https://picsum.photos/id/1012/300/300',
        nickname: 'Alex',
        nationality: 'France',
        availableLanguages: ['EN', 'KO'],
        koreanLevel: 'BEGINNER',
        travelStyles: ['LOCAL_FOOD', 'WALKING', 'CAFE'],
        bio: '현지 음식 먹어보고 예쁜 카페를 천천히 찾아다니는 걸 좋아해요.',
        buddyStyles: ['FOODIE', 'SLOW_TRAVEL'],
        socialLinks: [
          { type: 'INSTAGRAM', displayValue: '@alex.trips', url: 'https://instagram.com/alex.trips' },
        ],
        profilePublic: true,
        snsPublic: true,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '맛집과 카페를 같이 찾기 좋은 메이트예요.',
      sharedInterests: ['현지 음식', '카페', '산책'],
    },
    {
      profile: createProfile({
        profileId: 803,
        profileImageUrl: 'https://picsum.photos/id/1003/300/300',
        nickname: 'Joon',
        nationality: 'Korea',
        availableLanguages: ['KO', 'JP'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['HISTORY', 'TRADITIONAL_MARKET', 'NATURE'],
        bio: '지역 문화와 역사 공간을 함께 둘러보는 느린 여행을 선호해요.',
        buddyStyles: ['TRADITIONAL_CULTURE', 'QUIET_TRAVEL'],
        socialLinks: [],
        profilePublic: true,
        snsPublic: false,
        allowsMessages: true,
        canMessage: true,
        blockedByMe: false,
        updatedAt: nowIso,
      }),
      matchReason: '담양의 로컬 분위기와 전통 코스를 좋아해요.',
      sharedInterests: ['전통 문화', '역사', '자연'],
    },
  ]),
  jikkjisa: buildResponse('jikkjisa', '직지사', [
    {
      profile: createProfile({
        profileId: 901,
        profileImageUrl: 'https://picsum.photos/id/1025/300/300',
        nickname: 'Seoyeon',
        nationality: 'Korea',
        availableLanguages: ['KO', 'EN'],
        koreanLevel: 'ADVANCED',
        travelStyles: ['HISTORY', 'QUIET_TRAVEL', 'NATURE'],
        bio: '조용한 사찰 산책과 전통적인 분위기를 좋아해요.',
        buddyStyles: ['TRADITIONAL_CULTURE', 'SLOW_TRAVEL'],
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
        travelStyles: ['PHOTOGRAPHY', 'HISTORY', 'CAFE'],
        bio: '풍경 사진과 사찰 근처 카페를 함께 즐기고 싶어요.',
        buddyStyles: ['PHOTOGRAPHY', 'QUIET_TRAVEL'],
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
        travelStyles: ['NATURE', 'WALKING', 'LOCAL_FOOD'],
        bio: '가벼운 산책과 지역 음식을 함께 즐길 여행 친구를 찾고 있어요.',
        buddyStyles: ['FOODIE', 'SLOW_TRAVEL'],
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
        travelStyles: ['WALKING', 'PHOTO_SPOT', 'RELAX'],
        bio: '공원 산책과 잔잔한 풍경을 좋아해요. 천천히 걷는 여행이 잘 맞아요.',
        buddyStyles: ['SLOW_TRAVEL', 'PHOTOGRAPHY'],
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
        travelStyles: ['NATURE', 'CAFE', 'LOCAL_FOOD'],
        bio: '공원에서 쉬고 근처 맛집과 카페를 함께 찾아다니는 걸 좋아해요.',
        buddyStyles: ['FOODIE', 'QUIET_TRAVEL'],
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
        travelStyles: ['HISTORY', 'ART', 'QUIET_TRAVEL'],
        bio: '박물관과 전시 공간을 천천히 둘러보는 여행을 좋아해요.',
        buddyStyles: ['TRADITIONAL_CULTURE', 'PHOTOGRAPHY'],
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
        travelStyles: ['MUSEUM', 'CAFE', 'LOCAL_FOOD'],
        bio: '박물관 관람 후 근처 카페에서 쉬는 코스를 좋아해요.',
        buddyStyles: ['SLOW_TRAVEL', 'FOODIE'],
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
        travelStyles: ['LOCAL_FOOD', 'WALKING'],
        bio: `${placeTitle} 주변을 함께 천천히 둘러볼 여행 메이트예요.`,
        buddyStyles: ['SLOW_TRAVEL', 'FOODIE'],
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
