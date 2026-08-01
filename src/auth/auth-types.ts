export type NextStep = 'TERMS' | 'LANGUAGE' | 'ONBOARDING' | 'COMPLETED';

export type PreferredLanguage = 'KO' | 'EN' | null;

export type AuthUser = {
  userId: number;
  publicId: string;
  email: string;
  profileImageUrl: string | null;
  preferredLanguage: PreferredLanguage;
};

export type AuthSession = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
  nextStep: NextStep;
};

export interface AuthApi {
  loginWithGoogle(idToken: string, deviceId: string): Promise<AuthSession>;
  refresh(refreshToken: string, deviceId: string): Promise<AuthSession>;
  logout(accessToken: string, refreshToken: string, deviceId: string): Promise<void>;
}

export interface AuthSessionStore {
  getOrCreateDeviceId(): Promise<string>;
  loadSession(): Promise<AuthSession | null>;
  saveSession(session: AuthSession): Promise<void>;
  clearSession(): Promise<void>;
}

export interface GoogleIdentityProvider {
  getIdToken(): Promise<string>;
  signOut(): Promise<void>;
}
