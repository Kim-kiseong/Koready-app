import { client } from './client';
import type { NextStep } from './types';

export type PurposeId =
  | 'EXCHANGE_STUDENT'
  | 'LANGUAGE_COURSE'
  | 'SHORT_TRIP'
  | 'DEGREE_PROGRAM'
  | 'INTERN_JOB'
  | 'OTHER'
  | 'WORKING_HOLIDAY';

export const PURPOSE_IDS: readonly PurposeId[] = [
  'EXCHANGE_STUDENT',
  'LANGUAGE_COURSE',
  'SHORT_TRIP',
  'DEGREE_PROGRAM',
  'INTERN_JOB',
  'OTHER',
  'WORKING_HOLIDAY',
];

// Matches the backend's TravelStyle enum exactly (see PUT /users/me/onboarding) —
// values are sent as-is in the onboarding completion request.
export type TravelStyleId =
  | 'LOCAL_FOOD'
  | 'LOCAL_FESTIVAL'
  | 'TRADITIONAL_MARKET'
  | 'CULTURE_EXPERIENCE'
  | 'NATURE'
  | 'EXHIBITION_MUSEUM'
  | 'DRAMA_LOCATION';

export const TRAVEL_STYLE_IDS: readonly TravelStyleId[] = [
  'LOCAL_FOOD',
  'LOCAL_FESTIVAL',
  'TRADITIONAL_MARKET',
  'CULTURE_EXPERIENCE',
  'NATURE',
  'EXHIBITION_MUSEUM',
  'DRAMA_LOCATION',
];

export type LocationSearchResultType = 'ADDRESS' | 'PLACE';

export type LocationSearchItem = {
  // Opaque, 10-minute-TTL token — resubmit as-is with the location-save
  // request. The client never parses or derives anything from it.
  searchResultToken: string;
  provider: 'KAKAO';
  // ADDRESS = 주소 검색 결과, PLACE = 학교·건물·장소 키워드 결과
  resultType: LocationSearchResultType;
  providerPlaceId: string | null;
  name: string;
  roadAddress: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  sido: string;
  sigungu: string;
  dong: string | null;
  serviceRegionCode: ServiceRegionCode;
};

type LocationSearchEnvelope = {
  success: true;
  code: string;
  message: string;
  data: { items: LocationSearchItem[] };
  traceId: string;
};

// GET /locations/search — call after debouncing the search box input
// (300~500ms). The backend merges Kakao address + keyword search, dedupes,
// and normalizes addresses server-side, so a single request is enough. No
// matches is a normal 200 with items: [].
export async function searchLocations(query: string, limit = 10): Promise<LocationSearchItem[]> {
  const q = query.trim();
  if (!q) return [];
  const response = await client.get<LocationSearchEnvelope>('/locations/search', {
    params: { query: q, limit },
  });
  return response.data.data.items;
}

export type OnboardingStep = 'LOCATION' | 'TRAVEL_STYLES' | 'PREFERENCE_PLACES' | 'COMPLETED';

export type OnboardingProgressResponse = {
  completed: boolean;
  // Which screen the app should resume onboarding on.
  currentStep: OnboardingStep;
  currentLocationId: number | null;
  travelStyles: TravelStyleId[];
  candidateSetId: string | null;
  candidateSetVersion: number | null;
  selectedPreferencePlaceIds: number[];
};

type OnboardingProgressEnvelope = {
  success: true;
  code: string;
  message: string;
  data: OnboardingProgressResponse;
  traceId: string;
};

// GET /users/me/onboarding — called when the login response is nextStep=ONBOARDING,
// or when re-entering the onboarding flow (e.g. app restart). Requires a
// principal, so it can't be called before login.
export async function fetchOnboardingProgress(): Promise<OnboardingProgressResponse> {
  const response = await client.get<OnboardingProgressEnvelope>('/users/me/onboarding');
  return response.data.data;
}

export type ServiceRegionCode =
  | 'SEOUL'
  | 'GYEONGGI'
  | 'GANGWON'
  | 'CHUNGCHEONG'
  | 'JEOLLA'
  | 'GYEONGSANG'
  | 'JEJU';

export type LocationSummary = {
  locationId: number;
  displayName: string;
  serviceRegionCode: ServiceRegionCode;
};

export type PreferenceTagSource = 'ONBOARDING_PLACE_SELECTION' | 'MANUAL' | 'BEHAVIOR_INFERRED';

export type PreferenceTag = {
  tagId: number;
  code: string;
  name: string;
  weight: number;
  source: PreferenceTagSource;
};

export type OnboardingProfile = {
  currentLocation: LocationSummary;
  travelStyles: TravelStyleId[];
  selectedPreferencePlaceIds: number[];
  // Preference-tag scoring isn't approved yet — the backend always returns [].
  preferenceTags: PreferenceTag[];
};

export type OnboardingCompletionRequest = {
  currentLocationId: number;
  travelStyles: TravelStyleId[];
  candidateSetId: string;
  candidateSetVersion: number;
  selectedPreferencePlaceIds: number[];
};

export type OnboardingCompletionResponse = {
  completed: true;
  completedAt: string;
  nextStep: NextStep;
  profile: OnboardingProfile;
};

type OnboardingCompletionEnvelope = {
  success: true;
  code: string;
  message: string;
  data: OnboardingCompletionResponse;
  traceId: string;
};

// PUT /users/me/onboarding — validates location ownership, travel-style count,
// and candidate-set/selection consistency in one transaction, then marks
// onboarding complete. Idempotent for a retry of the exact same body (returns
// the original completedAt); a different body after completion returns 409.
export async function completeOnboarding(
  payload: OnboardingCompletionRequest,
): Promise<OnboardingCompletionResponse> {
  const response = await client.put<OnboardingCompletionEnvelope>('/users/me/onboarding', payload);
  return response.data.data;
}

export type CandidateSetStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type OnboardingCandidateItem = {
  placeId: number;
  title: string;
  imageUrl: string;
  serviceRegionCode: ServiceRegionCode;
  serviceRegionName: string;
  travelStyle: TravelStyleId;
  tags: string[];
  curatorMessage: string;
  displayOrder: number;
};

export type OnboardingCandidateSetResponse = {
  candidateSetId: string;
  version: number;
  status: CandidateSetStatus;
  publishedAt: string;
  minSelection: number;
  maxSelection: number;
  // Always exactly 10 — the admin-curated, immutable published set.
  items: OnboardingCandidateItem[];
};

type CandidateSetEnvelope = {
  success: true;
  code: string;
  message: string;
  data: OnboardingCandidateSetResponse;
  traceId: string;
};

// GET /onboarding/place-candidate-sets/current — called once when entering the
// final onboarding (preference-places) screen. Returns the admin-curated,
// immutable published set — not a per-user recommendation. candidateSetId and
// version must be kept and sent back unchanged with the completion request,
// alongside the 1~3 placeIds the user picked.
export async function fetchCurrentCandidateSet(): Promise<OnboardingCandidateSetResponse> {
  const response = await client.get<CandidateSetEnvelope>('/onboarding/place-candidate-sets/current');
  return response.data.data;
}
