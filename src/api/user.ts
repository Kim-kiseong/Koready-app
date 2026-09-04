import { client } from './client';
import type { LanguageCode, LanguageEnvelope, LanguageResponse, MyUserEnvelope, MyUserResponse } from './types';

// PATCH /users/me/language — called when the user picks KO/EN on the
// onboarding language screen or the home language toggle. The server
// computes nextStep from the current signup state; the client must not
// infer it itself.
export async function updateMyLanguage(language: LanguageCode): Promise<LanguageResponse> {
  const response = await client.patch<LanguageEnvelope>('/users/me/language', { language });
  return response.data.data;
}

// GET /users/me — called on cold app restart to recover the user's session
// and on opening the My screen. signupStatus/nextStep/defaultLocationId are
// the server-computed source of truth; the client must not recompute them.
export async function fetchMyUser(): Promise<MyUserResponse> {
  const response = await client.get<MyUserEnvelope>('/users/me');
  return response.data.data;
}
