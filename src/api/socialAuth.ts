export type SocialAuthResult = {
  idToken?: string;
  authorizationCode?: string;
};

// TODO: replace with @react-native-google-signin/google-signin once a Google
// OAuth client ID exists. Must return the ID token from the native sign-in flow.
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  throw new Error(
    'Google sign-in is not implemented yet — needs the Google Sign-In SDK and an OAuth client ID.',
  );
}

// TODO: replace with expo-apple-authentication once the app has a real bundle
// identifier and Apple Developer "Sign In with Apple" capability enabled.
export async function signInWithApple(): Promise<SocialAuthResult> {
  throw new Error(
    'Apple sign-in is not implemented yet — needs expo-apple-authentication and Apple Developer setup.',
  );
}
