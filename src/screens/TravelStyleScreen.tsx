import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAVEL_STYLE_IDS } from '@/api/onboarding';
import Chip from '@/components/Chip';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function TravelStyleScreen() {
  const router = useRouter();
  const t = useTranslation();
  const travelStyles = useOnboardingStore((state) => state.travelStyles);
  const toggleTravelStyle = useOnboardingStore((state) => state.toggleTravelStyle);

  const handleNext = () => {
    if (travelStyles.length === 0) return;
    router.push('/destinations');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} progress={{ currentStep: 2, totalSteps: 3 }} />

      <View style={styles.content}>
        <View style={styles.headerGroup}>
          <CustomText style={styles.title}>{t.travelStyle.title}</CustomText>
          <CustomText style={styles.subtitle}>{t.travelStyle.subtitle}</CustomText>
        </View>

        <View style={styles.chipList}>
          {TRAVEL_STYLE_IDS.map((id) => (
            <Chip
              key={id}
              label={t.travelStyle.options[id]}
              selected={travelStyles.includes(id)}
              onPress={() => toggleTravelStyle(id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={t.travelStyle.next}
          disabled={travelStyles.length === 0}
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
