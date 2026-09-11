import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { fetchMyUser } from '@/api/user';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { resolveOnboardingResumeRoute, resolveNextStepRoute } from '@/navigation/next-step-route';
import type { NextStep } from '@/api/types';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function Index() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const nextStep = useAuthStore((state) => state.nextStep);
  const [route, setRoute] = useState<Href | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken || !nextStep) {
      setRoute('/login');
      return;
    }

    const routeFromNextStep = (step: NextStep) => {
      if (step === 'ONBOARDING') {
        // Resume on the exact onboarding screen the server has progress for,
        // instead of always restarting at /location.
        resolveOnboardingResumeRoute()
          .then(setRoute)
          .catch(() => setRoute(resolveNextStepRoute(step)));
        return;
      }
      setRoute(resolveNextStepRoute(step));
    };

    // The dev-mock session isn't a real backend user — GET /users/me would
    // 401, triggering client.ts's refresh-then-logout cascade. Route from the
    // cached nextStep instead, same as every other mock-aware screen.
    const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
    if (isDevMockSession) {
      routeFromNextStep(nextStep);
      return;
    }

    // GET /users/me is now implemented on the real backend — refresh the
    // session from it on cold restart instead of trusting the cached
    // nextStep, and re-sync the fields other screens used to source purely
    // from local state (buddyProfileExists, unreadMessageCount, the current
    // location id).
    fetchMyUser()
      .then((me) => {
        useAuthStore.setState((state) => ({
          nextStep: me.nextStep,
          buddyProfileExists: me.buddyProfileExists,
          unreadMessageCount: me.unreadMessageCount,
          user: state.user ? { ...state.user, ...me.user } : me.user,
        }));
        // Authenticated responses (place titles, tags, ...) are localized
        // server-side from the account's saved preferredLanguage, not the
        // Accept-Language header — re-sync local i18n state from it on every
        // cold restart so app chrome and backend content never disagree.
        useLanguageStore.getState().setLanguage(me.user.preferredLanguage);
        useOnboardingStore.getState().setCurrentLocationId(me.defaultLocationId);
        routeFromNextStep(me.nextStep);
      })
      .catch(() => routeFromNextStep(nextStep));
  }, [hasHydrated, accessToken, nextStep]);

  if (!route) return null;
  return <Redirect href={route} />;
}
