import type { Href } from 'expo-router';

import type { NextStep } from '@/api/types';

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
