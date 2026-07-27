import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { completeOnboarding } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function CompleteScreen() {
  const router = useRouter();
  const t = useTranslation();
  const purpose = useOnboardingStore((state) => state.purpose);
  const location = useOnboardingStore((state) => state.location);
  const travelStyles = useOnboardingStore((state) => state.travelStyles);
  const currentLocationId = useOnboardingStore((state) => state.currentLocationId);
  const candidateSetId = useOnboardingStore((state) => state.candidateSetId);
  const candidateSetVersion = useOnboardingStore((state) => state.candidateSetVersion);
  const selectedPreferencePlaceIds = useOnboardingStore((state) => state.selectedPreferencePlaceIds);
  const setNextStep = useAuthStore((state) => state.setNextStep);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: currentLocationId/candidateSetId/candidateSetVersion/selectedPreferencePlaceIds
  // are only populated once the location-registration and place-candidate-set
  // APIs are wired into LocationScreen/DestinationScreen. Until then this stays
  // false for a fresh onboarding run.
  const canComplete =
    currentLocationId != null &&
    candidateSetId != null &&
    candidateSetVersion != null &&
    selectedPreferencePlaceIds.length > 0;

  const handleNext = async () => {
    if (!purpose || !location || isSubmitting) return;
    if (!canComplete) {
      // Expected until the location-registration and place-candidate-set
      // APIs are wired into LocationScreen/DestinationScreen (next task).
      Alert.alert('준비 중', '위치·여행지 선택 연동이 완료되면 이용할 수 있어요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await completeOnboarding({
        currentLocationId,
        travelStyles,
        candidateSetId,
        candidateSetVersion,
        selectedPreferencePlaceIds,
      });
      setNextStep(result.nextStep);
      resetOnboarding();
      router.replace('/home');
    } catch (error) {
      // A retried submit after a dropped response lands here as 409
      // ONBOARDING_ALREADY_COMPLETED — safe to treat as success.
      if (isAxiosError(error) && error.response?.status === 409) {
        setNextStep('COMPLETED');
        resetOnboarding();
        router.replace('/home');
        return;
      }
      Alert.alert('오류', error instanceof Error ? error.message : '온보딩 완료에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} />

      <View style={styles.content}>
        <Image
          source={require('@/assets/images/hi-hori-v1.png')}
          style={styles.mascot}
          contentFit="contain"
        />
        <View style={styles.textGroup}>
          <CustomText style={styles.title}>{t.complete.title}</CustomText>
          <CustomText style={styles.subtitle}>{t.complete.subtitle}</CustomText>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title={t.complete.next} disabled={isSubmitting} onPress={handleNext} />
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  mascot: {
    width: 94,
    height: 120,
  },
  textGroup: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.grey900,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey400,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
