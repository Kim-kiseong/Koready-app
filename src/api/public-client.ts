import axios from 'axios';

import { API_V1_BASE_URL } from '@/constants/env';
import { useLanguageStore } from '@/store/language-store';

export const publicClient = axios.create({
  baseURL: API_V1_BASE_URL,
});

publicClient.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', useLanguageStore.getState().language);
  return config;
});
