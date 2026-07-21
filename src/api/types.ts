export type SocialProvider = 'GOOGLE' | 'APPLE';

export type LanguageCode = 'KO' | 'EN';

export type NextStep = 'TERMS' | 'LANGUAGE' | 'ONBOARDING' | 'COMPLETED';

export type SocialLoginRequest = {
  provider: SocialProvider;
  idToken?: string | null;
  authorizationCode?: string | null;
  deviceId: string;
  expoPushToken?: string | null;
};

export type RefreshTokenRequest = {
  refreshToken: string;
  deviceId: string;
};

export type AuthUser = {
  userId: number;
  email: string;
  profileImageUrl: string | null;
  preferredLanguage: LanguageCode;
};

export type TokenResponse = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
  nextStep: NextStep;
};

export type TokenEnvelope = {
  success: true;
  code: string;
  message: string;
  data: TokenResponse;
  traceId: string;
};

export type ApiFieldError = {
  field: string;
  rejectedValue: string | null;
  reason: string;
};

export type ApiErrorEnvelope = {
  success: false;
  code: string;
  message: string;
  errors: ApiFieldError[];
  traceId: string;
};
