import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';

// General-purpose persistent storage for non-auth UI state. It mirrors the
// same native SecureStore / web localStorage split as secure-storage.ts, but
// stays separate so callers can clearly distinguish UI preferences from the
// auth/session store.
export const webPersistentStorage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // Private-mode Safari (and similar) can throw on write — nothing
        // actionable, the flag just won't persist this session.
      }
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // See setItem.
      }
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
