import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { PRIVACY_POLICY_TEXT, SERVICE_TERMS_TEXT } from '@/constants/legal-text';
import { FontFamily } from '@/constants/typography';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

// Figma's English frames for these two documents (node 3076:10185,
// 3076:10245) carry the Korean header title verbatim — an authoring
// oversight, since the checklist screen's own English frame (2286:13483)
// correctly localizes its header and even names these two documents "Terms
// of Service" / "Privacy Policy" in its own copy. Using those names here
// instead of the untranslated header keeps this screen consistent with that
// one, rather than inventing a translation from scratch.
const TITLES: Record<'SERVICE_TERMS' | 'PRIVACY_POLICY', Record<'KO' | 'EN', string>> = {
  SERVICE_TERMS: { KO: '서비스 이용약관', EN: 'Terms of Service' },
  PRIVACY_POLICY: { KO: '개인정보 처리방침', EN: 'Privacy Policy' },
};

const BODY_TEXT: Record<'SERVICE_TERMS' | 'PRIVACY_POLICY', Record<'KO' | 'EN', string>> = {
  SERVICE_TERMS: SERVICE_TERMS_TEXT,
  PRIVACY_POLICY: PRIVACY_POLICY_TEXT,
};

export default function TermsDetailScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: 'SERVICE_TERMS' | 'PRIVACY_POLICY' }>();
  const language = useLanguageStore((state) => state.language);

  const title = TITLES[code]?.[language] ?? '';
  const body = BODY_TEXT[code]?.[language] ?? '';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router, '/terms')} title={title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <CustomText style={styles.body}>{body}</CustomText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  body: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.text,
  },
});
