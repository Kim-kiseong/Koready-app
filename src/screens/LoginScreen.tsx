import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { socialLogin } from '@/api/auth';
import { signInWithApple, signInWithGoogle } from '@/api/socialAuth';
import type { SocialProvider } from '@/api/types';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { resolveNextStepRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';

// Dev-only bypass: lets onboarding be tested before social login keys exist.
const DEV_MOCK_SESSION = {
  tokenType: 'Bearer' as const,
  accessToken: DEV_MOCK_ACCESS_TOKEN,
  refreshToken: 'mock-refresh-token',
  accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  user: {
    userId: 0,
    email: 'dev@koready.test',
    profileImageUrl: null,
    preferredLanguage: 'KO' as const,
  },
  nextStep: 'TERMS' as const,
};

// Reference: Figma frame "로그인" (node 1329:9556), 375x812.
const FRAME_WIDTH = 375;
const TITLE_TOP = 177;
const MASCOT_TOP = 391;
const MASCOT_WIDTH = 164;
const MASCOT_BOTTOM = MASCOT_TOP + 210;
const SHADOW_TOP = 586;
const BUTTON_GROUP_TOP = 630;

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const scale = width / FRAME_WIDTH;
  const router = useRouter();
  const deviceId = useAuthStore((state) => state.deviceId);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsSubmitting(true);
    try {
      const { idToken, authorizationCode } =
        provider === 'GOOGLE' ? await signInWithGoogle() : await signInWithApple();
      const session = await socialLogin({ provider, idToken, authorizationCode, deviceId });
      setSession(session);
      router.replace(resolveNextStepRoute(session.nextStep));
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevOnboardingBypass = () => {
    setSession(DEV_MOCK_SESSION);
    router.replace(resolveNextStepRoute(DEV_MOCK_SESSION.nextStep));
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
          <Pressable style={styles.devButton} onPress={handleDevOnboardingBypass}>
            <CustomText style={styles.devButtonText}>온보딩 화면 바로가기 (Dev)</CustomText>
          </Pressable>
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
            label="Google로 시작하기"
            icon={require('@/assets/images/google.svg')}
            iconSize={{ width: 18, height: 18 }}
            backgroundColor="#ffffff"
            borderColor={Palette.grey200}
            textColor={Palette.grey900}
            disabled={buttonsDisabled}
            onPress={() => handleSocialLogin('GOOGLE')}
          />
          <SocialButton
            label="Apple로 시작하기"
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
  devButton: {
    marginTop: 8,
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
    color: Palette.primary,
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
  },
});
