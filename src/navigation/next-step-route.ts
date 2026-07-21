import type { Href } from 'expo-router';

import type { NextStep } from '@/api/types';

export function resolveNextStepRoute(nextStep: NextStep): Href {
  switch (nextStep) {
    case 'ONBOARDING':
      return '/onboarding';
    case 'COMPLETED':
      return '/';
    // TERMS and LANGUAGE screens don't exist yet — temporarily route through
    // onboarding until they're built.
    case 'TERMS':
    case 'LANGUAGE':
      return '/onboarding';
  }
}
