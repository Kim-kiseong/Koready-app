import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUser, LanguageResponse, NextStep, TokenResponse } from '@/api/types';

import { secureStorage } from './secure-storage';
import { useAddressStore } from './address-store';
import { useLanguageStore } from './language-store';
import { useOnboardingStore } from './onboarding-store';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  user: AuthUser | null;
  nextStep: NextStep | null;
  buddyProfileExists: boolean;
  unreadMessageCount: number;
  deviceId: string;
  hasHydrated: boolean;
  setSession: (session: TokenResponse) => void;
  applyLanguageChange: (data: LanguageResponse) => void;
  setBuddyProfileExists: (buddyProfileExists: boolean) => void;
  setNextStep: (nextStep: NextStep) => void;
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
      buddyProfileExists: false,
      unreadMessageCount: 0,
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
      applyLanguageChange: (data) => {
        set((state) => ({
          nextStep: data.nextStep,
          user: state.user ? { ...state.user, preferredLanguage: data.language } : state.user,
        }));
        useLanguageStore.getState().setLanguage(data.language);
      },
      setBuddyProfileExists: (buddyProfileExists) => set({ buddyProfileExists }),
      setNextStep: (nextStep) => set({ nextStep }),
      clearSession: () => {
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          user: null,
          nextStep: null,
          buddyProfileExists: false,
          unreadMessageCount: 0,
        });
        useOnboardingStore.getState().reset();
        useAddressStore.getState().reset();
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
        buddyProfileExists: state.buddyProfileExists,
        unreadMessageCount: state.unreadMessageCount,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
