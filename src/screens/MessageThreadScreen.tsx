import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
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

import { createMessageThreadIdempotencyKey, fetchMessageThread, markMessageThreadRead, replyMessageThread } from '@/api/messages';
import { fetchPlaceDetail, type PlaceDetail } from '@/api/place';
import type { MessageThreadMessage, MessageThreadResponse, ProfileOptionItem, ProfileOptionsResponse } from '@/api/types';
import { fetchProfileOptions } from '@/api/buddy-profile';
import CustomText from '@/components/CustomText';
import BuddyProfileModal from '@/components/place-detail/BuddyProfileModal';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { goBackOrRoot } from '@/navigation/safe-back';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { useAuthStore } from '@/store/auth-store';
import { useMessageThreadStore } from '@/store/message-thread-store';
import { formatCountryDisplay } from '@/utils/country';

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
  const normalizedThreadId = Array.isArray(threadId) ? threadId[0] : threadId;
  const storedThread = useMessageThreadStore((state) => {
    if (!normalizedThreadId) {
      return null;
    }

    return state.threads[normalizedThreadId] ?? null;
  });

  const [threadState, setThreadState] = useState<MessageThreadResponse | null>(storedThread);
  const [profileOptions, setProfileOptions] = useState<ProfileOptionsResponse | null>(null);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const hasMarkedReadRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const visibleThread = threadState ?? storedThread;
  const selectedProfileFallback = useMemo(
    () => (selectedProfileId == null ? null : getMockBuddyProfileDetailById(selectedProfileId)),
    [selectedProfileId],
  );
  const placeRouteId = visibleThread?.place.routeId ?? (visibleThread ? String(visibleThread.place.placeId) : '');

  useEffect(() => {
    setThreadState(storedThread);
  }, [storedThread]);

  useEffect(() => {
    if (!normalizedThreadId) {
      setLoadError('쪽지 내용을 불러오지 못했어요');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setLoadError(null);
    setIsLoading(true);
    setPlaceDetail(null);
    setProfileOptions(null);
    hasMarkedReadRef.current = null;

    (async () => {
      try {
        const loadedThread = await fetchMessageThread(normalizedThreadId, { size: 20 });
        if (cancelled) {
          return;
        }

        useMessageThreadStore.getState().upsertThread(loadedThread);
        setThreadState(loadedThread);

        const [optionsResult, placeResult] = await Promise.allSettled([
          fetchProfileOptions(),
          fetchPlaceDetail(loadedThread.place.routeId ?? String(loadedThread.place.placeId)),
        ]);

        if (cancelled) {
          return;
        }

        if (optionsResult.status === 'fulfilled') {
          setProfileOptions(optionsResult.value);
        }

        if (placeResult.status === 'fulfilled') {
          setPlaceDetail(placeResult.value);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(extractErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [normalizedThreadId]);

  useEffect(() => {
    if (!normalizedThreadId || !visibleThread) {
      return;
    }

    if (hasMarkedReadRef.current === normalizedThreadId) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const readResult = await markMessageThreadRead(normalizedThreadId);
        if (cancelled) {
          return;
        }

        useAuthStore.setState({ unreadMessageCount: readResult.unreadTotal });

        const refreshedThread = await fetchMessageThread(normalizedThreadId, { size: 20 });
        if (cancelled) {
          return;
        }

        useMessageThreadStore.getState().upsertThread(refreshedThread);
        setThreadState(refreshedThread);
        hasMarkedReadRef.current = normalizedThreadId;
      } catch {
        if (!cancelled) {
          hasMarkedReadRef.current = normalizedThreadId;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [normalizedThreadId, visibleThread]);

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
    visibleThread?.otherProfile.nationalityCode ?? visibleThread?.otherProfile.nationality ?? '',
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
    if (!normalizedThreadId || !visibleThread || isSending || !visibleThread.canReply) {
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    try {
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
        tab: 'MATE',
      },
    } as never);
  }, [router, visibleThread]);

  if (isLoading && !visibleThread) {
    return (
      <ScreenShell>
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
          <CustomText style={styles.loadingText}>쪽지 내용을 불러오는 중이에요</CustomText>
        </View>
      </ScreenShell>
    );
  }

  if ((loadError || !visibleThread) && !visibleThread) {
    return (
      <ScreenShell>
        <View style={styles.errorState}>
          <CustomText style={styles.errorTitle}>쪽지 내용을 불러오지 못했어요</CustomText>
          <CustomText style={styles.errorDescription}>
            {loadError ?? '잠시 후 다시 시도해 주세요.'}
          </CustomText>

          <Pressable style={styles.backButton} onPress={() => goBackOrRoot(router, '/message-threads')}>
            <CustomText style={styles.backButtonText}>돌아가기</CustomText>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  if (!visibleThread) {
    return null;
  }

  const currentPlace = placeDetail ?? {
    id: placeRouteId || String(visibleThread.place.placeId),
    routeId: visibleThread.place.routeId ?? placeRouteId,
    title: visibleThread.place.title,
    address: visibleThread.place.address ?? '',
    tags: [],
    isSaved: false,
    images: [
      {
        source: { uri: visibleThread.place.imageUrl },
        order: 1,
        altText: visibleThread.place.title,
      },
    ],
    description: {
      impactTitle: visibleThread.place.title,
      impactSubtitle: '',
      introParagraphs: [],
      enjoyPoints: [],
    },
    relatedPlaces: [],
  };

  const displayPlace = {
    ...currentPlace,
    title: visibleThread.place.title,
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView style={styles.keyboardWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <Pressable hitSlop={12} onPress={() => goBackOrRoot(router, '/message-threads')}>
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }}
                size={18}
                weight="semibold"
                tintColor={Palette.text}
              />
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
              <CustomText style={styles.noteText}>이메일처럼 주고받는 쪽지예요. 답장이 늦을 수 있어요.</CustomText>
            </View>

            <View style={styles.placeCard}>
              <Image
                source={resolvePlaceImageSource(displayPlace)}
                style={styles.placeImage}
                contentFit="cover"
              />

              <View style={styles.placeInfoRow}>
                <View style={styles.placeInfo}>
                  <CustomText style={styles.placeTitle}>{visibleThread.place.title}</CustomText>
                  <CustomText style={styles.placeAddress}>{currentPlace.address || visibleThread.place.title}</CustomText>
                </View>

                <Pressable style={styles.placeButton} onPress={handleOpenPlace}>
                  <CustomText style={styles.placeButtonText}>여행지 보기</CustomText>
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
                  <CustomText style={styles.loadMoreText}>이전 메시지 더보기</CustomText>
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
                        <CustomText style={styles.mineLabel}>나</CustomText>
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

                      <CustomText style={styles.messageTime}>{formatMessageTime(message.sentAt)}</CustomText>
                    </View>

                    <CustomText style={styles.messageContent}>{message.content}</CustomText>
                  </View>
                );
              })}
            </View>

            <View style={styles.replySection}>
              <CustomText style={styles.sectionTitle}>답변 작성하기</CustomText>

              <View style={[styles.replyBox, !visibleThread.canReply && styles.replyBoxDisabled]}>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder={
                    visibleThread.canReply ? '전하고 싶은 내용을 작성해보세요.' : '답장을 보낼 수 없는 쪽지예요.'
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
              </View>

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
                    쪽지 보내기
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

  if (!imageUrl) {
    return (
      <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <CustomText style={styles.avatarInitial}>{initials}</CustomText>
      </View>
    );
  }

  return <Image source={{ uri: imageUrl }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} contentFit="cover" />;
}

function resolvePlaceImageSource(place: PlaceDetail) {
  const firstImage = place.images[0]?.source;
  return firstImage ?? { uri: '' };
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
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
