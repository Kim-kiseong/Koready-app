import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddressRow from '@/components/AddressRow';
import CustomText from '@/components/CustomText';
import DeleteAddressModal from '@/components/DeleteAddressModal';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAddressStore } from '@/store/address-store';
import { useOnboardingStore } from '@/store/onboarding-store';

type DeleteTarget = { id: 'current' | number; title: string };

export default function AddressEditScreen() {
  const router = useRouter();
  const t = useTranslation();
  const location = useOnboardingStore((state) => state.location);
  const clearLocation = useOnboardingStore((state) => state.clearLocation);
  const savedAddresses = useAddressStore((state) => state.savedAddresses);
  const removeSavedAddress = useAddressStore((state) => state.removeSavedAddress);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const otherAddresses = savedAddresses.filter(
    (option) =>
      !option.default && option.customLabel !== location?.displayAddress && option.displayName !== location?.displayAddress,
  );

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === 'current') {
      clearLocation();
    } else {
      removeSavedAddress(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => router.back()}
        title={t.addressEdit.title}
        rightIcon={<Image source={require('@/assets/images/pencil.svg')} style={styles.pencilIcon} />}
      />

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
  pencilIcon: {
    width: 24,
    height: 24,
  },
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
