import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { OnboardingProgressResponse, PurposeId, TravelStyleId } from '@/api/onboarding';

import { secureStorage } from './secure-storage';

const MAX_TRAVEL_STYLES = 4;

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
  // Real backend identifiers, populated from GET /users/me/onboarding
  // (resuming a prior session), POST /users/me/locations (LocationScreen),
  // and GET /onboarding/place-candidate-sets/current as the user progresses.
  currentLocationId: number | null;
  candidateSetId: string | null;
  candidateSetVersion: number | null;
  selectedPreferencePlaceIds: number[];
  hasHydrated: boolean;
  setPurpose: (purpose: PurposeId) => void;
  setLocation: (location: OnboardingLocation) => void;
  setCurrentLocationId: (locationId: number | null) => void;
  clearLocation: () => void;
  toggleTravelStyle: (style: TravelStyleId) => void;
  toggleSelectedPreferencePlace: (placeId: number, max: number) => void;
  // Records which published candidate set the user is choosing from. If it
  // differs from what's already stored (a newer set got published since the
  // last visit), any previously selected placeIds are cleared since they
  // don't belong to the set now shown on screen.
  setCandidateSet: (candidateSetId: string, version: number) => void;
  applyProgress: (progress: OnboardingProgressResponse) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      purpose: null,
      location: null,
      travelStyles: [],
      currentLocationId: null,
      candidateSetId: null,
      candidateSetVersion: null,
      selectedPreferencePlaceIds: [],
      hasHydrated: false,
      setPurpose: (purpose) => set({ purpose }),
      setLocation: (location) => set({ location }),
      setCurrentLocationId: (locationId) => set({ currentLocationId: locationId }),
      clearLocation: () => set({ location: null, currentLocationId: null }),
      toggleTravelStyle: (style) =>
        set((state) => ({
          travelStyles: toggleCapped(state.travelStyles, style, MAX_TRAVEL_STYLES),
        })),
      toggleSelectedPreferencePlace: (placeId, max) =>
        set((state) => ({
          selectedPreferencePlaceIds: toggleCapped(state.selectedPreferencePlaceIds, placeId, max),
        })),
      setCandidateSet: (candidateSetId, version) =>
        set((state) =>
          state.candidateSetId === candidateSetId && state.candidateSetVersion === version
            ? { candidateSetId, candidateSetVersion: version }
            : { candidateSetId, candidateSetVersion: version, selectedPreferencePlaceIds: [] },
        ),
      applyProgress: (progress) =>
        set({
          travelStyles: progress.travelStyles,
          currentLocationId: progress.currentLocationId,
          candidateSetId: progress.candidateSetId,
          candidateSetVersion: progress.candidateSetVersion,
          selectedPreferencePlaceIds: progress.selectedPreferencePlaceIds,
        }),
      reset: () =>
        set({
          purpose: null,
          location: null,
          travelStyles: [],
          currentLocationId: null,
          candidateSetId: null,
          candidateSetVersion: null,
          selectedPreferencePlaceIds: [],
        }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        purpose: state.purpose,
        location: state.location,
        travelStyles: state.travelStyles,
        currentLocationId: state.currentLocationId,
        candidateSetId: state.candidateSetId,
        candidateSetVersion: state.candidateSetVersion,
        selectedPreferencePlaceIds: state.selectedPreferencePlaceIds,
      }),
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ hasHydrated: true });
      },
    },
  ),
);
