import { client } from './client';
import type { ServiceRegionCode } from './onboarding';

export type UserLocationResponse = {
  locationId: number;
  displayName: string;
  customLabel: string | null;
  roadAddress: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  serviceRegionCode: ServiceRegionCode;
  default: boolean;
  createdAt: string;
};

type UserLocationListEnvelope = {
  success: true;
  code: string;
  message: string;
  data: { items: UserLocationResponse[] };
  traceId: string;
};

// GET /users/me/locations — called on the my-locations management screen,
// the home location switcher, and route departure-point selection. The
// default=true location comes first, the rest newest-created-first. Deleted
// locations and incomplete pre-V15 rows without address/coordinates are
// excluded server-side.
export async function fetchMyLocations(): Promise<UserLocationResponse[]> {
  const response = await client.get<UserLocationListEnvelope>('/users/me/locations');
  return response.data.data.items;
}

export type CreateLocationRequest = {
  // Opaque, 10-minute-TTL token from GET /locations/search — the server only
  // trusts the signed value inside it and never re-queries Kakao here.
  searchResultToken: string;
  customLabel: string | null;
  setDefault: boolean;
};

type UserLocationEnvelope = {
  success: true;
  code: string;
  message: string;
  data: UserLocationResponse;
  traceId: string;
};

// POST /users/me/locations — called when the user picks one Kakao search
// result and confirms saving it. No address/coordinates are resent — just
// the token, an optional label, and setDefault. The very first active
// location becomes default automatically even if setDefault=false.
export async function createMyLocation(payload: CreateLocationRequest): Promise<UserLocationResponse> {
  const response = await client.post<UserLocationEnvelope>('/users/me/locations', payload);
  return response.data.data;
}

// PUT /users/me/locations/{locationId}/default — called when the user picks
// a different default from their saved-locations list. No body; the server
// swaps users.default_location_id in one transaction. A deleted or
// not-owned locationId returns 404 USER_LOCATION_NOT_FOUND.
export async function setDefaultLocation(locationId: number): Promise<UserLocationResponse> {
  const response = await client.put<UserLocationEnvelope>(`/users/me/locations/${locationId}/default`);
  return response.data.data;
}

// DELETE /users/me/locations/{locationId} — called when the user confirms
// deletion on the locations management screen. Soft delete; 204 with no
// body. Deleting the default location hands default to the most-recently-
// created remaining active location, or clears it entirely if none remain
// (the caller should re-fetch the list to see the new default).
export async function deleteMyLocation(locationId: number): Promise<void> {
  await client.delete(`/users/me/locations/${locationId}`);
}
