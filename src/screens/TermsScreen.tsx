import { isAxiosError } from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchRequiredTerms, submitTermAgreements, type RequiredTermItem } from '@/api/terms';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { PRIVACY_POLICY_TEXT, SERVICE_TERMS_TEXT } from '@/constants/legal-text';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveNextStepRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';
import { useTermDetailStore } from '@/store/term-detail-store';
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

// Dev-only fallback, used ONLY for the mock-login bypass session (see
// isDevMockSession below), which never has a real access token and so can
// never call the real backend. /terms/required and /users/me/term-agreements
// are live (`x-implementation-status: IMPLEMENTED`) — a real session always
// hits the real backend and surfaces real errors via the catch block below.
const DEV_FALLBACK_TERMS: RequiredTermItem[] = [
  {
    termId: 1,
    termVersionId: 10,
    code: 'SERVICE_TERMS',
    title: '서비스 이용약관',
    required: true,
    version: '1.0',
    sourceType: 'INLINE',
    contentUrl: null,
    content: SERVICE_TERMS_TEXT.KO,
    contentFormat: 'PLAIN_TEXT',
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
    sourceType: 'INLINE',
    contentUrl: null,
    content: PRIVACY_POLICY_TEXT.KO,
    contentFormat: 'PLAIN_TEXT',
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
    sourceType: 'EXTERNAL_URL',
    contentUrl: 'https://example.com/terms/marketing/1.0',
    content: null,
    contentFormat: null,
    agreed: false,
    needsAgreement: true,
    displayOrder: 3,
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore((state) => state.accessToken);
  // The dev-bypass session's token isn't a real one — sending it to the real
  // backend 401s, which trips client.ts's refresh-then-logout cascade before
  // this screen ever gets a chance to show anything. Skip the real call
  // entirely for that session instead of letting it round-trip and fail.
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
  const setPendingTermDetail = useTermDetailStore((state) => state.setPending);
  const [terms, setTerms] = useState<RequiredTermItem[] | null>(
    () => isDevMockSession ? DEV_FALLBACK_TERMS : null,
  );
  const [agreedMap, setAgreedMap] = useState<Record<number, boolean>>(
    () => isDevMockSession
      ? Object.fromEntries(DEV_FALLBACK_TERMS.map((term) => [term.termVersionId, term.agreed]))
      : {},
  );
  // Client-only requirement — there's no backend term or age-verification
  // logic for this, so it's never sent to submitTermAgreements. We just take
  // the user's word for it.
  const [age14Agreed, setAge14Agreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousMockSession, setPreviousMockSession] = useState(isDevMockSession);
  if (previousMockSession !== isDevMockSession) {
    setPreviousMockSession(isDevMockSession);
    setTerms(isDevMockSession ? DEV_FALLBACK_TERMS : null);
    setAgreedMap(isDevMockSession
      ? Object.fromEntries(DEV_FALLBACK_TERMS.map((term) => [term.termVersionId, term.agreed]))
      : {});
  }

  useEffect(() => {
    if (isDevMockSession) {
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
  const requiredTermsAgreed = requiredTerms.every((term) => agreedMap[term.termVersionId]);
  // Gates the "다음" button — includes the client-only age-14 checkbox
  // alongside the backend-driven required terms.
  const requiredAgreed = age14Agreed && requiredTermsAgreed;
  // No `terms.length > 0` gate here — [].every(...) is vacuously true, so an
  // empty/not-yet-loaded terms list must not permanently block "agree to
  // all" from reflecting age14Agreed (previously it could never show
  // checked in that case, even after toggling it).
  const allAgreed = age14Agreed && terms !== null && terms.every((term) => agreedMap[term.termVersionId]);

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
    const next = !allAgreed;
    setAge14Agreed(next);
    setAgreedMap(Object.fromEntries(terms.map((term) => [term.termVersionId, next])));
  };

  // Per the backend contract, sourceType (not `code`, which is a free-form
  // admin-defined string with no fixed value) decides how to open a term:
  // EXTERNAL_URL opens contentUrl in the browser, INLINE renders `content`
  // in-app. Previously this special-cased the two known onboarding term
  // codes and silently did nothing for anything else — if the live backend's
  // "서비스 이용약관" term wasn't configured with that exact literal code (it's
  // admin-defined per term, not guaranteed), tapping it did nothing with no
  // error, which is exactly the "이용약관만 안 눌림" symptom.
  const openTerm = (term: RequiredTermItem) => {
    if (term.sourceType === 'EXTERNAL_URL') {
      if (!term.contentUrl) return;
      WebBrowser.openBrowserAsync(term.contentUrl).catch((error) => {
        Alert.alert(t.terms.linkOpenError, extractErrorMessage(error));
      });
      return;
    }
    if (!term.content) return;
    setPendingTermDetail({
      code: term.code,
      title: term.title,
      content: term.content,
      contentFormat: term.contentFormat,
    });
    router.push({ pathname: '/terms/[code]', params: { code: term.code } });
  };

  const handleNext = async () => {
    if (!terms || !requiredAgreed || isSubmitting) return;
    if (isDevMockSession) {
      // Terms comes after Language in the onboarding flow, so the next step
      // from here is onboarding (Location), not back to Language.
      router.replace(resolveNextStepRoute('ONBOARDING'));
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
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router, '/language')} title={t.terms.headerTitle} rightIcon={null} />

      <View style={styles.content}>
        <CustomText style={styles.title}>{t.terms.title}</CustomText>

        {terms && (
          <View style={styles.checkGroup}>
            <CheckboxRow checked={allAgreed} onPress={handleToggleAll}>
              <CustomText style={styles.agreeAllLabel}>{t.terms.agreeAll}</CustomText>
            </CheckboxRow>

            <View style={styles.divider} />

            <CheckboxRow checked={age14Agreed} onPress={() => setAge14Agreed((prev) => !prev)}>
              <CustomText style={styles.label}>{t.terms.age14RequiredLabel}</CustomText>
            </CheckboxRow>

            {requiredTerms.length > 0 && (
              <CheckboxRow checked={requiredTermsAgreed} onPress={() => toggleGroup(requiredTerms)}>
                <CustomText style={styles.label}>
                  {t.terms.requiredPrefix}
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
                  {t.terms.optionalPrefix}
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 34) }]}>
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
    letterSpacing: -0.44,
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
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: -0.32,
    color: Palette.text,
  },
  label: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: -0.28,
    color: Palette.text,
  },
  // Figma specs this underline as `decoration-from-font` — a thin line
  // matched to the font's own metrics. `textDecorationLine`'s thickness is
  // "auto" on every platform, and there's no RN style prop to set it
  // explicitly. borderBottomWidth looked like the fix, but RN Web runs any
  // border-width style through the same PixelRatio division native uses for
  // StyleSheet.hairlineWidth (declaredPx / devicePixelRatio) — confirmed by
  // reading the computed style directly (`borderBottomWidth: 1` rendered as
  // 3.2px at devicePixelRatio 0.3125, and 0.889px at 1.125). On a display
  // with a non-integer scale factor (Windows custom scaling, which Windows
  // itself warns can render UI blurry), that division lands on a sub-pixel
  // CSS width the browser has to anti-alias, which reads as a soft, thick
  // smudge rather than a crisp line — reproducing every time, not just on
  // first paint. `boxShadow` is a raw CSS passthrough on RN Web (unlike
  // `border*`, it isn't tokenized through that PixelRatio conversion — see
  // the plain-px boxShadow values already used elsewhere in this codebase,
  // e.g. EventGridCard.tsx), so an inset shadow renders a guaranteed literal
  // 1px regardless of the display's DPI. Kept as textDecorationLine on
  // native (iOS/Android), where a bordered nested Text span can break inline
  // wrapping — not worth the risk for a platform that hasn't shown this bug.
  link: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: -0.28,
    color: Palette.text,
    ...Platform.select({
      web: { boxShadow: `inset 0 -1px 0 0 ${Palette.text}` } as object,
      default: { textDecorationLine: 'underline' as const },
    }),
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
