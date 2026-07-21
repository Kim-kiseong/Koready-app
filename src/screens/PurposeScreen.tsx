import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PURPOSE_IDS } from '@/api/onboarding';
import Chip from '@/components/Chip';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function PurposeScreen() {
  const router = useRouter();
  const t = useTranslation();
  const purpose = useOnboardingStore((state) => state.purpose);
  const setPurpose = useOnboardingStore((state) => state.setPurpose);

  const handleNext = () => {
    if (!purpose) return;
    router.push('/location');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} progress={{ currentStep: 1, totalSteps: 3 }} />

      <View style={styles.content}>
        <View style={styles.headerGroup}>
          <CustomText style={styles.title}>{t.purpose.title}</CustomText>
          <CustomText style={styles.subtitle}>{t.purpose.subtitle}</CustomText>
        </View>

        <View style={styles.chipList}>
          {PURPOSE_IDS.map((id) => (
            <Chip
              key={id}
              label={t.purpose.options[id]}
              selected={purpose === id}
              onPress={() => setPurpose(id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title={t.purpose.next} disabled={!purpose} onPress={handleNext} />
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
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
