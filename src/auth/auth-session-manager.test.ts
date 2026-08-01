import { AuthSessionManager } from './auth-session-manager';
import { AuthApiError } from './auth-api';
import type {
  AuthApi,
  AuthSession,
  AuthSessionStore,
  GoogleIdentityProvider,
} from './auth-types';

const session: AuthSession = {
  tokenType: 'Bearer',
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  accessTokenExpiresAt: '2026-08-01T10:00:00Z',
  refreshTokenExpiresAt: '2026-09-01T10:00:00Z',
  user: {
    userId: 1,
    publicId: 'usr_1',
    email: 'user@example.com',
    profileImageUrl: null,
    preferredLanguage: null,
  },
  nextStep: 'TERMS',
};

function createDependencies(storedSession: AuthSession | null = null) {
  const api: jest.Mocked<AuthApi> = {
    loginWithGoogle: jest.fn().mockResolvedValue(session),
    refresh: jest.fn().mockResolvedValue({
      ...session,
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  };
  const store: jest.Mocked<AuthSessionStore> = {
    getOrCreateDeviceId: jest.fn().mockResolvedValue('device-1'),
    loadSession: jest.fn().mockResolvedValue(storedSession),
    saveSession: jest.fn().mockResolvedValue(undefined),
    clearSession: jest.fn().mockResolvedValue(undefined),
  };
  const google: jest.Mocked<GoogleIdentityProvider> = {
    getIdToken: jest.fn().mockResolvedValue('google-id-token'),
    signOut: jest.fn().mockResolvedValue(undefined),
  };

  return { api, store, google };
}

describe('AuthSessionManager', () => {
  it('exchanges a Google ID token and stores the KoReady session', async () => {
    const dependencies = createDependencies();
    const manager = new AuthSessionManager(dependencies);

    await expect(manager.signInWithGoogle()).resolves.toEqual(session);

    expect(dependencies.api.loginWithGoogle).toHaveBeenCalledWith(
      'google-id-token',
      'device-1',
    );
    expect(dependencies.store.saveSession).toHaveBeenCalledWith(session);
  });

  it('rotates the refresh token while restoring a saved session', async () => {
    const dependencies = createDependencies(session);
    const manager = new AuthSessionManager(dependencies);

    await expect(manager.restore()).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
      }),
    );
    expect(dependencies.api.refresh).toHaveBeenCalledWith('refresh-1', 'device-1');
    expect(dependencies.store.saveSession).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'refresh-2' }),
    );
  });

  it('clears an invalid saved session', async () => {
    const dependencies = createDependencies(session);
    dependencies.api.refresh.mockRejectedValue(
      new AuthApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid.', null),
    );
    const manager = new AuthSessionManager(dependencies);

    await expect(manager.restore()).resolves.toBeNull();
    expect(dependencies.store.clearSession).toHaveBeenCalled();
  });

  it('keeps the saved session when refresh fails because the network is unavailable', async () => {
    const dependencies = createDependencies(session);
    dependencies.api.refresh.mockRejectedValue(new TypeError('Network request failed'));
    const manager = new AuthSessionManager(dependencies);

    await expect(manager.restore()).rejects.toThrow('Network request failed');
    expect(dependencies.store.clearSession).not.toHaveBeenCalled();
  });

  it('revokes the server session before clearing local credentials', async () => {
    const dependencies = createDependencies(session);
    const order: string[] = [];
    dependencies.api.logout.mockImplementation(async () => {
      order.push('server');
    });
    dependencies.store.clearSession.mockImplementation(async () => {
      order.push('local');
    });
    const manager = new AuthSessionManager(dependencies);

    await manager.signOut();

    expect(dependencies.api.logout).toHaveBeenCalledWith(
      'access-1',
      'refresh-1',
      'device-1',
    );
    expect(dependencies.google.signOut).toHaveBeenCalled();
    expect(order).toEqual(['server', 'local']);
  });

  it('still clears local credentials when server logout fails', async () => {
    const dependencies = createDependencies(session);
    dependencies.api.logout.mockRejectedValue(new Error('network unavailable'));
    const manager = new AuthSessionManager(dependencies);

    await expect(manager.signOut()).rejects.toThrow('network unavailable');
    expect(dependencies.store.clearSession).toHaveBeenCalled();
    expect(dependencies.google.signOut).toHaveBeenCalled();
  });
});
