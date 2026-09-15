import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import PcIframeShell from '@/components/PcIframeShell';
import { FontFamily } from '@/constants/typography';

SplashScreen.preventAutoHideAsync();

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
  // PcIframeShell short-circuits ahead of the fontsLoaded gate below — on a
  // wide top-level web tab it never needs this tree at all, just the static
  // phone-frame shell around its iframe, so it shouldn't wait on fonts first.
  return (
    <PcIframeShell>
      {fontsLoaded ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      ) : null}
    </PcIframeShell>
  );
}