import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';

// expo-secure-store has no web implementation. Native keeps using it (OS
// keychain/keystore). On web, session state goes in sessionStorage instead —
// this used to no-op entirely on web, which meant every page reload logged
// the user out. sessionStorage (deliberately not localStorage) keeps the
// token's exposure window to "this tab, until it's closed" rather than
// indefinitely on disk, while still surviving a reload. Every call is
// try/catched since storage access can throw (private browsing, blocked
// storage, quota) — falls back to the same "just requires signing in again"
// behavior this had before.
export const secureStorage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === 'web') {
      try {
        return window.sessionStorage.getItem(name);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS === 'web') {
      try {
        window.sessionStorage.setItem(name, value);
      } catch {
        // Ignored — same degrade as a getItem failure above.
      }
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === 'web') {
      try {
        window.sessionStorage.removeItem(name);
      } catch {
        // Ignored — same degrade as a getItem failure above.
      }
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
