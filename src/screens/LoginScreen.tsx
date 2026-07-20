import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

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

  return (
    <View style={styles.screen}>
      <Image
        style={StyleSheet.absoluteFill}
        source={require('@/assets/images/wallpaper.jpg')}
        contentFit="cover"
      />

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
            onPress={() => {}}
          />
          <SocialButton
            label="Apple로 시작하기"
            icon={require('@/assets/images/apple.svg')}
            iconSize={{ width: 16, height: 20 }}
            backgroundColor={Palette.appleBlack}
            textColor="#ffffff"
            onPress={() => {}}
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
  onPress: () => void;
};

function SocialButton({
  label,
  icon,
  iconSize,
  backgroundColor,
  borderColor,
  textColor,
  onPress,
}: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        { backgroundColor, borderColor: borderColor ?? 'transparent' },
        pressed && styles.pressed,
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
  socialLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
  },
});
