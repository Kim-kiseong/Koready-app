import type { Href } from 'expo-router';

import { fetchOnboardingProgress, type OnboardingStep } from '@/api/onboarding';
import type { NextStep } from '@/api/types';
import { useOnboardingStore } from '@/store/onboarding-store';

export function resolveNextStepRoute(nextStep: NextStep): Href {
  switch (nextStep) {
    case 'LANGUAGE':
      return '/language';
    case 'ONBOARDING':
      return '/purpose';
    case 'COMPLETED':
      return '/home';
    case 'TERMS':
      return '/terms';
  }
}

function onboardingStepRoute(step: OnboardingStep): Href {
  switch (step) {
    case 'LOCATION':
      return '/location';
    case 'TRAVEL_STYLES':
      return '/travel-style';
    case 'PREFERENCE_PLACES':
      return '/destinations';
    case 'COMPLETED':
      return '/home';
  }
}

// GET /users/me/onboarding — called when re-entering the onboarding flow
// (e.g. app restart) so it resumes on the exact screen the server has saved
// progress for, and hydrates onboarding-store with that progress. The
// purpose screen itself isn't tracked server-side, so it's always shown
// first on a fresh login/language change — this resolver is only used for
// resuming an already-started flow.
export async function resolveOnboardingResumeRoute(): Promise<Href> {
  const progress = await fetchOnboardingProgress();
  useOnboardingStore.getState().applyProgress(progress);
  return onboardingStepRoute(progress.currentStep);
}
