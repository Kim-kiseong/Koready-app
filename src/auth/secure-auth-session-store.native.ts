import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import type { AuthSession, AuthSessionStore } from './auth-types';

const DEVICE_ID_KEY = 'koready.auth.device-id.v1';
const SESSION_KEY = 'koready.auth.session.v1';
const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const session = value as Partial<AuthSession>;
  return Boolean(
    session.accessToken &&
      session.refreshToken &&
      session.accessTokenExpiresAt &&
      session.refreshTokenExpiresAt &&
      session.user?.publicId,
  );
}

export class SecureAuthSessionStore implements AuthSessionStore {
  async getOrCreateDeviceId() {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) {
      return existing;
    }
    const deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, STORE_OPTIONS);
    return deviceId;
  }

  async loadSession() {
    const serialized = await SecureStore.getItemAsync(SESSION_KEY);
    if (!serialized) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(serialized);
      if (isAuthSession(parsed)) {
        return parsed;
      }
    } catch {
      // Invalid local state is removed below.
    }
    await this.clearSession();
    return null;
  }

  async saveSession(session: AuthSession) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), STORE_OPTIONS);
  }

  async clearSession() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}
