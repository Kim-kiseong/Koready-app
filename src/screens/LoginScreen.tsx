import { isAxiosError } from 'axios';
import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { googleLogin } from '@/api/auth';
import { GoogleSignInCancelledError, signInWithGoogle } from '@/api/socialAuth';
import type { ApiErrorEnvelope } from '@/api/types';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { DEV_TEST_ACCESS_TOKEN, DEV_TEST_REFRESH_TOKEN } from '@/constants/env';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveNextStepRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';
import { refreshSavedLocationsAndRestoreCurrentLocation } from '@/utils/location-session';

// Dev-only bypass: lets onboarding be tested before social login keys exist.
// When EXPO_PUBLIC_DEV_TEST_ACCESS_TOKEN is set, this carries a real staging
// token instead, so screens that check for DEV_MOCK_ACCESS_TOKEN naturally
// stop using their local fallback data and call the real backend.
const DEV_MOCK_SESSION = {
  tokenType: 'Bearer' as const,
  accessToken: DEV_TEST_ACCESS_TOKEN ?? DEV_MOCK_ACCESS_TOKEN,
  refreshToken: DEV_TEST_REFRESH_TOKEN ?? 'mock-refresh-token',
  accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  user: {
    userId: 0,
    publicId: 'usr_00000000000000000000000000000000',
    email: 'dev@koready.test',
    profileImageUrl: null,
    preferredLanguage: 'KO' as const,
  },
  nextStep: 'LANGUAGE' as const,
};

const DEV_HOME_SESSION = {
  ...DEV_MOCK_SESSION,
  nextStep: 'COMPLETED' as const,
};

// Reference: Figma frame "스플래시" (node 2286:13137), 375x812 — the same
// background image as the old "로그인" (1329:9556) frame this was built
// from, but with title/mascot/shadow/fade all shifted down 69px as a block
// (their spacing relative to each other is identical, only the block's
// position within the frame moved). BUTTON_GROUP_TOP has no counterpart in
// this frame (it has no buttons) so it's extrapolated by the same +69,
// which keeps its gap below the fade's top edge unchanged (was 70px, still is).
const FRAME_WIDTH = 375;
const FRAME_HEIGHT = 812;
const TITLE_TOP = 246;
const SUBTITLE_TOP = 310;
const MASCOT_TOP = 460;
const MASCOT_WIDTH = 164;
const MASCOT_BOTTOM = MASCOT_TOP + 210;
const SHADOW_TOP = 655;
const BUTTON_GROUP_TOP = 699;

export default function LoginScreen() {
  const t = useTranslation();
  const { width, height } = useWindowDimensions();
  // On native the viewport always matches the device's own aspect ratio, so
  // width-only scaling was fine. On web (this screen opened as a browser tab
  // instead of the native app) the visible viewport is often much shorter
  // than the 375x812 Figma reference — mobile browser chrome (address bar,
  // bottom toolbar) eats into window height — so a width-only scale pushes
  // the button group below the fold and the page has to scroll to reach it.
  // Scaling by the smaller of the two ratios keeps the whole screen
  // (title, mascot, buttons) uniformly shrunk to fit within short viewports
  // instead of overflowing.
  const scale = Math.min(width / FRAME_WIDTH, height / FRAME_HEIGHT);
  const router = useRouter();
  const deviceId = useAuthStore((state) => state.deviceId);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const { idToken } = await signInWithGoogle();
      if (!idToken) {
        throw new Error('Google sign-in did not return an ID token.');
      }
      const session = await googleLogin({ idToken, deviceId });
      setSession(session);
      await refreshSavedLocationsAndRestoreCurrentLocation().catch(() => undefined);
      router.replace(resolveNextStepRoute(session.nextStep));
    } catch (error) {
      // User backed out of the Google account chooser — not a failure worth alerting on.
      if (error instanceof GoogleSignInCancelledError) {
        return;
      }
      if (isAxiosError<ApiErrorEnvelope>(error)) {
        if (!error.response) {
          Alert.alert('네트워크 오류', '인터넷 연결을 확인한 뒤 다시 시도해주세요.');
        } else if (error.response.status === 401) {
          Alert.alert('로그인 실패', '인증에 실패했습니다. 다시 시도해주세요.');
        } else {
          Alert.alert('로그인 실패', error.response.data?.message ?? '알 수 없는 오류가 발생했습니다.');
        }
        return;
      }
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevOnboardingBypass = () => {
    setSession(DEV_MOCK_SESSION);
    // Language comes before Terms in the onboarding flow, so route there
    // first, same as a real first-time login would (nextStep: 'LANGUAGE').
    // LanguageScreen/TermsScreen each have their own dev-mock fallbacks that
    // work fine with this session's fake token.
    router.replace('/language');
  };

  const handleDevHomeShortcut = () => {
    setSession(DEV_HOME_SESSION);
    router.replace('/home');
  };

  const buttonsDisabled = !hasHydrated || isSubmitting;

  return (
    <View style={styles.screen}>
      <Image
        style={StyleSheet.absoluteFill}
        source={require('@/assets/images/wallpaper.jpg')}
        contentFit="cover"
      />

      {__DEV__ && (
        <SafeAreaView edges={['top']} style={styles.devBanner}>
          <View style={styles.devButtonGroup}>
            <Pressable style={styles.devButton} onPress={handleDevOnboardingBypass}>
              <CustomText style={styles.devButtonText}>온보딩 화면 바로가기 (Dev)</CustomText>
            </Pressable>
            <Pressable style={styles.devButton} onPress={handleDevHomeShortcut}>
              <CustomText style={styles.devButtonText}>홈 화면 바로가기 (Dev)</CustomText>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      <CustomText style={[styles.title, { top: TITLE_TOP * scale }]}>Koready</CustomText>
      <CustomText style={[styles.subtitle, { top: SUBTITLE_TOP * scale }]}>
        {t.login.mobileRecommendation}
      </CustomText>

      <View style={[styles.mascotWrap, { top: MASCOT_TOP * scale }]}>
        <Image
          style={[styles.mascot, { width: MASCOT_WIDTH * scale }]}
          source={require('@/assets/images/hi-hori-v1.png')}
          contentFit="contain"
        />
        <View style={[styles.mascotShadow, { marginTop: (SHADOW_TOP - MASCOT_BOTTOM) * scale }]} />
      </View>

      <View style={[styles.buttonSection, { top: BUTTON_GROUP_TOP * scale }]}>
        <SafeAreaView edges={['bottom']} style={styles.buttonGroup}>
          <SocialButton
            label={t.login.googleButton}
            icon={require('@/assets/images/google.svg')}
            iconSize={{ width: 18, height: 18 }}
            backgroundColor="#ffffff"
            borderColor={Palette.grey200}
            textColor={Palette.grey900}
            disabled={buttonsDisabled}
            onPress={handleGoogleLogin}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

type SocialButtonProps = {
  label: string;
  icon: ImageSource;
  iconSize: { width: number; height: number };
  backgroundColor: string;
  borderColor?: string;
  textColor: string;
  disabled?: boolean;
  onPress: () => void;
};

function SocialButton({
  label,
  icon,
  iconSize,
  backgroundColor,
  borderColor,
  textColor,
  disabled,
  onPress,
}: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.socialButton,
        { backgroundColor, borderColor: borderColor ?? 'transparent' },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Image source={icon} style={iconSize} contentFit="contain" />
      <CustomText style={[styles.socialLabel, { color: textColor }]}>{label}</CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  devBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  devButtonGroup: {
    marginTop: 8,
    gap: 8,
    alignItems: 'center',
  },
  devButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Palette.grey900,
  },
  devButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: '#ffffff',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FontFamily.montserrat.extraBold,
    fontSize: 36,
    letterSpacing: -0.72,
    color: Palette.primary,
  },
  subtitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.26,
    color: Palette.grey900,
  },
  mascotWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mascot: {
    aspectRatio: 318 / 408,
  },
  mascotShadow: {
    width: 132,
    height: 11.941,
    experimental_backgroundImage:
      'radial-gradient(50% 50% at 50% 50%, rgba(53, 61, 74, 0.10) 0%, rgba(53, 61, 74, 0.05) 100%)',
    filter: 'blur(3px)',
  },
  buttonSection: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  buttonGroup: {
    paddingHorizontal: 16,
    gap: 12,
  },
  socialButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  socialLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    letterSpacing: -0.16,
  },
});
