import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/build/react-navigation/core';
import { SymbolView } from 'expo-symbols';
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
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { goBackOrRoot } from '@/navigation/safe-back';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { useMessageThreadStore } from '@/store/message-thread-store';
import { formatCountryDisplay, normalizeCountryCode } from '@/utils/country';

type MessageComposeParams = {
  receiverProfileId?: string;
  placeId?: string;
  placeRouteId?: string;
  placeTitle?: string;
  placeAddress?: string;
  placeImageUrl?: string;
  placeNumericId?: string;
};

type UnsavedChangesModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const FALLBACK_PROFILE_OPTIONS: Pick<ProfileOptionsResponse, 'countries' | 'languages' | 'koreanLevels'> = {
  countries: [
    { code: 'FR', labelKo: '프랑스', labelEn: 'France', displayOrder: 1 },
    { code: 'KR', labelKo: '한국', labelEn: 'Korea', displayOrder: 2 },
    { code: 'JP', labelKo: '일본', labelEn: 'Japan', displayOrder: 3 },
    { code: 'US', labelKo: '미국', labelEn: 'United States', displayOrder: 4 },
    { code: 'CN', labelKo: '중국', labelEn: 'China', displayOrder: 5 },
    { code: 'TW', labelKo: '대만', labelEn: 'Taiwan', displayOrder: 6 },
  ],
  languages: [
    { code: 'EN', labelKo: '영어', labelEn: 'English', displayOrder: 1 },
    { code: 'KO', labelKo: '한국어', labelEn: 'Korean', displayOrder: 2 },
    { code: 'JP', labelKo: '일본어', labelEn: 'Japanese', displayOrder: 3 },
    { code: 'CN', labelKo: '중국어', labelEn: 'Chinese', displayOrder: 4 },
    { code: 'FR', labelKo: '프랑스어', labelEn: 'French', displayOrder: 5 },
  ],
  koreanLevels: [
    { code: 'BEGINNER', labelKo: '초급', labelEn: 'Beginner', displayOrder: 1 },
    { code: 'INTERMEDIATE', labelKo: '중급', labelEn: 'Intermediate', displayOrder: 2 },
    { code: 'ADVANCED', labelKo: '고급', labelEn: 'Advanced', displayOrder: 3 },
  ],
};

const MAX_MESSAGE_LENGTH = 500;
const MOCK_MESSAGE_COMPOSE_PROFILE: BuddyProfileDetail = {
  profileId: 501,
  profileImageUrl: 'https://picsum.photos/id/1027/300/300',
  nickname: 'Emma',
  nationality: 'France',
  nationalityCode: 'FR',
  availableLanguages: ['EN', 'KO'],
  koreanLevel: 'BEGINNER',
  travelStyles: ['LOCAL_FOOD', 'NATURE'],
  bio: '한국 전통 문화와 로컬 맛집을 좋아해요 :)',
  buddyStyles: ['TRADITIONAL_CULTURE', 'FOODIE'],
  socialLinks: [
    {
      type: 'INSTAGRAM',
      displayValue: '@emma.travels',
      url: 'https://instagram.com/emma.travels',
    },
    {
      type: 'KAKAOTALK',
      displayValue: 'emma_kr',
      url: 'https://open.kakao.com/o/emma_kr',
    },
  ],
  profilePublic: true,
  snsPublic: true,
  allowsMessages: true,
  canMessage: true,
  blockedByMe: false,
  updatedAt: '2026-08-06T00:00:00.000Z',
};

function buildMockComposeProfile(profileId: number | null): BuddyProfileDetail {
  if (profileId != null) {
    const mockProfile = getMockBuddyProfileDetailById(profileId);
    if (mockProfile) {
      return {
        ...mockProfile,
        nationalityCode: normalizeCountryCode(mockProfile.nationality ?? '') || '',
      };
    }
  }

  return MOCK_MESSAGE_COMPOSE_PROFILE;
}

export default function MessageComposeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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

  const [profile, setProfile] = useState<BuddyProfileDetail | null>(() =>
    buildMockComposeProfile(parsedReceiverProfileId),
  );
  const [options, setOptions] = useState<Pick<
    ProfileOptionsResponse,
    'countries' | 'languages' | 'koreanLevels'
  > | null>(() => ({
    ...FALLBACK_PROFILE_OPTIONS,
    countries: [...FALLBACK_PROFILE_OPTIONS.countries],
    languages: [...FALLBACK_PROFILE_OPTIONS.languages],
    koreanLevels: [...FALLBACK_PROFILE_OPTIONS.koreanLevels],
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [sentThread, setSentThread] = useState<MessageThreadResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const pendingNavigationActionRef = useRef<any>(null);

  const resolvedOptions = options ?? FALLBACK_PROFILE_OPTIONS;
  const sendDisabled = !content.trim() || isSending;
  const contentLength = content.length;
  const hasUnsavedChanges = content.trim().length > 0 && !successVisible && !isLeaving;

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
    if (!isLeaving) {
      return;
    }

    goBackOrRoot(router);
  }, [isLeaving, router]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setProfile(buildMockComposeProfile(parsedReceiverProfileId));
    setOptions({
      ...FALLBACK_PROFILE_OPTIONS,
      countries: [...FALLBACK_PROFILE_OPTIONS.countries],
      languages: [...FALLBACK_PROFILE_OPTIONS.languages],
      koreanLevels: [...FALLBACK_PROFILE_OPTIONS.koreanLevels],
    });

    if (parsedReceiverProfileId == null) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const [profileResult, optionsResult] = await Promise.allSettled([
        fetchBuddyProfile(parsedReceiverProfileId),
        fetchProfileOptions(),
      ]);

      if (cancelled) {
        return;
      }

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
      }

      if (optionsResult.status === 'fulfilled') {
        setOptions({
          countries: optionsResult.value.countries,
          languages: optionsResult.value.languages,
          koreanLevels: optionsResult.value.koreanLevels,
        });
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [parsedPlaceId, parsedPlaceNumericId, parsedReceiverProfileId, reloadKey, router]);

  const languageChips = useMemo(() => {
    if (!profile) {
      return [];
    }

    const sortedLanguages = sortCodesByOptionOrder(profile.availableLanguages, resolvedOptions.languages);
    const levelLabel = getLabel(profile.koreanLevel, resolvedOptions.koreanLevels);
    const hasKorean = sortedLanguages.includes('KO');

    return sortedLanguages.map((languageCode, index) => {
      const languageLabel = getLabel(languageCode, resolvedOptions.languages);
      const shouldAppendLevel = languageCode === 'KO' || (!hasKorean && index === 0);
      return shouldAppendLevel && levelLabel ? `${languageLabel} (${levelLabel})` : languageLabel;
    });
  }, [profile, resolvedOptions.koreanLevels, resolvedOptions.languages]);

  const handleSend = useCallback(async () => {
    if (!profile) {
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) {
      return;
    }

    try {
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

      useMessageThreadStore.getState().upsertThread(nextThread);
      setSentThread(nextThread);
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert('쪽지를 보내지 못했어요', extractErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }, [
    content,
    normalizedPlaceAddress,
    normalizedPlaceImageUrl,
    normalizedPlaceId,
    normalizedPlaceNumericId,
    normalizedPlaceRouteId,
    normalizedPlaceTitle,
    parsedPlaceId,
    parsedPlaceNumericId,
    parsedReceiverProfileId,
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
    setIsLeaving(true);
  }, [router]);

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
          <CustomText style={styles.loadingText}>쪽지 화면을 불러오는 중이에요</CustomText>
        </View>
      </ScreenShell>
    );
  }

  if (loadError || !profile) {
    return (
      <ScreenShell>
        <View style={styles.errorState}>
          <CustomText style={styles.errorTitle}>쪽지 화면을 불러오지 못했어요</CustomText>
          <CustomText style={styles.errorDescription}>
            {loadError ?? '잠시 후 다시 시도해 주세요.'}
          </CustomText>

          <View style={styles.errorActions}>
            <Pressable style={[styles.secondaryButton, styles.errorSecondaryButton]} onPress={() => goBackOrRoot(router)}>
              <CustomText style={styles.secondaryButtonText}>돌아가기</CustomText>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => setReloadKey((value) => value + 1)}>
              <CustomText style={styles.primaryButtonText}>다시 시도</CustomText>
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
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }}
                size={18}
                weight="semibold"
                tintColor={Palette.text}
              />
            </Pressable>

            <CustomText style={styles.headerTitle}>쪽지 보내기</CustomText>

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
                    {formatCountryDisplay(profile.nationalityCode ?? profile.nationality ?? '', resolvedOptions.countries)}
                  </CustomText>
                </View>

                <View style={styles.chipRow}>
                  {languageChips.map((label) => (
                    <View key={label} style={styles.languageChip}>
                      <CustomText style={styles.languageChipText}>{label}</CustomText>
                    </View>
                  ))}
                </View>

                <CustomText style={styles.bio}>{profile.bio || '소개가 아직 없어요.'}</CustomText>
              </View>
            </View>

            <View style={styles.messageSection}>
              <CustomText style={styles.sectionTitle}>메시지</CustomText>

              <View style={styles.messageBox}>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="전하고 싶은 내용을 작성해보세요."
                  placeholderTextColor={Palette.grey500}
                  cursorColor={Palette.primary}
                  selectionColor={Palette.primary}
                  multiline
                  maxLength={MAX_MESSAGE_LENGTH}
                  style={styles.messageInput}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.counterRow}>
                <CustomText style={styles.counterCurrent}>{contentLength}</CustomText>
                <CustomText style={styles.counterSlash}>/</CustomText>
                <CustomText style={styles.counterTotal}>{MAX_MESSAGE_LENGTH}</CustomText>
              </View>
            </View>

            <View style={styles.noticeCard}>
              <CustomText style={styles.noticeText}>
                안전을 위해 전화번호, 주소, 금융정보 등 민감한 개인정보는 공유하지 마세요.
              </CustomText>
              <View style={styles.noticeDivider} />
              <CustomText style={styles.noticeText}>
                실시간 채팅이 아니라 답장이 조금 늦을 수 있어요
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
                    쪽지 보내기
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
            <View style={styles.successIconWrap}>
              <View style={styles.successIconHalo}>
                <View style={styles.successIconCore}>
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={16}
                    weight="bold"
                    tintColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>

            <CustomText style={styles.successTitle}>쪽지를 보냈어요!</CustomText>
            <CustomText style={styles.successDescription}>답장은 바로 오지 않을 수 있어요.</CustomText>
            <CustomText style={styles.successDescription}>새로운 답장은 쪽지함에서 확인할 수 있어요.</CustomText>

            <Pressable style={styles.successPrimaryButton} onPress={handleViewThread}>
              <CustomText style={styles.successPrimaryButtonText}>쪽지함 보기</CustomText>
            </Pressable>

            <Pressable style={styles.successSecondaryButton} onPress={handleContinueBrowsing}>
              <CustomText style={styles.successSecondaryButtonText}>계속 둘러보기</CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={unsavedChangesModalOpen} transparent animationType="fade" onRequestClose={cancelLeaveScreen}>
        <Pressable style={styles.unsavedChangesOverlay} onPress={cancelLeaveScreen}>
          <Pressable style={styles.unsavedChangesSheet} onPress={() => {}}>
            <CustomText style={styles.unsavedChangesMessage}>
              {`아직 쪽지가 전송되지 않았어요\n정말 나가실건가요?`}
            </CustomText>

            <View style={styles.unsavedChangesButtonRow}>
              <Pressable style={styles.unsavedChangesCancelButton} onPress={cancelLeaveScreen}>
                <CustomText style={styles.unsavedChangesCancelText}>취소</CustomText>
              </Pressable>
              <Pressable style={styles.unsavedChangesConfirmButton} onPress={confirmLeaveScreen}>
                <CustomText style={styles.unsavedChangesConfirmText}>나가기</CustomText>
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
  return (
    <View style={styles.avatarWrap}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <CustomText style={styles.avatarInitial}>{nickname.trim().charAt(0).toUpperCase() || 'M'}</CustomText>
        </View>
      )}
    </View>
  );
}

function sortCodesByOptionOrder(codes: string[], options: ProfileOptionItem[]) {
  return [...codes].sort((left, right) => {
    const leftIndex = options.findIndex((option) => option.code === left);
    const rightIndex = options.findIndex((option) => option.code === right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

function getLabel(code: string, options: ProfileOptionItem[]) {
  return options.find((option) => option.code === code)?.labelKo ?? code;
}

function extractErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.';
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
    paddingBottom: 180,
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
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
    letterSpacing: -0.26,
  },
  counterTotal: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
    letterSpacing: -0.26,
  },
  noticeCard: {
    marginTop: 170,
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIconHalo: {
    width: 55,
    height: 55,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79, 174, 152, 0.12)',
  },
  successIconCore: {
    width: 25,
    height: 25,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
  },
  successTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    marginBottom:4,
    lineHeight: 25.6,
    color: Palette.text,
    textAlign: 'center',
  },
  successDescription: {
    marginTop: 4,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
    textAlign: 'center',
  },
  successPrimaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  successPrimaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#FFFFFF',
  },
  successSecondaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  successSecondaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.primary,
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
