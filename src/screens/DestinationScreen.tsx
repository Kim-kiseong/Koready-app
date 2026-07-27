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
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function DestinationScreen() {
  const router = useRouter();
  const t = useTranslation();
  const selectedPreferencePlaceIds = useOnboardingStore((state) => state.selectedPreferencePlaceIds);
  const toggleSelectedPreferencePlace = useOnboardingStore(
    (state) => state.toggleSelectedPreferencePlace,
  );
  const setCandidateSet = useOnboardingStore((state) => state.setCandidateSet);
  const [candidateSet, setCandidateSetData] = useState<OnboardingCandidateSetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentCandidateSet()
      .then((data) => {
        setCandidateSetData(data);
        setCandidateSet(data.candidateSetId, data.version);
      })
      .catch(() => {
        Alert.alert('오류', '여행지 후보를 불러오지 못했습니다.');
      })
      .finally(() => setIsLoading(false));
  }, [setCandidateSet]);

  const handleNext = () => {
    if (selectedPreferencePlaceIds.length === 0) return;
    router.push('/complete');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} progress={{ currentStep: 3, totalSteps: 3 }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerGroup}>
          <CustomText style={styles.title}>{t.destination.title}</CustomText>
          <CustomText style={styles.subtitle}>{t.destination.subtitle}</CustomText>
        </View>

        <View style={styles.grid}>
          {candidateSet?.items.map((item) => (
            <DestinationCard
              key={item.placeId}
              item={item}
              selected={selectedPreferencePlaceIds.includes(item.placeId)}
              onPress={() =>
                toggleSelectedPreferencePlace(item.placeId, candidateSet.maxSelection)
              }
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
