import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/constants/env';

import { GoogleSignInCancelledError, signInWithApple } from './socialAuth.shared';
import type { SocialAuthResult } from './socialAuth.shared';

export type { SocialAuthResult };
export { GoogleSignInCancelledError, signInWithApple };

let googleConfigured = false;

function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<SocialAuthResult> {
  ensureGoogleConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (isCancelledResponse(response)) {
    throw new GoogleSignInCancelledError();
  }
  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error('Google sign-in did not return an ID token.');
  }
  return { idToken: response.data.idToken };
}

// Best-effort: clears the native Google session on logout. A missing prior
// session (e.g. this install never signed in) is not an error worth surfacing.
export async function signOutOfGoogle(): Promise<void> {
  try {
    ensureGoogleConfigured();
    await GoogleSignin.signOut();
  } catch {
    // ignore
  }
}
