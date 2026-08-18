export type SocialAuthResult = {
  idToken?: string;
  authorizationCode?: string;
};

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google sign-in was cancelled by the user.');
    this.name = 'GoogleSignInCancelledError';
  }
}

// TODO: replace with expo-apple-authentication once the app has a real bundle
// identifier and Apple Developer "Sign In with Apple" capability enabled.
export async function signInWithApple(): Promise<SocialAuthResult> {
  throw new Error(
    'Apple sign-in is not implemented yet — needs expo-apple-authentication and Apple Developer setup.',
  );
}
