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
  picks: {
    headerTitle: 'Recommended for You',
    scopeNearby: 'Nearby',
    scopeNationwide: 'Nationwide',
    loadingText: 'Loading recommendations...',
    errorText: "Couldn't load recommendations.",
    emptyText: 'No recommendations right now.',
    retry: 'Try again',
    detailButton: 'View travel course',
    guideTapText: 'Tap the image\nto see trip details',
    guideSwipeText: 'Swipe the card\nto see other destinations',
  },
  eventList: {
    total: 'Total ',
    countUnit: '',
    sortTitle: 'Sort',
    sortRecommended: 'Recommended',
    sortDeadline: 'Ending soon',
  },
  eventFilter: {
    title: 'Filters',
    reset: 'Reset',
    regionLabel: 'Region',
    regionAll: 'All',
    regionOptions: {
      SEOUL: 'Seoul',
      GYEONGGI: 'Gyeonggi',
      GANGWON: 'Gangwon',
      CHUNGCHEONG: 'Chungcheong',
      JEOLLA: 'Jeolla',
      GYEONGSANG: 'Gyeongsang',
      JEJU: 'Jeju',
    },
    dateLabel: 'Date',
    dateAll: 'All',
    dateOptions: {
      THIS_WEEK: 'This week',
      THIS_MONTH: 'This month',
      NEXT_MONTH: 'Next month',
    },
    dateCustomButton: 'Choose dates',
    typeLabel: 'Travel type',
    typeOptions: {
      LOCAL_FOOD: 'Local Food',
      LOCAL_FESTIVAL: 'Local Festival',
      TRADITIONAL_MARKET: 'Traditional Market',
      CULTURE_EXPERIENCE: 'Culture Experience',
      NATURE: 'Nature',
      EXHIBITION_MUSEUM: 'Exhibition & Museum',
      DRAMA_LOCATION: 'Drama Filming Location',
    },
    cancel: 'Cancel',
    apply: 'Apply',
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
