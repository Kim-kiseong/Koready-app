import { fetchMyLocations, type UserLocationResponse } from '@/api/address';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { useAuthStore } from '@/store/auth-store';
import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';

function pickPreferredLocation(
  savedLocations: UserLocationResponse[],
  currentLocationId: number | null,
): UserLocationResponse | null {
  if (currentLocationId != null) {
    const currentLocation = savedLocations.find((item) => item.locationId === currentLocationId);
    if (currentLocation) {
      return currentLocation;
    }
  }

  return savedLocations.find((item) => item.default) ?? savedLocations[0] ?? null;
}

function hydrateLocationState(savedLocation: UserLocationResponse | null) {
  const onboardingStore = useOnboardingStore.getState();

  if (!savedLocation) {
    onboardingStore.clearLocation();
    return;
  }

  onboardingStore.setLocation({
    displayAddress: savedLocation.customLabel ?? savedLocation.displayName,
    latitude: savedLocation.latitude,
    longitude: savedLocation.longitude,
    source: 'search',
  });
  onboardingStore.setCurrentLocationId(savedLocation.locationId);
}

// Re-fetches the authoritative saved-location list from the backend and
// restores the user's current map/home location from it. This is called right
// after a successful real login so logging out and back in shows the same
// address again instead of falling back to "위치정보 없음".
export async function refreshSavedLocationsAndRestoreCurrentLocation(): Promise<UserLocationResponse[]> {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken || (__DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN)) {
    return [];
  }

  const refreshedLocations = await fetchMyLocations();
  useAddressStore.getState().replaceSavedAddresses(refreshedLocations);

  const currentLocationId = useOnboardingStore.getState().currentLocationId;
  hydrateLocationState(pickPreferredLocation(refreshedLocations, currentLocationId));

  return refreshedLocations;
}
