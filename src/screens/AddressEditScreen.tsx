import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { deleteMyLocation, fetchMyLocations } from '@/api/address';
import AddressRow from '@/components/AddressRow';
import CustomText from '@/components/CustomText';
import DeleteAddressModal from '@/components/DeleteAddressModal';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';

type DeleteTarget = { id: 'current' | number; title: string };

export default function AddressEditScreen() {
  const router = useRouter();
  const t = useTranslation();
  const location = useOnboardingStore((state) => state.location);
  const currentLocationId = useOnboardingStore((state) => state.currentLocationId);
  const setLocation = useOnboardingStore((state) => state.setLocation);
  const setCurrentLocationId = useOnboardingStore((state) => state.setCurrentLocationId);
  const clearLocation = useOnboardingStore((state) => state.clearLocation);
  const savedAddresses = useAddressStore((state) => state.savedAddresses);
  const replaceSavedAddresses = useAddressStore((state) => state.replaceSavedAddresses);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const otherAddresses = savedAddresses.filter(
    (option) =>
      !option.default && option.customLabel !== location?.displayAddress && option.displayName !== location?.displayAddress,
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    const locationId = deleteTarget.id === 'current' ? currentLocationId : deleteTarget.id;
    setDeleteTarget(null);

    // No backend record to delete (e.g. the mock "current location" button) — just clear locally.
    if (locationId == null) {
      if (deleteTarget.id === 'current') clearLocation();
      return;
    }

    setIsDeleting(true);
    try {
      try {
        await deleteMyLocation(locationId);
      } catch (error) {
        // 404 means it's already gone server-side — safe to fall through and resync.
        if (!(isAxiosError(error) && error.response?.status === 404)) {
          Alert.alert(t.addressEdit.alerts.errorTitle, t.addressEdit.alerts.deleteFailed);
          return;
        }
      }

      // Deleting the default location reassigns default server-side; a 204
      // response doesn't say to what, so re-fetch to find the new one.
      const refreshed = await fetchMyLocations();
      replaceSavedAddresses(refreshed);
      const newDefault = refreshed.find((item) => item.default) ?? null;
      if (newDefault) {
        setLocation({
          displayAddress: newDefault.customLabel ?? newDefault.displayName,
          latitude: newDefault.latitude,
          longitude: newDefault.longitude,
          source: 'search',
        });
        setCurrentLocationId(newDefault.locationId);
      } else {
        clearLocation();
      }
    } catch {
      // The delete itself likely succeeded server-side; only the resync failed.
      Alert.alert(t.addressEdit.alerts.errorTitle, t.addressEdit.alerts.refreshFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={t.addressEdit.title} rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {location && (
            <AddressRow
              title={location.displayAddress}
              badge={t.address.currentAddressBadge}
              right={
                <DeleteChip
                  label={t.addressEdit.delete}
                  onPress={() => setDeleteTarget({ id: 'current', title: location.displayAddress })}
                />
              }
            />
          )}
          {otherAddresses.map((option) => (
            <AddressRow
              key={option.locationId}
              title={option.customLabel ?? option.displayName}
              subtitle={option.roadAddress ?? option.address ?? undefined}
              right={
                <DeleteChip
                  label={t.addressEdit.delete}
                  onPress={() =>
                    setDeleteTarget({
                      id: option.locationId,
                      title: option.customLabel ?? option.displayName,
                    })
                  }
                />
              }
            />
          ))}
        </View>
      </ScrollView>

      <DeleteAddressModal
        visible={deleteTarget !== null}
        addressTitle={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}

function DeleteChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.deleteChip} onPress={onPress}>
      <CustomText style={styles.deleteChipText}>{label}</CustomText>
    </Pressable>
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
  },
  list: {},
  deleteChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  deleteChipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.grey500,
  },
});
