import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fetchProfileOptions } from '@/api/buddy-profile';
import { fetchMessageThreads } from '@/api/messages';
import { useAuthStore } from '@/store/auth-store';
import type {
  MessageThreadListItem,
  MessageThreadMessage,
  MessageThreadResponse,
  MessageThreadsResponse,
  ProfileOptionItem,
  ProfileOptionsResponse,
} from '@/api/types';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import { useMessageThreadStore } from '@/store/message-thread-store';
import BuddyProfileModal from '@/components/place-detail/BuddyProfileModal';
import { getCountryDisplayName, getCountryFlag, normalizeCountryCode } from '@/utils/country';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';

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

const MOCK_THREAD_SUMMARY: MessageThreadsResponse = {
  items: [
    {
      threadId: 'mock-thread-emma',
      place: {
        placeId: 1101,
        title: '김천 김밥축제',
        imageUrl: 'https://picsum.photos/id/1040/600/400',
        routeId: 'gimcheon-gimbap-festival',
        address: '경상북도 김천시 직지사길 130 (대항면 운수리)',
      },
      otherProfile: {
        profileId: 501,
        nickname: 'Emma',
        profileImageUrl: 'https://picsum.photos/id/1027/300/300',
        nationalityCode: 'FR',
        nationality: 'France',
      },
      preview: '안녕하세요! 연락 주셔서 반가워요 😊 같이 가기...',
      updatedAt: '2026-08-05T10:40:00.000Z',
      unreadCount: 2,
      blocked: false,
      canReply: true,
    },
    {
      threadId: 'mock-thread-liam',
      place: {
        placeId: 1102,
        title: '성산일출봉',
        imageUrl: 'https://picsum.photos/id/1056/600/400',
        routeId: 'seongsan-ilchulbong',
        address: '제주특별자치도 서귀포시 성산읍 성산리 78',
      },
      otherProfile: {
        profileId: 502,
        nickname: 'Liam',
        profileImageUrl: 'https://picsum.photos/id/1005/300/300',
        nationalityCode: 'US',
        nationality: 'United States',
      },
      preview: '안녕하세요! 저도 다음 주말에 거기 가볼까 해요.',
      updatedAt: '2026-08-04T03:20:00.000Z',
      unreadCount: 1,
      blocked: false,
      canReply: true,
    },
    {
      threadId: 'mock-thread-sophie',
      place: {
        placeId: 1103,
        title: '인사동',
        imageUrl: 'https://picsum.photos/id/1050/600/400',
        routeId: 'insadong',
        address: '서울 종로구 인사동길 일대',
      },
      otherProfile: {
        profileId: 503,
        nickname: 'Sophie',
        profileImageUrl: 'https://picsum.photos/id/1011/300/300',
        nationalityCode: 'GB',
        nationality: 'United Kingdom',
      },
      preview: '추천해주실 만한 찻집이 있을까요?',
      updatedAt: '2026-08-03T16:10:00.000Z',
      unreadCount: 0,
      blocked: false,
      canReply: true,
    },
    {
      threadId: 'mock-thread-yuki',
      place: {
        placeId: 1104,
        title: '남산타워',
        imageUrl: 'https://picsum.photos/id/1069/600/400',
        routeId: 'namsan-tower',
        address: '서울 용산구 남산공원길 105',
      },
      otherProfile: {
        profileId: 504,
        nickname: 'Yuki',
        profileImageUrl: 'https://picsum.photos/id/1025/300/300',
        nationalityCode: 'JP',
        nationality: 'Japan',
      },
      preview: '좋네요! 다녀오면 어땠는지 알려주세요.',
      updatedAt: '2026-08-01T05:15:00.000Z',
      unreadCount: 0,
      blocked: false,
      canReply: true,
    },
  ],
  nextCursor: null,
  hasMore: false,
  unreadTotal: 3,
};

function cloneMockItems() {
  return MOCK_THREAD_SUMMARY.items.map((item) => ({
    ...item,
    place: { ...item.place },
    otherProfile: { ...item.otherProfile },
  }));
}

export default function MessageThreadsScreen() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const storeThreads = useMessageThreadStore((state) => state.threads);

  const [profileOptions, setProfileOptions] = useState<ProfileOptionsResponse | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [threadState, setThreadState] = useState<MessageThreadsScreenState>({
    items: cloneMockItems(),
    nextCursor: MOCK_THREAD_SUMMARY.nextCursor,
    hasMore: MOCK_THREAD_SUMMARY.hasMore,
    unreadTotal: MOCK_THREAD_SUMMARY.unreadTotal,
  });
  const countryOptions = profileOptions?.countries?.length ? profileOptions.countries : FALLBACK_COUNTRY_OPTIONS;
  const selectedProfileFallback = useMemo(
    () => (selectedProfileId == null ? null : getMockBuddyProfileDetailById(selectedProfileId)),
    [selectedProfileId],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [loadedOptions, loadedThreads] = await Promise.all([
          fetchProfileOptions(),
          fetchMessageThreads(),
        ]);

        if (cancelled) {
          return;
        }

        setProfileOptions(loadedOptions);
        setThreadState({
          items: loadedThreads.items.length > 0 ? loadedThreads.items : cloneMockItems(),
          nextCursor: loadedThreads.nextCursor,
          hasMore: loadedThreads.hasMore,
          unreadTotal: loadedThreads.unreadTotal,
        });
      } catch {
        if (!cancelled) {
          setProfileOptions(null);
          setThreadState({
            items: cloneMockItems(),
            nextCursor: MOCK_THREAD_SUMMARY.nextCursor,
            hasMore: MOCK_THREAD_SUMMARY.hasMore,
            unreadTotal: MOCK_THREAD_SUMMARY.unreadTotal,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayItems = useMemo(() => {
    const baseItems = threadState.items.length > 0 ? threadState.items : cloneMockItems();
    const apiMap = new Map(baseItems.map((item) => [item.threadId, item]));

    const storeItems = Object.values(storeThreads)
      .map((thread) => convertStoredThreadToListItem(thread, countryOptions))
      .sort(compareThreadsByUpdatedAt);

    const prependItems: MessageThreadListItem[] = [];
    storeItems.forEach((item) => {
      if (apiMap.has(item.threadId)) {
        apiMap.set(item.threadId, item);
        return;
      }

      prependItems.push(item);
    });

    return [...prependItems, ...Array.from(apiMap.values())];
  }, [countryOptions, storeThreads, threadState.items]);

  const unreadTotal = useMemo(
    () => displayItems.reduce((total, item) => total + item.unreadCount, 0),
    [displayItems],
  );

  useEffect(() => {
    useAuthStore.setState({ unreadMessageCount: unreadTotal });
  }, [unreadTotal]);

  const handlePressThread = useCallback(
    (item: MessageThreadListItem) => {
      const existingThread = useMessageThreadStore.getState().threads[item.threadId];
      if (!existingThread) {
        useMessageThreadStore.getState().upsertThread(buildThreadFromSummary(item));
      }

      router.push({
        pathname: '/message-threads/[threadId]',
        params: { threadId: item.threadId },
      } as never);
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => goBackOrRoot(router)}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }}
            size={18}
            weight="semibold"
            tintColor={Palette.text}
          />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <CustomText style={styles.headerTitle}>쪽지함</CustomText>
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
        contentContainerStyle={styles.listContent}
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
  const country = getCountryDisplayName(
    item.otherProfile.nationalityCode ?? item.otherProfile.nationality ?? '',
    countryOptions,
  );
  const countryFlag = getCountryFlag(item.otherProfile.nationalityCode ?? item.otherProfile.nationality ?? '', countryOptions);
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
            <CustomText style={styles.dot}>·</CustomText>
            <CustomText style={styles.country}>
              {country}
              {countryFlag ? ` ${countryFlag}` : ''}
            </CustomText>
          </View>

          <View style={styles.placeRow}>
            <PlacePinIcon />
            <CustomText style={styles.placeTitle}>{placeLabel}</CustomText>
          </View>
        </View>

        <CustomText style={styles.time}>{formatRelativeDate(item.updatedAt, language)}</CustomText>
      </View>

      <CustomText style={styles.preview} numberOfLines={1} ellipsizeMode="tail">
        {item.preview}
      </CustomText>
    </Pressable>
  );
}

function Avatar({ imageUrl, nickname }: { imageUrl: string | null; nickname: string }) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={styles.avatar} contentFit="cover" />;
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

function compareThreadsByUpdatedAt(left: MessageThreadListItem, right: MessageThreadListItem) {
  const updatedDiff = right.updatedAt.localeCompare(left.updatedAt);
  if (updatedDiff !== 0) {
    return updatedDiff;
  }

  return right.threadId.localeCompare(left.threadId);
}

function buildThreadFromSummary(item: MessageThreadListItem): MessageThreadResponse {
  const latestMessage: MessageThreadMessage = {
    messageId: Date.now(),
    threadId: item.threadId,
    senderProfileId: 0,
    receiverProfileId: item.otherProfile.profileId,
    placeId: item.place.placeId,
    content: item.preview,
    sentAt: item.updatedAt,
    read: item.unreadCount === 0,
    readAt: item.unreadCount === 0 ? item.updatedAt : null,
  };

  return {
    threadId: item.threadId,
    place: item.place,
    otherProfile: item.otherProfile,
    messages: [latestMessage],
    nextCursor: null,
    hasMore: false,
    canReply: item.canReply,
  };
}

function convertStoredThreadToListItem(
  thread: MessageThreadResponse,
  countryOptions: ProfileOptionItem[],
): MessageThreadListItem {
  const latestMessage = [...thread.messages].sort((left, right) => left.sentAt.localeCompare(right.sentAt)).at(-1);
  const preview = normalizePreviewText(latestMessage?.content ?? '');
  const updatedAt = latestMessage?.sentAt ?? new Date().toISOString();
  const unreadCount = thread.messages.reduce((count, message) => {
    return count + (message.senderProfileId === thread.otherProfile.profileId && !message.read ? 1 : 0);
  }, 0);

  return {
    threadId: thread.threadId,
    place: thread.place,
    otherProfile: {
      ...thread.otherProfile,
      nationalityCode:
        thread.otherProfile.nationalityCode ?? normalizeCountryCode(thread.otherProfile.nationality ?? ''),
      nationality:
        thread.otherProfile.nationality ??
        getCountryDisplayName(thread.otherProfile.nationalityCode ?? '', countryOptions),
    },
    preview,
    updatedAt,
    unreadCount,
    blocked: false,
    canReply: thread.canReply,
  };
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
  itemSeparator: {
    height: 16,
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
  footerSpacer: {
    height: 8,
  },
});
