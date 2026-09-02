import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  InteractionManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { logout } from '@/api/auth';
import ConfirmationModal from '@/components/ConfirmationModal';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

type SettingRowProps = {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
  value?: string;
  showDivider?: boolean;
  showChevron?: boolean;
};

const ROW_RIGHT_ICON = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const t = useTranslation();
  const copy = t.settings;
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const deviceId = useAuthStore((state) => state.deviceId);
  const clearSession = useAuthStore((state) => state.clearSession);
  const language = useLanguageStore((state) => state.language);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const [pendingAccountAction, setPendingAccountAction] = useState<'logout' | 'withdraw' | null>(null);
  const accountActionModalCopy =
    pendingAccountAction === 'logout'
      ? {
          message: copy.actions.logoutConfirmTitle,
          confirmLabel: copy.actions.logoutConfirmButton,
        }
      : pendingAccountAction === 'withdraw'
        ? {
            message: copy.actions.withdrawConfirmTitle,
            confirmLabel: copy.actions.withdrawConfirmButton,
          }
        : null;

  const handleLogout = async () => {
    if (!refreshToken) {
      clearSession();
      router.replace('/login');
      return;
    }

    try {
      await logout({ refreshToken, deviceId });
      clearSession();
      router.replace('/login');
    } catch {
      Alert.alert(copy.alerts.errorTitle, copy.alerts.logoutFailed);
    }
  };

  const closeAccountActionModal = () => {
    setPendingAccountAction(null);
  };

  const handleConfirmAccountAction = async () => {
    const action = pendingAccountAction;
    setPendingAccountAction(null);

    if (action === 'logout') {
      await handleLogout();
      return;
    }

    if (action === 'withdraw') {
      InteractionManager.runAfterInteractions(() => {
        Alert.alert(copy.alerts.withdrawComingSoonTitle, copy.alerts.withdrawComingSoonBody);
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={10} style={styles.headerButton} onPress={() => goBackOrRoot(router)}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }}
            size={18}
            weight="semibold"
            tintColor={Palette.text}
          />
        </Pressable>

        <CustomText style={styles.headerTitle}>{copy.title}</CustomText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsSection title={copy.sections.preferences}>
          <SettingRow
            label={copy.rows.language}
            icon={<LanguageSettingIcon />}
            value={copy.languageValues[language]}
            showDivider
            onPress={() => router.push('/settings-language')}
          />
        </SettingsSection>

        <SettingsSection title={copy.sections.serviceInfo}>
          <SettingRow
            label={copy.rows.termsOfService}
            icon={<TermsIcon />}
            showDivider
            onPress={() => router.push('/terms')}
          />
          <SettingRow
            label={copy.rows.privacyPolicy}
            icon={<PrivacyPolicyIcon />}
            showDivider
            onPress={() =>
              Alert.alert(copy.alerts.privacyComingSoonTitle, copy.alerts.privacyComingSoonBody)
            }
          />
          <SettingRow
            label={copy.rows.appVersion}
            icon={
              <SymbolView
                name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                size={20}
                weight="regular"
                tintColor={Palette.text}
              />
            }
            value={appVersion}
            showChevron={false}
          />
        </SettingsSection>

        <SettingsSection title={copy.sections.account}>
          <SettingRow
            label={copy.rows.logOut}
            icon={<LogoutIcon />}
            showDivider
            onPress={() => setPendingAccountAction('logout')}
          />
          <SettingRow
            label={copy.rows.deleteAccount}
            icon={<WithdrawIcon />}
            onPress={() => setPendingAccountAction('withdraw')}
          />
        </SettingsSection>
      </ScrollView>

      {accountActionModalCopy ? (
        <ConfirmationModal
          visible
          message={accountActionModalCopy.message}
          cancelLabel={copy.actions.cancel}
          confirmLabel={accountActionModalCopy.confirmLabel}
          onCancel={closeAccountActionModal}
          onConfirm={handleConfirmAccountAction}
        />
      ) : null}
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>{title}</CustomText>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingRow({
  label,
  icon,
  value,
  onPress,
  showDivider = false,
  showChevron = true,
}: SettingRowProps) {
  return (
    <View style={styles.rowBlock}>
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.row, onPress && pressed ? styles.rowPressed : null]}
      >
        <View style={styles.rowLeft}>
          <View style={styles.rowIcon}>{icon}</View>
          <CustomText style={styles.rowLabel}>{label}</CustomText>
        </View>

        <View style={styles.rowRight}>
          {value ? <CustomText style={styles.rowValue}>{value}</CustomText> : null}
          {showChevron ? (
            <SymbolView name={ROW_RIGHT_ICON} size={14} weight="semibold" tintColor={Palette.grey400} />
          ) : null}
        </View>
      </Pressable>
      {showDivider ? <View style={styles.rowDivider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 16,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  row: {
    height: 60,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#ffffff',
    width: '100%',
    alignSelf: 'stretch',
  },
  rowBlock: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
  },
  rowDivider: {
    height: 1,
    width: '100%',
    alignSelf: 'stretch',
    marginHorizontal: 20,
    backgroundColor: Palette.grey150,
  },
  sectionContent: {
    width: '100%',
    alignSelf: 'stretch',
  },
  rowPressed: {
    backgroundColor: Palette.grey100,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: Platform.select({
      web: 'Inter',
      default: FontFamily.pretendard.medium,
    }),
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    gap: 24,
  },
  modalTitle: {
    color: Palette.text,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEE5',
  },
  modalConfirmButton: {
    backgroundColor: Palette.primary,
  },
  modalButtonPressed: {
    opacity: 0.88,
  },
  modalCancelText: {
    color: Palette.grey500,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    lineHeight: 25.2,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    paddingHorizontal: 6,
  },
});

function LanguageSettingIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12C20 16.4183 16.4183 20 12 20M20 12C20 7.58172 16.4183 4 12 4M20 12H4M12 20C7.58172 20 4 16.4183 4 12M12 20C9.94579 17.8431 8.8 14.9786 8.8 12C8.8 9.02139 9.94579 6.15692 12 4M12 20C14.0542 17.8431 15.2 14.9786 15.2 12C15.2 9.02139 14.0542 6.15692 12 4M4 12C4 7.58172 7.58172 4 12 4"
        stroke={Palette.text}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TermsIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.625 4H7.125C6.69402 4 6.2807 4.16857 5.97595 4.46863C5.6712 4.76869 5.5 5.17566 5.5 5.6V18.4C5.5 18.8243 5.6712 19.2313 5.97595 19.5314C6.2807 19.8314 6.69402 20 7.125 20H16.875C17.306 20 17.7193 19.8314 18.024 19.5314C18.3288 19.2313 18.5 18.8243 18.5 18.4V8.8M13.625 4C13.8822 3.99959 14.1369 4.04928 14.3746 4.14622C14.6122 4.24315 14.828 4.38541 15.0095 4.5648L17.9247 7.4352C18.1074 7.61401 18.2523 7.82668 18.3511 8.06093C18.4498 8.29518 18.5004 8.54638 18.5 8.8M13.625 4V8C13.625 8.21217 13.7106 8.41566 13.863 8.56568C14.0153 8.71571 14.222 8.8 14.4375 8.8L18.5 8.8"
        stroke={Palette.text}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PrivacyPolicyIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.375 11.9989L11.125 13.7986L14.625 10.1992M19 12.8987C19 17.398 15.9375 19.6476 12.2975 20.9524C12.1069 21.0188 11.8998 21.0156 11.7113 20.9434C8.0625 19.6476 5 17.398 5 12.8987V6.5998C5 6.36115 5.09219 6.13227 5.25628 5.96351C5.42038 5.79476 5.64294 5.69995 5.875 5.69995C7.625 5.69995 9.8125 4.62013 11.335 3.25236C11.5204 3.08949 11.7562 3 12 3C12.2438 3 12.4796 3.08949 12.665 3.25236C14.1963 4.62913 16.375 5.69995 18.125 5.69995C18.3571 5.69995 18.5796 5.79476 18.7437 5.96351C18.9078 6.13227 19 6.36115 19 6.5998V12.8987Z"
        stroke={Palette.text}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.5556 7.55556L20 12L15.5556 16.4444M20 12H9.33333M9.33333 20H5.77778C5.30628 20 4.8541 19.8127 4.5207 19.4793C4.1873 19.1459 4 18.6937 4 18.2222V5.77778C4 5.30628 4.1873 4.8541 4.5207 4.5207C4.8541 4.1873 5.30628 4 5.77778 4H9.33333"
        stroke={Palette.text}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WithdrawIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20C2.99992 18.6314 3.39972 17.2918 4.15141 16.1421C4.9031 14.9924 5.97475 14.0813 7.23774 13.5182C8.50073 12.9551 9.90141 12.764 11.2717 12.9677C12.642 13.1714 13.9236 13.7613 14.9628 14.6667M21 18.2223H15.6M14.7 8.44446C14.7 10.8991 12.6853 12.8889 10.2 12.8889C7.71472 12.8889 5.7 10.8991 5.7 8.44446C5.7 5.98985 7.71472 4 10.2 4C12.6853 4 14.7 5.98985 14.7 8.44446Z"
        stroke={Palette.text}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
