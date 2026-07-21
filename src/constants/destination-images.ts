import type { DestinationId } from '@/api/onboarding';

export const DestinationImages: Record<DestinationId, number> = {
  NATIONAL_MUSEUM: require('@/assets/images/destinations/default.jpg'),
  JEONJU_HANOK_VILLAGE: require('@/assets/images/destinations/jeonju-hanok-village.jpg'),
  GWANGJANG_MARKET: require('@/assets/images/destinations/seoul-gwangjang-market.jpg'),
  HALLASAN: require('@/assets/images/destinations/jeju-hallasan.jpg'),
  YEOSU_CABLE_CAR: require('@/assets/images/destinations/yeosu-cable-car.jpg'),
  GAMCHEON_VILLAGE: require('@/assets/images/destinations/default.jpg'),
  MYEONGDONG: require('@/assets/images/destinations/default.jpg'),
  NAMI_ISLAND: require('@/assets/images/destinations/default.jpg'),
  BORYEONG_MUD_FESTIVAL: require('@/assets/images/destinations/boryeong-mud-festival.jpg'),
  NONSAN_SUNSHINE_LAND: require('@/assets/images/destinations/nonsan-sunshine-land.jpg'),
};
