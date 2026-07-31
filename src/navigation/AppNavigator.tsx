import { Stack } from 'expo-router';

export default function AppNavigator() {
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
      <Stack.Screen name="map" />
      <Stack.Screen name="picks" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="my" />
      <Stack.Screen name="places/[placeId]" />
      <Stack.Screen name="routes/[routeId]" />
    </Stack>
  );
}
