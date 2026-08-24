import type { Href } from 'expo-router';

import { fetchOnboardingProgress, type OnboardingStep } from '@/api/onboarding';
import { fetchRequiredTerms, submitTermAgreements } from '@/api/terms';
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

// TEMP: terms screen disabled for testing. The backend only advances nextStep
// past TERMS once agreements are actually submitted — just rerouting away
// from '/terms' (without calling the real API) makes the backend keep
// reporting nextStep: 'TERMS' forever, so every later step (language, ...)
// loops back here. Auto-agreeing for real is what actually unblocks it.
// Revert callers to `resolveNextStepRoute` directly once terms is ready to
// test again.
export async function resolveNextStepRouteSkippingTerms(nextStep: NextStep): Promise<Href> {
  if (nextStep !== 'TERMS') {
    return resolveNextStepRoute(nextStep);
  }
  try {
    const { terms } = await fetchRequiredTerms();
    const result = await submitTermAgreements(
      terms.map((term) => ({ termVersionId: term.termVersionId, agreed: true })),
    );
    return resolveNextStepRouteSkippingTerms(result.nextStep);
  } catch {
    // Real terms endpoints unreachable — fall back to just skipping the
    // screen visually (may loop back to TERMS on the next step).
    return '/language';
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
