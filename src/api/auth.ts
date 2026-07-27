import { client } from './client';
import type { SocialLoginRequest, TokenEnvelope } from './types';

export async function socialLogin(payload: SocialLoginRequest) {
  const response = await client.post<TokenEnvelope>('/auth/social/login', payload);
  return response.data.data;
}

export type LogoutRequest = {
  refreshToken: string;
  deviceId: string;
};

// POST /auth/logout — 204 no body. Callers must only clear local tokens and
// user cache after this resolves, not before.
export async function logout(payload: LogoutRequest): Promise<void> {
  await client.post('/auth/logout', payload);
}
