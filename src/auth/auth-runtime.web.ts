import { createAuthApi } from './auth-api';
import { AUTH_CONFIG } from './auth-config';
import { AuthSessionManager } from './auth-session-manager';
import type {
  AuthSession,
  AuthSessionStore,
  GoogleIdentityProvider,
} from './auth-types';

class VolatileSessionStore implements AuthSessionStore {
  private session: AuthSession | null = null;
  private readonly deviceId = 'web-google-sign-in-unsupported';

  async getOrCreateDeviceId() {
    return this.deviceId;
  }

  async loadSession() {
    return this.session;
  }

  async saveSession(session: AuthSession) {
    this.session = session;
  }

  async clearSession() {
    this.session = null;
  }
}

class UnsupportedWebGoogleProvider implements GoogleIdentityProvider {
  async getIdToken(): Promise<string> {
    throw new Error('Google sign-in is available in Android and iOS development builds.');
  }

  async signOut() {}
}

export function createAuthSessionManager() {
  return new AuthSessionManager({
    api: createAuthApi({ baseUrl: AUTH_CONFIG.apiBaseUrl }),
    google: new UnsupportedWebGoogleProvider(),
    store: new VolatileSessionStore(),
  });
}
