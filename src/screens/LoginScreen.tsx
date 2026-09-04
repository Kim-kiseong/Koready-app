import { isAxiosError } from 'axios';
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { googleLogin, socialLogin } from '@/api/auth';
import { GoogleSignInCancelledError, signInWithApple, signInWithGoogle } from '@/api/socialAuth';
import type { ApiErrorEnvelope, SocialProvider } from '@/api/types';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { DEV_TEST_ACCESS_TOKEN, DEV_TEST_REFRESH_TOKEN } from '@/constants/env';
import { useTranslation } from '@/i18n/useTranslation';
import { resolveNextStepRouteSkippingTerms } from '@/navigation/next-step-route';
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
  nextStep: 'TERMS' as const,
};

const DEV_HOME_SESSION = {
  ...DEV_MOCK_SESSION,
  nextStep: 'COMPLETED' as const,
};

// Reference: Figma frame "로그인" (node 1329:9556), 375x812.
const FRAME_WIDTH = 375;
const FRAME_HEIGHT = 812;
const TITLE_TOP = 177;
const MASCOT_TOP = 391;
const MASCOT_WIDTH = 164;
const MASCOT_BOTTOM = MASCOT_TOP + 210;
const SHADOW_TOP = 586;
const BUTTON_GROUP_TOP = 630;
const BOTTOM_FADE_TOP = 560;
const BOTTOM_FADE_HEIGHT = 187;
// Figma's "Image_fx 2" reflection layer fades to solid white by 22.722% into
// this band — past that point it's opaque white, which is what makes the
// buttons below read as sitting on a white floor instead of the wallpaper.
const BOTTOM_FADE_WHITE_STOP = 0.22722;

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

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsSubmitting(true);
    try {
      if (provider === 'GOOGLE') {
        const { idToken } = await signInWithGoogle();
        if (!idToken) {
          throw new Error('Google sign-in did not return an ID token.');
        }
        const session = await googleLogin({ idToken, deviceId });
        setSession(session);
        await refreshSavedLocationsAndRestoreCurrentLocation().catch(() => undefined);
        router.replace(await resolveNextStepRouteSkippingTerms(session.nextStep));
        return;
      }

      const { idToken, authorizationCode } = await signInWithApple();
      const session = await socialLogin({ provider, idToken, authorizationCode, deviceId });
      setSession(session);
      await refreshSavedLocationsAndRestoreCurrentLocation().catch(() => undefined);
      router.replace(await resolveNextStepRouteSkippingTerms(session.nextStep));
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
    // TermsScreen has its own dev-mock fallback (DEV_FALLBACK_TERMS) that
    // works fine with this session's fake token, so route through /terms
    // like a real login would rather than skipping it.
    router.replace('/terms');
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

      <LinearGradient
        colors={[`${Palette.white}00`, Palette.white, Palette.white]}
        locations={[0, BOTTOM_FADE_WHITE_STOP, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.bottomFade, { top: BOTTOM_FADE_TOP * scale, height: BOTTOM_FADE_HEIGHT * scale }]}
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
            onPress={() => handleSocialLogin('GOOGLE')}
          />
          <SocialButton
            label={t.login.appleButton}
            icon={require('@/assets/images/apple.svg')}
            iconSize={{ width: 16, height: 20 }}
            backgroundColor={Palette.appleBlack}
            textColor="#ffffff"
            disabled={buttonsDisabled}
            onPress={() => handleSocialLogin('APPLE')}
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
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
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
