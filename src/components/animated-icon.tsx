import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

const SPLASH_TRANSITION_DELAY = 500;
const SPLASH_TRANSITION_DURATION = 500;
const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);

// Reference: Figma frame "스플래시" (node 1053:1654), 375x812.
const FRAME_WIDTH = 375;
const TITLE_TOP = 246;
const MASCOT_TOP = 460;
const MASCOT_WIDTH = 164;
const MASCOT_BOTTOM = MASCOT_TOP + 210;
const SHADOW_TOP = 655;

export function AnimatedSplashOverlay() {
  const { width } = useWindowDimensions();
  const scale = width / FRAME_WIDTH;
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const [wallpaperLoaded, setWallpaperLoaded] = useState(false);
  const [mascotLoaded, setMascotLoaded] = useState(false);

  useEffect(() => {
    if (!wallpaperLoaded || !mascotLoaded) return;

    const timeout = setTimeout(() => {
      SplashScreen.hideAsync().finally(() => {
        setAnimate(true);
      });
    }, SPLASH_TRANSITION_DELAY);

    return () => clearTimeout(timeout);
  }, [wallpaperLoaded, mascotLoaded]);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
    },
    100: {
      opacity: 0,
      easing: EASE_OUT,
    },
  });

  const content = (
    <>
      <Image
        style={styles.wallpaper}
        source={require('@/assets/images/wallpaper.jpg')}
        contentFit="cover"
        onLoad={() => setWallpaperLoaded(true)}
      />
      <CustomText style={[styles.title, { top: TITLE_TOP * scale }]}>Koready</CustomText>
      <View style={[styles.mascotWrap, { top: MASCOT_TOP * scale }]}>
        <Image
          style={[styles.mascot, { width: MASCOT_WIDTH * scale }]}
          source={require('@/assets/images/hi-hori-v1.png')}
          contentFit="contain"
          onLoad={() => setMascotLoaded(true)}
        />
        <View style={[styles.mascotShadow, { marginTop: (SHADOW_TOP - MASCOT_BOTTOM) * scale }]} />
      </View>
    </>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(SPLASH_TRANSITION_DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {content}
    </Animated.View>
  ) : (
    <View style={styles.splashOverlay}>{content}</View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    zIndex: 1000,
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
  wallpaper: {
    ...StyleSheet.absoluteFill,
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
});
