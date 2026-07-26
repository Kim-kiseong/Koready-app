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
import CustomText from '@/components/CustomText';
import EnjoyPoints from '@/components/place-detail/EnjoyPoints';
import NearbyPlaceCard from '@/components/place-detail/NearbyPlaceCard';
import PlaceDescription from '@/components/place-detail/PlaceDescription';
import PlaceDetailTabs from '@/components/place-detail/PlaceDetailTabs';
import PlaceImageCarousel from '@/components/place-detail/PlaceImageCarousel';
import PlaceInfo from '@/components/place-detail/PlaceInfo';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useSavedPlaceStore } from '@/store/saved-place-store';

export default function PlaceDetailScreen() {
  const router = useRouter();

  const { placeId } =
    useLocalSearchParams<{
      placeId: string;
    }>();

  const t = useTranslation();

  const [place, setPlace] =
    useState<PlaceDetail | null>(null);

  const [activeTab, setActiveTab] =
    useState<PlaceDetailTab>(
      'DESCRIPTION',
    );

  const hasHydrated =
    useSavedPlaceStore(
      (state) => state.hasHydrated,
    );

  const savedByPlaceId =
    useSavedPlaceStore(
      (state) => state.savedByPlaceId,
    );

  const initializePlace =
    useSavedPlaceStore(
      (state) => state.initializePlace,
    );

  const togglePlace =
    useSavedPlaceStore(
      (state) => state.togglePlace,
    );

  const isSaved = placeId
    ? Boolean(savedByPlaceId[placeId])
    : false;

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
  }, [placeId]);

  /*
   * SecureStore 복원이 끝난 뒤에만
   * API/mock 초기값을 스토어에 반영합니다.
   *
   * 이미 로컬 저장 이력이 있는 장소는
   * initializePlace 내부에서 덮어쓰지 않습니다.
   */
  useEffect(() => {
    if (
      !placeId ||
      !place ||
      !hasHydrated
    ) {
      return;
    }

    initializePlace(
      placeId,
      place.isSaved,
    );
  }, [
    hasHydrated,
    initializePlace,
    place,
    placeId,
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

    togglePlace(placeId);
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top']}
    >
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
        >
          <SymbolView
            name={{
              ios: 'chevron.left',
              android: 'arrow_back_ios',
              web: 'arrow_back_ios',
            }}
            size={30}
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
              description={
                place.description
              }
              images={place.images}
            />

            <EnjoyPoints
              points={
                place.description
                  .enjoyPoints
              }
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

        {activeTab !==
          'DESCRIPTION' && (
          <View
            style={styles.placeholder}
          >
            <CustomText
              style={
                styles.placeholderText
              }
            >
              {activeTab === 'ROUTE'
                ? t.placeDetail
                    .routePlaceholder
                : t.placeDetail
                    .matePlaceholder}
            </CustomText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  topBar: {
    paddingHorizontal: 20,
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

  placeholder: {
    paddingVertical: 48,
    alignItems: 'center',
  },

  placeholderText: {
    fontFamily:
      FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.grey400,
  },
});
