import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

import type { GoogleIdentityProvider } from './auth-types';

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google sign-in was cancelled.');
    this.name = 'GoogleSignInCancelledError';
  }
}

export class NitroGoogleIdentityProvider implements GoogleIdentityProvider {
  constructor(webClientId: string, iosClientId: string) {
    GoogleOneTapSignIn.configure({
      webClientId,
      iosClientId,
      offlineAccess: false,
      autoSelectOnSignIn: false,
    });
  }

  async getIdToken() {
    await GoogleOneTapSignIn.checkPlayServices();
    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isCancelledResponse(response)) {
      throw new GoogleSignInCancelledError();
    }
    if (!isSuccessResponse(response) || !response.data.idToken) {
      throw new Error('Google did not return an ID token.');
    }
    return response.data.idToken;
  }

  signOut() {
    return GoogleOneTapSignIn.signOut();
  }
}
