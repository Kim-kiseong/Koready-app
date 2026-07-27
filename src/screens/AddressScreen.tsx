import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { fetchMyLocations, setDefaultLocation, type UserLocationResponse } from '@/api/address';
import AddressRow from '@/components/AddressRow';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function AddressScreen() {
  const router = useRouter();
  const t = useTranslation();
  const location = useOnboardingStore((state) => state.location);
  const setLocation = useOnboardingStore((state) => state.setLocation);
  const setCurrentLocationId = useOnboardingStore((state) => state.setCurrentLocationId);
  const savedAddresses = useAddressStore((state) => state.savedAddresses);
  const seedSavedAddresses = useAddressStore((state) => state.seedSavedAddresses);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    fetchMyLocations()
      .then(seedSavedAddresses)
      .catch(() => {
        // Keep showing the cached list; nothing actionable to do here.
      });
  }, [seedSavedAddresses]);

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
        Alert.alert('오류', '삭제되었거나 존재하지 않는 위치예요.');
      } else {
        Alert.alert('오류', '기본 위치 변경에 실패했습니다.');
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // The currently-active location is always the first row; the server's
  // default=true entry (and any option that happens to match it by label)
  // is dropped from the list below to avoid showing the same address twice.
  const otherAddresses = savedAddresses.filter(
    (option) =>
      !option.default && option.customLabel !== location?.displayAddress && option.displayName !== location?.displayAddress,
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => router.back()}
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

        <Pressable
          style={styles.currentLocationButton}
          onPress={() => router.push('/address-search')}>
          <Image source={require('@/assets/images/my_location.svg')} style={styles.myLocationIcon} />
          <CustomText style={styles.currentLocationText}>{t.location.currentLocationButton}</CustomText>
        </Pressable>

        <Pressable style={styles.addHomeRow} onPress={() => router.push('/address-search')}>
          <Image source={require('@/assets/images/myhome.svg')} style={styles.myHomeIcon} />
          <CustomText style={styles.addHomeText}>{t.address.addHome}</CustomText>
        </Pressable>

        <View style={styles.savedList}>
          {location && (
            <AddressRow
              title={location.displayAddress}
              badge={t.address.currentAddressBadge}
              right={<Checkbox selected />}
            />
          )}
          {otherAddresses.map((option) => (
            <AddressRow
              key={option.locationId}
              title={option.customLabel ?? option.displayName}
              subtitle={option.roadAddress ?? option.address ?? undefined}
              right={<Checkbox selected={false} />}
              onPress={() => handleSelectSaved(option)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Checkbox({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      <SymbolView
        name={{ ios: 'checkmark', android: 'check', web: 'check' }}
        size={12}
        weight="bold"
        tintColor={selected ? '#ffffff' : Palette.grey350}
      />
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
    fontSize: 16,
    color: Palette.grey400,
  },
  currentLocationButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currentLocationText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.text,
  },
  addHomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Palette.grey150,
  },
  addHomeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  savedList: {},
  pencilIcon: {
    width: 24,
    height: 24,
  },
  myLocationIcon: {
    width: 18,
    height: 18,
  },
  myHomeIcon: {
    width: 17,
    height: 18,
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
