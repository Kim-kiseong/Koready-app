import { createAuthApi } from './auth-api';
import { AUTH_CONFIG } from './auth-config';
import { NitroGoogleIdentityProvider } from './google-identity-provider.native';
import { SecureAuthSessionStore } from './secure-auth-session-store.native';
import { AuthSessionManager } from './auth-session-manager';

export function createAuthSessionManager() {
  return new AuthSessionManager({
    api: createAuthApi({ baseUrl: AUTH_CONFIG.apiBaseUrl }),
    google: new NitroGoogleIdentityProvider(
      AUTH_CONFIG.googleWebClientId,
      AUTH_CONFIG.googleIosClientId,
    ),
    store: new SecureAuthSessionStore(),
  });
}
