import { Modal, Pressable, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type DeleteAddressModalProps = {
  visible: boolean;
  addressTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteAddressModal({
  visible,
  addressTitle,
  onCancel,
  onConfirm,
}: DeleteAddressModalProps) {
  const t = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.titleRow}>
            <CustomText style={styles.titleBold}>{`'${addressTitle}'`}</CustomText>
            <CustomText style={styles.titleRegular}>{t.deleteAddressModal.suffix}</CustomText>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <CustomText style={styles.cancelButtonText}>{t.deleteAddressModal.cancel}</CustomText>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <CustomText style={styles.confirmButtonText}>{t.deleteAddressModal.confirm}</CustomText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 24,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  titleBold: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
  },
  titleRegular: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    color: Palette.grey400,
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: '#ffffff',
  },
});
