import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';

export default function TabsLayout() {
  // TODO: replace with real session check (Zustand auth store) once login is wired up.
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <AppTabs />;
}
