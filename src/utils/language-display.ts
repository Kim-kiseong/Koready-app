const LANGUAGE_CODE_ALIASES: Record<string, string> = {
  EN: 'EN',
  ENGLISH: 'EN',
  영어: 'EN',
  KO: 'KO',
  KOREAN: 'KO',
  한국어: 'KO',
  JP: 'JA',
  JA: 'JA',
  JPN: 'JA',
  JAPANESE: 'JA',
  일본어: 'JA',
  CN: 'ZH',
  ZH: 'ZH',
  CHN: 'ZH',
  'ZH CN': 'ZH',
  'ZH HANS': 'ZH',
  'ZH HANT': 'ZH',
  CHINESE: 'ZH',
  중국어: 'ZH',
  FR: 'FR',
  FRENCH: 'FR',
  프랑스어: 'FR',
  TH: 'TH',
  THAI: 'TH',
  태국어: 'TH',
  VI: 'VI',
  VIETNAMESE: 'VI',
  베트남어: 'VI',
  MN: 'MN',
  MONGOLIAN: 'MN',
  몽골어: 'MN',
  RU: 'RU',
  RUSSIAN: 'RU',
  러시아어: 'RU',
  ID: 'ID',
  INDONESIAN: 'ID',
  INDONESSIAN: 'ID',
  인도네시아어: 'ID',
  ES: 'ES',
  SPANISH: 'ES',
  스페인어: 'ES',
  DE: 'DE',
  GERMAN: 'DE',
  독일어: 'DE',
  AR: 'AR',
  ARABIC: 'AR',
  아랍어: 'AR',
};

function normalizeLookupKey(value: string | null | undefined) {
  return (value ?? '').trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toUpperCase();
}

export function normalizeLanguageCode(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return '';
  }

  const key = normalizeLookupKey(value);
  return LANGUAGE_CODE_ALIASES[key] ?? value.trim().toUpperCase();
}

export function buildLanguageDisplayLabels(
  languages: string[],
  koreanLevel: string,
  resolveLanguageLabel: (code: string) => string,
  resolveKoreanLevelLabel: (level: string) => string,
  fallbackText = '',
) {
  const levelLabel = resolveKoreanLevelLabel(koreanLevel).trim();
  const normalizedLanguages = languages
    .map(normalizeLanguageCode)
    .filter((code): code is string => typeof code === 'string' && code.length > 0);
  const displayLabels = normalizedLanguages
    .map((code) => resolveLanguageLabel(code).trim())
    .filter((label) => label.length > 0);

  const koreanLabel = resolveLanguageLabel('KO').trim() || 'Korean';
  const koreanDisplay = levelLabel ? `${koreanLabel} (${levelLabel})` : koreanLabel;
  const koreanIndex = normalizedLanguages.findIndex((code) => code === 'KO');

  if (koreanIndex >= 0) {
    if (koreanIndex < displayLabels.length) {
      displayLabels[koreanIndex] = koreanDisplay;
    } else {
      displayLabels.push(koreanDisplay);
    }
  } else if (koreanDisplay.length > 0) {
    displayLabels.push(koreanDisplay);
  }

  if (displayLabels.length > 0) {
    return displayLabels;
  }

  return fallbackText.trim() ? [fallbackText] : [];
}
