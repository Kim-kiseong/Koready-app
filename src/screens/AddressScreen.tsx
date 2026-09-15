import { isAxiosError } from 'axios';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyLocations, setDefaultLocation, type UserLocationResponse } from '@/api/address';
import AddressRow from '@/components/AddressRow';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function AddressScreen() {
  const router = useRouter();
  const t = useTranslation();
  const location = useOnboardingStore((state) => state.location);
  const setLocation = useOnboardingStore((state) => state.setLocation);
  const setCurrentLocationId = useOnboardingStore((state) => state.setCurrentLocationId);
  const savedAddresses = useAddressStore((state) => state.savedAddresses);
  const replaceSavedAddresses = useAddressStore((state) => state.replaceSavedAddresses);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // replaceSavedAddresses, not seedSavedAddresses — hasSeeded persists
    // across app restarts, so the seed-once guard would otherwise leave this
    // screen showing a stale cached list forever after the first successful load.
    fetchMyLocations()
      .then(replaceSavedAddresses)
      .catch(() => {
        // Keep showing the cached list; nothing actionable to do here.
      });
  }, [replaceSavedAddresses]);

  const handleSelectSaved = async (option: UserLocationResponse) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      const updated = await setDefaultLocation(option.locationId);
      setLocation({
        displayAddress: updated.customLabel ?? updated.displayName,
        latitude: updated.latitude,
        longitude: updated.longitude,
        source: 'search',
      });
      setCurrentLocationId(updated.locationId);
      setDefaultAddress(updated.locationId);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        Alert.alert(t.address.alerts.errorTitle, t.address.alerts.locationMissing);
      } else {
        Alert.alert(t.address.alerts.errorTitle, t.address.alerts.setDefaultFailed);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // Every row renders from this single savedAddresses array in its existing
  // order — the default one is never pulled out to a separate top slot, so
  // picking a different address just moves the highlight, not the row.
  const hasDefaultAddress = savedAddresses.some((option) => option.default);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router)}
        title={t.address.title}
        rightIcon={<Image source={require('@/assets/images/pencil.svg')} style={styles.pencilIcon} />}
        onRightPress={() => router.push('/address-edit')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.searchBar} onPress={() => router.push('/address-search')}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="regular"
            tintColor={Palette.grey400}
          />
          <CustomText style={styles.searchPlaceholder}>{t.address.searchPlaceholder}</CustomText>
        </Pressable>

        <View style={styles.savedList}>
          {savedAddresses.map((option) => (
            <AddressRow
              key={option.locationId}
              title={option.customLabel ?? option.displayName}
              subtitle={!option.default ? (option.roadAddress ?? option.address ?? undefined) : undefined}
              badge={option.default ? t.address.currentAddressBadge : undefined}
              right={<Checkbox selected={option.default} />}
              selected={option.default}
              onPress={option.default ? undefined : () => handleSelectSaved(option)}
            />
          ))}
          {/* Fallback for before savedAddresses has loaded or has no entry
              flagged default yet — show the onboarding-store location so the
              screen isn't empty, without risking it also showing below. */}
          {!hasDefaultAddress && location && (
            <AddressRow
              title={location.displayAddress}
              badge={t.address.currentAddressBadge}
              right={<Checkbox selected />}
              selected
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Checkbox({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected && (
        <SymbolView
          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
          size={12}
          weight="bold"
          tintColor="#ffffff"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: Palette.grey100,
    borderColor: Palette.grey200,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    letterSpacing: -0.26,
    color: Palette.grey400,
  },
  savedList: {},
  pencilIcon: {
    width: 24,
    height: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Palette.grey300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
});
