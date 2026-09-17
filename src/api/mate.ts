import { client } from './client';
import type {
  PlaceMatesEnvelope,
  PlaceMatesResponse,
} from './types';

function clonePlaceMatesResponse(response: PlaceMatesResponse): PlaceMatesResponse {
  return {
    placeId: response.placeId,
    items: response.items.map((item) => ({
      ...item,
      availableLanguages: [...item.availableLanguages],
      travelStyles: [...item.travelStyles],
      socialLinks: item.socialLinks.map((link) => ({ ...link })),
    })),
    nextCursor: response.nextCursor,
    hasMore: response.hasMore,
  };
}

export async function fetchPlaceMates(
  placeId: string,
  cursor?: string | null,
): Promise<PlaceMatesResponse> {
  const response = await client.get<PlaceMatesEnvelope>(`/places/${placeId}/mates`, {
    params: cursor ? { cursor } : undefined,
  });
  return clonePlaceMatesResponse(response.data.data);
}
