import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAVEL_STYLE_IDS, type TravelStyleId } from '@/api/onboarding';
import Chip from '@/components/Chip';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useOnboardingStore } from '@/store/onboarding-store';

const MAX_TRAVEL_STYLES = 4;

export default function TravelStyleScreen() {
  const router = useRouter();
  const t = useTranslation();
  const travelStyles = useOnboardingStore((state) => state.travelStyles);
  const toggleTravelStyle = useOnboardingStore((state) => state.toggleTravelStyle);

  // The store already caps selection at 4, but silently — block the 5th tap
  // here with a notice instead of letting it no-op with no feedback.
  const handleToggle = (style: TravelStyleId) => {
    if (!travelStyles.includes(style) && travelStyles.length >= MAX_TRAVEL_STYLES) {
      Alert.alert(t.travelStyle.alerts.noticeTitle, t.travelStyle.alerts.maxSelection);
      return;
    }
    toggleTravelStyle(style);
  };

  const handleNext = () => {
    if (travelStyles.length < 1) return;
    router.push('/destinations');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router, '/login')}
        progress={{ currentStep: 2, totalSteps: 3 }}
        rightIcon={null}
      />

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
              onPress={() => handleToggle(id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={t.travelStyle.next}
          disabled={travelStyles.length < 1}
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
