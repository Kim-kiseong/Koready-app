import { getMockBuddyProfileById } from '@/api/mate';
import type { BuddyProfile, BuddyProfileDetail } from '@/api/types';
import { normalizeCountryCode } from '@/utils/country';
import { useLanguageStore } from '@/store/language-store';

const INBOX_MOCK_BUDDY_PROFILES: Record<number, BuddyProfileDetail> = {
  501: {
    profileId: 501,
    profileImageUrl: 'https://picsum.photos/id/1027/300/300',
    nickname: 'Emma',
    nationality: 'France',
    nationalityCode: 'FR',
    availableLanguages: ['EN', 'KO'],
    koreanLevel: 'BEGINNER',
    travelStyles: ['LOCAL_FOOD', 'TRADITIONAL_MARKET'],
    bio: '한국 전통 문화와 로컬 맛집을 좋아해요 :)',
    buddyStyles: ['TRADITIONAL_CULTURE', 'FOODIE'],
    socialLinks: [
      {
        type: 'INSTAGRAM',
        displayValue: '@emma.travels',
        url: 'https://instagram.com/emma.travels',
      },
      {
        type: 'KAKAOTALK',
        displayValue: 'emma_kr',
        url: 'https://open.kakao.com/o/emma_kr',
      },
    ],
    profilePublic: true,
    snsPublic: true,
    allowsMessages: true,
    canMessage: true,
    blockedByMe: false,
    updatedAt: '2026-08-05T10:40:00.000Z',
  },
  502: {
    profileId: 502,
    profileImageUrl: 'https://picsum.photos/id/1005/300/300',
    nickname: 'Liam',
    nationality: 'United States',
    nationalityCode: 'US',
    availableLanguages: ['EN'],
    koreanLevel: 'INTERMEDIATE',
    travelStyles: ['NATURE', 'EXHIBITION_MUSEUM'],
    bio: '자연 풍경과 전시 관람을 함께 즐기는 여행을 좋아해요.',
    buddyStyles: ['PHOTOGRAPHY', 'QUIET_TRAVEL'],
    socialLinks: [
      {
        type: 'INSTAGRAM',
        displayValue: '@liam.wanders',
        url: 'https://instagram.com/liam.wanders',
      },
    ],
    profilePublic: true,
    snsPublic: true,
    allowsMessages: true,
    canMessage: true,
    blockedByMe: false,
    updatedAt: '2026-08-04T03:20:00.000Z',
  },
  503: {
    profileId: 503,
    profileImageUrl: 'https://picsum.photos/id/1011/300/300',
    nickname: 'Sophie',
    nationality: 'United Kingdom',
    nationalityCode: 'GB',
    availableLanguages: ['EN', 'KO'],
    koreanLevel: 'BEGINNER',
    travelStyles: ['CULTURE_EXPERIENCE', 'TRADITIONAL_MARKET'],
    bio: '추천해주실 만한 찻집이 있을까요?',
    buddyStyles: ['TRADITIONAL_CULTURE', 'QUIET_TRAVEL'],
    socialLinks: [
      {
        type: 'LINE',
        displayValue: 'sophie_seoul',
        url: 'https://line.me/ti/p/sophie_seoul',
      },
    ],
    profilePublic: true,
    snsPublic: true,
    allowsMessages: true,
    canMessage: true,
    blockedByMe: false,
    updatedAt: '2026-08-03T16:10:00.000Z',
  },
  504: {
    profileId: 504,
    profileImageUrl: 'https://picsum.photos/id/1025/300/300',
    nickname: 'Yuki',
    nationality: 'Japan',
    nationalityCode: 'JP',
    availableLanguages: ['JP', 'EN'],
    koreanLevel: 'BEGINNER',
    travelStyles: ['DRAMA_LOCATION', 'LOCAL_FOOD'],
    bio: '좋네요! 다녀오면 어땠는지 알려주세요.',
    buddyStyles: ['QUIET_TRAVEL', 'FOODIE'],
    socialLinks: [],
    profilePublic: true,
    snsPublic: false,
    allowsMessages: true,
    canMessage: true,
    blockedByMe: false,
    updatedAt: '2026-08-01T05:15:00.000Z',
  },
};

const ENGLISH_BIOS: Partial<Record<number, string>> = {
  501: 'I love Korean traditional culture and exploring local food spots :)',
  502: 'I enjoy nature spots and exhibition spaces with a relaxed pace.',
  503: 'Do you know any tea houses you would recommend?',
  504: 'Sounds great! Please let me know how it goes when you visit.',
};

function cloneBuddyProfileDetail(profile: BuddyProfileDetail): BuddyProfileDetail {
  return {
    ...profile,
    availableLanguages: [...profile.availableLanguages],
    travelStyles: [...profile.travelStyles],
    buddyStyles: [...profile.buddyStyles],
    socialLinks: profile.socialLinks.map((link) => ({ ...link })),
  };
}

function localizeBuddyProfile(profile: BuddyProfileDetail): BuddyProfileDetail {
  if (useLanguageStore.getState().language !== 'EN') {
    return profile;
  }

  return {
    ...profile,
    bio: ENGLISH_BIOS[profile.profileId] ?? profile.bio,
  };
}

function toBuddyProfileDetail(profile: BuddyProfile): BuddyProfileDetail {
  return {
    ...profile,
    nationalityCode: normalizeCountryCode(profile.nationality) || undefined,
  };
}

export function getInboxMockBuddyProfileById(profileId: number): BuddyProfileDetail | null {
  const profile = INBOX_MOCK_BUDDY_PROFILES[profileId];
  return profile ? localizeBuddyProfile(cloneBuddyProfileDetail(profile)) : null;
}

export function getMockBuddyProfileDetailById(profileId: number): BuddyProfileDetail | null {
  const inboxMockProfile = getInboxMockBuddyProfileById(profileId);
  if (inboxMockProfile) {
    return inboxMockProfile;
  }

  const mateProfile = getMockBuddyProfileById(profileId);
  if (mateProfile) {
    return localizeBuddyProfile(toBuddyProfileDetail(mateProfile));
  }

  return null;
}
