import axios, { type AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/env';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

import type { ApiErrorEnvelope, TokenEnvelope, TokenResponse } from './types';

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

export const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  // Keeps the server's locale-dependent responses (e.g. error messages) in
  // sync with whatever language the user last confirmed via PATCH /users/me/language.
  config.headers.set('Accept-Language', useLanguageStore.getState().language);
  return config;
});

let refreshPromise: Promise<TokenResponse> | null = null;

async function refreshSession(): Promise<TokenResponse> {
  const { refreshToken, deviceId } = useAuthStore.getState();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Deliberately a bare axios call (not `client`), so this never re-enters
  // the response interceptor below and can't recurse.
  const response = await axios.post<TokenEnvelope>(`${API_BASE_URL}/api/v1/auth/refresh`, {
    refreshToken,
    deviceId,
  });
  return response.data.data;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config: RetryableRequestConfig | undefined = error.config;
    const isRefreshCall = config?.url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || !config || config._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      refreshPromise ??= refreshSession();
      const session = await refreshPromise;
      // Updates the store; the request interceptor above re-reads it, so the
      // retried request below picks up the new access token automatically.
      useAuthStore.getState().setSession(session);
      return client(config);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      router.replace('/login');
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export type { ApiErrorEnvelope };
