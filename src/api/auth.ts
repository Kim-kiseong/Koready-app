import { client } from './client';
import type { SocialLoginRequest, TokenEnvelope } from './types';

export async function socialLogin(payload: SocialLoginRequest) {
  const response = await client.post<TokenEnvelope>('/auth/social/login', payload);
  return response.data.data;
}
