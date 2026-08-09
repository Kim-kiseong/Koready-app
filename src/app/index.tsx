import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { resolveOnboardingResumeRoute, resolveNextStepRouteSkippingTerms } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';

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

    // There is no GET /users/me on the real backend to refresh this from —
    // `nextStep` is persisted from login and kept current by every flow that
    // can change it (language switch, onboarding completion, ...), so the
    // cached value is already authoritative on a cold restart.
    if (nextStep === 'ONBOARDING') {
      // Resume on the exact onboarding screen the server has progress for,
      // instead of always restarting at /location.
      resolveOnboardingResumeRoute()
        .then(setRoute)
        .catch(() => resolveNextStepRouteSkippingTerms(nextStep).then(setRoute));
      return;
    }

    resolveNextStepRouteSkippingTerms(nextStep).then(setRoute);
  }, [hasHydrated, accessToken, nextStep]);

  if (!route) return null;
  return <Redirect href={route} />;
}
