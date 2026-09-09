import { useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/build/react-navigation/core';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LanguageCode } from '@/api/types';
import { updateMyLanguage } from '@/api/user';
import CustomText from '@/components/CustomText';
import BackIcon from '@/components/icons/BackIcon';
import ConfirmationModal from '@/components/ConfirmationModal';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

export default function SettingsLanguageScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const copy = t.settingsLanguage;
  const applyLanguageChange = useAuthStore((state) => state.applyLanguageChange);
  const hasHydrated = useLanguageStore((state) => state.hasHydrated);
  const savedLanguage = useLanguageStore((state) => state.language);
  const [selected, setSelected] = useState<LanguageCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const pendingNavigationActionRef = useRef<any>(null);
  const hasInitializedSelection = useRef(false);

  useEffect(() => {
    if (hasHydrated && !hasInitializedSelection.current) {
      setSelected(savedLanguage);
      hasInitializedSelection.current = true;
    }
  }, [hasHydrated, savedLanguage]);

  const handleSelect = (language: LanguageCode) => {
    setSelected(language);
  };

  const hasUnsavedChanges = !isLeaving && selected !== savedLanguage;

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    pendingNavigationActionRef.current = data.action;
    setUnsavedChangesModalOpen(true);
  });

  useEffect(() => {
    if (!isLeaving) return;
    goBackOrRoot(router);
  }, [isLeaving, router]);

  if (!hasHydrated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!selected || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await updateMyLanguage(selected);
      applyLanguageChange(result);
      pendingNavigationActionRef.current = null;
      setUnsavedChangesModalOpen(false);
      setIsLeaving(true);
    } catch (error) {
      Alert.alert(copy.errorTitle, error instanceof Error ? error.message : copy.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestLeaveScreen = () => {
    if (hasUnsavedChanges) {
      setUnsavedChangesModalOpen(true);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    goBackOrRoot(router);
  };

  const confirmLeaveScreen = () => {
    setUnsavedChangesModalOpen(false);
    pendingNavigationActionRef.current = null;
    setIsLeaving(true);
  };

  const cancelLeaveScreen = () => {
    pendingNavigationActionRef.current = null;
    setUnsavedChangesModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={10} style={styles.backButton} onPress={requestLeaveScreen}>
          <BackIcon />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.textGroup}>
          <CustomText style={styles.title}>{copy.title}</CustomText>
          <CustomText style={styles.subtitle}>{copy.subtitle}</CustomText>
        </View>

        <View style={styles.cardList}>
          <LanguageOptionCard
            title={copy.options.EN.title}
            subtitle={copy.options.EN.subtitle}
            selected={selected === 'EN'}
            onPress={() => handleSelect('EN')}
          />
          <LanguageOptionCard
            title={copy.options.KO.title}
            subtitle={copy.options.KO.subtitle}
            selected={selected === 'KO'}
            onPress={() => handleSelect('KO')}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom - 30, 0) }]}>
        <PrimaryButton title={copy.done} disabled={!selected || isSubmitting} onPress={handleSave} />
      </View>

      <ConfirmationModal
        visible={unsavedChangesModalOpen}
        message={copy.unsavedChangesMessage}
        cancelLabel={copy.cancel}
        confirmLabel={copy.leave}
        onCancel={cancelLeaveScreen}
        onConfirm={confirmLeaveScreen}
      />
    </SafeAreaView>
  );
}

function LanguageOptionCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardUnselected,
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.cardTextGroup}>
        <CustomText style={styles.cardTitle}>{title}</CustomText>
        <CustomText style={styles.cardSubtitle}>{subtitle}</CustomText>
      </View>

      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? (
          <SymbolView
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={12}
            weight="semibold"
            tintColor={Palette.white}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  textGroup: {
    gap: 4,
    marginBottom: 24,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    lineHeight: 30.8,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey400,
  },
  cardList: {
    gap: 8,
  },
  card: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.secondary,
  },
  cardUnselected: {
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardTextGroup: {
    gap: 6,
  },
  cardTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  cardSubtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Palette.grey300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primary,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 26, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  unsavedChangesSheet: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    backgroundColor: Palette.white,
    borderRadius: 24,
    gap: 24,
  },
  unsavedChangesMessage: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1C1C1A',
    textAlign: 'center',
  },
  unsavedChangesButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unsavedChangesCancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DEE5',
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesCancelText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    lineHeight: 22.4,
    color: Palette.grey400,
  },
  unsavedChangesConfirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesConfirmText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 22.4,
    color: Palette.white,
  },
});
