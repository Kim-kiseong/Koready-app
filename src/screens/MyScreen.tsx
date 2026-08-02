import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logout } from '@/api/auth';
import { signOutOfGoogle } from '@/api/socialAuth';
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
    let active = true;
    fetchMyUser()
      .then((data) => {
        // Avoid writing stale user data back in if logout/unmount happened
        // while this request was still in flight.
        if (active) applyMyUser(data);
      })
      .catch(() => {
        // Keep showing the last known state; the request layer already
        // handles session-expiry redirects on 401.
      });
    return () => {
      active = false;
    };
  }, [applyMyUser]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    if (!refreshToken) {
      // No session to log out of server-side — nothing to wait on, so just
      // drop the local state instead of leaving the button a silent no-op.
      await signOutOfGoogle();
      clearSession();
      router.replace('/login');
      return;
    }
    setIsLoggingOut(true);
    try {
      await logout({ refreshToken, deviceId });
    } catch {
      // The server call is best-effort — local sign-out must still happen so
      // the user isn't stuck "logged in" on this device.
      Alert.alert('오류', '서버 로그아웃 요청이 실패했지만 이 기기에서는 로그아웃되었습니다.');
    } finally {
      await signOutOfGoogle();
      clearSession();
      setIsLoggingOut(false);
      router.replace('/login');
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
