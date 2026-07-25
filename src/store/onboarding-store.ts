import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DestinationId, PurposeId, TravelStyleId } from '@/api/onboarding';

import { secureStorage } from './secure-storage';

const MAX_TRAVEL_STYLES = 4;
const MAX_DESTINATIONS = 3;

function toggleCapped<T>(list: T[], value: T, max: number): T[] {
  if (list.includes(value)) return list.filter((item) => item !== value);
  if (list.length >= max) return list;
  return [...list, value];
}

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
  destinations: DestinationId[];
  hasHydrated: boolean;
  setPurpose: (purpose: PurposeId) => void;
  setLocation: (location: OnboardingLocation) => void;
  clearLocation: () => void;
  toggleTravelStyle: (style: TravelStyleId) => void;
  toggleDestination: (destination: DestinationId) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      purpose: null,
      location: null,
      travelStyles: [],
      destinations: [],
      hasHydrated: false,
      setPurpose: (purpose) => set({ purpose }),
      setLocation: (location) => set({ location }),
      clearLocation: () => set({ location: null }),
      toggleTravelStyle: (style) =>
        set((state) => ({
          travelStyles: toggleCapped(state.travelStyles, style, MAX_TRAVEL_STYLES),
        })),
      toggleDestination: (destination) =>
        set((state) => ({
          destinations: toggleCapped(state.destinations, destination, MAX_DESTINATIONS),
        })),
      reset: () => set({ purpose: null, location: null, travelStyles: [], destinations: [] }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        purpose: state.purpose,
        location: state.location,
        travelStyles: state.travelStyles,
        destinations: state.destinations,
      }),
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ hasHydrated: true });
      },
    },
  ),
);
