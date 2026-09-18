import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { PRIVACY_POLICY_TEXT, SERVICE_TERMS_TEXT } from '@/constants/legal-text';
import { FontFamily } from '@/constants/typography';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import { useTermDetailStore } from '@/store/term-detail-store';

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
  const { code, from } = useLocalSearchParams<{ code: string; from?: string }>();
  const language = useLanguageStore((state) => state.language);
  const pending = useTermDetailStore((state) => state.pending);
  const clearPendingTermDetail = useTermDetailStore((state) => state.clearPending);
  // Freeze the handoff data on mount — TermsScreen clears it as soon as this
  // screen reads it, so a re-render must not re-derive from the (now empty)
  // store, and a screen reopened without a fresh handoff (e.g. from Settings,
  // or backgrounded and resumed) must fall through to the static copy below.
  const [pendingForThisCode] = useState(() => (pending?.code === code ? pending : null));

  useEffect(() => {
    if (pending?.code === code) clearPendingTermDetail();
    // Only ever meant to consume whatever was pending when this screen first
    // mounted for this code — deliberately not re-running on further pending/code changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const knownStaticCode = code === 'SERVICE_TERMS' || code === 'PRIVACY_POLICY' ? code : null;
  const title = pendingForThisCode?.title ?? (knownStaticCode ? TITLES[knownStaticCode][language] : '');
  const body = pendingForThisCode?.content ?? (knownStaticCode ? BODY_TEXT[knownStaticCode][language] : '');
  const backFallback = from === 'settings' ? '/settings' : '/terms';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router, backFallback)} title={title} rightIcon={null} />

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
