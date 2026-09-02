import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware';

import type { SavedPlaceItem } from '@/api/types';

import { secureStorage } from './secure-storage';

function sanitizeSavedPlaceTags(tags: readonly unknown[] = []) {
  const seen = new Set<string>();
  const nextTags: string[] = [];

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      continue;
    }

    const trimmed = tag.trim().replace(/^#+\s*/, '');
    if (!trimmed) {
      continue;
    }

    const normalized = trimmed.replace(/[\s_]+/g, '').toLowerCase();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    nextTags.push(trimmed);
  }

  return nextTags;
}

function sanitizeSavedPlace(place: SavedPlaceItem): SavedPlaceItem {
  return {
    ...place,
    tags: sanitizeSavedPlaceTags(place.tags),
  };
}

interface SavedPlaceState {
  savedByPlaceId: Record<string, boolean>;
  savedPlacesByPlaceId: Record<string, SavedPlaceItem>;
  hasHydrated: boolean;

  initializePlace: (
    placeId: string,
    initialIsSaved: boolean,
    snapshot?: SavedPlaceItem | null,
  ) => void;
  togglePlace: (placeId: string) => void;
  upsertSavedPlace: (place: SavedPlaceItem) => void;
  removeSavedPlace: (placeId: string | number) => void;
  replaceSavedPlaces: (places: SavedPlaceItem[]) => void;
}

export const useSavedPlaceStore =
  create<SavedPlaceState>()(
    persist(
      (set) => ({
        savedByPlaceId: {},
        savedPlacesByPlaceId: {},
        hasHydrated: false,

        initializePlace: (
          placeId,
          initialIsSaved,
          snapshot = null,
        ) => {
          set((state) => {
            /*
             * 로컬에 저장 이력이 있으면 API/mock 값으로
             * 다시 덮어쓰지 않습니다.
             */
            if (
              Object.prototype.hasOwnProperty.call(
                state.savedByPlaceId,
                placeId,
              )
            ) {
              return state;
            }

            return {
              savedByPlaceId: {
                ...state.savedByPlaceId,
                [placeId]: initialIsSaved,
              },
              ...(initialIsSaved && snapshot
                ? {
                    savedPlacesByPlaceId: {
                      ...state.savedPlacesByPlaceId,
                      [placeId]: sanitizeSavedPlace(snapshot),
                    },
                  }
                : null),
            };
          });
        },

        togglePlace: (placeId) => {
          set((state) => ({
            savedByPlaceId: {
              ...state.savedByPlaceId,
              [placeId]:
                !state.savedByPlaceId[placeId],
            },
            ...(state.savedByPlaceId[placeId]
              ? {
                  savedPlacesByPlaceId: Object.fromEntries(
                    Object.entries(state.savedPlacesByPlaceId).filter(([key]) => key !== placeId),
                  ),
                }
              : null),
          }));
        },

        upsertSavedPlace: (place) => {
          const placeId = String(place.placeId);
          const normalizedPlace = sanitizeSavedPlace(place);

          set((state) => {
            const existing = state.savedPlacesByPlaceId[placeId];
            const nextPlace = existing
              ? {
                  ...existing,
                  ...normalizedPlace,
                  saved: true,
                  savedAt: existing.savedAt,
                  source: existing.source ?? normalizedPlace.source,
                }
              : { ...normalizedPlace, saved: true };

            return {
              savedByPlaceId: {
                ...state.savedByPlaceId,
                [placeId]: true,
              },
              savedPlacesByPlaceId: {
                ...state.savedPlacesByPlaceId,
                [placeId]: nextPlace,
              },
            };
          });
        },

        removeSavedPlace: (placeId) => {
          const key = String(placeId);

          set((state) => {
            if (
              state.savedByPlaceId[key] === false &&
              !Object.prototype.hasOwnProperty.call(
                state.savedPlacesByPlaceId,
                key,
              )
            ) {
              return state;
            }

            const nextSavedPlacesByPlaceId = {
              ...state.savedPlacesByPlaceId,
            };
            delete nextSavedPlacesByPlaceId[key];

            return {
              savedByPlaceId: {
                ...state.savedByPlaceId,
                [key]: false,
              },
              savedPlacesByPlaceId:
                nextSavedPlacesByPlaceId,
            };
          });
        },

        replaceSavedPlaces: (places) => {
          set((state) => {
            const nextSavedByPlaceId = {
              ...state.savedByPlaceId,
            };
            const nextSavedPlacesByPlaceId = {
              ...state.savedPlacesByPlaceId,
            };

            for (const place of places) {
              const normalizedPlace = sanitizeSavedPlace(place);
              const key = String(place.placeId);

              if (nextSavedByPlaceId[key] === false) {
                continue;
              }

              const existing = nextSavedPlacesByPlaceId[key];
              nextSavedByPlaceId[key] = true;
              nextSavedPlacesByPlaceId[key] = existing
                ? {
                    ...existing,
                    ...normalizedPlace,
                    saved: true,
                    savedAt: existing.savedAt,
                    source: existing.source ?? normalizedPlace.source,
                  }
                : { ...normalizedPlace, saved: true };
            }

            return {
              savedByPlaceId: nextSavedByPlaceId,
              savedPlacesByPlaceId:
                nextSavedPlacesByPlaceId,
            };
          });
        },

      }),
      {
        name: 'saved-place-storage',
        storage: createJSONStorage(
          () => secureStorage,
        ),

        /*
         * 실제로 보관할 데이터만 지정합니다.
         * hasHydrated는 앱 실행 때마다 다시 확인합니다.
         */
        partialize: (state) => ({
          savedByPlaceId:
            state.savedByPlaceId,
          savedPlacesByPlaceId:
            state.savedPlacesByPlaceId,
        }),

        // Match the app's auth/onboarding stores: hydration completion is
        // tracked outside the persisted payload, so mock defaults never win
        // over an already saved local choice during app startup.
        onRehydrateStorage: () => (state, error) => {
          if (state && !error) {
            const normalizedSavedPlacesByPlaceId = Object.fromEntries(
              Object.entries(state.savedPlacesByPlaceId).map(([key, place]) => [
                key,
                sanitizeSavedPlace(place),
              ]),
            );

            useSavedPlaceStore.setState({
              savedPlacesByPlaceId: normalizedSavedPlacesByPlaceId,
              hasHydrated: true,
            });
            return;
          }

          useSavedPlaceStore.setState({
            hasHydrated: true,
          });
        },
      },
    ),
  );
