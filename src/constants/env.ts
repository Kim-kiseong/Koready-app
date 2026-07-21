// Must be a literal `process.env.EXPO_PUBLIC_*` member access — Expo's babel
// plugin statically inlines these at build time and can't resolve dynamic
// (bracket/variable) lookups, which would silently resolve to `undefined`.
const value = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!value) {
  throw new Error('Missing required environment variable: EXPO_PUBLIC_API_BASE_URL');
}

export const API_BASE_URL = value;
