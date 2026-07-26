import { client } from './client';
import type { MyUserEnvelope, MyUserResponse } from './types';

// GET /users/me — called after app restart to restore the session, or when
// opening the My screen. Response is the source of truth for signupStatus,
// preferredLanguage, and defaultLocationId app-wide.
export async function fetchMyUser(): Promise<MyUserResponse> {
  const response = await client.get<MyUserEnvelope>('/users/me');
  return response.data.data;
}
