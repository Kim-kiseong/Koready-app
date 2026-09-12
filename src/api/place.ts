import { Asset } from "expo-asset";
import type { ImageSource } from "expo-image";

import { formatPlaceRegionName } from "@/utils/place-i18n";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import type { ServiceRegionCode, TravelStyleId } from "./onboarding";
import type {
  PlaceListItem,
  PlaceListResponse,
  PlaceSortOrder,
  SavedPlaceFestivalOccurrence,
} from "./types";

import { client } from "./client";

export type PlaceDetailTab = "DESCRIPTION" | "ROUTE" | "MATES";

export type PlaceDescriptionSourceType =
  | "KTO_ORIGINAL"
  | "AI_GENERATED"
  | "MANUAL_EDITED";

export type PlaceImage = {
  source: ImageSource;
  order: number;
  altText: string;
};

export type PlaceDescription = {
  topic?: string | null;
  oneLineDescription?: string | null;
  shortIntroduction?: string | null;
  enjoyPoints?: string[] | null;
  contentVersion?: string | null;
  impactTitle?: string | null;
  impactSubtitle?: string | null;
  introParagraphs?: string[] | null;
  sourceType?: PlaceDescriptionSourceType | string | null;
};

const PLACE_DESCRIPTION_FIELDS = [
  "topic",
  "oneLineDescription",
  "shortIntroduction",
  "enjoyPoints",
  "contentVersion",
] as const;

type PlaceDescriptionField = (typeof PLACE_DESCRIPTION_FIELDS)[number];

function getNormalizedText(...values: (string | null | undefined)[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getNormalizedStringArray(...values: (string[] | null | undefined)[]) {
  for (const value of values) {
    if (
      Array.isArray(value) &&
      value.some((item) => typeof item === "string" && item.trim().length > 0)
    ) {
      return value.map((item) => item.trim()).filter((item) => item.length > 0);
    }
  }

  return [];
}

export type NormalizedPlaceDescription = {
  topic: string | null;
  oneLineDescription: string | null;
  shortIntroduction: string | null;
  introParagraphs: string[];
  enjoyPoints: string[];
  contentVersion: string | null;
};

export function normalizePlaceDescription(
  description: PlaceDescription | null | undefined,
): NormalizedPlaceDescription {
  const introParagraphs = getNormalizedStringArray(
    description?.introParagraphs,
  );
  const shortIntroduction = getNormalizedText(
    description?.shortIntroduction,
    introParagraphs[0],
  );

  return {
    topic: getNormalizedText(description?.topic, description?.impactTitle),
    oneLineDescription: getNormalizedText(
      description?.oneLineDescription,
      description?.impactSubtitle,
    ),
    shortIntroduction,
    introParagraphs:
      introParagraphs.length > 0
        ? introParagraphs
        : shortIntroduction
          ? [shortIntroduction]
          : [],
    enjoyPoints: getNormalizedStringArray(description?.enjoyPoints),
    contentVersion: getNormalizedText(
      description?.contentVersion,
      description?.sourceType,
    ),
  };
}

export function getMissingPlaceDescriptionFields(
  description: PlaceDescription | null | undefined,
): PlaceDescriptionField[] {
  if (!description) {
    return [...PLACE_DESCRIPTION_FIELDS];
  }

  const normalized = normalizePlaceDescription(description);
  const missingFields: PlaceDescriptionField[] = [];

  if (!normalized.topic) {
    missingFields.push("topic");
  }

  if (!normalized.oneLineDescription) {
    missingFields.push("oneLineDescription");
  }

  if (!normalized.shortIntroduction) {
    missingFields.push("shortIntroduction");
  }

  if (normalized.enjoyPoints.length === 0) {
    missingFields.push("enjoyPoints");
  }

  if (!normalized.contentVersion) {
    missingFields.push("contentVersion");
  }

  return missingFields;
}

export type RelatedPlace = {
  id: string;
  title: string;
  imageUrl: string | null;
  shortDescription: string;
};

export type PlaceDetail = {
  id: string;
  routeId?: string;
  numericId?: number;
  serviceRegionCode?: ServiceRegionCode;
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
  images: PlaceImage[];
  description: PlaceDescription | null;
  relatedPlaces: RelatedPlace[];
  availableTabs?: PlaceDetailTab[];
  travelStyle?: string | null;
};

const PLACE_DETAIL_IN_FLIGHT_REQUESTS = new Map<string, Promise<PlaceDetail>>();

function isWithinRequestedDateRange(
  place: { festivalOccurrence: SavedPlaceFestivalOccurrence | null },
  dateFrom?: string | null,
  dateTo?: string | null,
) {
  if (!dateFrom && !dateTo) {
    return true;
  }

  const occurrence = place.festivalOccurrence;
  if (!occurrence) {
    return false;
  }

  if (dateFrom && occurrence.endDate < dateFrom) {
    return false;
  }

  if (dateTo && occurrence.startDate > dateTo) {
    return false;
  }

  return true;
}

const DEFAULT_PLACE_CARD_IMAGE_URI = Asset.fromModule(
  require("@/assets/images/destinations/default.jpg"),
).uri;

type PlaceListApiCard = {
  placeId: number;
  title: string;
  serviceRegionCode: ServiceRegionCode;
  serviceRegionName: string;
  addressSummary: string;
  imageUrl: string | null;
  festivalOccurrence: SavedPlaceFestivalOccurrence | null;
  operatingHours?: string | null;
  travelStyle: string | null;
  tags: string[];
  shortDescription: string | null;
  saved: boolean;
};

type PlaceListApiResponse = {
  items: PlaceListApiCard[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number | null;
};

type PlaceListEnvelope = {
  success: true;
  code: string;
  message: string;
  data: PlaceListApiResponse;
  traceId: string;
};

function mapPlaceListCardResponse(item: PlaceListApiCard): PlaceListItem {
  return {
    placeId: item.placeId,
    title: item.title,
    serviceRegionCode: item.serviceRegionCode,
    serviceRegionName: formatPlaceRegionName(
      item.serviceRegionCode,
      useLanguageStore.getState().language,
    ),
    addressSummary: item.addressSummary,
    imageUrl: item.imageUrl ?? DEFAULT_PLACE_CARD_IMAGE_URI,
    festivalOccurrence: item.festivalOccurrence,
    operatingHours: item.operatingHours ?? null,
    travelStyle: item.travelStyle ?? "",
    tags: [...item.tags],
    shortDescription: item.shortDescription,
    overview: null,
    saved: item.saved,
    savedAt: null,
  };
}

function mapPlaceListResponse(
  response: PlaceListApiResponse,
): PlaceListResponse {
  return {
    items: response.items.map(mapPlaceListCardResponse),
    nextCursor: response.nextCursor,
    hasMore: response.hasMore,
    totalCount: response.totalCount ?? null,
  };
}

export type FetchPlacesParams = {
  serviceRegionCode: ServiceRegionCode;
  travelStyles?: TravelStyleId[];
  sort?: PlaceSortOrder;
  cursor?: string | null;
  size?: number;
  dateFrom?: string;
  dateTo?: string;
};

const DEFAULT_PLACE_LIST_SIZE = 20;

export async function fetchPlaces(
  params: FetchPlacesParams,
): Promise<PlaceListResponse> {
  try {
    const query = new URLSearchParams();
    query.set("serviceRegionCode", params.serviceRegionCode);
    if (params.travelStyles && params.travelStyles.length > 0) {
      // OpenAPI defines travelStyles as a form array with explode=false, so the
      // backend expects a comma-separated list like `NATURE,LOCAL_FESTIVAL`.
      query.set("travelStyles", params.travelStyles.join(","));
    }
    if (params.sort) {
      query.set("sort", params.sort);
    }
    if (params.cursor) {
      query.set("cursor", params.cursor);
    }
    if (params.size != null) {
      query.set("size", String(params.size));
    }

    const response = await client.get<PlaceListEnvelope>(
      `/places?${query.toString()}`,
    );
    const result = mapPlaceListResponse(response.data.data);

    // GET /places has no dateFrom/dateTo param — the backend contract only
    // supports serviceRegionCode/travelStyles/sort/cursor/size — so the date
    // filter picked in PlaceFilterBottomSheet has to be applied here instead,
    // otherwise it's silently ignored against the real API.
    if (!params.dateFrom && !params.dateTo) {
      return result;
    }

    return {
      ...result,
      items: result.items.filter((item) =>
        isWithinRequestedDateRange(item, params.dateFrom, params.dateTo),
      ),
    };
  } catch (error) {
    throw error;
  }
}

// GET /places/search — called from the home search bar. Unlike /places (map
// region browse), this isn't scoped to a service region or travel style —
// query is the only required filter, matched server-side against title and
// region name. Reuses the same PlaceListEnvelope/mapPlaceListResponse shape
// as fetchPlaces since both endpoints return PlaceCard items.
export async function searchPlaces(
  query: string,
  cursor?: string | null,
  size = DEFAULT_PLACE_LIST_SIZE,
  signal?: AbortSignal,
): Promise<PlaceListResponse> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  try {
    const params: Record<string, string> = {
      query: trimmedQuery,
      size: String(size),
    };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await client.get<PlaceListEnvelope>("/places/search", {
      params,
      signal,
    });
    return mapPlaceListResponse(response.data.data);
  } catch (error) {
    throw error;
  }
}

type PlaceDetailApiImage = {
  imageUrl: string;
  order: number;
  altText: string;
};

type PlaceDetailApiRelatedPlace = {
  placeId: number;
  title: string;
  imageUrl: string | null;
  shortDescription: string;
};

type PlaceDetailApiResponse = {
  placeId: number;
  serviceRegionCode: ServiceRegionCode;
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
  images: PlaceDetailApiImage[];
  description: PlaceDescription | null;
  // Optional/nullable defensively: if the backend omits this field, treating it
  // as required throws inside mapPlaceDetailResponse, which isn't an AxiosError
  // and so isn't caught by fetchPlaceDetail's fallback — the screen just hangs.
  relatedPlaces?: PlaceDetailApiRelatedPlace[] | null;
  availableTabs?: PlaceDetailTab[];
};

type PlaceDetailEnvelope = {
  success: true;
  code: string;
  message: string;
  data: PlaceDetailApiResponse;
  traceId: string;
};

function mapPlaceDetailResponse(response: PlaceDetailApiResponse): PlaceDetail {
  const relatedPlaces = (response.relatedPlaces ?? []).map((related) => ({
    id: String(related.placeId),
    title: related.title,
    imageUrl: related.imageUrl,
    shortDescription: related.shortDescription,
  }));

  return {
    id: String(response.placeId),
    routeId: String(response.placeId),
    numericId: response.placeId,
    serviceRegionCode: response.serviceRegionCode,
    title: response.title,
    address: response.address,
    tags: response.tags,
    isSaved: response.isSaved,
    images: [...response.images]
      .sort((a, b) => a.order - b.order)
      .map((image) => ({
        source: { uri: image.imageUrl },
        order: image.order,
        altText: image.altText,
      })),
    description: response.description,
    relatedPlaces,
    availableTabs: response.availableTabs ?? ["DESCRIPTION", "ROUTE", "MATES"],
  };
}

// GET /places/{placeId} — real place ids (from GET /home, GET /monthly-recommendations,
// GET /places) are numeric.
export async function fetchPlaceDetail(placeId: string): Promise<PlaceDetail> {
  const numericId = Number(placeId);
  if (Number.isFinite(numericId) && numericId > 0) {
    const viewerPublicId = useAuthStore.getState().user?.publicId ?? "guest";
    const language = useLanguageStore.getState().language;
    const cacheKey = `${viewerPublicId}:${language}:${numericId}`;
    const inflightRequest = PLACE_DETAIL_IN_FLIGHT_REQUESTS.get(cacheKey);

    if (inflightRequest) {
      return inflightRequest;
    }

    const request = (async () => {
      try {
        const response = await client.get<PlaceDetailEnvelope>(
          `/places/${numericId}`,
        );
        return mapPlaceDetailResponse(response.data.data);
      } catch (error) {
        throw error;
      } finally {
        PLACE_DETAIL_IN_FLIGHT_REQUESTS.delete(cacheKey);
      }
    })();

    PLACE_DETAIL_IN_FLIGHT_REQUESTS.set(cacheKey, request);
    return request;
  }

  throw new Error(`Invalid place id: ${placeId}`);
}
