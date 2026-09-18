import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { useHorizontalDragScroll } from '@/hooks/use-horizontal-drag-scroll';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import { formatPlaceTravelStyle } from '@/utils/place-i18n';

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

export default function EventListScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const { width: windowWidth } = useWindowDimensions();
  // Figma's grid card is a fixed 165pt that only fits 2-per-row at exactly the
  // 375pt reference width — on any other device width that leaves either dead
  // space or (if hardcoded) a rounding-driven wrap down to a single column.
  // Deriving it from the actual window width keeps the 2-column grid exact.
  const gridCardWidth = (windowWidth - SCREEN_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const orderedMonths = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return Array.from({ length: 12 }, (_, i) => ((currentMonth - 1 + i) % 12) + 1);
  }, []);
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('RECOMMENDED');
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [featured, setFeatured] = useState<FeaturedEvent[]>([]);
  // Same reasoning as HomeScreen's isEventsLoading: stays true until the
  // data's in AND every big card's photo has settled, so this row doesn't
  // flash empty then pop photos in one by one either.
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const settledFeaturedImageIdsRef = useRef<Set<string>>(new Set());
  const featuredScrollRef = useHorizontalDragScroll();
  const [events, setEvents] = useState<EventListing[]>([]);

  useEffect(() => {
    let cancelled = false;
    // month's own trigger (the month PillChip's onPress, see
    // handleMonthChange below) resets isFeaturedLoading itself — only
    // language has no local control to hook that into on this screen, so
    // it's set here instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFeaturedLoading(true);
    settledFeaturedImageIdsRef.current = new Set();
    fetchFeaturedEvents('POPULAR', month).then((result) => {
      if (cancelled) return;
      setFeatured(result);
      if (result.length === 0) setIsFeaturedLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [month, language]);

  const handleFeaturedImageSettled = (eventId: string) => {
    settledFeaturedImageIdsRef.current.add(eventId);
    if (settledFeaturedImageIdsRef.current.size >= featured.length) {
      setIsFeaturedLoading(false);
    }
  };

  const handleMonthChange = (nextMonth: number) => {
    if (nextMonth === month) return;
    setIsFeaturedLoading(true);
    setMonth(nextMonth);
  };

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
          {orderedMonths.map((m) => (
            <PillChip
              key={m}
              label={language === 'EN' ? EN_MONTH_NAMES[m - 1].slice(0, 3) : `${m}월`}
              selected={month === m}
              onPress={() => handleMonthChange(m)}
            />
          ))}
        </ScrollView>

        <View style={styles.featuredRowWrap}>
          {/* Stays mounted while loading too — its cards are what report
              back via onImageSettled, so hiding it until "loaded" would
              mean it never gets the chance to finish loading. The loading
              box below simply covers it until then. */}
          <ScrollView
            ref={featuredScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}
            pointerEvents={isFeaturedLoading ? 'none' : 'auto'}>
            {featured.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push({ pathname: '/places/[placeId]', params: { placeId: event.id } })}
                onImageSettled={() => handleFeaturedImageSettled(event.id)}
              />
            ))}
          </ScrollView>

          {isFeaturedLoading && (
            <View style={[StyleSheet.absoluteFill, styles.featuredLoadingBox]}>
              <ActivityIndicator color={Palette.primary} />
              <CustomText style={styles.featuredLoadingText}>{t.eventList.featuredLoading}</CustomText>
            </View>
          )}
        </View>

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
              categoryLabel={formatPlaceTravelStyle(event.category, language)}
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
  featuredRowWrap: {
    // Matches EventCard's own height so the section holds its size while
    // loading instead of collapsing/jumping once the row appears.
    height: 312,
    // Without this, a horizontal ScrollView sized only by its wrapper's
    // height (not its own) can end up a hair taller than that wrapper —
    // enough for a sliver of a still-loading card's photo/gradient to peek
    // out past the loading overlay's edge instead of being fully covered.
    overflow: 'hidden',
  },
  featuredLoadingBox: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  featuredLoadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
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
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: 'center',
  },
  sortButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.26,
    color: Palette.grey500,
  },
  filterButton: {
    width: 30,
    height: 30,
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
