import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

const SPLASH_TRANSITION_DELAY = 500;
const SPLASH_TRANSITION_DURATION = 500;
const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);

export function AnimatedSplashOverlay() {
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
      <View style={styles.mascotContainer}>
        <Image
          style={styles.mascot}
          source={require('@/assets/images/hi-hori-v1.png')}
          contentFit="contain"
          onLoad={() => setMascotLoaded(true)}
        />
        <View style={styles.mascotShadow} />
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

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1000,
  },
  wallpaper: {
    ...StyleSheet.absoluteFill,
  },
  mascotContainer: {
    alignItems: 'center',
  },
  mascot: {
    width: 180,
    aspectRatio: 318 / 408,
  },
  mascotShadow: {
    width: 132,
    height: 11.941,
    marginTop: -6,
    experimental_backgroundImage:
      'radial-gradient(50% 50% at 50% 50%, rgba(53, 61, 74, 0.10) 0%, rgba(53, 61, 74, 0.05) 100%)',
    filter: 'blur(3px)',
  },
});
