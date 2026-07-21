import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUser, NextStep, TokenResponse } from '@/api/types';

import { secureStorage } from './secure-storage';
import { useOnboardingStore } from './onboarding-store';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  user: AuthUser | null;
  nextStep: NextStep | null;
  deviceId: string;
  hasHydrated: boolean;
  setSession: (session: TokenResponse) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      user: null,
      nextStep: null,
      deviceId: Crypto.randomUUID(),
      hasHydrated: false,
      setSession: (session) =>
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
          refreshTokenExpiresAt: session.refreshTokenExpiresAt,
          user: session.user,
          nextStep: session.nextStep,
        }),
      clearSession: () => {
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          user: null,
          nextStep: null,
        });
        useOnboardingStore.getState().reset();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        user: state.user,
        nextStep: state.nextStep,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
