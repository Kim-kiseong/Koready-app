import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchDestinations, type Destination } from '@/api/onboarding';
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
  const destinations = useOnboardingStore((state) => state.destinations);
  const toggleDestination = useOnboardingStore((state) => state.toggleDestination);
  const [options, setOptions] = useState<Destination[]>([]);

  useEffect(() => {
    fetchDestinations().then(setOptions);
  }, []);

  const handleNext = () => {
    if (destinations.length === 0) return;
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
          {options.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              selected={destinations.includes(destination.id)}
              onPress={() => toggleDestination(destination.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={t.destination.next}
          disabled={destinations.length === 0}
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
