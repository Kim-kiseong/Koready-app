import type { Href } from 'expo-router';

import type { NextStep } from '@/api/types';

export function resolveNextStepRoute(nextStep: NextStep): Href {
  switch (nextStep) {
    case 'LANGUAGE':
      return '/language';
    case 'ONBOARDING':
      return '/onboarding';
    case 'COMPLETED':
      return '/';
    // TERMS screen doesn't exist yet — temporarily route through language
    // selection until it's built.
    case 'TERMS':
      return '/language';
  }
}
