import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchPlaceDetail,
  type PlaceDetail,
  type PlaceDetailTab,
} from '@/api/place';
import {
  buildSavedPlaceFromPlaceDetail,
  savePlace,
  unsavePlace,
} from '@/api/saved-place';
import { recordRecommendationEvent } from '@/api/picks';
import CustomText from '@/components/CustomText';
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
import { useLanguageStore } from '@/store/language-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';

export default function PlaceDetailScreen() {
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
      key={placeId ?? 'unknown'}
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

  const initialTab: PlaceDetailTab =
    normalizedTab === 'ROUTE' || normalizedTab === 'MATE'
      ? normalizedTab
      : 'DESCRIPTION';

  const [activeTab, setActiveTab] =
    useState<PlaceDetailTab>(initialTab);
  const [optimisticSavedState, setOptimisticSavedState] = useState<boolean | null>(null);

  const hasHydrated =
    useSavedPlaceStore(
      (state) => state.hasHydrated,
    );

  const localSavedState =
    useSavedPlaceStore((state) =>
      placeId ? state.savedByPlaceId[placeId] : undefined,
    );

  const savedPlaceSnapshot = useSavedPlaceStore((state) =>
    placeId ? state.savedPlacesByPlaceId[placeId] : undefined,
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
    savedPlaceSnapshot?.saved ??
    localSavedState ??
    place?.isSaved ??
    false;

  useEffect(() => {
    if (!placeId) {
      return;
    }

    let isMounted = true;

    fetchPlaceDetail(placeId).then(
      (detail) => {
        if (isMounted) {
          setPlace(detail);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [placeId, language]);

  /*
   * SecureStore 복원이 끝난 뒤에만
   * API/mock 초기값을 스토어에 반영합니다.
   *
   * 이미 로컬 저장 이력이 있는 장소는
   * initializePlace 내부에서 덮어쓰지 않습니다.
   */
  useEffect(() => {
    if (!placeId || !place || !hasHydrated || !place.isSaved) {
      return;
    }

    if (localSavedState === false) {
      return;
    }

    upsertSavedPlace(buildSavedPlaceFromPlaceDetail(place, 'PLACE_DETAIL'));
  }, [
    hasHydrated,
    place,
    placeId,
    localSavedState,
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

  const description = place.description;

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
      if (__DEV__) {
        console.info('[picks] ROUTE_OPENED recording', {
          routeId,
          deckId,
          placeId,
        });
      }
      recordRecommendationEvent(deckId, placeNumericId, 'ROUTE_OPENED').catch(() => {});
    }

    router.push({
      pathname: '/routes/[routeId]',
      params: {
        routeId,
        placeId,
        placeName: place.title,
        placeAddress: place.address,
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
          <SymbolView
            name={{
              ios: 'chevron.left',
              android: 'arrow_back_ios',
              web: 'arrow_back_ios',
            }}
            size={18}
            weight="semibold"
            tintColor={Palette.text}
          />
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
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab ===
          'DESCRIPTION' && (
          <>
            <PlaceDescription
              description={description}
              images={place.images}
            />

            <EnjoyPoints
              points={description.enjoyPoints}
            />

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

        {activeTab === 'ROUTE' && placeId && (
          <BuddyRouteTab
            placeId={placeId}
            destination={{
              name: place.title,
              address: place.address,
            }}
            onViewDetail={handleViewRouteDetail}
          />
        )}

        {activeTab === 'MATE' && placeId ? (
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

  nearbySection: {
    paddingHorizontal: 24,
    marginTop: 40,
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
