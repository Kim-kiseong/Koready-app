import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserLocationResponse } from '@/api/address';

import { secureStorage } from './secure-storage';

type AddressState = {
  savedAddresses: UserLocationResponse[];
  hasSeeded: boolean;
  seedSavedAddresses: (addresses: UserLocationResponse[]) => void;
  addSavedAddress: (address: UserLocationResponse) => void;
  setDefaultAddress: (locationId: number) => void;
  removeSavedAddress: (locationId: number) => void;
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
      // TODO: replace with client.delete(`/users/me/locations/${locationId}`) once that endpoint exists.
      removeSavedAddress: (locationId) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.locationId !== locationId),
        })),
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
