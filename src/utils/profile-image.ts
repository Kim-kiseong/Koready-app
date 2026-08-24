import type { ImageSource } from 'expo-image';

import { API_BASE_URL } from '@/constants/env';
import { useAuthStore } from '@/store/auth-store';

const PROFILE_IMAGE_PATH_PREFIX = '/api/v1/profile-images/';

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function toProfileImagePath(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (isAbsoluteUrl(trimmed)) {
    try {
      const url = new URL(trimmed);
      const apiPrefixIndex = url.pathname.indexOf(PROFILE_IMAGE_PATH_PREFIX);
      if (apiPrefixIndex >= 0) {
        return url.pathname.slice(apiPrefixIndex);
      }

      const legacyPrefixIndex = url.pathname.indexOf('/profile-images/');
      if (legacyPrefixIndex >= 0) {
        return `/api/v1${url.pathname.slice(legacyPrefixIndex)}`;
      }
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith(PROFILE_IMAGE_PATH_PREFIX)) {
    return trimmed;
  }

  if (trimmed.startsWith('/profile-images/')) {
    return `/api/v1${trimmed}`;
  }

  if (/^img_[0-9a-f]{32}$/i.test(trimmed)) {
    return `${PROFILE_IMAGE_PATH_PREFIX}${trimmed}`;
  }

  return trimmed;
}

export function resolveProfileImageUri(value: string | null | undefined) {
  const path = toProfileImagePath(value);
  if (!path) {
    return null;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export function resolveProfileImageSource(value: string | null | undefined): ImageSource | null {
  const path = toProfileImagePath(value);
  if (!path) {
    return null;
  }

  const uri = isAbsoluteUrl(path) ? path : `${API_BASE_URL}${path}`;
  const accessToken = useAuthStore.getState().accessToken;

  if (uri.startsWith(API_BASE_URL) && accessToken) {
    return {
      uri,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return { uri };
}

export function buildProfileImagePath(imageId: string) {
  return `${PROFILE_IMAGE_PATH_PREFIX}${encodeURIComponent(imageId)}`;
}
