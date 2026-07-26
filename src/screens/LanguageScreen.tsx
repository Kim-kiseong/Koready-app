import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LanguageCode } from '@/api/types';
import CustomText from '@/components/CustomText';
import PrimaryButton from '@/components/PrimaryButton';
import SelectableCard from '@/components/SelectableCard';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/language-store';

export default function LanguageScreen() {
  const router = useRouter();
  const t = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<LanguageCode | null>(null);

  const handleNext = () => {
    if (!selected) return;
    // TODO: sync preferredLanguage to the backend once that endpoint exists.
    setLanguage(selected);
    router.push('/purpose');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerGroup}>
          <CustomText style={styles.title}>{t.language.title}</CustomText>
          <CustomText style={styles.subtitle}>{t.language.subtitle}</CustomText>
        </View>

        <View style={styles.cardList}>
          <SelectableCard
            title="English"
            subtitle="영어"
            selected={selected === 'EN'}
            onPress={() => setSelected('EN')}
          />
          <SelectableCard
            title="한국어"
            subtitle="Korean"
            selected={selected === 'KO'}
            onPress={() => setSelected('KO')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title={t.language.next} disabled={!selected} onPress={handleNext} />
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
  cardList: {
    gap: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
