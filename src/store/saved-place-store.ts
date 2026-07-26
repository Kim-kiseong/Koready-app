import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware';

import { secureStorage } from './secure-storage';

interface SavedPlaceState {
  savedByPlaceId: Record<string, boolean>;
  hasHydrated: boolean;

  initializePlace: (
    placeId: string,
    initialIsSaved: boolean,
  ) => void;
  togglePlace: (placeId: string) => void;
}

export const useSavedPlaceStore =
  create<SavedPlaceState>()(
    persist(
      (set) => ({
        savedByPlaceId: {},
        hasHydrated: false,

        initializePlace: (
          placeId,
          initialIsSaved,
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
          }));
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
        }),

        // Match the app's auth/onboarding stores: hydration completion is
        // tracked outside the persisted payload, so mock defaults never win
        // over an already saved local choice during app startup.
        onRehydrateStorage: () => () => {
          useSavedPlaceStore.setState({
            hasHydrated: true,
          });
        },
      },
    ),
  );
