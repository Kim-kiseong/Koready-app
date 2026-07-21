import type { LanguageCode } from '@/api/types';

import type { DeepPartial } from './deep-partial';
import { en } from './translations/en';
import { ko, type Translations } from './translations/ko';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T extends object>(base: T, overrides: DeepPartial<T>): T {
  const baseRecord = base as Record<string, unknown>;
  const overridesRecord = overrides as Record<string, unknown>;
  const result: Record<string, unknown> = { ...baseRecord };

  for (const key in overridesRecord) {
    const overrideValue = overridesRecord[key];
    const baseValue = baseRecord[key];
    if (overrideValue === undefined) continue;
    result[key] =
      isPlainObject(overrideValue) && isPlainObject(baseValue)
        ? deepMerge(baseValue, overrideValue)
        : overrideValue;
  }
  return result as T;
}

export const dictionaries: Record<LanguageCode, Translations> = {
  KO: ko,
  EN: deepMerge(ko, en),
};

export type { Translations };
