import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPlaces } from '@/api/place';
import type { PlaceListItem, PlaceSortOrder } from '@/api/types';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PlaceFilterBottomSheet from '@/components/PlaceFilterBottomSheet';
import PlaceGridCard from '@/components/PlaceGridCard';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import {
  DEFAULT_PLACE_FILTER_SELECTION,
  resolvePlaceDateQuery,
  type PlaceFilterSelection,
} from '@/utils/place-filter';

const GYEONGSANG_MAP_IMAGE = require('@/assets/images/gyeongsang/gyeongsang-frame.svg');
const MAP_BASE_WIDTH = 343;
const MAP_BASE_HEIGHT = 408;
const PLACE_PAGE_SIZE = 12;

type MapArtwork = {
  key: string;
  source: number;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

const GYEONGSANG_MAP_ARTWORK: MapArtwork[] = [
  {
    key: 'premium-cafe',
    source: require('@/assets/images/gyeongsang/map-icons/sangju-cafe.png'),
    left: 40,
    top: 65,
    width: 100,
    height: 100,
    zIndex: 7,
  },
  {
    key: 'gimbap-festival',
    source: require('@/assets/images/gyeongsang/map-icons/gimbap-festival.png'),
    left: 75,
    top: 135,
    width: 100,
    height: 100,
    zIndex: 5,
  },
  {
    key: 'hahoe-mask',
    source: require('@/assets/images/gyeongsang/map-icons/hahoe-mask.png'),
    left: 130,
    top: 64,
    width: 100,
    height: 100,
    zIndex: 9,
  },
  {
    key: 'birch-forest',
    source: require('@/assets/images/gyeongsang/map-icons/yeongyang-birch-forest.png'),
    left: 193,
    top: 20,
    width: 100,
    height: 100,
    zIndex: 8,
  },
  {
    key: 'seokguram',
    source: require('@/assets/images/gyeongsang/map-icons/seokguram.png'),
    left: 180,
    top: 135,
    width: 100,
    height: 100,
    zIndex: 6,
  },
  {
    key: 'cheomseongdae',
    source: require('@/assets/images/gyeongsang/map-icons/gyeongju-cheomseongdae.png'),
    left: 230,
    top: 173,
    width: 100,
    height: 100,
    zIndex: 7,
  },
  {
    key: 'daebong-skyland',
    source: require('@/assets/images/gyeongsang/map-icons/hamyang-daebong.png'),
    left: 15,
    top: 205,
    width: 100,
    height: 100,
    zIndex: 6,
  },
  {
    key: 'seomun-market',
    source: require('@/assets/images/gyeongsang/map-icons/daegu-seomun-market.png'),
    left: 120,
    top: 205,
    width: 100,
    height: 100,
    zIndex: 7,
  },
  {
    key: 'taehwa-garden',
    source: require('@/assets/images/gyeongsang/map-icons/taehwa-river-garden.png'),
    left: 205,
    top: 245,
    width: 100,
    height: 100,
    zIndex: 6,
  },
  {
    key: 'seafood-feast',
    source: require('@/assets/images/gyeongsang/map-icons/galam-seafood.png'),
    left: 15,
    top: 280,
    width: 100,
    height: 100,
    zIndex: 5,
  },
  {
    key: 'dongpirang',
    source: require('@/assets/images/gyeongsang/map-icons/dongpirang-village.png'),
    left: 95,
    top: 316,
    width: 100,
    height: 100,
    zIndex: 6,
  },
  {
    key: 'gwangan-bridge',
    source: require('@/assets/images/gyeongsang/map-icons/gwangan-bridge.png'),
    left: 186,
    top: 298,
    width: 100,
    height: 100,
    zIndex: 5,
  },
];

const SORT_OPTIONS: { value: PlaceSortOrder; label: string }[] = [
  { value: 'RECOMMENDED', label: '추천순' },
  { value: 'DEADLINE', label: '마감순' },
];

export default function GyeongsangScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const t = useTranslation();
  const isEnglish = useLanguageStore((state) => state.language) === 'EN';
  const loadVersionRef = useRef(0);

  const [sortOrder, setSortOrder] = useState<PlaceSortOrder>('RECOMMENDED');
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PlaceFilterSelection>(
    DEFAULT_PLACE_FILTER_SELECTION,
  );

  const mapWidth = Math.min(width - 32, MAP_BASE_WIDTH);
  const mapScale = mapWidth / MAP_BASE_WIDTH;
  const mapHeight = MAP_BASE_HEIGHT * mapScale;
  const cardWidth = Math.floor((width - 40 - 12) / 2);
  const regionLabel = t.map.regionLabels.gyeongsang;
  const currentSortLabel =
    sortOrder === 'RECOMMENDED' ? t.map.sortRecommended : t.map.sortDeadline;
  const sortChevronName = isSortMenuOpen
    ? ({ ios: 'chevron.up', android: 'arrow_drop_up', web: 'arrow_drop_up' } as const)
    : ({ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' } as const);
  const snapPoints = useMemo(() => ['32%', '76%', '96%'], []);

  const loadPlaces = useCallback(
    async (nextCursor: string | null = null, isMore = false) => {
      const requestVersion = ++loadVersionRef.current;

      if (isMore) {
        setIsLoadingMore(true);
      } else {
        setIsSortMenuOpen(false);
        setPlaces([]);
        setCursor(null);
        setHasMore(false);
        setIsLoading(true);
        setIsLoadingMore(false);
      }

      try {
        const result = await fetchPlaces({
          serviceRegionCode: 'GYEONGSANG',
          sort: sortOrder,
          cursor: nextCursor,
          ...resolvePlaceDateQuery(selectedFilter),
          travelStyles: selectedFilter.travelStyles.length > 0 ? selectedFilter.travelStyles : undefined,
          size: PLACE_PAGE_SIZE,
        });

        if (loadVersionRef.current !== requestVersion) {
          return;
        }

        setPlaces((currentPlaces) => (isMore ? [...currentPlaces, ...result.items] : result.items));
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } finally {
        if (loadVersionRef.current === requestVersion) {
          if (isMore) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [selectedFilter, sortOrder],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadPlaces(null, false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [loadPlaces]);

  const handleLoadMore = useCallback(() => {
    if (!cursor || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    void loadPlaces(cursor, true);
  }, [cursor, hasMore, isLoading, isLoadingMore, loadPlaces]);

  const renderPlace = useCallback(
    ({ item }: { item: PlaceListItem }) => (
      <PlaceGridCard
        place={item}
        width={cardWidth}
        onPress={() =>
          router.push({
            pathname: '/places/[placeId]',
            params: { placeId: String(item.placeId) },
          })
        }
      />
    ),
    [cardWidth, router],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router, '/map')}
        title={regionLabel}
        rightIcon={<View style={styles.headerSpacer} />}
      />

      <View style={styles.contentArea}>
        <View style={[styles.mapStage, { width: mapWidth, height: mapHeight }]}>
          <Image source={GYEONGSANG_MAP_IMAGE} style={styles.mapBase} contentFit="contain" />

          <View style={styles.mapOverlay}>
            {GYEONGSANG_MAP_ARTWORK.map((artwork) => (
              <Image
                key={artwork.key}
                source={artwork.source}
                style={[
                  styles.mapIcon,
                  {
                    left: artwork.left * mapScale,
                    top: artwork.top * mapScale,
                    width: artwork.width * mapScale,
                    height: artwork.height * mapScale,
                    zIndex: artwork.zIndex,
                  },
                ]}
                contentFit="contain"
              />
            ))}
          </View>
        </View>

        <BottomSheet
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableDynamicSizing={false}
          handleIndicatorStyle={styles.sheetHandle}
          backgroundStyle={styles.bottomSheetBackground}
          style={styles.bottomSheetShadow}
        >
          <BottomSheetView style={styles.sheetHeader}>
            <View style={styles.toolbarRow}>
              <View style={styles.countRow}>
                {t.map.countPrefix ? <CustomText style={styles.countLabel}>{t.map.countPrefix}</CustomText> : null}
                <CustomText style={styles.countValue}>{places.length}</CustomText>
                <CustomText style={styles.countLabel}>{t.map.countSuffix}</CustomText>
              </View>

              <View style={styles.toolsRow}>
                <View style={styles.sortControl}>
                  <Pressable
                    style={[
                      styles.sortButton,
                      isEnglish && styles.sortButtonEnglish,
                      isEnglish && sortOrder === 'DEADLINE' && styles.sortButtonEnglishDeadline,
                    ]}
                    onPress={() => setIsSortMenuOpen((current) => !current)}
                  >
                    <CustomText numberOfLines={1} style={styles.sortButtonText}>{currentSortLabel}</CustomText>
                    <SymbolView name={sortChevronName} size={12} weight="regular" tintColor={Palette.grey500} />
                  </Pressable>

                  {isSortMenuOpen ? (
                    <View style={[styles.sortMenu, isEnglish && styles.sortMenuEnglish]}>
                      {SORT_OPTIONS.map((option, index) => {
                        const selected = option.value === sortOrder;
                        const label =
                          option.value === 'RECOMMENDED' ? t.map.sortRecommended : t.map.sortDeadline;
                        return (
                          <Pressable
                            key={option.value}
                            style={[
                              styles.sortMenuItem,
                              index === 0 ? styles.sortMenuItemTop : styles.sortMenuItemBottom,
                            ]}
                            onPress={() => {
                              setSortOrder(option.value);
                              setIsSortMenuOpen(false);
                            }}
                            >
                            <CustomText numberOfLines={1} style={selected ? styles.sortMenuTextSelected : styles.sortMenuText}>
                              {label}
                            </CustomText>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>

                <Pressable
                  style={styles.filterButton}
                  onPress={() => {
                    setIsSortMenuOpen(false);
                    setIsFilterSheetOpen(true);
                  }}
                >
                  <SymbolView
                    name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
                    size={14}
                    weight="regular"
                    tintColor={Palette.grey500}
                  />
                </Pressable>
              </View>
            </View>
          </BottomSheetView>

          <BottomSheetFlatList<PlaceListItem>
            style={styles.list}
            data={places}
            keyExtractor={(item) => String(item.placeId)}
            numColumns={2}
            renderItem={renderPlace}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.cardRow}
            ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            onScrollBeginDrag={() => {
              setIsSortMenuOpen(false);
              setIsFilterSheetOpen(false);
            }}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator color={Palette.primary} />
                  <CustomText style={styles.loadingText}>
                    {t.map.loading.replace('{region}', regionLabel)}
                  </CustomText>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <CustomText style={styles.emptyTitle}>{t.map.emptyTitle}</CustomText>
                  <CustomText style={styles.emptyDescription}>{t.map.emptyDescription}</CustomText>
                </View>
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={Palette.primary} />
                </View>
              ) : (
                <View style={styles.footerSpacer} />
              )
            }
          />
        </BottomSheet>

        <PlaceFilterBottomSheet
          visible={isFilterSheetOpen}
          value={selectedFilter}
          onApply={setSelectedFilter}
          onClose={() => setIsFilterSheetOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  mapStage: {
    alignSelf: 'center',
    position: 'relative',
    marginTop: 16,
  },
  mapBase: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
    overflow: 'visible',
    pointerEvents: 'none',
  },
  mapIcon: {
    position: 'absolute',
  },
  bottomSheetShadow: {
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 -4px 18px rgba(0, 0, 0, 0.08)' } as object)
      : {
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -4 },
        }),
    elevation: 8,
  },
  bottomSheetBackground: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHandle: {
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: Palette.grey200,
  },
  sheetHeader: {
    position: 'relative',
    zIndex: 30,
    elevation: 30,
    overflow: 'visible',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Palette.white,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  countRow: {
    flexShrink: 1,
    minWidth: 0,
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
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortControl: {
    position: 'relative',
    zIndex: 60,
    elevation: 60,
    overflow: 'visible',
    alignSelf: 'flex-start',
  },
  sortButton: {
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    paddingLeft: 12,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sortButtonEnglish: {
    width: 126,
  },
  sortButtonEnglishDeadline: {
    width: 112,
  },
  sortButtonText: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
  },
  sortMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    minWidth: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.08)' } as object)
      : {
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 5, height: 5 },
        }),
    elevation: 100,
    zIndex: 100,
  },
  sortMenuEnglish: {
    minWidth: 104,
  },
  sortMenuItem: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  sortMenuItemTop: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  sortMenuItemBottom: {
    paddingTop: 6,
    paddingBottom: 8,
  },
  sortMenuText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey500,
  },
  sortMenuTextSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: Palette.grey700,
  },
  filterButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  listHeaderSpacer: {
    height: 56,
  },
  cardRow: {
    gap: 12,
    marginBottom: 12,
  },
  loadingState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  emptyState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
  },
  emptyDescription: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
    textAlign: 'center',
  },
  footerLoader: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  footerSpacer: {
    height: 12,
  },
});
