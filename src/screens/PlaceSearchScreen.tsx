import { isAxiosError } from 'axios';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchPlaces } from '@/api/place';
import { buildSavedPlaceFromPlaceListItem, savePlace, unsavePlace } from '@/api/saved-place';
import type { LanguageCode, PlaceListItem } from '@/api/types';
import CustomText from '@/components/CustomText';
import HeartIcon from '@/components/HeartIcon';
import OnboardingHeader from '@/components/OnboardingHeader';
import DetailTag from '@/components/place-detail/DetailTag';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/language-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';
import { formatPlaceTitle, formatPlaceTravelStyle } from '@/utils/place-i18n';

const SEARCH_DEBOUNCE_MS = 400;

export default function PlaceSearchScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const upsertSavedPlace = useSavedPlaceStore((state) => state.upsertSavedPlace);
  const removeSavedPlace = useSavedPlaceStore((state) => state.removeSavedPlace);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const trimmedQuery = query.trim();

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  };

  useEffect(() => {
    if (trimmedQuery.length === 0) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(trimmedQuery, null, 20, controller.signal)
        .then((response) => {
          setResults(response.items);
          setHasSearched(true);
          setIsLoading(false);
        })
        .catch((error) => {
          if (isAxiosError(error) && error.code === 'ERR_CANCELED') return;
          setResults([]);
          setHasSearched(true);
          setIsLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const handleToggleSave = (place: PlaceListItem) => {
    const nextSaved = !place.saved;
    setResults((prev) =>
      prev.map((item) => (item.placeId === place.placeId ? { ...item, saved: nextSaved } : item)),
    );

    if (nextSaved) {
      const snapshot = buildSavedPlaceFromPlaceListItem({ ...place, saved: true }, 'MAP');
      upsertSavedPlace(snapshot);
      void savePlace(place.placeId, 'MAP', snapshot).catch(() => {});
      return;
    }

    removeSavedPlace(place.placeId);
    void unsavePlace(place.placeId).catch(() => {});
  };

  const showEmptyState = !isLoading && hasSearched && results.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} title="" rightIcon={<View style={styles.headerSpacer} />} />

      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="regular"
            tintColor={Palette.grey400}
          />
          <TextInput
            autoFocus
            value={query}
            onChangeText={handleQueryChange}
            placeholder={t.home.searchPlaceholder}
            placeholderTextColor={Palette.grey400}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleQueryChange('')} hitSlop={8}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                size={20}
                weight="regular"
                tintColor={Palette.grey350}
              />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      ) : showEmptyState ? (
        <View style={styles.centerState}>
          <Image
            source={require('@/assets/images/search/no-results-mascot.png')}
            style={styles.emptyImage}
            contentFit="contain"
          />
          <CustomText style={styles.emptyTitle}>{t.placeSearch.emptyTitle}</CustomText>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.placeId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <PlaceSearchResultCard
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
        />
      )}
    </SafeAreaView>
  );
}

function getDDayLabel(place: PlaceListItem) {
  if (!place.festivalOccurrence) return '';
  const startDate = new Date(`${place.festivalOccurrence.startDate}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.ceil((startDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

function PlaceSearchResultCard({
  place,
  language,
  onPress,
  onToggleSave,
}: {
  place: PlaceListItem;
  language: LanguageCode;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const subtitleText = place.festivalOccurrence?.dateRangeText ?? null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {place.imageUrl && <Image source={{ uri: place.imageUrl }} style={styles.image} contentFit="cover" />}
        {place.festivalOccurrence ? (
          <View style={styles.dDayBadge}>
            <CustomText style={styles.dDayText}>{getDDayLabel(place)}</CustomText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTextGroup}>
            <CustomText style={styles.travelStyle}>{formatPlaceTravelStyle(place.travelStyle, language)}</CustomText>
            <CustomText numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {formatPlaceTitle(place.title, language)}
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
            <HeartIcon filled={place.saved} color={place.saved ? Palette.red300 : Palette.grey400} size={24} />
          </Pressable>
        </View>

        {place.tags.length > 0 && (
          <View style={styles.tagRow}>
            {place.tags.slice(0, 3).map((tag, index) => (
              <DetailTag key={`${place.placeId}-${index}`} label={tag} />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    // A flex item's default min-width is its content's intrinsic width, not
    // 0 — without this, the long placeholder ("오늘은 어떤 여행을 해보실래요?")
    // refuses to shrink and pushes the input (and its focus border) past
    // the search bar's right edge instead of just clipping/scrolling.
    minWidth: 0,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.text,
    padding: 0,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyImage: {
    width: 95,
    height: 120,
    aspectRatio: 19 / 24,
    transform: [{ translateY: -20 }],
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  emptyTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
    textAlign: 'center',
    transform: [{ translateY: -20 }],
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  heartButton: {
    padding: 0,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
