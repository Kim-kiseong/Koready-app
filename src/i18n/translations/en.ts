import type { DeepPartial } from '../deep-partial';
import type { Translations } from './ko';

// English copy hasn't been written yet. Fill in keys here as they're
// translated — any key left out falls back to the Korean value (see
// `../index.ts`), so partially-translated screens keep working.
export const en: DeepPartial<Translations> = {
  nav: {
    home: 'Home',
    map: 'Map',
    picks: 'Picks',
    saved: 'Saved',
    my: 'My',
  },
  home: {
    locationPlaceholder: 'No location set',
    searchPlaceholder: 'What kind of trip are you up for today?',
    guidesSectionTitle: "Hori's Guide to Traveling in Korea",
    seeAll: 'View all',
    categories: {
      POPULAR: 'Popular',
      LOCAL_FESTIVAL: 'Local Festivals',
      EXHIBITION_MUSEUM: 'Exhibitions & Museums',
      NATURE: 'Nature Spots',
    },
  },
  placeDetail: {
    loading: 'Loading details.',
    tabs: {
      description: 'About',
      route: 'Route',
      mate: 'Mate',
    },
    enjoyTitle: 'How to enjoy it',
    nearbyTitle: 'Places to visit nearby',
    routePlaceholder: 'Route information is coming soon.',
    matePlaceholder: 'The mate feature is coming soon.',
  },
};
