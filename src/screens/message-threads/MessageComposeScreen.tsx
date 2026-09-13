import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/build/react-navigation/core';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchBuddyProfile, fetchProfileOptions } from '@/api/buddy-profile';
import {
  createMessageThreadIdempotencyKey,
  sendMessageThread,
} from '@/api/messages';
import type {
  BuddyProfileDetail,
  MessageThreadResponse,
  ProfileOptionItem,
  ProfileOptionsResponse,
} from '@/api/types';
import CustomText from '@/components/CustomText';
import BackIcon from '@/components/icons/BackIcon';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import { useMessageThreadStore } from '@/store/message-thread-store';
import { useAuthStore } from '@/store/auth-store';
import { formatCountryDisplay } from '@/utils/country';
import { buildLanguageDisplayLabels, normalizeLanguageCode } from '@/utils/language-display';
import { resolveProfileImageUri } from '@/utils/profile-image';

type MessageComposeParams = {
  receiverProfileId?: string;
  placeId?: string;
  placeRouteId?: string;
  placeTitle?: string;
  placeAddress?: string;
  placeImageUrl?: string;
  placeNumericId?: string;
};

const MAX_MESSAGE_LENGTH = 500;

export default function MessageComposeScreen() {
  const publicId = useAuthStore((state) => state.user?.publicId);
  const ownerPublicId = useMessageThreadStore((state) => state.ownerPublicId);
  const sessionVersion = useMessageThreadStore((state) => state.sessionVersion);
  if (!publicId || publicId !== ownerPublicId) return null;
  return <MessageComposeContent key={`${publicId}:${sessionVersion}`} sessionVersion={sessionVersion} />;
}

function MessageComposeContent({ sessionVersion }: { sessionVersion: number }) {
  const router = useRouter();
  const navigation = useNavigation();
  const language = useLanguageStore((state) => state.language);
  const t = useTranslation();
  const {
    receiverProfileId,
    placeId,
    placeRouteId,
    placeTitle,
    placeAddress,
    placeImageUrl,
    placeNumericId,
  } = useLocalSearchParams<MessageComposeParams>();
  const normalizedReceiverProfileId = Array.isArray(receiverProfileId) ? receiverProfileId[0] : receiverProfileId;
  const normalizedPlaceId = Array.isArray(placeId) ? placeId[0] : placeId;
  const normalizedPlaceRouteId = Array.isArray(placeRouteId) ? placeRouteId[0] : placeRouteId;
  const normalizedPlaceTitle = Array.isArray(placeTitle) ? placeTitle[0] : placeTitle;
  const normalizedPlaceAddress = Array.isArray(placeAddress) ? placeAddress[0] : placeAddress;
  const normalizedPlaceImageUrl = Array.isArray(placeImageUrl) ? placeImageUrl[0] : placeImageUrl;
  const normalizedPlaceNumericId = Array.isArray(placeNumericId) ? placeNumericId[0] : placeNumericId;
  const parsedPlaceId = useMemo(() => {
    if (!normalizedPlaceId) {
      return null;
    }

    const parsed = Number(normalizedPlaceId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [normalizedPlaceId]);

  const parsedPlaceNumericId = useMemo(() => {
    if (!normalizedPlaceNumericId) {
      return null;
    }

    const parsed = Number(normalizedPlaceNumericId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [normalizedPlaceNumericId]);

  const parsedReceiverProfileId = useMemo(() => {
    if (!normalizedReceiverProfileId) {
      return null;
    }

    const parsed = Number(normalizedReceiverProfileId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [normalizedReceiverProfileId]);

  const [loadState, setLoadState] = useState<{
    key: string;
    profile: BuddyProfileDetail | null;
    options: Pick<ProfileOptionsResponse, 'countries' | 'languages' | 'koreanLevels'> | null;
    error: string | null;
  } | null>(null);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [sentThread, setSentThread] = useState<MessageThreadResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const loadKey = JSON.stringify([language, parsedReceiverProfileId, reloadKey]);
  const currentLoad = loadState?.key === loadKey ? loadState : null;
  const profile = currentLoad?.profile ?? null;
  const options = currentLoad?.options ?? null;
  const isLoading = parsedReceiverProfileId != null && currentLoad == null;
  const loadError = parsedReceiverProfileId == null
    ? t.messages.compose.errorDescriptionFallback
    : currentLoad?.error ?? null;
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const pendingNavigationActionRef = useRef<any>(null);
  const sendInFlightRef = useRef(false);
  const messageInputRef = useRef<TextInput | null>(null);

  const sendDisabled = !content.trim() || isSending;
  const contentLength = content.length;
  const hasUnsavedChanges = content.trim().length > 0 && !successVisible;

  const openUnsavedChangesModal = useCallback(
    (action?: any) => {
      if (unsavedChangesModalOpen) {
        return;
      }

      if (action) {
        pendingNavigationActionRef.current = action;
      }

      setUnsavedChangesModalOpen(true);
    },
    [unsavedChangesModalOpen],
  );

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    openUnsavedChangesModal(data.action);
  });

  useEffect(() => {
    let cancelled = false;

    if (parsedReceiverProfileId == null) {
      return;
    }

    (async () => {
      const [profileResult, optionsResult] = await Promise.allSettled([
        fetchBuddyProfile(parsedReceiverProfileId),
        fetchProfileOptions(),
      ]);

      if (cancelled) {
        return;
      }

      setLoadState({
        key: loadKey,
        profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
        options: optionsResult.status === 'fulfilled' ? optionsResult.value : null,
        error: profileResult.status === 'rejected'
          ? extractErrorMessage(profileResult.reason, t.messages.compose.errorDescriptionFallback)
          : null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [loadKey, parsedReceiverProfileId, t.messages.compose.errorDescriptionFallback]);

  const languageChips = useMemo(() => {
    if (!profile || !options) {
      return [];
    }

    const sortedLanguages = sortLanguageCodesByOptionOrder(profile.availableLanguages, options.languages);
    return buildLanguageDisplayLabels(
      sortedLanguages,
      profile.koreanLevel,
      (code) => getLabel(code, options.languages, language),
      (level) => getLabel(level, options.koreanLevels, language),
      '',
      { koreanLevelPlacement: 'append', koreanLabelFallback: '' },
    );
  }, [language, options, profile]);

  const handleSend = useCallback(async () => {
    if (!profile) {
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent || isSending || sendInFlightRef.current) {
      return;
    }

    try {
      sendInFlightRef.current = true;
      setIsSending(true);
      const receiverId = parsedReceiverProfileId ?? profile.profileId;
      const placeIdValue = parsedPlaceNumericId ?? parsedPlaceId ?? 0;
      const threadResponse = await sendMessageThread(
        {
          receiverProfileId: receiverId,
          placeId: placeIdValue,
          content: trimmedContent,
        },
        createMessageThreadIdempotencyKey(),
        {
          placeRouteId: normalizedPlaceRouteId ?? normalizedPlaceId ?? undefined,
          placeTitle: normalizedPlaceTitle,
          placeAddress: normalizedPlaceAddress ?? undefined,
          placeImageUrl: normalizedPlaceImageUrl ?? undefined,
        },
      );

      const nextThread = normalizedPlaceTitle || normalizedPlaceRouteId || normalizedPlaceAddress
        ? {
            ...threadResponse,
            place: {
              ...threadResponse.place,
              routeId: normalizedPlaceRouteId ?? normalizedPlaceId ?? threadResponse.place.routeId,
              address: normalizedPlaceAddress ?? threadResponse.place.address,
              imageUrl: normalizedPlaceImageUrl ?? threadResponse.place.imageUrl,
              title: normalizedPlaceTitle ?? threadResponse.place.title,
            },
          }
        : threadResponse;

      useMessageThreadStore.getState().upsertThread(nextThread, sessionVersion);
      setSentThread(nextThread);
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert(t.messages.compose.sendFailedTitle, extractErrorMessage(error, t.messages.compose.errorDescriptionFallback));
    } finally {
      sendInFlightRef.current = false;
      setIsSending(false);
    }
  }, [
    content,
    t,
    normalizedPlaceAddress,
    normalizedPlaceImageUrl,
    normalizedPlaceId,
    normalizedPlaceRouteId,
    normalizedPlaceTitle,
    parsedPlaceId,
    parsedPlaceNumericId,
    parsedReceiverProfileId,
    sessionVersion,
    profile,
    isSending,
  ]);

  const handleViewThread = useCallback(() => {
    if (!sentThread) {
      return;
    }

    setSuccessVisible(false);
    setContent('');
    router.replace('/message-threads' as never);
  }, [router, sentThread]);

  const handleContinueBrowsing = useCallback(() => {
    setSuccessVisible(false);
    setContent('');
    setSentThread(null);
    const placeId = normalizedPlaceNumericId ?? normalizedPlaceId ?? normalizedPlaceRouteId;
    goBackOrRoot(router, placeId
      ? { pathname: '/places/[placeId]', params: { placeId, tab: 'MATES' } }
      : '/home');
  }, [normalizedPlaceId, normalizedPlaceNumericId, normalizedPlaceRouteId, router]);

  const requestLeaveScreen = useCallback(() => {
    if (hasUnsavedChanges) {
      openUnsavedChangesModal();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    goBackOrRoot(router);
  }, [hasUnsavedChanges, navigation, openUnsavedChangesModal, router]);

  const confirmLeaveScreen = useCallback(() => {
    setUnsavedChangesModalOpen(false);
    const pendingAction = pendingNavigationActionRef.current;
    pendingNavigationActionRef.current = null;
    setContent('');
    setSentThread(null);
    setSuccessVisible(false);

    if (pendingAction) {
      navigation.dispatch(pendingAction);
      return;
    }

    goBackOrRoot(router);
  }, [navigation, router]);

  const cancelLeaveScreen = useCallback(() => {
    pendingNavigationActionRef.current = null;
    setUnsavedChangesModalOpen(false);
  }, []);

  if (isLoading) {
    return (
      <ScreenShell>
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
          <CustomText style={styles.loadingText}>{t.messages.compose.loading}</CustomText>
        </View>
      </ScreenShell>
    );
  }

  if (loadError || !profile) {
    return (
      <ScreenShell>
        <View style={styles.errorState}>
          <CustomText style={styles.errorTitle}>{t.messages.compose.errorTitle}</CustomText>
          <CustomText style={styles.errorDescription}>
            {loadError ?? t.messages.compose.errorDescriptionFallback}
          </CustomText>

          <View style={styles.errorActions}>
            <Pressable style={[styles.secondaryButton, styles.errorSecondaryButton]} onPress={() => goBackOrRoot(router)}>
              <CustomText style={styles.secondaryButtonText}>{t.messages.compose.back}</CustomText>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => setReloadKey((value) => value + 1)}>
              <CustomText style={styles.primaryButtonText}>{t.messages.compose.retry}</CustomText>
            </Pressable>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <Pressable hitSlop={12} onPress={requestLeaveScreen}>
              <BackIcon />
            </Pressable>

            <CustomText style={styles.headerTitle}>{t.messages.compose.title}</CustomText>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
              <ProfileAvatar imageUrl={profile.profileImageUrl} nickname={profile.nickname} />

              <View style={styles.profileMeta}>
                <View style={styles.nameRow}>
                  <CustomText style={styles.nickname}>{profile.nickname}</CustomText>
                  <CustomText style={styles.dot}>·</CustomText>
                  <CustomText style={styles.country}>
                    {formatCountryDisplay(
                      profile.nationalityCode ??
                        profile.nationality ??
                        profile.nationalityName ??
                        '',
                      options?.countries,
                      language,
                    )}
                  </CustomText>
                </View>

                <View style={styles.chipRow}>
                  {languageChips.map((label) => (
                    <View key={label} style={styles.languageChip}>
                      <CustomText style={styles.languageChipText}>{label}</CustomText>
                    </View>
                  ))}
                </View>

                <CustomText style={styles.bio}>{profile.bio || t.messages.compose.bioFallback}</CustomText>
              </View>
            </View>

            <View style={styles.messageSection}>
              <CustomText style={styles.sectionTitle}>{t.messages.compose.sectionMessage}</CustomText>

              <Pressable style={styles.messageBox} onPress={() => messageInputRef.current?.focus()}>
                <TextInput
                  ref={messageInputRef}
                  value={content}
                  onChangeText={setContent}
                  placeholder={t.messages.compose.placeholder}
                  placeholderTextColor={Palette.grey500}
                  cursorColor={Palette.primary}
                  selectionColor={Palette.primary}
                  multiline
                  maxLength={MAX_MESSAGE_LENGTH}
                  style={styles.messageInput}
                  textAlignVertical="top"
                />
              </Pressable>

              <View style={styles.counterRow}>
                <CustomText style={styles.counterCurrent}>{contentLength}</CustomText>
                <CustomText style={styles.counterSlash}>/</CustomText>
                <CustomText style={styles.counterTotal}>{MAX_MESSAGE_LENGTH}</CustomText>
              </View>
            </View>

            <View
              style={[
                styles.noticeCard,
                language === 'EN' && styles.noticeCardEnglish,
              ]}>
              <CustomText style={styles.noticeText}>
                {t.messages.compose.safetyNotice}
              </CustomText>
              <View style={styles.noticeDivider} />
              <CustomText style={styles.noticeText}>
                {t.messages.compose.delayNotice}
              </CustomText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && !sendDisabled && styles.pressed,
                  sendDisabled && styles.sendButtonDisabled,
                ]}
                disabled={sendDisabled}
                onPress={handleSend}>
                {isSending ? (
                  <ActivityIndicator color={sendDisabled ? Palette.grey500 : '#FFFFFF'} />
                ) : (
                  <CustomText
                    style={[
                      styles.sendButtonText,
                      sendDisabled && styles.sendButtonTextDisabled,
                    ]}>
                    {t.messages.compose.send}
                  </CustomText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={handleContinueBrowsing}>
        <View style={styles.successOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleContinueBrowsing} />

          <View style={styles.successSheet}>
            <View style={styles.successHandleArea}>
              <View style={styles.successHandle} />
            </View>

            <View style={styles.successContent}>
              <View style={styles.successTextGroup}>
                <CustomText style={styles.successTitle}>{t.messages.compose.sentTitle}</CustomText>
                <CustomText style={styles.successDescription}>
                  {t.messages.compose.sentDescription}
                </CustomText>
              </View>

              <View style={styles.successActions}>
                <Pressable style={styles.successPrimaryButton} onPress={handleViewThread}>
                  <CustomText style={styles.successPrimaryButtonText}>{t.messages.compose.viewMessages}</CustomText>
                </Pressable>

                <Pressable style={styles.successSecondaryButton} onPress={handleContinueBrowsing}>
                  <CustomText style={styles.successSecondaryButtonText}>{t.messages.compose.continueBrowsing}</CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={unsavedChangesModalOpen} transparent animationType="fade" onRequestClose={cancelLeaveScreen}>
        <Pressable style={styles.unsavedChangesOverlay} onPress={cancelLeaveScreen}>
          <Pressable style={styles.unsavedChangesSheet} onPress={() => {}}>
            <CustomText style={styles.unsavedChangesMessage}>
              {t.messages.compose.unsavedMessage}
            </CustomText>

            <View style={styles.unsavedChangesButtonRow}>
              <Pressable style={styles.unsavedChangesCancelButton} onPress={cancelLeaveScreen}>
                <CustomText style={styles.unsavedChangesCancelText}>{t.messages.compose.unsavedCancel}</CustomText>
              </Pressable>
              <Pressable style={styles.unsavedChangesConfirmButton} onPress={confirmLeaveScreen}>
                <CustomText style={styles.unsavedChangesConfirmText}>{t.messages.compose.unsavedLeave}</CustomText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenShell>
  );
}

function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.shell} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

function ProfileAvatar({ imageUrl, nickname }: { imageUrl: string | null; nickname: string }) {
  const resolvedImageUrl = resolveProfileImageUri(imageUrl);

  return (
    <View style={styles.avatarWrap}>
      {resolvedImageUrl ? (
        <Image source={{ uri: resolvedImageUrl }} style={styles.avatarImage} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <CustomText style={styles.avatarInitial}>{nickname.trim().charAt(0).toUpperCase() || 'M'}</CustomText>
        </View>
      )}
    </View>
  );
}

function sortLanguageCodesByOptionOrder(codes: string[], options: ProfileOptionItem[]) {
  const order = new Map(
    options.map((option, index) => [normalizeLanguageCode(option.code), index] as const),
  );
  const normalized = codes
    .map(normalizeLanguageCode)
    .filter((code): code is string => typeof code === 'string' && code.length > 0);
  const unique = Array.from(new Set(normalized));

  return unique.sort((left, right) => {
    const leftOrder = order.get(left);
    const rightOrder = order.get(right);

    if (leftOrder == null && rightOrder == null) {
      return left.localeCompare(right);
    }

    if (leftOrder == null) {
      return 1;
    }

    if (rightOrder == null) {
      return -1;
    }

    return leftOrder - rightOrder;
  });
}

function getLabel(code: string, options: ProfileOptionItem[], language: 'KO' | 'EN') {
  const option = options.find((item) => normalizeLanguageCode(item.code) === normalizeLanguageCode(code));
  if (!option) {
    return '';
  }

  return language === 'EN' ? option.labelEn : option.labelKo;
}

function extractErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardWrap: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  errorTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 27,
    color: Palette.text,
  },
  errorDescription: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  errorSecondaryButton: {
    minWidth: 120,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minWidth: 120,
  },
  primaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  header: {
    minHeight: 54,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  headerSpacer: {
    width: 24,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 18,
  },
  profileCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F3F5',
    backgroundColor: '#FFFFFF',
  },
  avatarWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#E8EEF2',
  },
  avatarFallback: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EEF2',
  },
  avatarInitial: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.grey500,
  },
  profileMeta: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  nickname: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  dot: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  country: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    height: 24,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#9BE6C6',
    backgroundColor: '#F4FFF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageChipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: Palette.primary,
  },
  bio: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  messageSection: {
    marginTop: 32,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  messageBox: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    backgroundColor: '#F6F9FB',
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  messageInput: {
    flex: 1,
    width: '100%',
    minHeight: 68,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
    padding: 0,
    margin: 0,
  },
  counterRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  counterCurrent: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey700,
    letterSpacing: -0.26,
  },
  counterSlash: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
    letterSpacing: -0.26,
  },
  counterTotal: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
    letterSpacing: -0.26,
  },
  noticeCard: {
    marginTop: Platform.select({ web: 147, default: 180 }),
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noticeCardEnglish: {
    marginTop: Platform.select({ web: 110, default: 130 }),
  },
  noticeText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 20.8,
    color: Palette.grey600,
  },
  noticeDivider: {
    height: 1,
    backgroundColor: Palette.grey200,
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  footerContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sendButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E8EEF2',
  },
  sendButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#FFFFFF',
  },
  sendButtonTextDisabled: {
    color: Palette.grey500,
  },
  pressed: {
    opacity: 0.85,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'flex-end',
  },
  successSheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'stretch',
  },
  successHandleArea: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
    paddingBottom: 24,
  },
  successHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
  },
  successContent: {
    alignSelf: 'stretch',
    gap: 32,
  },
  successTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
    textAlign: 'left',
  },
  successTextGroup: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    gap: 8,
  },
  successDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.grey600,
    textAlign: 'left',
  },
  successActions: {
    alignSelf: 'stretch',
    gap: 12,
  },
  successPrimaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successPrimaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: '#FFFFFF',
  },
  successSecondaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7DEE5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successSecondaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 25.2,
    color: '#8B95A1',
  },
  unsavedChangesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unsavedChangesSheet: {
    width: '100%',
    maxWidth: 335,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  unsavedChangesMessage: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  unsavedChangesButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unsavedChangesCancelButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesCancelText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.grey600,
  },
  unsavedChangesConfirmButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesConfirmText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#FFFFFF',
  },
});
