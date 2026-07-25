import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LanguageCode } from '@/api/types';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type LanguageSwitchModalProps = {
  visible: boolean;
  currentLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LanguageSwitchModal({
  visible,
  currentLanguage,
  targetLanguage,
  onCancel,
  onConfirm,
}: LanguageSwitchModalProps) {
  const t = useTranslation();

  const languageLabel = (code: LanguageCode) =>
    code === 'KO' ? t.home.languageKo : t.home.languageEn;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.textGroup}>
            <CustomText style={styles.title}>{t.languageModal.title}</CustomText>
            <CustomText style={styles.subtitle}>{t.languageModal.subtitle[targetLanguage]}</CustomText>
          </View>

          <View style={styles.pillRow}>
            <View style={styles.pillCurrent}>
              <CustomText style={styles.pillCurrentText}>{languageLabel(currentLanguage)}</CustomText>
            </View>
            <View style={styles.arrowCircle}>
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                size={12}
                weight="semibold"
                tintColor={Palette.grey400}
              />
            </View>
            <View style={styles.pillTarget}>
              <CustomText style={styles.pillTargetText}>{languageLabel(targetLanguage)}</CustomText>
            </View>
          </View>

          <SafeAreaView edges={['bottom']} style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <CustomText style={styles.cancelButtonText}>{t.languageModal.cancel}</CustomText>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <CustomText style={styles.confirmButtonText}>{t.languageModal.confirm}</CustomText>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    gap: 20,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 40,
    backgroundColor: '#E5E8EB',
  },
  textGroup: {
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.grey600,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pillCurrent: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCurrentText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.grey600,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTarget: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTargetText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
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
