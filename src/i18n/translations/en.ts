import type { DeepPartial } from '../deep-partial';
import type { Translations } from './ko';

// English copy hasn't been written yet. Fill in keys here as they're
// translated — any key left out falls back to the Korean value (see
// `../index.ts`), so partially-translated screens keep working.
export const en: DeepPartial<Translations> = {
  nav: {
    home: 'Home',
    map: 'Map',
    picks: 'For You',
    saved: 'Saved',
    profile: 'Profile',
  },
  saved: {
    title: 'Saved',
    loading: 'Loading your saved places.',
    emptyTitle: 'No saved places yet.',
    emptyDescription: 'Tap the heart to save places you like.',
    sortTitle: 'Sort',
    sortOptions: {
      savedAt: 'Recently Saved',
      deadline: 'Ending Soon',
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
