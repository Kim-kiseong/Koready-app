import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from './secure-storage';

type PicksState = {
  hasSeenGuide: boolean;
  dismissGuide: () => void;
};

export const usePicksStore = create<PicksState>()(
  persist(
    (set) => ({
      hasSeenGuide: false,
      dismissGuide: () => set({ hasSeenGuide: true }),
    }),
    {
      name: 'picks-storage',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
