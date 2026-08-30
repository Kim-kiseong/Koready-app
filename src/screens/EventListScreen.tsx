import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_EVENT_FILTERS,
  fetchEventListings,
  fetchFeaturedEvents,
  type EventFilters,
  type EventListing,
  type EventSortOrder,
  type FeaturedEvent,
} from '@/api/home';
import CustomText from '@/components/CustomText';
import EventCard from '@/components/EventCard';
import EventGridCard from '@/components/EventGridCard';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import OnboardingHeader from '@/components/OnboardingHeader';
import PillChip from '@/components/PillChip';
import SortBottomSheet from '@/components/SortBottomSheet';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const EN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const GRID_COLUMNS = 2;
const GRID_GAP = 13;
const SCREEN_PADDING = 16;
// useWindowDimensions() reports the OS/browser window size, not the grid
// View's actual rendered content width — on web a vertical scrollbar (when
// the page is tall enough to need one) eats a further ~15-20pt that the
// window-size math never accounts for. That's enough overshoot to push the
// second 2-column card past the true available width every time, collapsing
// the grid to a single column. Native has no scrollbar, so this stays 0 there.
const WEB_SCROLLBAR_ALLOWANCE = Platform.OS === 'web' ? 20 : 0;

export default function EventListScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const { width: windowWidth } = useWindowDimensions();
  // Figma's grid card is a fixed 165pt that only fits 2-per-row at exactly the
  // 375pt reference width — on any other device width that leaves either dead
  // space or (if hardcoded) a rounding-driven wrap down to a single column.
  // Deriving it from the actual window width keeps the 2-column grid exact.
  const gridCardWidth =
    (windowWidth - SCREEN_PADDING * 2 - WEB_SCROLLBAR_ALLOWANCE - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('RECOMMENDED');
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [featured, setFeatured] = useState<FeaturedEvent[]>([]);
  const [events, setEvents] = useState<EventListing[]>([]);

  useEffect(() => {
    fetchFeaturedEvents('POPULAR').then(setFeatured);
  }, [language]);

  useEffect(() => {
    fetchEventListings(month, sortOrder, filters).then(setEvents);
  }, [month, sortOrder, filters, language]);

  const title = useMemo(
    () =>
      language === 'EN' ? `Places to visit in ${EN_MONTH_NAMES[month - 1]}` : `${month}${t.eventList.titleSuffix}`,
    [month, t, language],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={title} rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
          {MONTHS.map((m) => (
            <PillChip
              key={m}
              label={language === 'EN' ? EN_MONTH_NAMES[m - 1].slice(0, 3) : `${m}월`}
              selected={month === m}
              onPress={() => setMonth(m)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
          {featured.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push({ pathname: '/places/[placeId]', params: { placeId: event.id } })}
            />
          ))}
        </ScrollView>

        <View style={styles.gridHeaderRow}>
          <View style={styles.countRow}>
            <CustomText style={styles.countLabel}>{t.eventList.total}</CustomText>
            <CustomText style={styles.countValue}>{events.length}</CustomText>
            <CustomText style={styles.countLabel}>{t.eventList.countUnit}</CustomText>
          </View>

          <View style={styles.toolsRow}>
            <Pressable style={styles.sortButton} onPress={() => setSortSheetOpen(true)}>
              <CustomText style={styles.sortButtonText}>
                {sortOrder === 'RECOMMENDED' ? t.eventList.sortRecommended : t.eventList.sortDeadline}
              </CustomText>
              <SymbolView
                name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
                size={12}
                weight="regular"
                tintColor={Palette.grey500}
              />
            </Pressable>
            <Pressable style={styles.filterButton} onPress={() => setFilterSheetOpen(true)}>
              <SymbolView
                name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
                size={14}
                weight="regular"
                tintColor={Palette.grey500}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.grid}>
          {events.map((event) => (
            <EventGridCard
              key={event.id}
              event={event}
              categoryLabel={t.eventFilter.typeOptions[event.category]}
              width={gridCardWidth}
              onPress={() => router.push({ pathname: '/places/[placeId]', params: { placeId: event.id } })}
            />
          ))}
        </View>
      </ScrollView>

      <SortBottomSheet
        visible={isSortSheetOpen}
        value={sortOrder}
        onSelect={(next) => {
          setSortOrder(next);
          setSortSheetOpen(false);
        }}
        onClose={() => setSortSheetOpen(false)}
      />

      <FilterBottomSheet
        visible={isFilterSheetOpen}
        value={filters}
        onApply={setFilters}
        onClose={() => setFilterSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  monthRow: {
    gap: 6,
    paddingHorizontal: 16,
  },
  featuredRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  countLabel: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
  },
  countValue: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.primary,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
  },
  sortButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey500,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GRID_GAP,
    rowGap: GRID_GAP,
    paddingHorizontal: SCREEN_PADDING,
  },
});
