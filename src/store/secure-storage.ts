import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { type StateStorage } from 'zustand/middleware';

// expo-secure-store has no web implementation. On web we degrade gracefully:
// nothing persists, so a page reload just requires signing in again.
export const secureStorage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === 'web') return null;
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS === 'web') return;
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === 'web') return;
    await SecureStore.deleteItemAsync(name);
  },
};
