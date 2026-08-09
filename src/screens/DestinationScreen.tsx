import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchCurrentCandidateSet, type OnboardingCandidateSetResponse } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import DestinationCard from '@/components/DestinationCard';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

// The dev-bypass session's token isn't real — sending it to GET
// /onboarding/place-candidate-sets/current 401s, which trips client.ts's
// refresh-then-logout cascade. Mirrors TermsScreen's same dev-only bypass.
const DEV_MOCK_CANDIDATE_SET: OnboardingCandidateSetResponse = {
  candidateSetId: 'dev-mock-candidate-set',
  version: 1,
  status: 'PUBLISHED',
  publishedAt: new Date().toISOString(),
  minSelection: 1,
  maxSelection: 3,
  items: [
    {
      placeId: 1,
      title: '경주 문화유산 나들이',
      imageUrl: 'https://picsum.photos/seed/gyeongju/600/600',
      serviceRegionCode: 'GYEONGSANG',
      serviceRegionName: '경상',
      travelStyle: 'CULTURE_EXPERIENCE',
      tags: ['역사', '전통'],
      curatorMessage: '경주의 문화유산을 느껴보세요.',
      displayOrder: 1,
    },
    {
      placeId: 2,
      title: '전주 한옥마을 나들이',
      imageUrl: 'https://picsum.photos/seed/jeonju/600/600',
      serviceRegionCode: 'JEOLLA',
      serviceRegionName: '전라',
      travelStyle: 'TRADITIONAL_MARKET',
      tags: ['한옥', '전통시장'],
      curatorMessage: '전주의 정취를 느껴보세요.',
      displayOrder: 2,
    },
    {
      placeId: 3,
      title: '부산 해운대 나들이',
      imageUrl: 'https://picsum.photos/seed/haeundae/600/600',
      serviceRegionCode: 'GYEONGSANG',
      serviceRegionName: '경상',
      travelStyle: 'NATURE',
      tags: ['바다', '산책'],
      curatorMessage: '해운대 바다를 즐겨보세요.',
      displayOrder: 3,
    },
  ],
};

export default function DestinationScreen() {
  const router = useRouter();
  const t = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
  const selectedPreferencePlaceIds = useOnboardingStore((state) => state.selectedPreferencePlaceIds);
  const toggleSelectedPreferencePlace = useOnboardingStore(
    (state) => state.toggleSelectedPreferencePlace,
  );
  const setCandidateSet = useOnboardingStore((state) => state.setCandidateSet);
  const [candidateSet, setCandidateSetData] = useState<OnboardingCandidateSetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDevMockSession) {
      setCandidateSetData(DEV_MOCK_CANDIDATE_SET);
      setCandidateSet(DEV_MOCK_CANDIDATE_SET.candidateSetId, DEV_MOCK_CANDIDATE_SET.version);
      setIsLoading(false);
      return;
    }
    fetchCurrentCandidateSet()
      .then((data) => {
        setCandidateSetData(data);
        setCandidateSet(data.candidateSetId, data.version);
      })
      .catch(() => {
        Alert.alert('오류', '여행지 후보를 불러오지 못했습니다.');
      })
      .finally(() => setIsLoading(false));
  }, [setCandidateSet, isDevMockSession]);

  const handleNext = () => {
    if (selectedPreferencePlaceIds.length === 0) return;
    router.push('/complete');
  };

  const sortedItems = candidateSet
    ? [...candidateSet.items].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  // Always 3 per the API's maxSelection enum — sortedItems is empty until
  // candidateSet loads anyway, so this default never actually gets tapped.
  const maxSelection = candidateSet?.maxSelection ?? 3;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router, '/login')} progress={{ currentStep: 2, totalSteps: 2 }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerGroup}>
          <CustomText style={styles.title}>{t.destination.title}</CustomText>
          <CustomText style={styles.subtitle}>{t.destination.subtitle}</CustomText>
        </View>

        <View style={styles.grid}>
          {sortedItems.map((item) => (
            <DestinationCard
              key={item.placeId}
              item={item}
              selected={selectedPreferencePlaceIds.includes(item.placeId)}
              onPress={() => toggleSelectedPreferencePlace(item.placeId, maxSelection)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={t.destination.next}
          disabled={isLoading || selectedPreferencePlaceIds.length === 0}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
  },
  headerGroup: {
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.grey900,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey400,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 13,
    rowGap: 15,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
