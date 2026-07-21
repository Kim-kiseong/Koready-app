import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// 폰트가 로드되기 전까지 스플래시 스크린 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 1. Pretendard 폰트 로드
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  // 2. 폰트 로드 완료 시 스플래시 숨김
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // 엑스포 최신 버전에 맞게 복잡한 Provider 없이 Stack만 반환합니다.
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}