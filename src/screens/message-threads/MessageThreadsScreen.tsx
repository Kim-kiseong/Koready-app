import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fetchProfileOptions } from '@/api/buddy-profile';
import { fetchMessageThreads } from '@/api/messages';
import { useAuthStore } from '@/store/auth-store';
import type {
  MessageThreadListItem,
  MessageThreadProfile,
  MessageThreadResponse,
  ProfileOptionItem,
  ProfileOptionsResponse,
} from '@/api/types';
import CustomText from '@/components/CustomText';
import BackIcon from '@/components/icons/BackIcon';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import { useMessageThreadStore } from '@/store/message-thread-store';
import BuddyProfileModal from '@/components/place-detail/BuddyProfileModal';
import { useTranslation } from '@/i18n/useTranslation';
import { formatCountryDisplay, getCountryDisplayName, normalizeCountryCode } from '@/utils/country';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { resolveProfileImageUri } from '@/utils/profile-image';

type MessageThreadsScreenState = {
  items: MessageThreadListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadTotal: number;
};

const FALLBACK_COUNTRY_OPTIONS: ProfileOptionItem[] = [
  { code: 'FR', labelKo: '프랑스', labelEn: 'France', displayOrder: 1 },
  { code: 'KR', labelKo: '한국', labelEn: 'Korea', displayOrder: 2 },
  { code: 'JP', labelKo: '일본', labelEn: 'Japan', displayOrder: 3 },
  { code: 'US', labelKo: '미국', labelEn: 'United States', displayOrder: 4 },
  { code: 'CN', labelKo: '중국', labelEn: 'China', displayOrder: 5 },
  { code: 'TW', labelKo: '대만', labelEn: 'Taiwan', displayOrder: 6 },
  { code: 'GB', labelKo: '영국', labelEn: 'United Kingdom', displayOrder: 7 },
];

export default function MessageThreadsScreen() {
  const [reloadToken, setReloadToken] = useState(0);
  const language = useLanguageStore((state) => state.language);
  const publicId = useAuthStore((state) => state.user?.publicId);
  const ownerPublicId = useMessageThreadStore((state) => state.ownerPublicId);
  const sessionVersion = useMessageThreadStore((state) => state.sessionVersion);
  if (!publicId || publicId !== ownerPublicId) return null;
  return (
    <MessageThreadsContent
      key={`${publicId}:${sessionVersion}:${language}:${reloadToken}`}
      sessionVersion={sessionVersion}
      onRetry={() => setReloadToken((value) => value + 1)}
    />
  );
}

function MessageThreadsContent({ onRetry, sessionVersion }: { onRetry: () => void; sessionVersion: number }) {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const t = useTranslation();
  const storeThreads = useMessageThreadStore((state) => state.threads);

  const [profileOptions, setProfileOptions] = useState<ProfileOptionsResponse | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [threadState, setThreadState] = useState<MessageThreadsScreenState>({
    items: [],
    nextCursor: null,
    hasMore: false,
    unreadTotal: 0,
  });
  const countryOptions = profileOptions?.countries?.length ? profileOptions.countries : FALLBACK_COUNTRY_OPTIONS;
  const selectedProfileFallback = useMemo(
    () => (selectedProfileId == null ? null : getMockBuddyProfileDetailById(selectedProfileId)),
    [selectedProfileId],
  );

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    (async () => {
      const [optionsResult, threadsResult] = await Promise.allSettled([
        fetchProfileOptions(),
        fetchMessageThreads(),
      ]);

      if (cancelled) {
        return;
      }

      if (optionsResult.status === 'fulfilled') {
        setProfileOptions(optionsResult.value);
      } else {
        setProfileOptions(null);
      }

      if (threadsResult.status === 'fulfilled') {
        const nextThreads = threadsResult.value;
        setThreadState(nextThreads);
        setLoadError(null);
      } else {
        setThreadState({ items: [], nextCursor: null, hasMore: false, unreadTotal: 0 });
        setLoadError(
          extractErrorMessage(threadsResult.reason, t.messages.threads.errorDescriptionFallback),
        );
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [t.messages.threads.errorDescriptionFallback]));

  const displayItems = useMemo(() => {
    const baseItems = threadState.items;
    const apiMap = new Map(baseItems.map((item) => [item.threadId, item]));

    const storeItems = Object.values(storeThreads)
      .map((thread) => convertStoredThreadToListItem(thread, countryOptions))
      .sort(compareThreadsByLastSentAt);

    const prependItems: MessageThreadListItem[] = [];
    storeItems.forEach((item) => {
      const summary = apiMap.get(item.threadId);
      if (summary) {
        if (Date.parse(item.lastSentAt) > Date.parse(summary.lastSentAt)) {
          apiMap.set(item.threadId, {
            ...summary,
            preview: item.preview,
            lastSentAt: item.lastSentAt,
            unreadCount: item.unreadCount,
          });
          return;
        }
        // A read detail supersedes the cached summary until a newer message arrives.
        if (item.unreadCount === 0 && Date.parse(item.lastSentAt) >= Date.parse(summary.lastSentAt)) {
          apiMap.set(item.threadId, { ...summary, unreadCount: 0 });
        }
        return;
      }

      prependItems.push(item);
    });

    return [...prependItems, ...Array.from(apiMap.values())].sort(compareThreadsByLastSentAt);
  }, [countryOptions, storeThreads, threadState.items]);

  const unreadTotal = useMemo(
    () => displayItems.reduce((total, item) => total + item.unreadCount, 0),
    [displayItems],
  );

  useEffect(() => {
    if (useMessageThreadStore.getState().sessionVersion !== sessionVersion) return;
    useAuthStore.setState({ unreadMessageCount: unreadTotal });
  }, [sessionVersion, unreadTotal]);

  const handlePressThread = useCallback(
    (item: MessageThreadListItem) => {
      router.push({
        pathname: '/message-threads/[threadId]',
        params: { threadId: item.threadId },
      } as never);
    },
    [router],
  );

  if (isLoading && !loadError) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
          <CustomText style={styles.loadingText}>{t.messages.threads.loading}</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.errorState}>
          <CustomText style={styles.errorTitle}>{t.messages.threads.errorTitle}</CustomText>
          <CustomText style={styles.errorDescription}>{loadError}</CustomText>

          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            onPress={onRetry}>
            <CustomText style={styles.retryButtonText}>{t.messages.threads.retry}</CustomText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => goBackOrRoot(router)}>
          <BackIcon />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <CustomText style={styles.headerTitle}>{t.messages.threads.title}</CustomText>
          {unreadTotal > 0 ? (
            <View style={styles.unreadBadge}>
              <CustomText style={styles.unreadBadgeText}>{unreadTotal}</CustomText>
            </View>
          ) : null}
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.threadId}
        contentContainerStyle={[
          styles.listContent,
          displayItems.length === 0 ? styles.listContentEmpty : null,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: ListRenderItemInfo<MessageThreadListItem>) => (
          <MessageThreadCard
            item={item}
            countryOptions={countryOptions}
            language={language}
            onPressProfile={(profileId) => setSelectedProfileId(profileId)}
            onPress={() => handlePressThread(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CustomText style={styles.emptyTitle}>{t.messages.threads.emptyTitle}</CustomText>
            <CustomText style={styles.emptyDescription}>{t.messages.threads.emptyDescription}</CustomText>
          </View>
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />

      <BuddyProfileModal
        visible={selectedProfileId !== null}
        profileId={selectedProfileId}
        options={profileOptions}
        fallbackProfile={selectedProfileFallback}
        onClose={() => setSelectedProfileId(null)}
      />
    </SafeAreaView>
  );
}

function MessageThreadCard({
  item,
  countryOptions,
  language,
  onPressProfile,
  onPress,
}: {
  item: MessageThreadListItem;
  countryOptions: ProfileOptionItem[];
  language: 'KO' | 'EN';
  onPressProfile: (profileId: number) => void;
  onPress: () => void;
}) {
  const avatarPressActiveRef = useRef(false);
  const countryLabel = formatCountryDisplay(
    getProfileNationalityValue(item.otherProfile),
    countryOptions,
    language,
  );
  const placeLabel = item.place.title;
  const unread = item.unreadCount > 0;

  return (
    <Pressable
      onPress={() => {
        if (avatarPressActiveRef.current) {
          return;
        }

        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        unread ? styles.cardUnread : styles.cardRead,
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.cardTopRow}>
        <Pressable
          hitSlop={8}
          style={styles.avatarPressable}
          onPressIn={() => {
            avatarPressActiveRef.current = true;
          }}
          onPressOut={() => {
            setTimeout(() => {
              avatarPressActiveRef.current = false;
            }, 0);
          }}
          onPress={() => {
            onPressProfile(item.otherProfile.profileId);
          }}>
          <Avatar imageUrl={item.otherProfile.profileImageUrl} nickname={item.otherProfile.nickname} />
        </Pressable>

        <View style={styles.cardMeta}>
          <View style={styles.nameRow}>
            <CustomText style={styles.nickname}>{item.otherProfile.nickname}</CustomText>
            {countryLabel ? (
              <>
                <CustomText style={styles.dot}>·</CustomText>
                <CustomText style={styles.country}>{countryLabel}</CustomText>
              </>
            ) : null}
          </View>

          <View style={styles.placeRow}>
            <PlacePinIcon />
            <CustomText style={styles.placeTitle}>{placeLabel}</CustomText>
          </View>
        </View>

        <CustomText style={styles.time}>{formatRelativeDate(item.lastSentAt, language)}</CustomText>
      </View>

      <CustomText style={styles.preview} numberOfLines={1} ellipsizeMode="tail">
        {item.preview}
      </CustomText>
    </Pressable>
  );
}

function Avatar({ imageUrl, nickname }: { imageUrl: string | null; nickname: string }) {
  const resolvedImageUrl = resolveProfileImageUri(imageUrl);

  if (resolvedImageUrl) {
    return <Image source={{ uri: resolvedImageUrl }} style={styles.avatar} contentFit="cover" />;
  }

  const initial = nickname.trim().charAt(0).toUpperCase() || 'M';
  return (
    <View style={styles.avatarFallback}>
      <CustomText style={styles.avatarInitial}>{initial}</CustomText>
    </View>
  );
}

function PlacePinIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M8.59418 15.9304C8.46897 15.8838 8.342 15.8115 8.21326 15.7133C7.82077 15.3895 7.329 14.9476 6.73796 14.3875C6.14705 13.8276 5.57158 13.1989 5.01157 12.5012C4.45142 11.8036 3.97612 11.0562 3.58567 10.259C3.19522 9.4617 3 8.66135 3 7.85798C3 6.24729 3.55845 4.86829 4.67535 3.72097C5.79239 2.57366 7.23394 2 9 2C10.7524 2 12.1906 2.57366 13.3144 3.72097C14.4381 4.86829 15 6.24729 15 7.85798C15 8.66135 14.8014 9.46367 14.4041 10.2649C14.0069 11.0663 13.5329 11.8171 12.9823 12.5172C12.4315 13.2173 11.8607 13.8428 11.2698 14.3937C10.6789 14.9446 10.1871 15.382 9.7945 15.7056C9.66576 15.8038 9.53756 15.8774 9.40991 15.9264C9.28212 15.9755 9.14548 16 9 16C8.85452 16 8.71924 15.9768 8.59418 15.9304ZM9.93107 8.70633C10.1856 8.46051 10.3128 8.16056 10.3128 7.80649C10.3128 7.45241 10.1856 7.1524 9.93107 6.90644C9.67671 6.66062 9.36636 6.5377 9 6.5377C8.63364 6.5377 8.32329 6.66062 8.06893 6.90644C7.81444 7.1524 7.68719 7.45241 7.68719 7.80649C7.68719 8.16056 7.81444 8.46051 8.06893 8.70633C8.32329 8.95216 8.63364 9.07507 9 9.07507C9.36636 9.07507 9.67671 8.95216 9.93107 8.70633Z"
        fill="#4FAE98"
      />
    </Svg>
  );
}

function compareThreadsByLastSentAt(left: MessageThreadListItem, right: MessageThreadListItem) {
  const lastSentDiff = Date.parse(right.lastSentAt) - Date.parse(left.lastSentAt);
  if (lastSentDiff !== 0) {
    return lastSentDiff;
  }

  return right.threadId.localeCompare(left.threadId);
}

function convertStoredThreadToListItem(
  thread: MessageThreadResponse,
  countryOptions: ProfileOptionItem[],
): MessageThreadListItem {
  const latestMessage = [...thread.messages].sort((left, right) => left.sentAt.localeCompare(right.sentAt)).at(-1);
  const preview = normalizePreviewText(latestMessage?.content ?? '');
  const lastSentAt = latestMessage?.sentAt ?? new Date().toISOString();
  const unreadCount = thread.messages.reduce((count, message) => {
    return count + (message.senderProfileId === thread.otherProfile.profileId && !message.read ? 1 : 0);
  }, 0);

  return {
    threadId: thread.threadId,
    place: thread.place,
    otherProfile: {
      ...thread.otherProfile,
      nationalityCode: getProfileNationalityCode(thread.otherProfile),
      nationality:
        getNonEmptyString(thread.otherProfile.nationality) ??
        getNonEmptyString(thread.otherProfile.nationalityName) ??
        getCountryDisplayName(getProfileNationalityValue(thread.otherProfile), countryOptions),
      nationalityName: getNonEmptyString(thread.otherProfile.nationalityName),
    },
    preview,
    lastSentAt,
    unreadCount,
    blocked: false,
    canReply: thread.canReply,
  };
}

function getNonEmptyString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getProfileNationalityValue(profile: MessageThreadListItem['otherProfile'] | MessageThreadProfile) {
  return (
    getNonEmptyString(profile.nationalityCode) ??
    getNonEmptyString(profile.nationality) ??
    getNonEmptyString(profile.nationalityName) ??
    ''
  );
}

function getProfileNationalityCode(profile: MessageThreadListItem['otherProfile'] | MessageThreadProfile) {
  const explicitCode = getNonEmptyString(profile.nationalityCode);
  if (explicitCode) {
    return explicitCode;
  }

  return normalizeCountryCode(
    getNonEmptyString(profile.nationality) ??
    getNonEmptyString(profile.nationalityName) ??
    '',
  );
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as {
      response?: {
        data?: {
          message?: string;
          code?: string;
        };
      };
    }).response;

    const message = response?.data?.message?.trim();
    if (message) {
      return message;
    }

    const code = response?.data?.code?.trim();
    if (code) {
      return code;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function normalizePreviewText(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 100);
}

function formatRelativeDate(value: string, language: 'KO' | 'EN') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return language === 'KO' ? '방금' : 'just now';
  }

  if (diffMinutes < 60) {
    return language === 'KO' ? `${diffMinutes}분 전` : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return language === 'KO' ? `${diffHours}시간 전` : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return language === 'KO' ? '어제' : 'Yesterday';
  }

  return language === 'KO' ? `${diffDays}일 전` : `${diffDays} days ago`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#F4FFF8',
    borderWidth: 1,
    borderColor: '#BFE9D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 11,
    lineHeight: 15.4,
    color: Palette.primary,
  },
  headerSpacer: {
    width: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  itemSeparator: {
    height: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardUnread: {
    backgroundColor: '#F4FFF8',
    borderWidth: 1,
    borderColor: '#D4F7E4',
  },
  cardRead: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Palette.grey100,
  },
  avatarPressable: {
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.primary,
  },
  cardMeta: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    marginHorizontal: 4,
  },
  country: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
  },
  time: {
    alignSelf: 'flex-start',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
  },
  preview: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.text,
    textAlign: 'center',
  },
  errorDescription: {
    marginTop: 10,
    marginBottom: 24,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
    borderRadius: 14,
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonPressed: {
    opacity: 0.9,
  },
  retryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 15,
    lineHeight: 21,
    color: '#FFFFFF',
  },
  footerSpacer: {
    height: 8,
  },
});
