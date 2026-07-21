import { useLanguageStore } from '@/store/language-store';

import { dictionaries } from './index';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  return dictionaries[language];
}
