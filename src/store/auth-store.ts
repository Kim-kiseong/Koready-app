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
  setUserProfileImageUrl: (profileImageUrl: string | null) => void;
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
      setSession: (session) => {
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
          refreshTokenExpiresAt: session.refreshTokenExpiresAt,
          user: session.user,
          nextStep: session.nextStep,
        });
        // The backend localizes every authenticated response (place titles,
        // tags, ...) using the account's saved preferredLanguage, not the
        // Accept-Language header — so local i18n state has to mirror it
        // here, otherwise a returning user whose profile is EN sees Korean
        // app chrome (from language-store's local default) alongside English
        // content (from the backend actually honoring their real profile).
        useLanguageStore.getState().setLanguage(session.user.preferredLanguage);
      },
      applyLanguageChange: (data) => {
        set((state) => ({
          nextStep: data.nextStep,
          user: state.user ? { ...state.user, preferredLanguage: data.language } : state.user,
        }));
        useLanguageStore.getState().setLanguage(data.language);
      },
      setBuddyProfileExists: (buddyProfileExists) => set({ buddyProfileExists }),
      setUserProfileImageUrl: (profileImageUrl) =>
        set((state) => ({
          user: state.user ? { ...state.user, profileImageUrl } : state.user,
        })),
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
