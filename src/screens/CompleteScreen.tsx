import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { submitOnboarding } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function CompleteScreen() {
  const router = useRouter();
  const t = useTranslation();
  const purpose = useOnboardingStore((state) => state.purpose);
  const location = useOnboardingStore((state) => state.location);
  const travelStyles = useOnboardingStore((state) => state.travelStyles);
  const destinations = useOnboardingStore((state) => state.destinations);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!purpose || !location) return;
    setIsSubmitting(true);
    try {
      // TODO: once submitOnboarding returns a real session/nextStep, update
      // auth-store's nextStep from 'ONBOARDING' to 'COMPLETED' here.
      await submitOnboarding({ purpose, location, travelStyles, destinations });
      router.replace('/home');
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
