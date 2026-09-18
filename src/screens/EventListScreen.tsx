import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_EVENT_FILTERS,
  fetchEventListings,
  type EventFilters,
  type EventListing,
  type EventSortOrder,
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
const TOP_FEATURED_COUNT = 5;

export default function EventListScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  // Measured from the screen's own onLayout instead of useWindowDimensions —
  // this app always renders inside PcIframeShell's 393-wide iframe on a PC
  // browser (see PcIframeShell.web.tsx), and useWindowDimensions there was
  // landing on the outer top-level tab's full width instead of the iframe's,
  // computing a card width far wider than what actually fits and collapsing
  // the grid to a single column. The screen's own laid-out width is correct
  // regardless of which window a dimensions hook happens to resolve against.
  const [screenWidth, setScreenWidth] = useState(0);
  // Figma's grid card is a fixed 165pt that only fits 2-per-row at exactly the
  // 375pt reference width — on any other device width that leaves either dead
  // space or (if hardcoded) a rounding-driven wrap down to a single column.
  // Deriving it from the actual screen width keeps the 2-column grid exact.
  // Floored (not left as the exact fractional fit) so 2 cards + the gap
  // always land a hair under the container's width instead of exactly at
  // it — browser zoom introduces sub-pixel rounding between this
  // JS-computed width and what the layout engine actually renders, and an
  // exact zero-tolerance fit wraps to a single column the moment that
  // rounding goes against it (only worked by coincidence at 100%/80% zoom).
  const gridCardWidth = Math.floor(
    (screenWidth - SCREEN_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
  );
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const orderedMonths = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return Array.from({ length: 12 }, (_, i) => ((currentMonth - 1 + i) % 12) + 1);
  }, []);
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('RECOMMENDED');
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const featuredScrollRef = useHorizontalDragScroll();
  const monthScrollRef = useHorizontalDragScroll();
  const [events, setEvents] = useState<EventListing[]>([]);
  // Same reasoning as HomeScreen's isEventsLoading: stays true until the
  // data's in AND every big card's photo has settled, so this row doesn't
  // flash empty then pop photos in one by one either.
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const settledFeaturedImageIdsRef = useRef<Set<string>>(new Set());

  // The top "big card" row used to be its own separate GET
  // /monthly-recommendations call (fetchFeaturedEvents) requesting the same
  // month's full page just to slice off the first 5 — a second full request
  // for data the grid below was already fetching, which is why switching
  // months visibly took longer to update the row above than the grid below.
  // It's just the sorted grid's own first 5 (EventListing already has every
  // field EventCard needs), so no second request is required at all.
  const featured = events.slice(0, TOP_FEATURED_COUNT);

  useEffect(() => {
    let cancelled = false;
    // month/sortOrder/filters' own triggers (handleMonthChange,
    // SortBottomSheet's onSelect, FilterBottomSheet's onApply) reset
    // isFeaturedLoading themselves — only language has no local control to
    // hook that into on this screen, so it's set here instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFeaturedLoading(true);
    settledFeaturedImageIdsRef.current = new Set();
    fetchEventListings(month, sortOrder, filters).then((result) => {
      if (cancelled) return;
      setEvents(result);
      if (result.length === 0) setIsFeaturedLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [month, sortOrder, filters, language]);

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

  const title = useMemo(
    () =>
      language === 'EN' ? `Places to visit in ${EN_MONTH_NAMES[month - 1]}` : `${month}${t.eventList.titleSuffix}`,
    [month, t, language],
  );

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}
      onLayout={(event) => setScreenWidth(event.nativeEvent.layout.width)}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={title} rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView
          ref={monthScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthRow}>
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
            <View style={styles.featuredLoadingBox}>
              <ActivityIndicator color={Palette.primary} />
              <CustomText style={styles.featuredLoadingText}>{t.eventList.featuredLoading}</CustomText>
            </View>
          )}
        </View>

        {/* Hidden together with the featured row above while isFeaturedLoading
            — both come from the same fetch (see the events effect), so
            showing this count/grid the instant events lands, ahead of the
            featured row's own image-settle wait, read as this section
            loading in two disjointed steps instead of one. */}
        {!isFeaturedLoading && (
          <>
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
          </>
        )}
      </ScrollView>

      <SortBottomSheet
        visible={isSortSheetOpen}
        value={sortOrder}
        onSelect={(next) => {
          if (next !== sortOrder) setIsFeaturedLoading(true);
          setSortOrder(next);
          setSortSheetOpen(false);
        }}
        onClose={() => setSortSheetOpen(false)}
      />

      <FilterBottomSheet
        visible={isFilterSheetOpen}
        value={filters}
        onApply={(next) => {
          setIsFeaturedLoading(true);
          setFilters(next);
        }}
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
  },
  featuredLoadingBox: {
    // A couple px past absoluteFill's exact edges on every side — cheaper
    // and more reliable than getting the still-loading ScrollView's own
    // layout height to match this wrapper's to the sub-pixel (RN Web can
    // round the two independently), which left a sliver of a loading card's
    // photo/gradient visible as a thin line along one edge. Overshooting
    // onto the page's own white background is invisible either way.
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
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
