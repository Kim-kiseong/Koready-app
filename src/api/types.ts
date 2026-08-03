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

export type GoogleLoginRequest = {
  idToken: string;
  deviceId: string;
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

// Same shape as AuthUser — named separately to match the /users/me schema (UserSummary).
export type UserSummary = AuthUser;

export type SignupStatus =
  | 'TERMS_REQUIRED'
  | 'LANGUAGE_REQUIRED'
  | 'ONBOARDING_REQUIRED'
  | 'ACTIVE';

export type MyUserResponse = {
  user: UserSummary;
  // Server-computed signup progress — do not recompute from terms/language/onboarding client-side.
  signupStatus: SignupStatus;
  nextStep: NextStep;
  // null means the location-registration screen is still needed.
  defaultLocationId: number | null;
  onboardingCompleted: boolean;
  buddyProfileExists: boolean;
  unreadMessageCount: number;
  termsNeedReAgreement: boolean;
};

export type ProfileOptionItem = {
  code: string;
  labelKo: string;
  labelEn: string;
  displayOrder: number;
};

export type ProfileOptionsResponse = {
  countries: ProfileOptionItem[];
  languages: ProfileOptionItem[];
  koreanLevels: ProfileOptionItem[];
  travelStyles: ProfileOptionItem[];
  buddyStyles: ProfileOptionItem[];
  socialPlatforms: ProfileOptionItem[];
};

export type ProfileOptionsEnvelope = {
  success: true;
  code: string;
  message: string;
  data: ProfileOptionsResponse;
  traceId: string;
};

export type ProfileImageUploadUrlRequest = {
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type ProfileImageUploadUrlResponse = {
  imageId?: string;
  uploadUrl?: string;
  requiredHeaders?: Record<string, string>;
  profileImageUrl?: string | null;
};

export type ProfileImageUploadUrlEnvelope = {
  success: true;
  code: string;
  message: string;
  data: ProfileImageUploadUrlResponse;
  traceId: string;
};

export type ProfileImageCompleteRequest = {
  imageId: string;
};

export type ProfileImageCompleteResponse = {
  imageId?: string;
  profileImageUrl?: string | null;
  profile?: {
    profileImageUrl?: string | null;
  } | null;
};

export type ProfileImageCompleteEnvelope = {
  success: true;
  code: string;
  message: string;
  data: ProfileImageCompleteResponse;
  traceId: string;
};

export type BuddyProfileSocialLink = {
  type: string;
  displayValue: string;
  url: string;
};

export type BuddyProfileSocialLinkInput = {
  type: string;
  displayValue: string;
  url?: string | null;
};

export type BuddyProfile = {
  profileId: number;
  profileImageUrl: string | null;
  nickname: string;
  nationality: string;
  availableLanguages: string[];
  koreanLevel: string;
  travelStyles: string[];
  bio: string;
  buddyStyles: string[];
  socialLinks: BuddyProfileSocialLink[];
  profilePublic: boolean;
  snsPublic: boolean;
  allowsMessages: boolean;
  canMessage: boolean;
  blockedByMe: boolean;
  updatedAt: string;
};

export type BuddyProfileUpdateRequest = {
  profileImageUrl: string | null;
  nickname: string;
  nationality: string;
  availableLanguages: string[];
  koreanLevel: string;
  bio: string;
  travelStyles: string[];
  buddyStyles: string[];
  socialLinks: BuddyProfileSocialLinkInput[];
  profilePublic: boolean;
  snsPublic: boolean;
  allowsMessages: boolean;
};

export type BuddyProfileResponse = {
  exists: boolean;
  profile: BuddyProfile | null;
};

export type BuddyProfileEnvelope = {
  success: true;
  code: string;
  message: string;
  data: BuddyProfileResponse;
  traceId: string;
};

export type MyUserEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MyUserResponse;
  traceId: string;
};

export type LanguageRequest = {
  language: LanguageCode;
};

export type LanguageResponse = {
  language: LanguageCode;
  // Server-computed from the current signup state — the client must not guess this.
  nextStep: NextStep;
  updatedAt: string;
};

export type LanguageEnvelope = {
  success: true;
  code: string;
  message: string;
  data: LanguageResponse;
  traceId: string;
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
