import type { GuideCategoryId } from '@/api/home';

export const GuideCategoryImages: Record<GuideCategoryId, number> = {
  TRANSPORT: require('@/assets/images/guides/category-transport.png'),
  ORDER: require('@/assets/images/guides/category-order.png'),
  SAFETY: require('@/assets/images/guides/category-safety.png'),
  LANGUAGE: require('@/assets/images/guides/category-language.png'),
};
