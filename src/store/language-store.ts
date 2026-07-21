import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LanguageCode } from '@/api/types';

import { secureStorage } from './secure-storage';

type LanguageState = {
  language: LanguageCode;
  hasHydrated: boolean;
  setLanguage: (language: LanguageCode) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'KO',
      hasHydrated: false,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => () => {
        useLanguageStore.setState({ hasHydrated: true });
      },
    },
  ),
);
