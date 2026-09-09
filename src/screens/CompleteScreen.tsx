import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import type { ApiErrorEnvelope } from '@/api/client';
import { completeOnboarding, fetchOnboardingProgress } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveOnboardingResumeRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function CompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  // The dev-bypass session's token isn't real — sending it to PUT
  // /users/me/onboarding 401s, which trips client.ts's refresh-then-logout
  // cascade. Mirrors TermsScreen's same dev-only bypass; since it never calls
  // the real API, it doesn't need real currentLocationId/candidateSet ids either.
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
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
  const clearCompletedFlowSelections = useOnboardingStore((state) => state.clearCompletedFlowSelections);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canComplete = isDevMockSession
    ? selectedPreferencePlaceIds.length > 0
    : currentLocationId != null &&
      candidateSetId != null &&
      candidateSetVersion != null &&
      selectedPreferencePlaceIds.length > 0;

  // Maps each documented PUT /users/me/onboarding error code to the specific
  // recovery the spec calls for, rather than a single generic failure message.
  const handleCompletionError = async (error: unknown) => {
    if (!isAxiosError<ApiErrorEnvelope>(error)) {
      Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.genericFailed);
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
          clearCompletedFlowSelections();
          router.replace('/home');
        } else {
          Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.alreadyCompletedOther);
          router.replace(await resolveOnboardingResumeRoute());
        }
      } catch {
        Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.resumeCheckFailed);
      }
      return;
    }

    switch (code) {
      case 'ONBOARDING_LOCATION_INVALID':
        setCurrentLocationId(null);
        Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.invalidLocation);
        router.replace('/location');
        return;
      case 'ONBOARDING_TRAVEL_STYLES_INVALID':
        Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.invalidTravelStyles);
        router.replace('/travel-style');
        return;
      case 'ONBOARDING_CANDIDATE_SET_INVALID':
        clearPreferencePlaceSelection();
        Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.invalidCandidateSet);
        router.replace('/destinations');
        return;
      case 'ONBOARDING_SELECTION_INVALID':
        clearPreferencePlaceSelection();
        Alert.alert(t.complete.alerts.errorTitle, t.complete.alerts.invalidSelection);
        router.replace('/destinations');
        return;
      default:
        Alert.alert(t.complete.alerts.errorTitle, error.response?.data?.message || t.complete.alerts.genericFailed);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    if (!canComplete) {
      Alert.alert(t.complete.alerts.noticeTitle, t.complete.alerts.incompleteSelection);
      return;
    }
    if (isDevMockSession) {
      setNextStep('COMPLETED');
      clearCompletedFlowSelections();
      router.replace('/home');
      return;
    }
    // Non-dev-mock canComplete already guarantees these are non-null — narrows
    // them for the real API call below (the ternary above loses that link).
    if (currentLocationId == null || candidateSetId == null || candidateSetVersion == null) return;
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
      clearCompletedFlowSelections();
      router.replace('/home');
    } catch (error) {
      await handleCompletionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader onBack={() => router.replace('/destinations')} rightIcon={null} />

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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 34) }]}>
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
