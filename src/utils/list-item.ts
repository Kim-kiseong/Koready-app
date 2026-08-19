function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickString(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }

  return null;
}

export function toDisplayText(value: unknown): string {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toDisplayText(item))
      .filter(Boolean)
      .join(' ');
  }

  if (isRecord(value)) {
    return (
      pickString(value, [
        'label',
        'name',
        'title',
        'displayName',
        'labelKo',
        'labelEn',
        'value',
        'code',
        'id',
      ]) ?? ''
    );
  }

  return '';
}

export function toStableListKey(value: unknown, index: number): string {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return `item-${index}`;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => toDisplayText(item) || String(item))
      .join('|');
    return `array-${index}-${joined || 'item'}`;
  }

  if (isRecord(value)) {
    const identity =
      pickString(value, [
        'id',
        'code',
        'key',
        'placeId',
        'profileId',
        'tagId',
        'value',
        'searchResultToken',
        'label',
        'name',
        'title',
        'displayName',
        'labelKo',
        'labelEn',
      ]) ?? null;

    if (identity) {
      return `${identity}-${index}`;
    }
  }

  return `item-${index}`;
}
