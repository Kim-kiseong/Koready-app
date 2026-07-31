import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import type { ApiErrorEnvelope } from '@/api/client';
import { completeOnboarding, fetchOnboardingProgress } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveOnboardingResumeRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function CompleteScreen() {
  const router = useRouter();
  const t = useTranslation();
  const travelStyles = useOnboardingStore((state) => state.travelStyles);
  const currentLocationId = useOnboardingStore((state) => state.currentLocationId);
  const candidateSetId = useOnboardingStore((state) => state.candidateSetId);
  const candidateSetVersion = useOnboardingStore((state) => state.candidateSetVersion);
  const selectedPreferencePlaceIds = useOnboardingStore((state) => state.selectedPreferencePlaceIds);
  const setCurrentLocationId = useOnboardingStore((state) => state.setCurrentLocationId);
  const clearPreferencePlaceSelection = useOnboardingStore(
    (state) => state.clearPreferencePlaceSelection,
  );
  const setNextStep = useAuthStore((state) => state.setNextStep);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canComplete =
    currentLocationId != null &&
    candidateSetId != null &&
    candidateSetVersion != null &&
    selectedPreferencePlaceIds.length > 0;

  // Maps each documented PUT /users/me/onboarding error code to the specific
  // recovery the spec calls for, rather than a single generic failure message.
  const handleCompletionError = async (error: unknown) => {
    if (!isAxiosError<ApiErrorEnvelope>(error)) {
      Alert.alert('오류', '온보딩 완료에 실패했습니다.');
      return;
    }
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // A retry after a dropped response can land here as 409. Never overwrite
    // what's already saved — re-read the authoritative state instead.
    if (status === 409 && code === 'ONBOARDING_ALREADY_COMPLETED') {
      try {
        const progress = await fetchOnboardingProgress();
        if (progress.completed) {
          setNextStep('COMPLETED');
          resetOnboarding();
          router.replace('/home');
        } else {
          Alert.alert('오류', '이미 다른 선택으로 완료된 온보딩이에요.');
          router.replace(await resolveOnboardingResumeRoute());
        }
      } catch {
        Alert.alert('오류', '저장된 온보딩 상태를 확인하지 못했어요. 다시 시도해 주세요.');
      }
      return;
    }

    switch (code) {
      case 'ONBOARDING_LOCATION_INVALID':
        setCurrentLocationId(null);
        Alert.alert('오류', '위치 정보가 유효하지 않아요. 위치를 다시 선택해 주세요.');
        router.replace('/location');
        return;
      case 'ONBOARDING_TRAVEL_STYLES_INVALID':
        Alert.alert('오류', '여행 스타일을 1~4개, 중복 없이 다시 선택해 주세요.');
        router.replace('/travel-style');
        return;
      case 'ONBOARDING_CANDIDATE_SET_INVALID':
        clearPreferencePlaceSelection();
        Alert.alert('오류', '여행지 후보가 갱신됐어요. 다시 선택해 주세요.');
        router.replace('/destinations');
        return;
      case 'ONBOARDING_SELECTION_INVALID':
        clearPreferencePlaceSelection();
        Alert.alert('오류', '선택한 여행지를 확인해 주세요 (1~3개, 같은 후보 세트).');
        router.replace('/destinations');
        return;
      default:
        Alert.alert('오류', error.response?.data?.message || '온보딩 완료에 실패했습니다.');
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    if (!canComplete) {
      Alert.alert('알림', '위치와 여행지를 모두 선택해야 완료할 수 있어요.');
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
      await handleCompletionError(error);
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
