import { client } from './client';
import type { LocationSummary, ServiceRegionCode, TravelStyleId } from './onboarding';

export type PicksScope = 'NEARBY' | 'NATIONWIDE';

export type RecommendationEventType =
  | 'CARD_EXPANDED'
  | 'CARD_PREVIOUS'
  | 'CARD_NEXT'
  | 'PLACE_DETAIL_CLICKED'
  | 'PLACE_SAVED'
  | 'PLACE_UNSAVED'
  | 'ROUTE_OPENED';

export type PicksCard = {
  placeId: number;
  title: string;
  locationText: string;
  // Backend contract: null means "no photo uploaded yet" — the frontend is
  // expected to substitute its own default (see api-docs' imageUrl description).
  imageUrl: string | null;
  saved: boolean;
  tags: string[];
  shortDescription: string;
  serviceRegionCode: ServiceRegionCode;
  travelStyle: TravelStyleId;
};

export type RecommendationDeck = {
  deckId: string;
  scope: PicksScope;
  originLocation: LocationSummary | null;
  cards: PicksCard[];
  nextCursor: string | null;
  hasMore: boolean;
  // Server-computed: once fewer than this many unseen cards remain ahead of the
  // current one, the client should fetch the next page. Don't hardcode this value.
  remainingThreshold: number;
};

type RecommendationDeckEnvelope = {
  success: true;
  code: string;
  message: string;
  data: RecommendationDeck;
  traceId: string;
};

export type RecommendationEventResponse = {
  eventId: string;
  deckId: string;
  placeId: number;
  eventType: RecommendationEventType;
  recordedAt: string;
};

type RecommendationEventEnvelope = {
  success: true;
  code: string;
  message: string;
  data: RecommendationEventResponse;
  traceId: string;
};

export const PICKS_PAGE_SIZE = 20;

// POST /recommendation-decks — creates a fresh recommendation deck for the given
// scope. originLocationId is optional server-side; omit it when the user has no default
// location yet (e.g. browsing NATIONWIDE before onboarding sets one).
export async function createRecommendationDeck(
  scope: PicksScope,
  originLocationId: number | null,
  size: number = PICKS_PAGE_SIZE,
): Promise<RecommendationDeck> {
  const response = await client.post<RecommendationDeckEnvelope>('/recommendation-decks', {
    scope,
    size,
    ...(originLocationId != null ? { originLocationId } : {}),
  });
  return response.data.data;
}

// GET /recommendation-decks/{deckId} — fetches the next page of cards for an
// already-created deck. Omit cursor for the first page, pass the deck's own nextCursor
// for subsequent pages.
export async function fetchRecommendationDeckPage(
  deckId: string,
  cursor: string | null,
): Promise<RecommendationDeck> {
  const response = await client.get<RecommendationDeckEnvelope>(
    `/recommendation-decks/${deckId}`,
    { params: cursor ? { cursor } : undefined },
  );
  return response.data.data;
}

// POST /recommendation-decks/{deckId}/events — records a single card interaction
// for personalization/analytics. Treat as fire-and-forget: callers should swallow
// failures so a tracking hiccup never blocks navigation.
export async function recordRecommendationEvent(
  deckId: string,
  placeId: number,
  eventType: RecommendationEventType,
): Promise<RecommendationEventResponse> {
  const response = await client.post<RecommendationEventEnvelope>(
    `/recommendation-decks/${deckId}/events`,
    { placeId, eventType, occurredAt: new Date().toISOString() },
  );
  return response.data.data;
}
