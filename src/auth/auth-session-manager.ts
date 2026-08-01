import { AuthApiError } from './auth-api';
import type {
  AuthApi,
  AuthSession,
  AuthSessionStore,
  GoogleIdentityProvider,
} from './auth-types';

type Dependencies = {
  api: AuthApi;
  store: AuthSessionStore;
  google: GoogleIdentityProvider;
};

export class AuthSessionManager {
  private currentSession: AuthSession | null = null;
  private signInPromise: Promise<AuthSession> | null = null;

  constructor(private readonly dependencies: Dependencies) {}

  getSession() {
    return this.currentSession;
  }

  signInWithGoogle(): Promise<AuthSession> {
    if (this.signInPromise) {
      return this.signInPromise;
    }

    this.signInPromise = this.performGoogleSignIn().finally(() => {
      this.signInPromise = null;
    });
    return this.signInPromise;
  }

  private async performGoogleSignIn() {
    const [idToken, deviceId] = await Promise.all([
      this.dependencies.google.getIdToken(),
      this.dependencies.store.getOrCreateDeviceId(),
    ]);
    const session = await this.dependencies.api.loginWithGoogle(idToken, deviceId);
    await this.dependencies.store.saveSession(session);
    this.currentSession = session;
    return session;
  }

  async restore(): Promise<AuthSession | null> {
    const saved = await this.dependencies.store.loadSession();
    if (!saved) {
      this.currentSession = null;
      return null;
    }

    const deviceId = await this.dependencies.store.getOrCreateDeviceId();
    try {
      const rotated = await this.dependencies.api.refresh(saved.refreshToken, deviceId);
      await this.dependencies.store.saveSession(rotated);
      this.currentSession = rotated;
      return rotated;
    } catch (error) {
      if (error instanceof AuthApiError && (error.status === 401 || error.status === 403)) {
        await this.dependencies.store.clearSession();
        this.currentSession = null;
        return null;
      }
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const session = this.currentSession ?? (await this.dependencies.store.loadSession());
    let serverError: unknown;

    try {
      if (session) {
        const deviceId = await this.dependencies.store.getOrCreateDeviceId();
        await this.dependencies.api.logout(
          session.accessToken,
          session.refreshToken,
          deviceId,
        );
      }
    } catch (error) {
      serverError = error;
    } finally {
      await Promise.all([
        this.dependencies.store.clearSession(),
        this.dependencies.google.signOut(),
      ]);
      this.currentSession = null;
    }

    if (serverError) {
      throw serverError;
    }
  }
}
