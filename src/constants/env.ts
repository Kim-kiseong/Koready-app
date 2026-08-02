// Must be a literal `process.env.EXPO_PUBLIC_*` member access — Expo's babel
// plugin statically inlines these at build time and can't resolve dynamic
// (bracket/variable) lookups, which would silently resolve to `undefined`.
const value = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!value) {
  throw new Error('Missing required environment variable: EXPO_PUBLIC_API_BASE_URL');
}

export const API_BASE_URL = value;

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (!googleWebClientId) {
  throw new Error('Missing required environment variable: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
}

export const GOOGLE_WEB_CLIENT_ID = googleWebClientId;

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

if (!googleIosClientId) {
  throw new Error('Missing required environment variable: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
}

export const GOOGLE_IOS_CLIENT_ID = googleIosClientId;

// Optional: a real staging access/refresh token pair, used by LoginScreen's
// dev-only bypass so authenticated endpoints can be tested against the real
// backend before real social login exists. Leave unset to keep using the
// mock dev session (see constants/dev.ts) — every screen already falls back
// to local mock data whenever it detects that sentinel token.
export const DEV_TEST_ACCESS_TOKEN = process.env.EXPO_PUBLIC_DEV_TEST_ACCESS_TOKEN || null;
export const DEV_TEST_REFRESH_TOKEN = process.env.EXPO_PUBLIC_DEV_TEST_REFRESH_TOKEN || null;
