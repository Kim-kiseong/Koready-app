import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { fetchMyUser } from '@/api/user';
import { resolveNextStepRoute, resolveOnboardingResumeRoute } from '@/navigation/next-step-route';
import { useAuthStore } from '@/store/auth-store';

export default function Index() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const applyMyUser = useAuthStore((state) => state.applyMyUser);
  const [route, setRoute] = useState<Href | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      setRoute('/login');
      return;
    }

    fetchMyUser()
      .then(async (data) => {
        applyMyUser(data);
        if (data.signupStatus === 'ACTIVE') {
          setRoute('/home');
          return;
        }
        if (data.nextStep === 'ONBOARDING') {
          // Resume on the exact onboarding screen the server has progress
          // for, instead of always restarting at /location.
          try {
            setRoute(await resolveOnboardingResumeRoute());
            return;
          } catch {
            // Falls through to the default ONBOARDING route below.
          }
        }
        setRoute(resolveNextStepRoute(data.nextStep));
      })
      .catch(() => {
        // 401s already clear the session and redirect via the client's response
        // interceptor. For other failures (e.g. offline), fall back to the last
        // known step instead of losing the session.
        const cachedNextStep = useAuthStore.getState().nextStep;
        setRoute(cachedNextStep ? resolveNextStepRoute(cachedNextStep) : '/login');
      });
  }, [hasHydrated, accessToken, applyMyUser]);

  if (!route) return null;
  return <Redirect href={route} />;
}
