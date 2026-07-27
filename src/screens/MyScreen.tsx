import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '@/api/auth';
import { fetchMyUser } from '@/api/user';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';

export default function MyScreen() {
  const router = useRouter();
  const applyMyUser = useAuthStore((state) => state.applyMyUser);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const deviceId = useAuthStore((state) => state.deviceId);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchMyUser()
      .then(applyMyUser)
      .catch(() => {
        // Keep showing the last known state; the request layer already
        // handles session-expiry redirects on 401.
      });
  }, [applyMyUser]);

  const handleLogout = async () => {
    if (!refreshToken || isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout({ refreshToken, deviceId });
      // Only clear local token/user cache after the server confirms logout.
      clearSession();
      router.replace('/login');
    } catch {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <CustomText style={styles.title}>마이 화면 (준비 중)</CustomText>
        <Pressable style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          <CustomText style={styles.logoutText}>로그아웃</CustomText>
        </Pressable>
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
    gap: 16,
  },
  title: {
    fontSize: 16,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
  },
  logoutText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
});
