import type { ProfileOptionItem } from '@/api/types';

const COUNTRY_CODE_BY_VALUE: Record<string, string> = {
  fr: 'FR',
  france: 'FR',
  프랑스: 'FR',
  kr: 'KR',
  korea: 'KR',
  'south korea': 'KR',
  'republic of korea': 'KR',
  한국: 'KR',
  대한민국: 'KR',
  jp: 'JP',
  japan: 'JP',
  일본: 'JP',
  us: 'US',
  usa: 'US',
  'united states': 'US',
  unitedstates: 'US',
  미국: 'US',
  cn: 'CN',
  china: 'CN',
  중국: 'CN',
  tw: 'TW',
  taiwan: 'TW',
  대만: 'TW',
};

export function resolveCountryOption(value: string, options?: ProfileOptionItem[]) {
  const normalizedValue = value.trim();
  return (
    options?.find(
      (option) =>
        option.code === normalizedValue ||
        option.labelKo === normalizedValue ||
        option.labelEn === normalizedValue,
    ) ?? null
  );
}

export function normalizeCountryCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    return upper;
  }

  return COUNTRY_CODE_BY_VALUE[trimmed.toLowerCase()] ?? '';
}

export function getCountryDisplayName(value: string, options?: ProfileOptionItem[]) {
  const option = resolveCountryOption(value, options);
  if (option) {
    return option.labelEn;
  }

  return value.trim();
}

export function getCountryFlag(value: string, options?: ProfileOptionItem[]) {
  const code =
    normalizeCountryCode(value) || resolveCountryOption(value, options)?.code || '';
  if (!/^[A-Z]{2}$/.test(code)) {
    return '';
  }

  return String.fromCodePoint(...code.split('').map((char) => 127397 + char.charCodeAt(0)));
}

export function formatCountryDisplay(value: string, options?: ProfileOptionItem[]) {
  const displayName = getCountryDisplayName(value, options);
  const flag = getCountryFlag(value, options);
  return flag ? `${displayName} ${flag}` : displayName;
}
