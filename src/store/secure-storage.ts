import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';

// expo-secure-store has no web implementation. On native platforms this keeps
// using SecureStore, while web falls back to localStorage so a browser refresh
// can rehydrate zustand's persisted session.
export const secureStorage: StateStorage = {
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
        // Private-mode Safari and storage quota limits can throw. In that case
        // the session simply won't persist across refreshes.
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
