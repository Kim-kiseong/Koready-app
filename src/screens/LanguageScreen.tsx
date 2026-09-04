import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { updateMyLanguage } from '@/api/user';
import type { LanguageCode } from '@/api/types';
import CustomText from '@/components/CustomText';
import PrimaryButton from '@/components/PrimaryButton';
import SelectableCard from '@/components/SelectableCard';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveNextStepRoute, resolveNextStepRouteSkippingTerms } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';

export default function LanguageScreen() {
  const router = useRouter();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore((state) => state.accessToken);
  const applyLanguageChange = useAuthStore((state) => state.applyLanguageChange);
  // The dev-bypass session's token isn't real — sending it to PATCH
  // /users/me/language 401s, which trips client.ts's refresh-then-logout
  // cascade and bounces the app back to /login. Mirrors TermsScreen's same
  // dev-only bypass.
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
  const [selected, setSelected] = useState<LanguageCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!selected || isSubmitting) return;
    if (isDevMockSession) {
      applyLanguageChange({ language: selected, nextStep: 'ONBOARDING', updatedAt: new Date().toISOString() });
      router.push(resolveNextStepRoute('ONBOARDING'));
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await updateMyLanguage(selected);
      applyLanguageChange(result);
      // Real backend only advances past TERMS once agreements are actually
      // submitted — if terms still aren't agreed, result.nextStep comes back
      // as 'TERMS' again here. Auto-agree instead of looping back to /language.
      router.push(await resolveNextStepRouteSkippingTerms(result.nextStep));
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '언어 설정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 34) }]}>
        <PrimaryButton
          title={t.language.next}
          disabled={!selected || isSubmitting}
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
    // Figma reserves the shared 54pt header's height here even though this
    // screen renders no header — content starts at the same 122pt mark
    // (54 header + 24 margin) as the sibling onboarding screens that do
    // render one.
    paddingTop: 78,
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
