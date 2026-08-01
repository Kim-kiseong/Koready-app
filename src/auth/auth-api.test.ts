import { AuthApiError, createAuthApi } from './auth-api';

const tokenResponse = {
  success: true,
  code: 'GOOGLE_LOGIN_OK',
  data: {
    tokenType: 'Bearer',
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessTokenExpiresAt: '2026-08-01T10:00:00Z',
    refreshTokenExpiresAt: '2026-09-01T10:00:00Z',
    user: {
      userId: 1,
      publicId: 'usr_1',
      email: 'user@example.com',
      profileImageUrl: null,
      preferredLanguage: null,
    },
    nextStep: 'TERMS',
  },
  traceId: 'trace-1',
};

describe('auth api', () => {
  it('sends the Google ID token and device ID to the backend', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const api = createAuthApi({
      baseUrl: 'https://api.koready.cloud',
      fetcher,
    });

    await expect(api.loginWithGoogle('google-id-token', 'device-1')).resolves.toEqual(
      tokenResponse.data,
    );
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.koready.cloud/api/v1/auth/google',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          idToken: 'google-id-token',
          deviceId: 'device-1',
        }),
      }),
    );
  });

  it('sends the rotated refresh token request', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const api = createAuthApi({
      baseUrl: 'https://api.koready.cloud/',
      fetcher,
    });

    await api.refresh('old-refresh-token', 'device-1');

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.koready.cloud/api/v1/auth/refresh',
      expect.objectContaining({
        body: JSON.stringify({
          refreshToken: 'old-refresh-token',
          deviceId: 'device-1',
        }),
      }),
    );
  });

  it('maps backend errors without exposing token values', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          code: 'INVALID_GOOGLE_ID_TOKEN',
          message: 'Google token is invalid.',
          traceId: 'trace-error',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    const api = createAuthApi({
      baseUrl: 'https://api.koready.cloud',
      fetcher,
    });

    await expect(api.loginWithGoogle('sensitive-token', 'device-1')).rejects.toEqual(
      expect.objectContaining<AuthApiError>({
        name: 'AuthApiError',
        message: 'Google token is invalid.',
        status: 401,
        code: 'INVALID_GOOGLE_ID_TOKEN',
        traceId: 'trace-error',
      }),
    );
    await expect(api.loginWithGoogle('sensitive-token', 'device-1')).rejects.not.toThrow(
      'sensitive-token',
    );
  });
});
