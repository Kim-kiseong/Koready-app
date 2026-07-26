// Sentinel access token used by LoginScreen's dev-only onboarding bypass.
// Screens that call real (non-mock) endpoints check against this so they
// don't send a fake token to the real backend — doing so triggers a 401 →
// refresh-attempt → refresh-failure → forced logout cascade in client.ts's
// response interceptor, since the fake refresh token can't be honored either.
export const DEV_MOCK_ACCESS_TOKEN = 'mock-token';
