import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAuthStore } from '@/store/auth-store';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <AppTabs />;
}
