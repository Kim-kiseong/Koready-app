import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SavedAddressOption } from '@/api/address';

import { secureStorage } from './secure-storage';

type AddressState = {
  savedAddresses: SavedAddressOption[];
  hasSeeded: boolean;
  seedSavedAddresses: (addresses: SavedAddressOption[]) => void;
  removeSavedAddress: (id: string) => void;
};

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      savedAddresses: [],
      hasSeeded: false,
      // Only seeds once — after the user deletes every saved address, the
      // list legitimately stays empty instead of resurrecting the mock data.
      seedSavedAddresses: (addresses) =>
        set((state) => (state.hasSeeded ? state : { savedAddresses: addresses, hasSeeded: true })),
      // TODO: replace with client.delete(`/addresses/${id}`)
      removeSavedAddress: (id) =>
        set((state) => ({ savedAddresses: state.savedAddresses.filter((a) => a.id !== id) })),
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
