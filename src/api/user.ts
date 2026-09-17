import { client } from './client';
import type {
  AccountWithdrawalEnvelope,
  AccountWithdrawalResponse,
  LanguageCode,
  LanguageEnvelope,
  LanguageResponse,
  MyUserEnvelope,
  MyUserResponse,
} from './types';

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

// GET /users/me/withdrawal — whether a withdrawal is pending and, if so, the
// 7-day grace period's end/purge timestamps.
export async function fetchMyWithdrawal(): Promise<AccountWithdrawalResponse> {
  const response = await client.get<AccountWithdrawalEnvelope>('/users/me/withdrawal');
  return response.data.data;
}

// POST /users/me/withdrawal — requests account deletion. Hides the Buddy
// profile and revokes every refresh token immediately; personal data is
// actually deleted 7 days later unless cancelMyWithdrawal is called first.
// Callers must treat this like a forced logout right after it resolves,
// since the tokens it just revoked include the one the caller is using.
export async function requestMyWithdrawal(): Promise<AccountWithdrawalResponse> {
  const response = await client.post<AccountWithdrawalEnvelope>('/users/me/withdrawal');
  return response.data.data;
}

// DELETE /users/me/withdrawal — cancels a pending withdrawal within the
// 7-day grace period and restores the account's previous visibility.
export async function cancelMyWithdrawal(): Promise<AccountWithdrawalResponse> {
  const response = await client.delete<AccountWithdrawalEnvelope>('/users/me/withdrawal');
  return response.data.data;
}
