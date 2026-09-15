import axios, { create, type AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { API_V1_BASE_URL } from '@/constants/env';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

import type { ApiErrorEnvelope, TokenEnvelope, TokenResponse } from './types';

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

// No timeout previously meant a hung backend response (slow query, deadlock,
// ...) left the caller waiting forever with no error and no loading feedback.
const REQUEST_TIMEOUT_MS = 15_000;

export const client = create({
  baseURL: API_V1_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
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
  const response = await axios.post<TokenEnvelope>(`${API_V1_BASE_URL}/auth/refresh`, {
    refreshToken,
    deviceId,
  });
  return response.data.data;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config: RetryableRequestConfig | undefined = error.config;
    // Neither call has a session to refresh yet — /auth/refresh itself would
    // recurse, and /auth/google is the login call that creates the session in
    // the first place. Retrying either on 401 just replaces the real backend
    // error with a confusing "no refresh token" one. `config.url` here is the
    // relative path passed to `client` (baseURL already carries /api/v1), not
    // the resolved absolute URL.
    const isRefreshCall =
      config?.url?.includes('/auth/refresh') || config?.url?.includes('/auth/google');

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
