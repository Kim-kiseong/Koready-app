import { isAxiosError } from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchRequiredTerms, submitTermAgreements, type RequiredTermItem } from '@/api/terms';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveNextStepRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';
import { goBackOrRoot } from '@/navigation/safe-back';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as { message?: unknown; traceId?: unknown };
    const base =
      typeof data.message === 'string' && data.message.length > 0
        ? data.message
        : '알 수 없는 오류가 발생했습니다.';
    // Surfaced so a failed real-device test can be reported to the backend
    // with the exact status/traceId, per the Google-login verification spec.
    const traceId = typeof data.traceId === 'string' ? data.traceId : null;
    return traceId ? `${base}\n(status ${error.response?.status}, traceId ${traceId})` : base;
  }
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
}

// Dev-only fallback: /terms/required and /users/me/term-agreements are still
// `x-implementation-status: PLANNED` on the backend, so this keeps the screen
// previewable/testable locally before those endpoints go live. Mirrors the
// same trade-off as LoginScreen's dev-bypass button. contentUrl points at
// example.com as a stand-in — the real backend response will carry the
// actual koready.kr terms/privacy page URLs once those pages are published.
const DEV_FALLBACK_TERMS: RequiredTermItem[] = [
  {
    termId: 1,
    termVersionId: 10,
    code: 'SERVICE_TERMS',
    title: '서비스 이용약관',
    required: true,
    version: '1.0',
    contentUrl: 'https://example.com/terms/service/1.0',
    agreed: false,
    needsAgreement: true,
    displayOrder: 1,
  },
  {
    termId: 2,
    termVersionId: 11,
    code: 'PRIVACY_POLICY',
    title: '개인정보 취급 방침',
    required: true,
    version: '1.0',
    contentUrl: 'https://example.com/terms/privacy/1.0',
    agreed: false,
    needsAgreement: true,
    displayOrder: 2,
  },
  {
    termId: 3,
    termVersionId: 12,
    code: 'MARKETING',
    title: '마케팅 정보 수신',
    required: false,
    version: '1.0',
    contentUrl: 'https://example.com/terms/marketing/1.0',
    agreed: false,
    needsAgreement: true,
    displayOrder: 3,
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const t = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  // The dev-bypass session's token isn't a real one — sending it to the real
  // backend 401s, which trips client.ts's refresh-then-logout cascade before
  // this screen ever gets a chance to show anything. Skip the real call
  // entirely for that session instead of letting it round-trip and fail.
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
  const [terms, setTerms] = useState<RequiredTermItem[] | null>(null);
  const [agreedMap, setAgreedMap] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isDevMockSession) {
      setTerms(DEV_FALLBACK_TERMS);
      setAgreedMap(Object.fromEntries(DEV_FALLBACK_TERMS.map((term) => [term.termVersionId, term.agreed])));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetchRequiredTerms();
        if (cancelled) return;
        setTerms(response.terms);
        setAgreedMap(Object.fromEntries(response.terms.map((term) => [term.termVersionId, term.agreed])));
      } catch (error) {
        if (cancelled) return;
        if (__DEV__) {
          setTerms(DEV_FALLBACK_TERMS);
          setAgreedMap(Object.fromEntries(DEV_FALLBACK_TERMS.map((term) => [term.termVersionId, term.agreed])));
          return;
        }
        Alert.alert(t.terms.loadError, extractErrorMessage(error), [
          { text: '확인', onPress: () => goBackOrRoot(router, '/login') },
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, t, isDevMockSession]);

  const requiredTerms = terms?.filter((term) => term.required) ?? [];
  const optionalTerms = terms?.filter((term) => !term.required) ?? [];
  const requiredAgreed = requiredTerms.every((term) => agreedMap[term.termVersionId]);
  const allAgreed = terms !== null && terms.length > 0 && terms.every((term) => agreedMap[term.termVersionId]);

  const toggleGroup = (group: RequiredTermItem[]) => {
    const groupAgreed = group.every((term) => agreedMap[term.termVersionId]);
    const next = !groupAgreed;
    setAgreedMap((prev) => {
      const updated = { ...prev };
      group.forEach((term) => {
        updated[term.termVersionId] = next;
      });
      return updated;
    });
  };

  const handleToggleAll = () => {
    if (!terms) return;
    toggleGroup(terms);
  };

  const openTerm = (term: RequiredTermItem) => {
    WebBrowser.openBrowserAsync(term.contentUrl).catch((error) => {
      Alert.alert(t.terms.linkOpenError, extractErrorMessage(error));
    });
  };

  const handleNext = async () => {
    if (!terms || !requiredAgreed || isSubmitting) return;
    if (isDevMockSession) {
      router.replace(resolveNextStepRoute('LANGUAGE'));
      return;
    }
    setIsSubmitting(true);
    try {
      const agreements = terms.map((term) => ({
        termVersionId: term.termVersionId,
        agreed: !!agreedMap[term.termVersionId],
      }));
      const result = await submitTermAgreements(agreements);
      router.replace(resolveNextStepRoute(result.nextStep));
    } catch (error) {
      Alert.alert(t.terms.submitError, extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router, '/login')} title={t.terms.headerTitle} rightIcon={null} />

      <View style={styles.content}>
        <CustomText style={styles.title}>{t.terms.title}</CustomText>

        {terms && (
          <View style={styles.checkGroup}>
            <CheckboxRow checked={allAgreed} onPress={handleToggleAll}>
              <CustomText style={styles.agreeAllLabel}>{t.terms.agreeAll}</CustomText>
            </CheckboxRow>

            <View style={styles.divider} />

            {requiredTerms.length > 0 && (
              <CheckboxRow checked={requiredAgreed} onPress={() => toggleGroup(requiredTerms)}>
                <CustomText style={styles.label}>
                  {requiredTerms.map((term, index) => (
                    <Fragment key={term.termId}>
                      {index > 0 ? t.terms.connector : null}
                      <CustomText style={styles.link} onPress={() => openTerm(term)}>
                        {term.title}
                      </CustomText>
                    </Fragment>
                  ))}
                  {t.terms.requiredSuffix}
                </CustomText>
              </CheckboxRow>
            )}

            {optionalTerms.map((term) => (
              <CheckboxRow
                key={term.termId}
                checked={!!agreedMap[term.termVersionId]}
                onPress={() =>
                  setAgreedMap((prev) => ({ ...prev, [term.termVersionId]: !prev[term.termVersionId] }))
                }>
                <CustomText style={styles.label}>
                  <CustomText style={styles.link} onPress={() => openTerm(term)}>
                    {term.title}
                  </CustomText>
                  {t.terms.optionalSuffix}
                </CustomText>
              </CheckboxRow>
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title={t.terms.next}
          disabled={!terms || !requiredAgreed || isSubmitting}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

function CheckboxRow({
  checked,
  onPress,
  children,
}: {
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress} hitSlop={4}>
      <View style={[styles.checkbox, checked ? styles.checkboxChecked : styles.checkboxUnchecked]}>
        {checked && (
          <SymbolView
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={12}
            weight="bold"
            tintColor="#ffffff"
          />
        )}
      </View>
      {children}
    </Pressable>
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
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    lineHeight: 30.8,
    color: Palette.grey900,
  },
  checkGroup: {
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.grey150,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.grey300,
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
  },
  agreeAllLabel: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 16,
    color: Palette.text,
  },
  label: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.text,
  },
  link: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.text,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
