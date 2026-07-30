import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserLocationResponse } from '@/api/address';

import { secureStorage } from './secure-storage';

type AddressState = {
  savedAddresses: UserLocationResponse[];
  hasSeeded: boolean;
  seedSavedAddresses: (addresses: UserLocationResponse[]) => void;
  // Wholesale overwrite, unlike seedSavedAddresses' seed-once guard — used to
  // resync after a delete, since the server may have reassigned default to a
  // different location and a 204 response doesn't say which.
  replaceSavedAddresses: (addresses: UserLocationResponse[]) => void;
  addSavedAddress: (address: UserLocationResponse) => void;
  setDefaultAddress: (locationId: number) => void;
  reset: () => void;
};

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      savedAddresses: [],
      hasSeeded: false,
      // Only seeds once — after the user deletes every saved address, the
      // list legitimately stays empty instead of resurrecting stale data.
      seedSavedAddresses: (addresses) =>
        set((state) => (state.hasSeeded ? state : { savedAddresses: addresses, hasSeeded: true })),
      replaceSavedAddresses: (addresses) => set({ savedAddresses: addresses, hasSeeded: true }),
      addSavedAddress: (address) =>
        set((state) => ({
          savedAddresses: [
            address,
            ...state.savedAddresses.filter((a) => a.locationId !== address.locationId),
          ],
          hasSeeded: true,
        })),
      setDefaultAddress: (locationId) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) => ({
            ...a,
            default: a.locationId === locationId,
          })),
        })),
      reset: () => set({ savedAddresses: [], hasSeeded: false }),
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => secureStorage),
      // v0 persisted the old mock SavedAddressOption shape ({id, title,
      // subtitle}); there's no meaningful mapping onto UserLocationResponse,
      // so discard it and let fetchMyLocations() reseed on next load.
      version: 1,
      migrate: () => ({ savedAddresses: [], hasSeeded: false }) as unknown as AddressState,
    },
  ),
);
