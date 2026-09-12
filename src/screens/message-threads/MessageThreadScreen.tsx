import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchProfileOptions } from '@/api/buddy-profile';
import { createMessageThreadIdempotencyKey, fetchMessageThread, markMessageThreadRead, replyMessageThread } from '@/api/messages';
import { fetchPlaceDetail, type PlaceDetail } from '@/api/place';
import type { MessageThreadMessage, MessageThreadResponse, ProfileOptionItem, ProfileOptionsResponse } from '@/api/types';
import CustomText from '@/components/CustomText';
import BackIcon from '@/components/icons/BackIcon';
import BuddyProfileModal from '@/components/place-detail/BuddyProfileModal';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useMessageThreadStore } from '@/store/message-thread-store';
import { formatCountryDisplay } from '@/utils/country';
import { resolveProfileImageUri } from '@/utils/profile-image';

type MessageThreadParams = {
  threadId?: string;
};

const MAX_REPLY_LENGTH = 500;
const FALLBACK_COUNTRY_OPTIONS: ProfileOptionItem[] = [
  { code: 'FR', labelKo: '프랑스', labelEn: 'France', displayOrder: 1 },
  { code: 'KR', labelKo: '한국', labelEn: 'Korea', displayOrder: 2 },
  { code: 'JP', labelKo: '일본', labelEn: 'Japan', displayOrder: 3 },
  { code: 'US', labelKo: '미국', labelEn: 'United States', displayOrder: 4 },
  { code: 'CN', labelKo: '중국', labelEn: 'China', displayOrder: 5 },
  { code: 'TW', labelKo: '대만', labelEn: 'Taiwan', displayOrder: 6 },
  { code: 'GB', labelKo: '영국', labelEn: 'United Kingdom', displayOrder: 7 },
];

export default function MessageThreadScreen() {
  const router = useRouter();
  const { threadId } = useLocalSearchParams<MessageThreadParams>();
  const language = useLanguageStore((state) => state.language);
  const t = useTranslation();
  const normalizedThreadId = Array.isArray(threadId) ? threadId[0] : threadId;
  const [threadState, setThreadState] = useState<MessageThreadResponse | null>(null);
  const [profileOptions, setProfileOptions] = useState<ProfileOptionsResponse | null>(null);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [loadStatus, setLoadStatus] = useState<{ key: string; error: string | null } | null>(null);
  const loadKey = JSON.stringify([language, normalizedThreadId]);
  const isLoading = !!normalizedThreadId && loadStatus?.key !== loadKey;
  const loadError = !normalizedThreadId
    ? t.messages.thread.errorTitle
    : loadStatus?.key === loadKey ? loadStatus.error : null;
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const sendInFlightRef = useRef(false);
  const replyInputRef = useRef<TextInput | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const visibleThread = threadState?.threadId === normalizedThreadId ? threadState : null;
  const selectedProfileFallback = useMemo(
    () => (selectedProfileId == null ? null : getMockBuddyProfileDetailById(selectedProfileId)),
    [language, selectedProfileId],
  );

  useEffect(() => {
    if (!normalizedThreadId) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const loadedThread = await fetchMessageThread(normalizedThreadId, { size: 20 });
        if (cancelled) {
          return;
        }

        const readAt = new Date().toISOString();
        const readThread: MessageThreadResponse = {
          ...loadedThread,
          messages: loadedThread.messages.map((message) =>
            message.senderProfileId === loadedThread.otherProfile.profileId && !message.read
              ? { ...message, read: true, readAt }
              : message,
          ),
        };

        // Clear the inbox highlight before the read request finishes, including on a quick back navigation.
        useMessageThreadStore.getState().replaceThread(readThread);
        setThreadState(readThread);

        void markMessageThreadRead(normalizedThreadId)
          .then((readResult) => {
            useAuthStore.setState({ unreadMessageCount: readResult.unreadTotal });
          })
          .catch(() => {
            // Keep locally viewed messages read; opening the thread again retries the request.
          });

        const [optionsResult, placeResult] = await Promise.allSettled([
          fetchProfileOptions(),
          fetchPlaceDetail(loadedThread.place.routeId ?? String(loadedThread.place.placeId)),
        ]);

        if (cancelled) {
          return;
        }

        setProfileOptions(optionsResult.status === 'fulfilled' ? optionsResult.value : null);
        setPlaceDetail(placeResult.status === 'fulfilled' ? placeResult.value : null);
        setLoadStatus({
          key: loadKey,
          error: placeResult.status === 'rejected'
            ? extractErrorMessage(placeResult.reason, t.messages.thread.errorDescriptionFallback)
            : null,
        });
      } catch (error) {
        if (!cancelled) {
          setLoadStatus({
            key: loadKey,
            error: extractErrorMessage(error, t.messages.thread.errorDescriptionFallback),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadKey, normalizedThreadId, t.messages.thread.errorDescriptionFallback]);

  const messageRows = useMemo(() => {
    return [...(visibleThread?.messages ?? [])].sort((left, right) => {
      const sentDiff = left.sentAt.localeCompare(right.sentAt);
      if (sentDiff !== 0) {
        return sentDiff;
      }

      return left.messageId - right.messageId;
    });
  }, [visibleThread]);

  const countryOptions = profileOptions?.countries?.length ? profileOptions.countries : FALLBACK_COUNTRY_OPTIONS;
  const otherCountryLabel = formatCountryDisplay(
    visibleThread?.otherProfile.nationalityCode ??
      visibleThread?.otherProfile.nationality ??
      visibleThread?.otherProfile.nationalityName ??
      '',
    countryOptions,
  );

  const handleLoadOlderMessages = useCallback(async () => {
    if (!normalizedThreadId || !visibleThread?.hasMore || !visibleThread.nextCursor || isLoadingOlder) {
      return;
    }

    setIsLoadingOlder(true);

    try {
      const olderPage = await fetchMessageThread(normalizedThreadId, {
        cursor: visibleThread.nextCursor,
        size: 20,
      });

      useMessageThreadStore.getState().upsertThread(olderPage);
      setThreadState((previous) => mergeThreadDetail(previous, olderPage));
    } catch {
      // mock-backed API should keep the UI usable even if this page fails.
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, normalizedThreadId, visibleThread]);

  const handleSendReply = useCallback(async () => {
    if (!normalizedThreadId || !visibleThread || isSending || sendInFlightRef.current || !visibleThread.canReply) {
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    try {
      sendInFlightRef.current = true;
      setIsSending(true);

      const message = await replyMessageThread(
        normalizedThreadId,
        { content: trimmedContent },
        createMessageThreadIdempotencyKey(),
      );

      if (!message) {
        return;
      }

      useMessageThreadStore.getState().upsertThread({
        ...visibleThread,
        messages: [message],
      });

      setThreadState((previous) => {
        if (!previous) {
          return previous;
        }

        return mergeThreadDetail(previous, {
          ...previous,
          messages: [message],
        });
      });

      setContent('');

      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    } catch {
      // Keep the draft intact when sending fails.
    } finally {
      sendInFlightRef.current = false;
      setIsSending(false);
    }
  }, [content, isSending, normalizedThreadId, visibleThread]);

  const handleOpenPlace = useCallback(() => {
    if (!visibleThread) {
      return;
    }

    router.push({
      pathname: '/places/[placeId]',
      params: {
        placeId: visibleThread.place.routeId ?? String(visibleThread.place.placeId),
        tab: 'MATES',
      },
    } as never);
  }, [router, visibleThread]);

  if (loadError) {
    return (
      <ScreenShell>
        <View style={styles.errorState}>
          <CustomText style={styles.errorTitle}>{t.messages.thread.errorTitle}</CustomText>
          <CustomText style={styles.errorDescription}>
            {loadError ?? t.messages.thread.errorDescriptionFallback}
          </CustomText>

          <Pressable style={styles.backButton} onPress={() => goBackOrRoot(router, '/message-threads')}>
            <CustomText style={styles.backButtonText}>{t.messages.thread.back}</CustomText>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  if (isLoading || !visibleThread || !placeDetail) {
    return (
      <ScreenShell>
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
          <CustomText style={styles.loadingText}>{t.messages.thread.loading}</CustomText>
        </View>
      </ScreenShell>
    );
  }

  const displayPlace = {
    ...placeDetail,
    title: placeDetail.title || visibleThread.place.title,
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView style={styles.keyboardWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <Pressable hitSlop={12} onPress={() => goBackOrRoot(router, '/message-threads')}>
              <BackIcon />
            </Pressable>

            <CustomText style={styles.headerTitle}>{visibleThread.otherProfile.nickname}</CustomText>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.noteCard}>
              <CustomText style={styles.noteText}>{t.messages.thread.note}</CustomText>
            </View>

            <View style={styles.placeCard}>
              {resolvePlaceImageSource(displayPlace) ? (
                <Image
                  source={resolvePlaceImageSource(displayPlace)}
                  style={styles.placeImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.placeImage} />
              )}

              <View style={styles.placeInfoRow}>
                <View style={styles.placeInfo}>
                  <CustomText style={styles.placeTitle}>{displayPlace.title}</CustomText>
                  <CustomText style={styles.placeAddress}>{displayPlace.address || displayPlace.title}</CustomText>
                </View>

                <Pressable style={styles.placeButton} onPress={handleOpenPlace}>
                  <CustomText style={styles.placeButtonText}>{t.messages.thread.viewDestination}</CustomText>
                </Pressable>
              </View>
            </View>

            {visibleThread.hasMore ? (
              <Pressable
                style={({ pressed }) => [
                  styles.loadMoreButton,
                  pressed && styles.pressed,
                  isLoadingOlder && styles.loadMoreButtonDisabled,
                ]}
                disabled={isLoadingOlder}
                onPress={handleLoadOlderMessages}>
                {isLoadingOlder ? (
                  <ActivityIndicator color={Palette.primary} />
                ) : (
                  <CustomText style={styles.loadMoreText}>{t.messages.thread.loadMore}</CustomText>
                )}
              </Pressable>
            ) : null}

            <View style={styles.messageStack}>
              {messageRows.map((message) => {
                const isMine = message.senderProfileId !== visibleThread.otherProfile.profileId;
                return (
                  <View key={message.messageId} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      {isMine ? (
                        <CustomText style={styles.mineLabel}>{t.messages.thread.me}</CustomText>
                      ) : (
                        <Pressable
                          hitSlop={10}
                          style={styles.otherProfileHeader}
                          onPress={() => setSelectedProfileId(visibleThread.otherProfile.profileId)}>
                          <Avatar
                            imageUrl={visibleThread.otherProfile.profileImageUrl}
                            nickname={visibleThread.otherProfile.nickname}
                            size={28}
                          />

                          <View style={styles.otherProfileTextRow}>
                            <CustomText style={styles.otherProfileName}>
                              {visibleThread.otherProfile.nickname}
                            </CustomText>
                            <CustomText style={styles.otherProfileSeparator}>·</CustomText>
                            <CustomText style={styles.otherProfileCountry}>{otherCountryLabel}</CustomText>
                          </View>
                        </Pressable>
                      )}

                      <CustomText style={styles.messageTime}>{formatMessageTime(message.sentAt, language)}</CustomText>
                    </View>

                    <CustomText style={styles.messageContent}>{message.content}</CustomText>
                  </View>
                );
              })}
            </View>

            <View style={styles.replySection}>
              <CustomText style={styles.sectionTitle}>{t.messages.thread.replySection}</CustomText>

              <Pressable
                style={[styles.replyBox, !visibleThread.canReply && styles.replyBoxDisabled]}
                disabled={!visibleThread.canReply}
                onPress={() => replyInputRef.current?.focus()}>
                <TextInput
                  ref={replyInputRef}
                  value={content}
                  onChangeText={setContent}
                  placeholder={
                    visibleThread.canReply
                      ? t.messages.thread.replyPlaceholder
                      : t.messages.thread.replyPlaceholderDisabled
                  }
                  placeholderTextColor={Palette.grey400}
                  cursorColor={Palette.primary}
                  selectionColor={Palette.primary}
                  editable={visibleThread.canReply}
                  multiline
                  maxLength={MAX_REPLY_LENGTH}
                  style={styles.replyInput}
                  textAlignVertical="top"
                />
              </Pressable>

              <View style={styles.counterRow}>
                <CustomText style={styles.counterCurrent}>{content.length}</CustomText>
                <CustomText style={styles.counterSlash}>/</CustomText>
                <CustomText style={styles.counterTotal}>{MAX_REPLY_LENGTH}</CustomText>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerInner}>
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && !sendDisabled(visibleThread, content, isSending) && styles.pressed,
                  sendDisabled(visibleThread, content, isSending) && styles.sendButtonDisabled,
                ]}
                disabled={sendDisabled(visibleThread, content, isSending)}
                onPress={handleSendReply}>
                {isSending ? (
                  <ActivityIndicator color={sendDisabled(visibleThread, content, isSending) ? Palette.grey500 : '#FFFFFF'} />
                ) : (
                  <CustomText
                    style={[
                      styles.sendButtonText,
                      sendDisabled(visibleThread, content, isSending) && styles.sendButtonTextDisabled,
                    ]}>
                    {t.messages.thread.send}
                  </CustomText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <BuddyProfileModal
        visible={selectedProfileId !== null}
        profileId={selectedProfileId}
        options={profileOptions}
        fallbackProfile={selectedProfileFallback}
        onClose={() => setSelectedProfileId(null)}
      />
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

function Avatar({
  imageUrl,
  nickname,
  size = 36,
}: {
  imageUrl: string | null;
  nickname: string;
  size?: number;
}) {
  const initials = nickname.trim().charAt(0).toUpperCase() || 'M';
  const resolvedImageUrl = resolveProfileImageUri(imageUrl);

  if (!resolvedImageUrl) {
    return (
      <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <CustomText style={styles.avatarInitial}>{initials}</CustomText>
      </View>
    );
  }

  return <Image source={{ uri: resolvedImageUrl }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} contentFit="cover" />;
}

function resolvePlaceImageSource(place: PlaceDetail) {
  return place.images[0]?.source ?? null;
}

function formatMessageTime(value: string, language: 'KO' | 'EN') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  if (language === 'EN') {
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return `${dateLabel} (${weekday}) · ${time}`;
  }

  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${month}월 ${day}일 (${weekday}) ${hour}:${minute}`;
}

function mergeThreadDetail(
  existing: MessageThreadResponse | null,
  incoming: MessageThreadResponse,
): MessageThreadResponse {
  if (!existing) {
    return incoming;
  }

  const mergedMessages = new Map<number, MessageThreadMessage>();
  existing.messages.forEach((message) => {
    mergedMessages.set(message.messageId, message);
  });
  incoming.messages.forEach((message) => {
    mergedMessages.set(message.messageId, message);
  });

  return {
    ...existing,
    ...incoming,
    messages: [...mergedMessages.values()].sort((left, right) => {
      const sentDiff = left.sentAt.localeCompare(right.sentAt);
      if (sentDiff !== 0) {
        return sentDiff;
      }

      return left.messageId - right.messageId;
    }),
  };
}

function sendDisabled(thread: MessageThreadResponse, content: string, isSending: boolean) {
  return !thread.canReply || !content.trim() || isSending;
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
  header: {
    minHeight: 54,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
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
    paddingBottom: 160,
  },
  noteCard: {
    borderRadius: 12,
    backgroundColor: Palette.grey100,
    padding: 16,
  },
  noteText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 20.8,
    color: Palette.grey500,
  },
  placeCard: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.grey200,
    overflow: 'hidden',
  },
  placeImage: {
    width: '100%',
    height: 120,
    backgroundColor: Palette.grey100,
  },
  placeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  placeInfo: {
    flex: 1,
    gap: 4,
  },
  placeTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  placeAddress: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  placeButton: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#FFFFFF',
  },
  loadMoreButton: {
    marginTop: 24,
    minHeight: 42,
    alignSelf: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButtonDisabled: {
    opacity: 0.7,
  },
  loadMoreText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  messageStack: {
    gap: 12,
    marginTop: 16,
  },
  messageCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mineLabel: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.primary,
  },
  otherProfileHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otherProfileTextRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  otherProfileName: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  otherProfileSeparator: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  otherProfileCountry: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  messageTime: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 20.8,
    color: Palette.grey400,
  },
  messageContent: {
    marginTop: 16,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.grey600,
  },
  replySection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  replyBox: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
    padding: 16,
  },
  replyBoxDisabled: {
    opacity: 0.8,
  },
  replyInput: {
    flex: 1,
    width: '100%',
    minHeight: 68,
    padding: 0,
    margin: 0,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  footerInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sendButton: {
    width: '100%',
    minHeight: 52,
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
    fontSize: 14,
    lineHeight: 19.6,
    color: '#FFFFFF',
  },
  sendButtonTextDisabled: {
    color: Palette.grey500,
  },
  pressed: {
    opacity: 0.88,
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
  backButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#FFFFFF',
  },
  avatarImage: {
    backgroundColor: Palette.grey200,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.grey200,
  },
  avatarInitial: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 12,
    color: Palette.grey500,
  },
});
