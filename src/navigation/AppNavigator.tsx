import { useEffect } from 'react';
import { Stack } from 'expo-router';

import { preloadRegionMapAssetsSequentially } from '@/utils/map-assets';

export default function AppNavigator() {
  useEffect(() => {
    const timer = setTimeout(() => {
      void preloadRegionMapAssetsSequentially();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="language" />
      <Stack.Screen name="location" />
      <Stack.Screen name="travel-style" />
      <Stack.Screen name="destinations" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="home" />
      <Stack.Screen name="guides" />
      <Stack.Screen name="events" />
      <Stack.Screen name="address" />
      <Stack.Screen name="address-search" />
      <Stack.Screen name="address-edit" />
      <Stack.Screen name="(map)/map" />
      <Stack.Screen name="picks" />
      <Stack.Screen name="(save)/saved" />
      <Stack.Screen name="my" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings-language" />
      <Stack.Screen name="profile-edit" options={{ headerBackButtonMenuEnabled: false }} />
      <Stack.Screen name="message-threads" />
      <Stack.Screen name="message-threads/new" />
      <Stack.Screen name="message-threads/[threadId]" />
      <Stack.Screen name="places/[placeId]" />
      <Stack.Screen name="routes/[routeId]" />
    </Stack>
  );
}
