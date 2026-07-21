import { Stack } from 'expo-router';

export default function AppNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="language" />
      <Stack.Screen name="purpose" />
      <Stack.Screen name="location" />
      <Stack.Screen name="travel-style" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="home" />
    </Stack>
  );
}
