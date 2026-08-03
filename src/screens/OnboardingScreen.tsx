import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
      <View style={styles.container}>
      <Text style={styles.title}>Onboarding Screen</Text>
      <Button title="Go to Home" onPress={() => router.push('/home')} />
      <Button title="Back to Login" onPress={() => router.replace('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
