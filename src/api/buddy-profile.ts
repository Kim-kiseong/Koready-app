import { isAxiosError } from 'axios';

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

function sortOptions<T extends ProfileOptionItem>(options: T[]): T[] {
  return [...options].sort((left, right) => left.displayOrder - right.displayOrder);
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

export async function fetchProfileOptions(): Promise<ProfileOptionsResponse> {
  const response = await publicClient.get<ProfileOptionsEnvelope>('/profile-options');
  return sortProfileOptions(response.data.data);
}

export async function fetchMyBuddyProfile(): Promise<BuddyProfileResponse> {
  const response = await client.get<BuddyProfileEnvelope>('/users/me/buddy-profile');
  return response.data.data;
}

export async function updateMyBuddyProfile(
  payload: BuddyProfileUpdateRequest,
): Promise<BuddyProfileResponse> {
  const response = await client.put<BuddyProfileEnvelope>('/users/me/buddy-profile', payload);
  return response.data.data;
}

export async function fetchBuddyProfile(profileId: number): Promise<BuddyProfileDetail> {
  try {
    const response = await client.get<BuddyProfileDetailEnvelope>(`/buddy-profiles/${profileId}`);
    return cloneBuddyProfile(response.data.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new BuddyProfileNotFoundError();
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
