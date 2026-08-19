import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchSavedPlaces, unsavePlace } from '@/api/saved-place';
import type { SavedPlaceItem } from '@/api/types';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import DetailTag from '@/components/place-detail/DetailTag';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

type SavedSortOrder = 'SAVED_AT' | 'DEADLINE';

const SORT_OPTIONS: { value: SavedSortOrder; label: string }[] = [
  { value: 'SAVED_AT', label: '담은순' },
  { value: 'DEADLINE', label: '마감순' },
];

const TRAVEL_STYLE_LABELS: Record<string, string> = {
  LOCAL_FOOD: '로컬 맛집',
  LOCAL_FESTIVAL: '지역 축제',
  TRADITIONAL_MARKET: '전통시장',
  CULTURE_EXPERIENCE: '문화 체험',
  NATURE: '자연 명소',
  EXHIBITION_MUSEUM: '전시/미술관',
  DRAMA_LOCATION: '드라마 촬영지',
};

export default function SavedScreen() {
  const router = useRouter();
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const savedStoreHydrated = useSavedPlaceStore((state) => state.hasHydrated);
  const savedPlacesByPlaceId = useSavedPlaceStore((state) => state.savedPlacesByPlaceId);
  const replaceSavedPlaces = useSavedPlaceStore((state) => state.replaceSavedPlaces);
  const removeSavedPlace = useSavedPlaceStore((state) => state.removeSavedPlace);

  const [sortOrder, setSortOrder] = useState<SavedSortOrder>('SAVED_AT');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);

  const loadSavedPlaces = useCallback(
    async (nextCursor: string | null = null, isMore = false) => {
      if (!hasAuthHydrated || !savedStoreHydrated) {
        return;
      }

      if (isMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchSavedPlaces(nextCursor, 20);
        replaceSavedPlaces(result.items);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } finally {
        if (isMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [hasAuthHydrated, replaceSavedPlaces, savedStoreHydrated],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSavedPlaces(null, false);
    }, [loadSavedPlaces]),
  );

  const savedPlaces = useMemo(() => {
    const items = Object.values(savedPlacesByPlaceId).filter((item) => item.saved !== false);

    return items.sort((left, right) => {
      if (sortOrder === 'DEADLINE') {
        const leftDeadline = left.festivalOccurrence?.endDate;
        const rightDeadline = right.festivalOccurrence?.endDate;

        if (leftDeadline && rightDeadline && leftDeadline !== rightDeadline) {
          return leftDeadline.localeCompare(rightDeadline);
        }

        if (leftDeadline && !rightDeadline) {
          return -1;
        }

        if (!leftDeadline && rightDeadline) {
          return 1;
        }
      }

      const savedDiff = Date.parse(right.savedAt) - Date.parse(left.savedAt);
      if (savedDiff !== 0) {
        return savedDiff;
      }

      return right.placeId - left.placeId;
    });
  }, [savedPlacesByPlaceId, sortOrder]);

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOrder)?.label ?? '담은순';
  const sortChevronName = isSortSheetVisible
    ? ({ ios: 'chevron.up', android: 'arrow_drop_up', web: 'arrow_drop_up' } as const)
    : ({ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' } as const);

  const handleToggleSave = (place: SavedPlaceItem) => {
    removeSavedPlace(place.placeId);
    void unsavePlace(place.placeId).catch(() => {});
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    void loadSavedPlaces(cursor, true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>저장</CustomText>

        <View style={styles.sortControl}>
          <Pressable style={styles.sortButton} onPress={() => setIsSortSheetVisible(true)}>
            <CustomText style={styles.sortButtonText}>{currentSortLabel}</CustomText>
            <SymbolView name={sortChevronName} size={12} weight="regular" tintColor={Palette.grey500} />
          </Pressable>
        </View>
      </View>

      {isLoading && savedPlaces.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
          <CustomText style={styles.loadingText}>저장한 여행지를 불러오는 중이에요.</CustomText>
        </View>
      ) : savedPlaces.length === 0 ? (
        <View style={styles.emptyState}>
          <CustomText style={styles.emptyTitle}>저장한 장소가 없어요.</CustomText>
          <CustomText style={styles.emptyDescription}>
            마음에 드는 여행지의 하트를 눌러 저장해보세요.
          </CustomText>
        </View>
      ) : (
        <FlatList
          data={savedPlaces}
          keyExtractor={(item) => String(item.placeId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setIsSortSheetVisible(false)}
          renderItem={({ item }) => (
            <SavedPlaceCard
              place={item}
              onPress={() =>
                router.push({
                  pathname: '/places/[placeId]',
                  params: { placeId: String(item.placeId) },
                })
              }
              onToggleSave={() => handleToggleSave(item)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
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
      )}

      <BottomNavBar active="saved" />

      <SortSheet
        visible={isSortSheetVisible}
        value={sortOrder}
        onClose={() => setIsSortSheetVisible(false)}
        onSelect={(nextOrder) => {
          setSortOrder(nextOrder);
          setIsSortSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function SavedPlaceCard({
  place,
  onPress,
  onToggleSave,
}: {
  place: SavedPlaceItem;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const subtitleText = place.scheduleText ?? place.festivalOccurrence?.dateRangeText ?? null;
  const heartIcon = (
    <SymbolView
      name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
      size={24}
      weight="regular"
      tintColor={Palette.red300}
    />
  );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {place.imageUrl && (
          <Image source={{ uri: place.imageUrl }} style={styles.image} contentFit="cover" />
        )}
        {place.festivalOccurrence ? (
          <View style={styles.dDayBadge}>
            <CustomText style={styles.dDayText}>{getDDayLabel(place)}</CustomText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTextGroup}>
            <CustomText style={styles.travelStyle}>{formatTravelStyle(place.travelStyle)}</CustomText>
            <CustomText numberOfLines={1} style={styles.title}>
              {place.title}
            </CustomText>
            {subtitleText ? (
              <CustomText numberOfLines={1} style={styles.subtitle}>
                {subtitleText}
              </CustomText>
            ) : null}
          </View>

          <Pressable
            hitSlop={10}
            style={styles.heartButton}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}>
            {heartIcon}
          </Pressable>
        </View>

        <View style={styles.tagRow}>
          {place.tags.slice(0, 3).map((tag, index) => (
            <DetailTag key={toStableListKey(tag, index)} label={toDisplayText(tag)} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function SortSheet({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SavedSortOrder;
  onSelect: (value: SavedSortOrder) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandleArea}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetContent}>
            <CustomText style={styles.sheetTitle}>정렬</CustomText>

            <View style={styles.sheetOptions}>
              {SORT_OPTIONS.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable key={option.value} style={styles.sheetOptionRow} onPress={() => onSelect(option.value)}>
                    <CustomText style={selected ? styles.sheetOptionSelected : styles.sheetOption}>
                      {option.label}
                    </CustomText>
                    {selected && (
                      <SymbolView
                        name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                        size={18}
                        weight="semibold"
                        tintColor={Palette.text}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatTravelStyle(value: string) {
  return TRAVEL_STYLE_LABELS[value] ?? value;
}

function getDDayLabel(place: SavedPlaceItem) {
  if (!place.festivalOccurrence) {
    return '';
  }

  const startDate = new Date(`${place.festivalOccurrence.startDate}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.ceil((startDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 0) {
    return `D-${diffDays}`;
  }

  return `D+${Math.abs(diffDays)}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 18,
    overflow: 'visible',
  },
  headerTitle: {
    alignSelf: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  sortControl: {
    alignSelf: 'flex-end',
    position: 'relative',
    overflow: 'visible',
    zIndex: 20,
    elevation: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
  },
  sortButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  sortMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    elevation: 100,
    zIndex: 100,
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
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  sortMenuTextSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey700,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 140,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F5',
    backgroundColor: '#ffffff',
  },
  imageWrap: {
    width: 107,
    height: 107,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Palette.grey200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dDayBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(28,28,26,0.55)',
  },
  dDayText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#ffffff',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    paddingRight: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextGroup: {
    flex: 1,
    gap: 4,
  },
  travelStyle: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 0,
  },
  heartButton: {
    padding: 0,
    marginTop: 0,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.text,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  footerSpacer: {
    height: 12,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
    gap: 16,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
  },
  sheetContent: {
    gap: 24,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  sheetOptions: {
    gap: 24,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  sheetOption: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22.4,
    color: Palette.text,
  },
  sheetOptionSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
});
