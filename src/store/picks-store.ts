import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { webPersistentStorage } from './local-storage';

type PicksState = {
  hasSeenGuide: boolean;
  hasHydrated: boolean;
  dismissGuide: () => void;
};

export const usePicksStore = create<PicksState>()(
  persist(
    (set) => ({
      hasSeenGuide: false,
      hasHydrated: false,
      dismissGuide: () => set({ hasSeenGuide: true }),
    }),
    {
      name: 'picks-storage',
      storage: createJSONStorage(() => webPersistentStorage),
      partialize: (state) => ({ hasSeenGuide: state.hasSeenGuide }),
      onRehydrateStorage: () => () => {
        usePicksStore.setState({ hasHydrated: true });
      },
    },
  ),
);
