import { client } from './client';
import type { GoogleLoginRequest, SocialLoginRequest, TokenEnvelope } from './types';

export async function googleLogin(payload: GoogleLoginRequest) {
  const response = await client.post<TokenEnvelope>('/auth/google', payload);
  return response.data.data;
}

export async function socialLogin(payload: SocialLoginRequest) {
  const response = await client.post<TokenEnvelope>('/auth/social/login', payload);
  return response.data.data;
}

export type LogoutRequest = {
  refreshToken: string;
  deviceId: string;
};

// POST /auth/logout — 204 no body. Callers must clear local tokens and
// user cache once this settles, whether it resolves or rejects — the server
// call is best-effort, the local sign-out is not.
export async function logout(payload: LogoutRequest): Promise<void> {
  await client.post('/auth/logout', payload);
}
