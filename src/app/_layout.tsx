import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider, useAuth } from '@/auth/auth-context';
import SignInScreen from '@/auth/sign-in-screen';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthenticatedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { status } = useAuth();
  return status === 'signedIn' ? <AppTabs /> : <SignInScreen />;
}
