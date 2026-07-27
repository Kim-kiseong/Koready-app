import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AuthUser,
  LanguageResponse,
  MyUserResponse,
  NextStep,
  SignupStatus,
  TokenResponse,
} from '@/api/types';

import { secureStorage } from './secure-storage';
import { useLanguageStore } from './language-store';
import { useOnboardingStore } from './onboarding-store';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  user: AuthUser | null;
  nextStep: NextStep | null;
  signupStatus: SignupStatus | null;
  defaultLocationId: number | null;
  onboardingCompleted: boolean;
  buddyProfileExists: boolean;
  unreadMessageCount: number;
  termsNeedReAgreement: boolean;
  deviceId: string;
  hasHydrated: boolean;
  setSession: (session: TokenResponse) => void;
  applyMyUser: (data: MyUserResponse) => void;
  applyLanguageChange: (data: LanguageResponse) => void;
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
      signupStatus: null,
      defaultLocationId: null,
      onboardingCompleted: false,
      buddyProfileExists: false,
      unreadMessageCount: 0,
      termsNeedReAgreement: false,
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
      applyMyUser: (data) => {
        set({
          user: data.user,
          nextStep: data.nextStep,
          signupStatus: data.signupStatus,
          defaultLocationId: data.defaultLocationId,
          onboardingCompleted: data.onboardingCompleted,
          buddyProfileExists: data.buddyProfileExists,
          unreadMessageCount: data.unreadMessageCount,
          termsNeedReAgreement: data.termsNeedReAgreement,
        });
        useLanguageStore.getState().setLanguage(data.user.preferredLanguage);
      },
      applyLanguageChange: (data) => {
        set((state) => ({
          nextStep: data.nextStep,
          user: state.user ? { ...state.user, preferredLanguage: data.language } : state.user,
        }));
        useLanguageStore.getState().setLanguage(data.language);
      },
      setNextStep: (nextStep) => set({ nextStep }),
      clearSession: () => {
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          user: null,
          nextStep: null,
          signupStatus: null,
          defaultLocationId: null,
          onboardingCompleted: false,
          buddyProfileExists: false,
          unreadMessageCount: 0,
          termsNeedReAgreement: false,
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
        signupStatus: state.signupStatus,
        defaultLocationId: state.defaultLocationId,
        onboardingCompleted: state.onboardingCompleted,
        buddyProfileExists: state.buddyProfileExists,
        unreadMessageCount: state.unreadMessageCount,
        termsNeedReAgreement: state.termsNeedReAgreement,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
