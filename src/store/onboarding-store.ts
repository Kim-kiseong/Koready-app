import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PurposeId, TravelStyleId } from '@/api/onboarding';

import { secureStorage } from './secure-storage';

const MAX_TRAVEL_STYLES = 4;

export type OnboardingLocation = {
  displayAddress: string;
  latitude: number | null;
  longitude: number | null;
  source: 'search' | 'current';
};

type OnboardingState = {
  purpose: PurposeId | null;
  location: OnboardingLocation | null;
  travelStyles: TravelStyleId[];
  hasHydrated: boolean;
  setPurpose: (purpose: PurposeId) => void;
  setLocation: (location: OnboardingLocation) => void;
  toggleTravelStyle: (style: TravelStyleId) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      purpose: null,
      location: null,
      travelStyles: [],
      hasHydrated: false,
      setPurpose: (purpose) => set({ purpose }),
      setLocation: (location) => set({ location }),
      toggleTravelStyle: (style) =>
        set((state) => {
          if (state.travelStyles.includes(style)) {
            return { travelStyles: state.travelStyles.filter((s) => s !== style) };
          }
          if (state.travelStyles.length >= MAX_TRAVEL_STYLES) {
            return state;
          }
          return { travelStyles: [...state.travelStyles, style] };
        }),
      reset: () => set({ purpose: null, location: null, travelStyles: [] }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        purpose: state.purpose,
        location: state.location,
        travelStyles: state.travelStyles,
      }),
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ hasHydrated: true });
      },
    },
  ),
);
