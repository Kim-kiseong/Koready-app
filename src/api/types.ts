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
  publicId: string;
  email: string;
  profileImageUrl: string | null;
  preferredLanguage: LanguageCode;
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
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
};

export type ProfileImageUploadUrlResponse = {
  imageId: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string> | string | null;
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
  imageId: string;
  profileImageUrl: string;
  size: number;
  completedAt: string;
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
  url: string | null;
};

export type PlaceMateSocialLink = BuddyProfileSocialLink;

export type BuddyProfileSocialLinkRequest = {
  type: string;
  value: string;
};

export type PlaceMate = {
  profileId: number;
  profileImageUrl: string | null;
  nickname: string;
  nationalityCode: string;
  availableLanguages: string[];
  koreanLevel: string;
  travelStyles: string[];
  bio: string;
  socialLinks: PlaceMateSocialLink[];
  profilePublic: boolean;
  snsPublic: boolean;
  allowsMessages: boolean;
  canMessage: boolean;
  blockedByMe: boolean;
  updatedAt: string;
};

export type PlaceMatesResponse = {
  placeId: string;
  items: PlaceMate[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type PlaceMatesEnvelope = {
  success: true;
  code: string;
  message: string;
  data: PlaceMatesResponse;
  traceId: string;
};

export type SavedPlaceSource = 'HOME_MONTHLY' | 'RECOMMENDATION_CARD' | 'PLACE_DETAIL' | 'MAP';

export type SavedPlaceFestivalOccurrence = {
  occurrenceId: number;
  eventYear: number;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED';
  dateRangeText: string;
};

export type SavedPlaceItem = {
  placeId: number;
  title: string;
  serviceRegionCode: string;
  serviceRegionName: string;
  addressSummary: string;
  // Backend contract: null means "no photo uploaded yet" — the frontend is
  // expected to substitute its own default (see api-docs' imageUrl description).
  imageUrl: string | null;
  festivalOccurrence: SavedPlaceFestivalOccurrence | null;
  travelStyle: string;
  tags: string[];
  scheduleText?: string | null;
  shortDescription: string | null;
  overview?: string | null;
  saved: boolean;
  savedAt: string;
  source?: SavedPlaceSource | string;
};

export type SavedPlacesResponse = {
  items: SavedPlaceItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type PlaceSortOrder = 'RECOMMENDED' | 'DEADLINE';

export type PlaceListItem = {
  placeId: number;
  title: string;
  serviceRegionCode: string;
  serviceRegionName: string;
  addressSummary: string;
  imageUrl: string;
  festivalOccurrence: SavedPlaceFestivalOccurrence | null;
  operatingHours?: string | null;
  travelStyle: string;
  tags: string[];
  shortDescription: string | null;
  overview: string | null;
  saved: boolean;
  savedAt?: string | null;
};

export type PlaceListResponse = {
  items: PlaceListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number | null;
};

export type SavedPlaceToggleResponse = {
  placeId: number;
  saved: boolean;
  savedAt: string;
};

export type MessageThreadCreateRequest = {
  receiverProfileId: number;
  placeId: number;
  content: string;
};

export type MessageThreadRequestContext = {
  placeRouteId?: string;
  placeTitle?: string;
  placeAddress?: string | null;
  placeImageUrl?: string | null;
};

export type MessageThreadPlace = {
  placeId: number;
  title: string;
  // Backend contract: null means "no photo uploaded yet" — the frontend is
  // expected to substitute its own default (see api-docs' imageUrl description).
  imageUrl: string | null;
  routeId?: string;
  address?: string | null;
};

export type MessageThreadProfile = {
  profileId: number;
  nickname: string;
  profileImageUrl: string | null;
  nationalityCode?: string | null;
  nationality?: string | null;
};

export type MessageThreadListProfile = MessageThreadProfile & {
  nationalityCode?: string | null;
  nationality?: string | null;
};

export type MessageThreadListItem = {
  threadId: string;
  place: MessageThreadPlace;
  otherProfile: MessageThreadListProfile;
  preview: string;
  lastSentAt: string;
  unreadCount: number;
  blocked: boolean;
  canReply: boolean;
};

export type MessageThreadMessage = {
  messageId: number;
  threadId: string;
  senderProfileId: number;
  receiverProfileId: number;
  placeId: number;
  content: string;
  sentAt: string;
  read: boolean;
  readAt: string | null;
};

export type MessageThreadResponse = {
  threadId: string;
  place: MessageThreadPlace;
  otherProfile: MessageThreadProfile;
  messages: MessageThreadMessage[];
  nextCursor: string | null;
  hasMore: boolean;
  canReply: boolean;
};

export type MessageThreadEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MessageThreadResponse;
  traceId: string;
};

export type MessageThreadMessageEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MessageThreadMessage;
  traceId: string;
};

export type MessageThreadReplyRequest = {
  content: string;
};

export type MessageThreadReadResponse = {
  threadId: string;
  readAt: string;
  threadUnreadCount: number;
  unreadTotal: number;
};

export type MessageThreadReadEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MessageThreadReadResponse;
  traceId: string;
};

export type MessageThreadsResponse = {
  items: MessageThreadListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadTotal: number;
};

export type MessageThreadsEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MessageThreadsResponse;
  traceId: string;
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
  nationalityCode?: string;
  availableLanguages: string[];
  koreanLevel: string;
  travelStyles: string[];
  bio: string;
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
  nationalityCode: string;
  availableLanguages: string[];
  koreanLevel: string;
  bio: string;
  travelStyles: string[];
  socialLinks: BuddyProfileSocialLinkRequest[];
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

export type BuddyProfileDetail = Omit<BuddyProfile, 'nationality'> & {
  nationality?: string;
  nationalityCode?: string;
};

export type BuddyProfileDetailEnvelope = {
  success: true;
  code: string;
  message: string;
  data: BuddyProfileDetail;
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

export type SignupStatus = 'TERMS_REQUIRED' | 'LANGUAGE_REQUIRED' | 'ONBOARDING_REQUIRED' | 'ACTIVE';

export type MyUserResponse = {
  user: AuthUser;
  // Server-computed from the current terms/language/onboarding state — the
  // client must not recompute this itself.
  signupStatus: SignupStatus;
  nextStep: NextStep;
  // null means the user has no default location yet (needs the location screen).
  defaultLocationId: number | null;
  onboardingCompleted: boolean;
  buddyProfileExists: boolean;
  unreadMessageCount: number;
  termsNeedReAgreement: boolean;
};

export type MyUserEnvelope = {
  success: true;
  code: string;
  message: string;
  data: MyUserResponse;
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
