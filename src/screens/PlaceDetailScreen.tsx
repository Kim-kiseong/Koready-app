import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { recordRecommendationEvent } from '@/api/picks';
import {
  fetchPlaceDetail,
  type PlaceDetail,
  type PlaceDetailTab,
} from '@/api/place';
import {
  buildSavedPlaceFromPlaceDetail,
  fetchSavedPlaceStatus,
  savePlace,
  unsavePlace,
} from '@/api/saved-place';
import CustomText from '@/components/CustomText';
import BackIcon from '@/components/icons/BackIcon';
import BuddyRouteTab from '@/components/place-detail/BuddyRouteTab';
import EnjoyPoints from '@/components/place-detail/EnjoyPoints';
import MateTab from '@/components/place-detail/MateTab';
import NearbyPlaceCard from '@/components/place-detail/NearbyPlaceCard';
import PlaceDescription from '@/components/place-detail/PlaceDescription';
import PlaceDetailTabs from '@/components/place-detail/PlaceDetailTabs';
import PlaceImageCarousel from '@/components/place-detail/PlaceImageCarousel';
import PlaceInfo from '@/components/place-detail/PlaceInfo';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';

const KOREA_TOURISM_ORGANIZATION_URL = 'https://korean.visitkorea.or.kr/main/main.do';

function normalizePlaceDetailTab(tab?: string): PlaceDetailTab {
  if (tab === 'ROUTE' || tab === 'MATES') {
    return tab;
  }

  if (tab === 'MATE') {
    return 'MATES';
  }

  return 'DESCRIPTION';
}

function resolveVisiblePlaceTabs(tabs?: PlaceDetailTab[]): PlaceDetailTab[] {
  const baseTabs: PlaceDetailTab[] =
    tabs?.length
      ? tabs
      : ['DESCRIPTION', 'ROUTE', 'MATES'];

  if (baseTabs.includes('ROUTE')) {
    return baseTabs;
  }

  const nextTabs: PlaceDetailTab[] = [...baseTabs];
  const descriptionIndex = nextTabs.indexOf('DESCRIPTION');

  if (descriptionIndex >= 0) {
    nextTabs.splice(descriptionIndex + 1, 0, 'ROUTE');
  } else {
    nextTabs.unshift('ROUTE');
  }

  return nextTabs;
}

export default function PlaceDetailScreen() {
  const viewerPublicId = useAuthStore((state) => state.user?.publicId ?? null);
  const { placeId, tab, deckId } =
    useLocalSearchParams<{
      placeId: string;
      tab?: string;
      deckId?: string;
    }>();
  const normalizedTab = Array.isArray(tab) ? tab[0] : tab;
  const normalizedDeckId = Array.isArray(deckId) ? deckId[0] : deckId;

  return (
    <PlaceDetailScreenContent
      key={`${viewerPublicId ?? 'guest'}:${placeId ?? 'unknown'}`}
      placeId={placeId}
      normalizedTab={normalizedTab}
      deckId={normalizedDeckId}
    />
  );
}

function PlaceDetailScreenContent({
  placeId,
  normalizedTab,
  deckId,
}: {
  placeId: string;
  normalizedTab?: string;
  deckId?: string;
}) {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);

  const [place, setPlace] =
    useState<PlaceDetail | null>(null);

  const initialTab: PlaceDetailTab = normalizePlaceDetailTab(normalizedTab);

  const [activeTab, setActiveTab] =
    useState<PlaceDetailTab>(initialTab);
  const [optimisticSavedState, setOptimisticSavedState] = useState<boolean | null>(null);

  const hasHydrated =
    useSavedPlaceStore(
      (state) => state.hasHydrated,
    );

  const upsertSavedPlace =
    useSavedPlaceStore(
      (state) => state.upsertSavedPlace,
    );

  const removeSavedPlace =
    useSavedPlaceStore(
      (state) => state.removeSavedPlace,
    );

  const isSaved =
    optimisticSavedState ??
    place?.isSaved ??
    false;

  const visibleTabs = resolveVisiblePlaceTabs(place?.availableTabs);
  const resolvedTab = visibleTabs.includes(activeTab)
    ? activeTab
    : visibleTabs[0] ?? 'DESCRIPTION';

  const description = place?.description ?? null;

  useEffect(() => {
    if (!placeId) {
      return;
    }

    let isMounted = true;

    Promise.all([
      fetchPlaceDetail(placeId),
      fetchSavedPlaceStatus(placeId),
    ]).then(
      ([detail, verifiedSavedState]) => {
        if (isMounted) {
          setPlace({
            ...detail,
            isSaved: verifiedSavedState,
          });
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [placeId, language]);

  // The protected saved-list check is the source of truth when entering this
  // screen. Local state is only used for the current optimistic toggle, so a
  // previous account can never override the current viewer's saved status.
  useEffect(() => {
    if (!placeId || !place || !hasHydrated) {
      return;
    }

    if (!place.isSaved) {
      removeSavedPlace(placeId);
      return;
    }

    upsertSavedPlace(buildSavedPlaceFromPlaceDetail(place, 'PLACE_DETAIL'));
  }, [
    hasHydrated,
    place,
    placeId,
    removeSavedPlace,
    upsertSavedPlace,
  ]);

  if (!place || !hasHydrated) {
    return (
      <SafeAreaView
        style={styles.loading}
      >
        <ActivityIndicator
          color={Palette.primary}
        />

        <CustomText
          style={styles.loadingText}
        >
          {t.placeDetail.loading}
        </CustomText>
      </SafeAreaView>
    );
  }

  const handleToggleSave = () => {
    if (!placeId) {
      return;
    }

    const placeNumericId = place.numericId ?? Number(placeId);
    if (!Number.isFinite(placeNumericId)) {
      return;
    }

    const nextSavedState = !isSaved;
    setOptimisticSavedState(nextSavedState);

    if (isSaved) {
      removeSavedPlace(placeId);
      void unsavePlace(placeNumericId).catch(() => {
        setOptimisticSavedState(true);
      });
      return;
    }

    const snapshot = buildSavedPlaceFromPlaceDetail(place, 'PLACE_DETAIL');
    upsertSavedPlace(snapshot);
    void savePlace(placeNumericId, 'PLACE_DETAIL', snapshot).catch(() => {
      setOptimisticSavedState(false);
    });
  };

  const handleViewRouteDetail = (routeId: string) => {
    const placeNumericId = Number(placeId);
    if (deckId && deckId !== 'dev-mock-deck' && Number.isFinite(placeNumericId)) {
      recordRecommendationEvent(deckId, placeNumericId, 'ROUTE_OPENED').catch(() => {});
    }

    router.push({
      pathname: '/routes/[routeId]',
      params: {
        routeId,
        placeId,
        placeName: place.title,
        placeAddress: place.address,
        destinationPlaceId: place.numericId != null ? String(place.numericId) : undefined,
        deckId: deckId ?? undefined,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top']}
    >
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => goBackOrRoot(router)}
        >
          <BackIcon />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <PlaceImageCarousel
          images={place.images}
        />

        <PlaceInfo
          title={place.title}
          address={place.address}
          tags={place.tags}
          isSaved={isSaved}
          onToggleSave={
            handleToggleSave
          }
        />

        <PlaceDetailTabs
          activeTab={resolvedTab}
          tabs={visibleTabs}
          onChange={setActiveTab}
        />

        {resolvedTab ===
          'DESCRIPTION' && (
          <>
            <PlaceDescription
              description={description}
              images={place.images}
            />

            <EnjoyPoints
              points={description?.enjoyPoints ?? []}
            />

            <TourismSourceAttribution />

            <View
              style={
                styles.nearbySection
              }
            >
              <CustomText
                style={
                  styles.sectionTitle
                }
              >
                {
                  t.placeDetail
                    .nearbyTitle
                }
              </CustomText>

              {place.relatedPlaces.map(
                (relatedPlace) => (
                  <NearbyPlaceCard
                    key={
                      relatedPlace.id
                    }
                    place={
                      relatedPlace
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          '/places/[placeId]',
                        params: {
                          placeId:
                            relatedPlace.id,
                        },
                      })
                    }
                  />
                ),
              )}
            </View>
          </>
        )}

        {resolvedTab === 'ROUTE' && placeId && (
          <BuddyRouteTab
            placeId={placeId}
            destinationPlaceId={place.numericId ?? null}
            destination={{
              name: place.title,
              address: place.address,
            }}
            onViewDetail={handleViewRouteDetail}
          />
        )}

        {resolvedTab === 'MATES' && placeId ? (
          <MateTab
            placeId={placeId}
            placeTitle={place.title}
            placeRouteId={place.routeId ?? place.id}
            placeAddress={place.address}
            placeImageUrl={getFirstPlaceImageUrl(place)}
            placeNumericId={place.numericId}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function getFirstPlaceImageUrl(place: PlaceDetail) {
  const source = place.images[0]?.source;

  if (!source || typeof source !== 'object' || Array.isArray(source) || !('uri' in source)) {
    return undefined;
  }

  return typeof source.uri === 'string' ? source.uri : undefined;
}

function TourismSourceAttribution() {
  const handlePress = () => {
    void Linking.openURL(KOREA_TOURISM_ORGANIZATION_URL);
  };

  return (
    <View style={styles.sourceAttributionRow}>
      <CustomText style={styles.sourceAttribution}>제공</CustomText>
      <CustomText style={styles.sourceAttributionLink} onPress={handlePress}>
        ©한국관광공사
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  content: {
    paddingBottom: 48,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
  },

  loadingText: {
    fontFamily:
      FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },

  sourceAttributionRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  sourceAttribution: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.26,
    color: '#6B7684',
  },

  sourceAttributionLink: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.26,
    color: '#6B7684',
    textDecorationLine: 'underline',
  },

  nearbySection: {
    paddingHorizontal: 24,
    marginTop: 30,
  },

  sectionTitle: {
    marginBottom: 16,
    fontFamily:
      FontFamily.pretendard.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.text,
  },

});
