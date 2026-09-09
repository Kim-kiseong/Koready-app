import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';

// secure-storage.ts deliberately no-ops on web for anything that touches
// auth tokens — localStorage is readable by any script on the page (XSS
// exposed) in a way SecureStore's native keychain/keystore isn't, so that
// tradeoff is correct there. But the same no-op also breaks web persistence
// for stores that hold nothing sensitive (a "seen this hint" flag, a UI
// preference, ...), where there's no security reason to skip it — e.g.
// picks-store's hasSeenGuide reset on every web page load and kept
// re-showing the onboarding guide. Use this instead for that kind of state.
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
