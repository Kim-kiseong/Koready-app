import { client } from './client';
import type {
  LanguageCode,
  LanguageEnvelope,
  LanguageResponse,
  MyUserEnvelope,
  MyUserResponse,
} from './types';

// GET /users/me — called after app restart to restore the session, or when
// opening the My screen. Response is the source of truth for signupStatus,
// preferredLanguage, and defaultLocationId app-wide.
export async function fetchMyUser(): Promise<MyUserResponse> {
  const response = await client.get<MyUserEnvelope>('/users/me');
  return response.data.data;
}

// PATCH /users/me/language — called when the user picks KO/EN on the
// onboarding language screen or the home language toggle. The server
// computes nextStep from the current signup state; the client must not
// infer it itself.
export async function updateMyLanguage(language: LanguageCode): Promise<LanguageResponse> {
  const response = await client.patch<LanguageEnvelope>('/users/me/language', { language });
  return response.data.data;
}
