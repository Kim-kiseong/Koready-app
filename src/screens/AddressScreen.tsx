import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchSavedAddresses, type SavedAddressOption } from '@/api/address';
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
  const savedAddresses = useAddressStore((state) => state.savedAddresses);
  const seedSavedAddresses = useAddressStore((state) => state.seedSavedAddresses);

  useEffect(() => {
    fetchSavedAddresses().then(seedSavedAddresses);
  }, [seedSavedAddresses]);

  const handleSelectSaved = (option: SavedAddressOption) => {
    setLocation({ displayAddress: option.title, latitude: null, longitude: null, source: 'search' });
  };

  // The currently-active location is always the first row; any saved option
  // that happens to match it is dropped from the list below to avoid showing
  // the same address twice.
  const otherAddresses = savedAddresses.filter((option) => option.title !== location?.displayAddress);

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
              key={option.id}
              title={option.title}
              subtitle={option.subtitle}
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
