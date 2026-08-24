import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
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
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LanguageSwitchModal({
  visible,
  currentLanguage,
  targetLanguage,
  loading = false,
  onCancel,
  onConfirm,
}: LanguageSwitchModalProps) {
  const t = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  // Modal's own animationType="slide" translates the whole tree it renders —
  // backdrop included — so the dim overlay used to slide up from the bottom
  // together with the sheet instead of just appearing. Driving the two
  // separately (backdrop opacity, sheet translateY) with animationType="none"
  // gives the backdrop a plain fade while the sheet still slides in.
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [sheetTranslateY] = useState(() => new Animated.Value(windowHeight));

  useEffect(() => {
    const backdropListenerId = backdropOpacity.addListener(() => {});
    const sheetListenerId = sheetTranslateY.addListener(() => {});

    return () => {
      backdropOpacity.removeListener(backdropListenerId);
      sheetTranslateY.removeListener(sheetListenerId);
    };
  }, [backdropOpacity, sheetTranslateY]);

  useEffect(() => {
    if (!visible) return;
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(windowHeight);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, windowHeight, backdropOpacity, sheetTranslateY]);

  const languageLabel = (code: LanguageCode) =>
    code === 'KO' ? t.home.languageKo : t.home.languageEn;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <AnimatedPressable
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
          onPress={loading ? undefined : onCancel}
        />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
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
            <Pressable
              style={[styles.cancelButton, loading && styles.buttonDisabled]}
              onPress={onCancel}
              disabled={loading}>
              <CustomText style={styles.cancelButtonText}>{t.languageModal.cancel}</CustomText>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <CustomText style={styles.confirmButtonText}>{t.languageModal.confirm}</CustomText>
              )}
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(28,28,26,0.7)',
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
  buttonDisabled: {
    opacity: 0.5,
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
