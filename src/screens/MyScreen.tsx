import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyUser } from '@/api/user';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import { useAuthStore } from '@/store/auth-store';

export default function MyScreen() {
  const applyMyUser = useAuthStore((state) => state.applyMyUser);

  useEffect(() => {
    fetchMyUser()
      .then(applyMyUser)
      .catch(() => {
        // Keep showing the last known state; the request layer already
        // handles session-expiry redirects on 401.
      });
  }, [applyMyUser]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <CustomText style={styles.title}>마이 화면 (준비 중)</CustomText>
      </View>
      <BottomNavBar active="my" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
  },
});
