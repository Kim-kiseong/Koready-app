import type { Href } from 'expo-router';

import { fetchOnboardingProgress, type OnboardingStep } from '@/api/onboarding';
import type { NextStep } from '@/api/types';
import { useOnboardingStore } from '@/store/onboarding-store';

export function resolveNextStepRoute(nextStep: NextStep): Href {
  switch (nextStep) {
    case 'LANGUAGE':
      return '/language';
    case 'ONBOARDING':
      return '/location';
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
// progress for, and hydrates onboarding-store with that progress. A fresh
// login/language change skips this and goes straight to LOCATION via
// resolveNextStepRoute — this resolver is only for resuming an
// already-started flow.
export async function resolveOnboardingResumeRoute(): Promise<Href> {
  const progress = await fetchOnboardingProgress();
  useOnboardingStore.getState().applyProgress(progress);
  return onboardingStepRoute(progress.currentStep);
}
