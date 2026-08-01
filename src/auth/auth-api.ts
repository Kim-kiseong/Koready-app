import type { AuthApi, AuthSession } from './auth-types';

type Fetcher = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<Response>;

type ApiEnvelope<T> = {
  success: boolean;
  code: string;
  message?: string;
  data: T;
  traceId?: string | null;
};

type ApiErrorEnvelope = {
  code?: string;
  message?: string;
  traceId?: string | null;
};

export class AuthApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly traceId: string | null,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }
  return response.json();
}

function asErrorEnvelope(value: unknown): ApiErrorEnvelope {
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value as ApiErrorEnvelope;
}

function asAuthSessionEnvelope(value: unknown): ApiEnvelope<AuthSession> {
  if (!value || typeof value !== 'object') {
    throw new AuthApiError(502, 'INVALID_AUTH_RESPONSE', 'Invalid auth response.', null);
  }
  const envelope = value as Partial<ApiEnvelope<AuthSession>>;
  if (!envelope.success || !envelope.data?.accessToken || !envelope.data.refreshToken) {
    throw new AuthApiError(
      502,
      'INVALID_AUTH_RESPONSE',
      'Invalid auth response.',
      envelope.traceId ?? null,
    );
  }
  return envelope as ApiEnvelope<AuthSession>;
}

export function createAuthApi({
  baseUrl,
  fetcher = fetch,
}: {
  baseUrl: string;
  fetcher?: Fetcher;
}): AuthApi {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  async function post<T>(
    path: string,
    body: Record<string, string>,
    accessToken?: string,
  ): Promise<T | null> {
    let response: Response;
    try {
      response = await fetcher(`${normalizedBaseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new AuthApiError(
        0,
        'AUTH_NETWORK_ERROR',
        'Unable to reach the authentication server.',
        null,
      );
    }

    const payload = await readJson(response);
    if (!response.ok) {
      const error = asErrorEnvelope(payload);
      throw new AuthApiError(
        response.status,
        error.code ?? 'AUTH_REQUEST_FAILED',
        error.message ?? 'Authentication request failed.',
        error.traceId ?? null,
      );
    }

    return payload as T | null;
  }

  return {
    async loginWithGoogle(idToken, deviceId) {
      const response = await post<ApiEnvelope<AuthSession>>('/api/v1/auth/google', {
        idToken,
        deviceId,
      });
      return asAuthSessionEnvelope(response).data;
    },

    async refresh(refreshToken, deviceId) {
      const response = await post<ApiEnvelope<AuthSession>>('/api/v1/auth/refresh', {
        refreshToken,
        deviceId,
      });
      return asAuthSessionEnvelope(response).data;
    },

    async logout(accessToken, refreshToken, deviceId) {
      await post('/api/v1/auth/logout', { refreshToken, deviceId }, accessToken);
    },
  };
}
