import axios from 'axios';

import { client } from './client';
import { publicClient } from './public-client';
import type {
  BuddyProfile,
  BuddyProfileEnvelope,
  BuddyProfileDetailEnvelope,
  BuddyProfileDetail,
  BuddyProfileResponse,
  BuddyProfileUpdateRequest,
  ProfileImageCompleteEnvelope,
  ProfileImageCompleteRequest,
  ProfileImageCompleteResponse,
  ProfileImageUploadUrlEnvelope,
  ProfileImageUploadUrlRequest,
  ProfileImageUploadUrlResponse,
  ProfileOptionItem,
  ProfileOptionsEnvelope,
  ProfileOptionsResponse,
} from './types';

import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { useAuthStore } from '@/store/auth-store';

const NOW_ISO = '2026-07-31T02:49:51.377Z';

const DEV_PROFILE_OPTIONS: ProfileOptionsResponse = {
  countries: sortOptions([
    { code: 'FR', labelKo: '프랑스', labelEn: 'France', displayOrder: 1 },
    { code: 'KR', labelKo: '한국', labelEn: 'Korea', displayOrder: 2 },
    { code: 'JP', labelKo: '일본', labelEn: 'Japan', displayOrder: 3 },
    { code: 'US', labelKo: '미국', labelEn: 'United States', displayOrder: 4 },
    { code: 'CN', labelKo: '중국', labelEn: 'China', displayOrder: 5 },
    { code: 'TW', labelKo: '대만', labelEn: 'Taiwan', displayOrder: 6 },
  ]),
  languages: sortOptions([
    { code: 'EN', labelKo: '영어', labelEn: 'English', displayOrder: 1 },
    { code: 'KO', labelKo: '한국어', labelEn: 'Korean', displayOrder: 2 },
    { code: 'JA', labelKo: '일본어', labelEn: 'Japanese', displayOrder: 3 },
    { code: 'ZH', labelKo: '중국어', labelEn: 'Chinese', displayOrder: 4 },
    { code: 'FR', labelKo: '프랑스어', labelEn: 'French', displayOrder: 5 },
    { code: 'TH', labelKo: '태국어', labelEn: 'Thai', displayOrder: 6 },
    { code: 'VI', labelKo: '베트남어', labelEn: 'Vietnamese', displayOrder: 7 },
    { code: 'MN', labelKo: '몽골어', labelEn: 'Mongolian', displayOrder: 8 },
    { code: 'RU', labelKo: '러시아어', labelEn: 'Russian', displayOrder: 9 },
    { code: 'ID', labelKo: '인도네시아어', labelEn: 'Indonesian', displayOrder: 10 },
    { code: 'ES', labelKo: '스페인어', labelEn: 'Spanish', displayOrder: 11 },
    { code: 'DE', labelKo: '독일어', labelEn: 'German', displayOrder: 12 },
    { code: 'AR', labelKo: '아랍어', labelEn: 'Arabic', displayOrder: 13 },
  ]),
  koreanLevels: sortOptions([
    { code: 'BEGINNER', labelKo: '초급', labelEn: 'Beginner', displayOrder: 1 },
    { code: 'INTERMEDIATE', labelKo: '중급', labelEn: 'Intermediate', displayOrder: 2 },
    { code: 'ADVANCED', labelKo: '고급', labelEn: 'Advanced', displayOrder: 3 },
  ]),
  travelStyles: sortOptions([
    { code: 'LOCAL_FOOD', labelKo: '로컬 맛집', labelEn: 'Local Food', displayOrder: 1 },
    { code: 'LOCAL_FESTIVAL', labelKo: '지역 축제', labelEn: 'Local Festival', displayOrder: 2 },
    { code: 'TRADITIONAL_MARKET', labelKo: '전통시장', labelEn: 'Traditional Market', displayOrder: 3 },
    { code: 'CULTURE_EXPERIENCE', labelKo: '문화 체험', labelEn: 'Culture Experience', displayOrder: 4 },
    { code: 'NATURE', labelKo: '자연 명소', labelEn: 'Nature', displayOrder: 5 },
    { code: 'EXHIBITION_MUSEUM', labelKo: '전시/미술관', labelEn: 'Exhibition / Museum', displayOrder: 6 },
    { code: 'DRAMA_LOCATION', labelKo: '드라마 촬영지', labelEn: 'Drama Location', displayOrder: 7 },
  ]),
  socialPlatforms: sortOptions([
    { code: 'INSTAGRAM', labelKo: 'Instagram', labelEn: 'Instagram', displayOrder: 1 },
    { code: 'TIKTOK', labelKo: 'TikTok', labelEn: 'TikTok', displayOrder: 2 },
    { code: 'WECHAT', labelKo: 'WeChat', labelEn: 'WeChat', displayOrder: 3 },
    { code: 'XIAOHONGSHU', labelKo: 'Xiaohongshu', labelEn: 'Xiaohongshu', displayOrder: 4 },
    { code: 'LINE', labelKo: 'LINE', labelEn: 'LINE', displayOrder: 5 },
    { code: 'KAKAOTALK', labelKo: 'KakaoTalk', labelEn: 'KakaoTalk', displayOrder: 6 },
  ]),
};

const DEV_BUDDY_PROFILE_RESPONSE: BuddyProfileResponse = {
  exists: true,
    profile: {
      profileId: 501,
      profileImageUrl: 'https://picsum.photos/id/1027/300/300',
      nickname: 'Luna',
      nationality: 'France',
      nationalityCode: 'FR',
      availableLanguages: ['EN', 'KO'],
      koreanLevel: 'BEGINNER',
      travelStyles: ['LOCAL_FOOD', 'NATURE'],
      bio: '분위기 좋은 카페와 한옥, 산책을 좋아해요.',
      socialLinks: [
        {
          type: 'INSTAGRAM',
        displayValue: '@luna002',
        url: 'https://instagram.com/luna002',
      },
      {
        type: 'KAKAOTALK',
        displayValue: 'luna002',
        url: 'https://open.kakao.com/o/luna002',
      },
    ],
    profilePublic: true,
    snsPublic: true,
    allowsMessages: true,
    canMessage: true,
    blockedByMe: false,
    updatedAt: NOW_ISO,
  },
};

let devBuddyProfileResponse = cloneBuddyProfileResponse(DEV_BUDDY_PROFILE_RESPONSE);

function isDevMockSession() {
  return __DEV__ && useAuthStore.getState().accessToken === DEV_MOCK_ACCESS_TOKEN;
}

function sortOptions<T extends ProfileOptionItem>(options: T[]): T[] {
  return [...options].sort((left, right) => left.displayOrder - right.displayOrder);
}

function normalizeSocialLinkUrl(type: string, value: string) {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  const handle = normalizedValue.replace(/^@+/, '').trim();
  if (!handle) {
    return '';
  }

  const encodedHandle = encodeURIComponent(handle);
  switch (type) {
    case 'INSTAGRAM':
      return `https://instagram.com/${encodedHandle}`;
    case 'TIKTOK':
      return `https://tiktok.com/@${encodedHandle}`;
    case 'WECHAT':
      return `https://wechat.com/${encodedHandle}`;
    case 'XIAOHONGSHU':
      return `https://xiaohongshu.com/${encodedHandle}`;
    case 'LINE':
      return `https://line.me/ti/p/${encodedHandle}`;
    case 'KAKAOTALK':
      return `https://open.kakao.com/o/${encodedHandle}`;
    default:
      return `https://${type.toLowerCase()}.com/${encodedHandle}`;
  }
}

function cloneBuddyProfileResponse(response: BuddyProfileResponse): BuddyProfileResponse {
  return {
    exists: response.exists,
    profile: response.profile
      ? {
        ...response.profile,
        availableLanguages: [...response.profile.availableLanguages],
        travelStyles: [...response.profile.travelStyles],
        socialLinks: response.profile.socialLinks.map((link) => ({ ...link })),
      }
      : null,
  };
}

function cloneBuddyProfile(profile: BuddyProfile | BuddyProfileDetail): BuddyProfileDetail {
  return {
    ...profile,
    availableLanguages: [...profile.availableLanguages],
    travelStyles: [...profile.travelStyles],
    socialLinks: profile.socialLinks.map((link) => ({ ...link })),
  };
}

export class BuddyProfileNotFoundError extends Error {
  constructor() {
    super('Buddy profile not found');
    this.name = 'BuddyProfileNotFoundError';
  }
}

function sortProfileOptions(response: ProfileOptionsResponse): ProfileOptionsResponse {
  return {
    countries: sortOptions(response.countries),
    languages: sortOptions(response.languages),
    koreanLevels: sortOptions(response.koreanLevels),
    travelStyles: sortOptions(response.travelStyles),
    socialPlatforms: sortOptions(response.socialPlatforms),
  };
}

function getDefaultProfile(): BuddyProfile {
  return {
    profileId: 0,
    profileImageUrl: null,
    nickname: '',
    nationality: '',
    nationalityCode: '',
    availableLanguages: [],
    koreanLevel: '',
    travelStyles: [],
    bio: '',
    socialLinks: [],
    profilePublic: true,
    snsPublic: true,
    allowsMessages: true,
    canMessage: true,
    blockedByMe: false,
    updatedAt: NOW_ISO,
  };
}

export async function fetchProfileOptions(): Promise<ProfileOptionsResponse> {
  if (isDevMockSession()) {
    return sortProfileOptions(DEV_PROFILE_OPTIONS);
  }

  const response = await publicClient.get<ProfileOptionsEnvelope>('/profile-options');
  return sortProfileOptions(response.data.data);
}

export async function fetchMyBuddyProfile(): Promise<BuddyProfileResponse> {
  if (isDevMockSession()) {
    return cloneBuddyProfileResponse(devBuddyProfileResponse);
  }

  const response = await client.get<BuddyProfileEnvelope>('/users/me/buddy-profile');
  return response.data.data;
}

export async function updateMyBuddyProfile(
  payload: BuddyProfileUpdateRequest,
): Promise<BuddyProfileResponse> {
  if (isDevMockSession()) {
    const current = devBuddyProfileResponse.profile ?? getDefaultProfile();
    const nextProfile: BuddyProfile = {
      ...current,
      profileImageUrl: payload.profileImageUrl,
      nickname: payload.nickname,
      nationalityCode: payload.nationalityCode,
      availableLanguages: [...payload.availableLanguages],
      koreanLevel: payload.koreanLevel,
      bio: payload.bio,
      travelStyles: [...payload.travelStyles],
      socialLinks: payload.socialLinks.map((link) => ({
        type: link.type,
        displayValue: link.value,
        url: normalizeSocialLinkUrl(link.type, link.value),
      })),
      profilePublic: payload.profilePublic,
      snsPublic: payload.snsPublic,
      allowsMessages: payload.allowsMessages,
      canMessage: current.canMessage,
      blockedByMe: current.blockedByMe,
      updatedAt: new Date().toISOString(),
    };

    devBuddyProfileResponse = { exists: true, profile: nextProfile };
    return cloneBuddyProfileResponse(devBuddyProfileResponse);
  }

  const response = await client.put<BuddyProfileEnvelope>('/users/me/buddy-profile', payload);
  return response.data.data;
}

export async function fetchBuddyProfile(profileId: number): Promise<BuddyProfileDetail> {
  try {
    if (isDevMockSession()) {
      const mockProfile = getMockBuddyProfileDetailById(profileId);
      if (mockProfile) {
        return cloneBuddyProfile(mockProfile);
      }
    }

    const response = await client.get<BuddyProfileDetailEnvelope>(`/buddy-profiles/${profileId}`);
    return cloneBuddyProfile(response.data.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      if (isDevMockSession()) {
        const mockProfile = getMockBuddyProfileDetailById(profileId);
        if (mockProfile) {
          return cloneBuddyProfile(mockProfile);
        }
      }

      throw new BuddyProfileNotFoundError();
    }

    if (isDevMockSession()) {
      const mockProfile = getMockBuddyProfileDetailById(profileId);
      if (mockProfile) {
        return cloneBuddyProfile(mockProfile);
      }
    }

    throw error;
  }
}

export async function requestProfileImageUploadUrl(
  payload: ProfileImageUploadUrlRequest,
): Promise<ProfileImageUploadUrlResponse> {
  const response = await client.post<ProfileImageUploadUrlEnvelope>(
    '/users/me/profile-image/upload-url',
    payload,
  );
  return response.data.data;
}

export async function completeProfileImageUpload(
  payload: ProfileImageCompleteRequest,
): Promise<ProfileImageCompleteResponse> {
  const response = await client.post<ProfileImageCompleteEnvelope>(
    '/users/me/profile-image/complete',
    payload,
  );
  return response.data.data;
}
