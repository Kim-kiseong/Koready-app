import { client } from './client';
import type { LanguageCode, LanguageEnvelope, LanguageResponse } from './types';

// PATCH /users/me/language — called when the user picks KO/EN on the
// onboarding language screen or the home language toggle. The server
// computes nextStep from the current signup state; the client must not
// infer it itself.
export async function updateMyLanguage(language: LanguageCode): Promise<LanguageResponse> {
  const response = await client.patch<LanguageEnvelope>('/users/me/language', { language });
  return response.data.data;
}
