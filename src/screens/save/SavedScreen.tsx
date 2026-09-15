import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchSavedPlaces,
  unsavePlace,
} from '@/api/saved-place';
import type { LanguageCode, SavedPlaceItem } from '@/api/types';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import HeartIcon from '@/components/HeartIcon';
import DetailTag from '@/components/place-detail/DetailTag';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

type SavedSortOrder = 'SAVED_AT' | 'DEADLINE';

type SavedSortOption = {
  value: SavedSortOrder;
  label: string;
};

const SORT_SHEET_HEIGHT = 260;
const SORT_SHEET_ANIMATION_DURATION = 220;

const TRAVEL_STYLE_LABELS: Record<LanguageCode, Record<string, string>> = {
  KO: {
    LOCAL_FOOD: '로컬 맛집',
    LOCAL_FESTIVAL: '지역 축제',
    TRADITIONAL_MARKET: '전통시장',
    CULTURE_EXPERIENCE: '문화 체험',
    NATURE: '자연 명소',
    EXHIBITION_MUSEUM: '전시/미술관',
    DRAMA_LOCATION: '드라마 촬영지',
  },
  EN: {
    LOCAL_FOOD: 'Local Food',
    LOCAL_FESTIVAL: 'Local Festival',
    TRADITIONAL_MARKET: 'Traditional Market',
    CULTURE_EXPERIENCE: 'Cultural Experience',
    NATURE: 'Nature',
    EXHIBITION_MUSEUM: 'Exhibitions & Museums',
    DRAMA_LOCATION: 'Drama Filming Sites',
  },
};

function createLocalizedLabelMap(entries: [string, string][]) {
  const ko: Record<string, string> = {};
  const en: Record<string, string> = {};

  for (const [korean, english] of entries) {
    ko[korean] = korean;
    ko[english] = korean;
    en[korean] = english;
    en[english] = english;
  }

  return {
    KO: ko,
    EN: en,
  } satisfies Record<LanguageCode, Record<string, string>>;
}

const TITLE_TRANSLATIONS = createLocalizedLabelMap([]);
const TAG_TRANSLATIONS = createLocalizedLabelMap([]);

export default function SavedScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);

  const [sortOrder, setSortOrder] = useState<SavedSortOrder>('SAVED_AT');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [savedPlacesSnapshot, setSavedPlacesSnapshot] = useState<SavedPlaceItem[]>([]);
  const loadKey = JSON.stringify([language, hasAuthHydrated]);
  const [previousLoadKey, setPreviousLoadKey] = useState(loadKey);
  if (previousLoadKey !== loadKey) {
    setPreviousLoadKey(loadKey);
    setSavedPlacesSnapshot([]);
    setCursor(null);
    setHasMore(false);
    setIsLoading(true);
    setIsLoadingMore(false);
  }

  const loadSavedPlaces = useCallback(
    async (nextCursor: string | null = null, isMore = false) => {
      if (!hasAuthHydrated) {
        return;
      }

      if (isMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchSavedPlaces(nextCursor, 20);
        setSavedPlacesSnapshot((current) => {
          const nextItems = isMore ? [...current, ...result.items] : [...result.items];
          const deduped = new Map<number, SavedPlaceItem>();

          for (const item of nextItems) {
            deduped.set(item.placeId, item);
          }

          return [...deduped.values()];
        });
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
    [hasAuthHydrated],
  );

  useEffect(() => {
    if (!hasAuthHydrated) {
      return;
    }

    let cancelled = false;
    fetchSavedPlaces(null, 20)
      .then((result) => {
        if (cancelled) return;
        setSavedPlacesSnapshot([...new Map(result.items.map((item) => [item.placeId, item])).values()]);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      })
      .catch(() => {
        // Keep the empty list usable if its initial request fails.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language, hasAuthHydrated]);

  const savedPlaces = useMemo(() => {
    const items = savedPlacesSnapshot.filter((item) => item.saved !== false);

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
  }, [savedPlacesSnapshot, sortOrder]);

  const sortOptions = [
    { value: 'SAVED_AT', label: t.saved.sortOptions.savedAt },
    { value: 'DEADLINE', label: t.saved.sortOptions.deadline },
  ] satisfies SavedSortOption[];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label ?? t.saved.sortOptions.savedAt;
  const sortChevronName = isSortSheetVisible
    ? ({ ios: 'chevron.up', android: 'arrow_drop_up', web: 'arrow_drop_up' } as const)
    : ({ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' } as const);

  const handleToggleSave = (place: SavedPlaceItem) => {
    setSavedPlacesSnapshot((current) =>
      current.filter((item) => item.placeId !== place.placeId),
    );
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
        <CustomText style={styles.headerTitle}>{t.saved.title}</CustomText>

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
          <CustomText style={styles.loadingText}>{t.saved.loading}</CustomText>
        </View>
      ) : savedPlaces.length === 0 ? (
        <View style={styles.emptyState}>
          <CustomText style={styles.emptyTitle}>{t.saved.emptyTitle}</CustomText>
          <CustomText style={styles.emptyDescription}>{t.saved.emptyDescription}</CustomText>
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
              language={language}
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
        options={sortOptions}
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
  language,
  onPress,
  onToggleSave,
}: {
  place: SavedPlaceItem;
  language: LanguageCode;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const subtitleText = formatSavedPlaceSubtitle(place, language);
  const heartIcon = <HeartIcon filled color={Palette.red300} size={20} />;

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
            <CustomText style={styles.travelStyle}>
              {formatTravelStyle(place.travelStyle, language)}
            </CustomText>
            <CustomText numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {formatSavedPlaceTitle(place, language)}
            </CustomText>
            {subtitleText ? (
              <CustomText numberOfLines={1} ellipsizeMode="tail" style={styles.subtitle}>
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
          {place.tags
            .map((tag) => formatSavedTag(tag, language))
            .filter((tag) => !isHiddenSavedTag(tag))
            .slice(0, 3)
            .map((tag, index) => (
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
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SavedSortOrder;
  options: SavedSortOption[];
  onSelect: (value: SavedSortOrder) => void;
  onClose: () => void;
}) {
  const t = useTranslation();
  const [translateY] = useState(() => new Animated.Value(SORT_SHEET_HEIGHT));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  // The parent toggles `visible` directly (no close handshake), so the exit
  // animation has to be kept alive across the render where `visible` flips
  // to false — deriving `isClosing` here (React's documented "adjust state
  // during render" escape hatch) instead of in an effect keeps this in sync
  // on the very same render, before the sheet would otherwise unmount.
  const [prevVisible, setPrevVisible] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setIsClosing(true);
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: SORT_SHEET_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: SORT_SHEET_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!isClosing) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SORT_SHEET_HEIGHT,
        duration: SORT_SHEET_ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: SORT_SHEET_ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsClosing(false);
    });
  }, [visible, isClosing, translateY, overlayOpacity]);

  if (!visible && !isClosing) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetOverlayContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.sheetOverlayBackground, { opacity: overlayOpacity }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandleArea}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetContent}>
            <CustomText style={styles.sheetTitle}>{t.saved.sortTitle}</CustomText>

            <View style={styles.sheetOptions}>
              {options.map((option) => {
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
        </Animated.View>
      </View>
    </Modal>
  );
}

function formatSavedPlaceTitle(place: SavedPlaceItem, language: LanguageCode) {
  return TITLE_TRANSLATIONS[language][place.title] ?? place.title;
}

function formatSavedPlaceSubtitle(place: SavedPlaceItem, language: LanguageCode) {
  if (language === 'EN') {
    if (place.festivalOccurrence) {
      return formatEnglishDateRange(place.festivalOccurrence.startDate, place.festivalOccurrence.endDate);
    }

    if (place.scheduleText) {
      return formatEnglishScheduleText(place.scheduleText);
    }

    return null;
  }

  if (place.festivalOccurrence) {
    return formatKoreanDateRange(place.festivalOccurrence.startDate, place.festivalOccurrence.endDate);
  }

  if (place.scheduleText) {
    return formatKoreanScheduleText(place.scheduleText);
  }

  return null;
}

function formatTravelStyle(value: string, language: LanguageCode) {
  return TRAVEL_STYLE_LABELS[language][value] ?? value;
}

function formatSavedTag(value: string, language: LanguageCode) {
  const normalized = value.trim().replace(/^#+\s*/, '');
  return TAG_TRANSLATIONS[language][normalized] ?? normalized;
}

function isHiddenSavedTag(value: string) {
  const normalized = value.trim().replace(/^#+\s*/, '').replace(/[\s_]+/g, '').toLowerCase();
  return normalized === '지역축제' || normalized === 'localfestival';
}

function formatEnglishDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  });

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const startParts = formatter.formatToParts(start);
  const endParts = formatter.formatToParts(end);

  const formatParts = (parts: Intl.DateTimeFormatPart[]) => {
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return `${month} ${day} (${weekday})`.trim();
  };

  return `${formatParts(startParts)} - ${formatParts(endParts)}`;
}

function formatKoreanDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  });

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const formatParts = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return `${month}.${day}(${weekday})`.trim();
  };

  return `${formatParts(start)} - ${formatParts(end)}`;
}

function formatEnglishScheduleText(scheduleText: string) {
  const parts = splitScheduleParts(scheduleText);
  if (parts.length !== 2) {
    return scheduleText;
  }

  const start = formatEnglishTime(parts[0]);
  const end = formatEnglishTime(parts[1]);
  if (start === null || end === null) {
    return scheduleText;
  }

  return `${start} - ${end}`;
}

function formatKoreanScheduleText(scheduleText: string) {
  const parts = splitScheduleParts(scheduleText);
  if (parts.length !== 2) {
    return scheduleText;
  }

  const start = formatKoreanTime(parts[0]);
  const end = formatKoreanTime(parts[1]);
  if (start === null || end === null) {
    return scheduleText;
  }

  return `${start} ~ ${end}`;
}

function splitScheduleParts(scheduleText: string) {
  return scheduleText.includes('~')
    ? scheduleText.split('~').map((part) => part.trim())
    : scheduleText.split('-').map((part) => part.trim());
}

function formatEnglishTime(value: string) {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) {
    return null;
  }

  const date = new Date(Date.UTC(2026, 0, 1, Math.floor(minutes / 60), minutes % 60));
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date).replace(/\u202f/g, ' ');
}

function formatKoreanTime(value: string) {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) {
    return null;
  }

  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function parseTimeToMinutes(value: string) {
  const trimmed = value.trim();
  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    return Number(twentyFourHourMatch[1]) * 60 + Number(twentyFourHourMatch[2]);
  }

  const twelveHourMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]) % 12;
    const minutes = Number(twelveHourMatch[2] ?? '00');
    if (twelveHourMatch[3].toUpperCase() === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  return null;
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
    fontFamily: FontFamily.pretendard.medium,
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
    fontFamily: FontFamily.pretendard.medium,
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
  sheetOverlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetOverlayBackground: {
    backgroundColor: 'rgba(28,28,26,0.7)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
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
    fontFamily: FontFamily.pretendard.medium,
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
    fontFamily: FontFamily.pretendard.medium,
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
