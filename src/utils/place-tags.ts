const TRAVEL_STYLE_TAGS_BY_CODE: Record<string, string> = {
  LOCAL_FOOD: '로컬 맛집',
  LOCAL_FESTIVAL: '지역 축제',
  TRADITIONAL_MARKET: '전통시장',
  CULTURE_EXPERIENCE: '문화체험',
  NATURE: '자연명소',
  EXHIBITION_MUSEUM: '전시/미술관',
  DRAMA_LOCATION: '드라마 촬영지',
};

function normalizeTagKey(tag: string) {
  return tag.replace(/\s+/g, '').trim().toLowerCase();
}

function isFestivalTag(tag: string) {
  const normalized = normalizeTagKey(tag);
  return normalized === '축제' || normalized === '지역축제' || normalized.includes('festival');
}

function getDerivedPlaceTag(
  tags: readonly string[],
  travelStyle?: string | null,
  title?: string | null,
) {
  if (travelStyle && Object.prototype.hasOwnProperty.call(TRAVEL_STYLE_TAGS_BY_CODE, travelStyle)) {
    return TRAVEL_STYLE_TAGS_BY_CODE[travelStyle];
  }

  if (title && /축제|festival/i.test(title)) {
    return TRAVEL_STYLE_TAGS_BY_CODE.LOCAL_FESTIVAL;
  }

  if (tags.some(isFestivalTag)) {
    return TRAVEL_STYLE_TAGS_BY_CODE.LOCAL_FESTIVAL;
  }

  return null;
}

export function normalizePlaceTags(
  tags: readonly string[] = [],
  travelStyle?: string | null,
  title?: string | null,
) {
  const nextTags: string[] = [];
  const seen = new Set<string>();

  const pushTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) {
      return;
    }

    const normalized = normalizeTagKey(trimmed);
    if (seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    nextTags.push(trimmed);
  };

  const derivedTag = getDerivedPlaceTag(tags, travelStyle, title);
  if (derivedTag) {
    pushTag(derivedTag);
  }

  for (const tag of tags) {
    pushTag(tag);
  }

  return nextTags;
}

export function normalizeTaggedPlace<T extends { tags: string[]; travelStyle?: string | null; title?: string | null }>(
  place: T,
) {
  return {
    ...place,
    tags: normalizePlaceTags(place.tags, place.travelStyle, place.title),
  } as T;
}
