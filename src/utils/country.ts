import type { LanguageCode, ProfileOptionItem } from '@/api/types';

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
  gb: 'GB',
  uk: 'GB',
  'united kingdom': 'GB',
  unitedkingdom: 'GB',
  영국: 'GB',
};

const COUNTRY_LABEL_BY_CODE: Record<string, string> = {
  FR: 'France',
  KR: 'Korea',
  JP: 'Japan',
  US: 'United States',
  CN: 'China',
  TW: 'Taiwan',
  GB: 'United Kingdom',
};

const COUNTRY_LABEL_BY_CODE_KO: Record<string, string> = {
  FR: '프랑스',
  KR: '한국',
  JP: '일본',
  US: '미국',
  CN: '중국',
  TW: '대만',
  GB: '영국',
};

export function resolveCountryOption(value: string, options?: ProfileOptionItem[]) {
  const normalizedValue = value.trim();
  const normalizedCode = normalizedValue.toUpperCase();
  return (
    options?.find(
      (option) =>
        option.code.trim().toUpperCase() === normalizedCode ||
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

  const mappedCode = COUNTRY_CODE_BY_VALUE[trimmed.toLowerCase()];
  if (mappedCode) {
    return mappedCode;
  }

  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    return upper;
  }

  return '';
}

export function getCountryDisplayName(
  value: string,
  options?: ProfileOptionItem[],
  language: LanguageCode = 'EN',
) {
  const option = resolveCountryOption(value, options);
  if (option) {
    return language === 'EN' ? option.labelEn : option.labelKo;
  }

  const normalizedCode = normalizeCountryCode(value);
  if (normalizedCode) {
    return language === 'EN'
      ? COUNTRY_LABEL_BY_CODE[normalizedCode] ?? value.trim()
      : COUNTRY_LABEL_BY_CODE_KO[normalizedCode] ?? value.trim();
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

export function formatCountryDisplay(
  value: string,
  options?: ProfileOptionItem[],
  language: LanguageCode = 'EN',
) {
  const displayName = getCountryDisplayName(value, options, language);
  const flag = getCountryFlag(value, options);
  return flag ? `${displayName} ${flag}` : displayName;
}
