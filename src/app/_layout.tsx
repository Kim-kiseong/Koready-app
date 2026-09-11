import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox, Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FontFamily } from '@/constants/typography';

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
  'props.pointerEvents is deprecated. Use style.pointerEvents',
]);

if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const firstArg = args[0];
    if (
      typeof firstArg === 'string' &&
      firstArg.includes('props.pointerEvents is deprecated. Use style.pointerEvents')
    ) {
      return;
    }

    originalWarn(...args);
  };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    [FontFamily.pretendard.thin]: require('@/assets/fonts/Pretendard-Thin.ttf'),
    [FontFamily.pretendard.light]: require('@/assets/fonts/Pretendard-Light.ttf'),
    [FontFamily.pretendard.regular]: require('@/assets/fonts/Pretendard-Regular.ttf'),
    [FontFamily.pretendard.medium]: require('@/assets/fonts/Pretendard-Medium.ttf'),
    [FontFamily.pretendard.semiBold]: require('@/assets/fonts/Pretendard-SemiBold.ttf'),
    [FontFamily.pretendard.bold]: require('@/assets/fonts/Pretendard-Bold.ttf'),
    [FontFamily.pretendard.black]: require('@/assets/fonts/Pretendard-Black.ttf'),
    [FontFamily.montserrat.extraBold]: require('@/assets/fonts/Montserrat-ExtraBold.ttf'),
    [FontFamily.inter.medium]: require('@/assets/fonts/Inter-Medium.ttf'),
  });

  // Native splash stays up (preventAutoHideAsync above) until fonts are ready.
  // AnimatedSplashOverlay calls SplashScreen.hideAsync() itself once it mounts.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
