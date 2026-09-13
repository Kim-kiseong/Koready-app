import type {
  MessageThreadCreateRequest,
  MessageThreadListItem,
  MessageThreadMessage,
  MessageThreadRequestContext,
  MessageThreadPlace,
  MessageThreadProfile,
  MessageThreadReadResponse,
  MessageThreadReplyRequest,
  MessageThreadResponse,
  MessageThreadsResponse,
} from '@/api/types';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { normalizeCountryCode } from '@/utils/country';
import { useLanguageStore } from '@/store/language-store';
import { useMessageThreadStore } from '@/store/message-thread-store';

type ThreadRecord = {
  threadId: string;
  place: MessageThreadPlace;
  otherProfile: MessageThreadProfile;
  messages: MessageThreadMessage[];
  canReply: boolean;
};

type ListCursor = {
  lastSentAt: string;
  threadId: string;
};

type IdempotencyRecord =
  | {
      kind: 'create';
      fingerprint: string;
      response: MessageThreadResponse;
    }
  | {
      kind: 'reply';
      fingerprint: string;
      response: MessageThreadMessage;
    };

type MockLanguage = 'KO' | 'EN';

const ENGLISH_THREAD_COPY: Record<
  string,
  {
    place?: {
      title?: string;
      address?: string;
    };
    messages?: Record<number, string>;
  }
> = {
  'mock-thread-emma': {
    place: {
      title: 'Gimcheon Gimbap Festival',
      address: '130 Jikjisa-gil, Daehang-myeon, Gimcheon-si, Gyeongsangbuk-do',
    },
    messages: {
      9301: 'Hi Emma! 😊\nI noticed you saved the Gimcheon Gimbap Festival.\nI was thinking about visiting this weekend too.\nWould you like to go together?',
      9302: 'Hi! Thanks for reaching out 😊 I’d love to join.',
      9303: 'Would you like to visit N Seoul Tower together?',
    },
  },
  'mock-thread-liam': {
    place: {
      title: 'Seongsan Ilchulbong',
      address: '78 Seongsan-ri, Seongsan-eup, Seogwipo-si, Jeju-do',
    },
    messages: {
      9311: 'I also added Seongsan Ilchulbong to my itinerary. Want to go together?',
      9312: "Hi! I'm thinking of going there next weekend too.",
    },
  },
  'mock-thread-sophie': {
    place: {
      title: 'Insadong',
      address: 'Insadong-gil area, Jongno-gu, Seoul',
    },
    messages: {
      9321: 'I put together a tea house and alley course in Insadong.',
      9322: 'Do you know any tea houses you would recommend?',
    },
  },
  'mock-thread-yuki': {
    place: {
      title: 'N Seoul Tower',
      address: '105 Namsan Park-gil, Yongsan-gu, Seoul',
    },
    messages: {
      9331: 'I reached out because I was curious about the N Seoul Tower night-view course.',
      9332: 'Sounds great! Please let me know how it was when you go.',
    },
  },
} as const;

const PLACE_LOOKUP: Record<number, MessageThreadPlace> = {
  1101: {
    placeId: 1101,
    title: '김천 김밥축제',
    imageUrl: 'https://picsum.photos/id/1040/600/400',
    routeId: 'gimcheon-gimbap-festival',
    address: '경상북도 김천시 직지사길 130 (대항면 운수리)',
  },
  1102: {
    placeId: 1102,
    title: '성산일출봉',
    imageUrl: 'https://picsum.photos/id/1056/600/400',
    routeId: 'seongsan-ilchulbong',
    address: '제주특별자치도 서귀포시 성산읍 성산리 78',
  },
  1103: {
    placeId: 1103,
    title: '인사동',
    imageUrl: 'https://picsum.photos/id/1050/600/400',
    routeId: 'insadong',
    address: '서울 종로구 인사동길 일대',
  },
  1104: {
    placeId: 1104,
    title: '남산타워',
    imageUrl: 'https://picsum.photos/id/1069/600/400',
    routeId: 'namsan-tower',
    address: '서울 용산구 남산공원길 105',
  },
};

const MOCK_CURRENT_PROFILE_ID = 0;

const MOCK_THREADS = new Map<string, ThreadRecord>();
const MOCK_IDEMPOTENCY = new Map<string, IdempotencyRecord>();

let nextMessageId = 9400;

seedThread({
  threadId: 'mock-thread-emma',
  place: PLACE_LOOKUP[1101],
  otherProfileId: 501,
  canReply: true,
  messages: [
    createMessage({
      messageId: 9301,
      threadId: 'mock-thread-emma',
      senderProfileId: MOCK_CURRENT_PROFILE_ID,
      receiverProfileId: 501,
      placeId: 1101,
      content: '안녕하세요, Emma! 😊\n김천 김밥축제를 저장하신 걸 보고 쪽지드려요.\n저도 이번 주말에 방문해볼까 해서요.\n혹시 같이 다녀오실래요?',
      sentAt: '2026-08-05T05:32:00.000Z',
      read: true,
      readAt: '2026-08-05T05:32:00.000Z',
    }),
    createMessage({
      messageId: 9302,
      threadId: 'mock-thread-emma',
      senderProfileId: 501,
      receiverProfileId: MOCK_CURRENT_PROFILE_ID,
      placeId: 1101,
      content: '안녕하세요! 연락 주셔서 반가워요 😊 같이 가기 좋을 것 같아요.',
      sentAt: '2026-08-05T10:32:00.000Z',
      read: false,
      readAt: null,
    }),
    createMessage({
      messageId: 9303,
      threadId: 'mock-thread-emma',
      senderProfileId: 501,
      receiverProfileId: MOCK_CURRENT_PROFILE_ID,
      placeId: 1101,
      content: '혹시 남산타워도 같이 가실래요?',
      sentAt: '2026-08-05T10:41:00.000Z',
      read: false,
      readAt: null,
    }),
  ],
});

seedThread({
  threadId: 'mock-thread-liam',
  place: PLACE_LOOKUP[1102],
  otherProfileId: 502,
  canReply: true,
  messages: [
    createMessage({
      messageId: 9311,
      threadId: 'mock-thread-liam',
      senderProfileId: MOCK_CURRENT_PROFILE_ID,
      receiverProfileId: 502,
      placeId: 1102,
      content: '성산일출봉도 일정에 넣어두었어요. 같이 가실래요?',
      sentAt: '2026-08-04T03:12:00.000Z',
      read: true,
      readAt: '2026-08-04T03:12:00.000Z',
    }),
    createMessage({
      messageId: 9312,
      threadId: 'mock-thread-liam',
      senderProfileId: 502,
      receiverProfileId: MOCK_CURRENT_PROFILE_ID,
      placeId: 1102,
      content: '안녕하세요! 저도 다음 주말에 거기 가볼까 해요.',
      sentAt: '2026-08-04T03:20:00.000Z',
      read: false,
      readAt: null,
    }),
  ],
});

seedThread({
  threadId: 'mock-thread-sophie',
  place: PLACE_LOOKUP[1103],
  otherProfileId: 503,
  canReply: true,
  messages: [
    createMessage({
      messageId: 9321,
      threadId: 'mock-thread-sophie',
      senderProfileId: MOCK_CURRENT_PROFILE_ID,
      receiverProfileId: 503,
      placeId: 1103,
      content: '인사동 찻집과 골목길 코스를 정리해봤어요.',
      sentAt: '2026-08-03T15:55:00.000Z',
      read: true,
      readAt: '2026-08-03T15:55:00.000Z',
    }),
    createMessage({
      messageId: 9322,
      threadId: 'mock-thread-sophie',
      senderProfileId: 503,
      receiverProfileId: MOCK_CURRENT_PROFILE_ID,
      placeId: 1103,
      content: '추천해주실 만한 찻집이 있을까요?',
      sentAt: '2026-08-03T16:10:00.000Z',
      read: true,
      readAt: '2026-08-03T16:10:00.000Z',
    }),
  ],
});

seedThread({
  threadId: 'mock-thread-yuki',
  place: PLACE_LOOKUP[1104],
  otherProfileId: 504,
  canReply: true,
  messages: [
    createMessage({
      messageId: 9331,
      threadId: 'mock-thread-yuki',
      senderProfileId: MOCK_CURRENT_PROFILE_ID,
      receiverProfileId: 504,
      placeId: 1104,
      content: '남산타워 야경 코스가 궁금해서 연락드렸어요.',
      sentAt: '2026-08-01T04:50:00.000Z',
      read: true,
      readAt: '2026-08-01T04:50:00.000Z',
    }),
    createMessage({
      messageId: 9332,
      threadId: 'mock-thread-yuki',
      senderProfileId: 504,
      receiverProfileId: MOCK_CURRENT_PROFILE_ID,
      placeId: 1104,
      content: '좋네요! 다녀오면 어땠는지 알려주세요.',
      sentAt: '2026-08-01T05:15:00.000Z',
      read: true,
      readAt: '2026-08-01T05:15:00.000Z',
    }),
  ],
});

const INITIAL_MOCK_THREADS = [...MOCK_THREADS.values()].map((thread) => ({
  ...thread,
  messages: thread.messages.map((message) => ({ ...message })),
}));
let mockSessionVersion: number | null = null;

export function prepareMockMessageThreads(sessionVersion: number) {
  if (mockSessionVersion === sessionVersion) return;
  mockSessionVersion = sessionVersion;
  MOCK_THREADS.clear();
  MOCK_IDEMPOTENCY.clear();
  nextMessageId = 9400;
  INITIAL_MOCK_THREADS.forEach((thread) => {
    MOCK_THREADS.set(thread.threadId, {
      ...thread,
      place: { ...thread.place },
      otherProfile: { ...thread.otherProfile },
      messages: thread.messages.map((message) => ({ ...message })),
    });
  });
}

function seedThread(seed: Omit<ThreadRecord, 'otherProfile'> & { otherProfileId: number }) {
  const profile = getMockBuddyProfileDetailById(seed.otherProfileId);
  const otherProfile = profile
    ? {
        profileId: profile.profileId,
        nickname: profile.nickname,
        profileImageUrl: profile.profileImageUrl,
        nationalityCode: profile.nationalityCode ?? normalizeCountryCode(profile.nationality ?? ''),
        nationality: profile.nationality ?? profile.nationalityCode ?? '',
      }
    : {
        profileId: seed.otherProfileId,
        nickname: `Buddy ${seed.otherProfileId}`,
        profileImageUrl: null,
        nationalityCode: '',
        nationality: '',
      };

  MOCK_THREADS.set(seed.threadId, {
    threadId: seed.threadId,
    place: { ...seed.place },
    otherProfile,
    messages: sortMessages(seed.messages.map((message) => ({ ...message }))),
    canReply: seed.canReply,
  });
}

function createMessage(message: MessageThreadMessage): MessageThreadMessage {
  nextMessageId = Math.max(nextMessageId, message.messageId + 1);
  return { ...message };
}

function getMockLanguage(): MockLanguage {
  return useLanguageStore.getState().language === 'EN' ? 'EN' : 'KO';
}

function localizePlace(place: MessageThreadPlace, threadId: string): MessageThreadPlace {
  if (getMockLanguage() !== 'EN') {
    return { ...place };
  }

  const copy = ENGLISH_THREAD_COPY[threadId]?.place;
  return {
    ...place,
    title: copy?.title ?? place.title,
    address: copy?.address ?? place.address,
  };
}

function localizeMessage(threadId: string, message: MessageThreadMessage): MessageThreadMessage {
  if (getMockLanguage() !== 'EN') {
    return cloneMessage(message);
  }

  const copy = ENGLISH_THREAD_COPY[threadId]?.messages?.[message.messageId];
  return {
    ...message,
    content: copy ?? message.content,
  };
}

function createNextMessageId() {
  nextMessageId += 1;
  return nextMessageId;
}

function cloneMessage(message: MessageThreadMessage): MessageThreadMessage {
  return { ...message };
}

function sortMessages(messages: MessageThreadMessage[]) {
  return [...messages].sort((left, right) => {
    const sentDiff = left.sentAt.localeCompare(right.sentAt);
    if (sentDiff !== 0) {
      return sentDiff;
    }

    return left.messageId - right.messageId;
  });
}

function normalizeContent(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function getCreateFingerprint(
  payload: MessageThreadCreateRequest,
  content: string,
  context?: MessageThreadRequestContext,
) {
  return [
    'create',
    payload.receiverProfileId,
    context?.placeRouteId ?? payload.placeId,
    normalizeContent(content),
  ].join(':');
}

function getReplyFingerprint(threadId: string, content: string) {
  return ['reply', threadId, normalizeContent(content)].join(':');
}

function getCachedIdempotentResponse<T extends IdempotencyRecord['response']>(
  idempotencyKey: string,
  fingerprint: string,
): T | null {
  const cached = MOCK_IDEMPOTENCY.get(idempotencyKey);
  if (!cached) {
    return null;
  }

  if (cached.fingerprint !== fingerprint) {
    throw new Error('IDEMPOTENCY_KEY_REUSED');
  }

  return cached.response as T;
}

function cacheIdempotentResponse(idempotencyKey: string, record: IdempotencyRecord) {
  MOCK_IDEMPOTENCY.set(idempotencyKey, record);
}

function getLatestMessage(messages: MessageThreadMessage[]) {
  return sortMessages(messages).at(-1) ?? null;
}

function getThreadLastSentAt(record: ThreadRecord) {
  return getLatestMessage(record.messages)?.sentAt ?? '1970-01-01T00:00:00.000Z';
}

function getUnreadCount(record: ThreadRecord) {
  return record.messages.reduce((count, message) => {
    return count + (message.senderProfileId !== MOCK_CURRENT_PROFILE_ID && !message.read ? 1 : 0);
  }, 0);
}

function buildListItem(record: ThreadRecord): MessageThreadListItem {
  const latestMessage = getLatestMessage(record.messages);
  const localizedLatestMessage = latestMessage ? localizeMessage(record.threadId, latestMessage) : null;
  const lastSentAt = getThreadLastSentAt(record);

  return {
    threadId: record.threadId,
    place: localizePlace(record.place, record.threadId),
    otherProfile: {
      ...record.otherProfile,
    },
    preview: normalizeContent(localizedLatestMessage?.content ?? '').slice(0, 100),
    lastSentAt,
    unreadCount: getUnreadCount(record),
    blocked: false,
    canReply: record.canReply,
  };
}

function encodeListCursor(lastSentAt: string, threadId: string) {
  return `${lastSentAt}|${threadId}`;
}

function decodeListCursor(cursor: string): ListCursor | null {
  const separatorIndex = cursor.lastIndexOf('|');
  if (separatorIndex === -1) {
    return null;
  }

  const lastSentAt = cursor.slice(0, separatorIndex);
  const threadId = cursor.slice(separatorIndex + 1);
  if (!lastSentAt || !threadId) {
    return null;
  }

  return { lastSentAt, threadId };
}

function paginateList(items: MessageThreadListItem[], cursor?: string | null, size = 20) {
  const normalizedSize = Math.min(50, Math.max(1, size));
  const sorted = [...items].sort((left, right) => {
    const lastSentDiff = right.lastSentAt.localeCompare(left.lastSentAt);
    if (lastSentDiff !== 0) {
      return lastSentDiff;
    }

    return right.threadId.localeCompare(left.threadId);
  });

  if (!cursor) {
    const page = sorted.slice(0, normalizedSize);
    return {
      items: page,
      hasMore: sorted.length > normalizedSize,
      nextCursor:
        sorted.length > normalizedSize
          ? encodeListCursor(page.at(-1)!.lastSentAt, page.at(-1)!.threadId)
          : null,
    };
  }

  const decoded = decodeListCursor(cursor);
  if (!decoded) {
    return null;
  }

  const cursorIndex = sorted.findIndex(
    (item) => item.lastSentAt === decoded.lastSentAt && item.threadId === decoded.threadId,
  );
  if (cursorIndex === -1) {
    return null;
  }

  const page = sorted.slice(cursorIndex + 1, cursorIndex + 1 + normalizedSize);
  return {
    items: page,
    hasMore: cursorIndex + 1 + normalizedSize < sorted.length,
    nextCursor: page.length > 0 ? encodeListCursor(page.at(-1)!.lastSentAt, page.at(-1)!.threadId) : null,
  };
}

function getThreadRecord(threadId: string) {
  const record = MOCK_THREADS.get(threadId);
  if (record) return record;

  // Fast Refresh can reload mock fixtures while the screen store still has sent messages.
  const cachedThread = useMessageThreadStore.getState().threads[threadId];
  if (!threadId.startsWith('mock-message-thread-') || !cachedThread?.messages.length) {
    return null;
  }

  const restoredRecord: ThreadRecord = {
    threadId,
    place: { ...cachedThread.place },
    otherProfile: { ...cachedThread.otherProfile },
    messages: cachedThread.messages.map((message) => ({ ...message })),
    canReply: cachedThread.canReply,
  };
  MOCK_THREADS.set(threadId, restoredRecord);
  return restoredRecord;
}

function ensureRecordFromRequest(
  payload: MessageThreadCreateRequest,
  threadId: string,
  context?: MessageThreadRequestContext,
) {
  const existing = getThreadRecord(threadId);
  if (existing) {
    if (context) {
      existing.place = {
        ...existing.place,
        title: context.placeTitle ?? existing.place.title,
        routeId: context.placeRouteId ?? existing.place.routeId,
        address: context.placeAddress ?? existing.place.address,
        imageUrl: context.placeImageUrl ?? existing.place.imageUrl,
      };
      MOCK_THREADS.set(threadId, existing);
    }

    return existing;
  }

  const profile = getMockBuddyProfileDetailById(payload.receiverProfileId);
  const mockLanguage = getMockLanguage();
  const basePlace = PLACE_LOOKUP[payload.placeId] ?? {
    placeId: payload.placeId,
    title: mockLanguage === 'EN' ? 'Mock Place' : '목업 장소',
    imageUrl: `https://picsum.photos/seed/koready-place-${payload.placeId}/600/400`,
  };
  const place = {
    ...basePlace,
    title: context?.placeTitle ?? basePlace.title,
    routeId: context?.placeRouteId ?? basePlace.routeId,
    address: context?.placeAddress ?? basePlace.address,
    imageUrl: context?.placeImageUrl ?? basePlace.imageUrl,
  };

  const nextRecord: ThreadRecord = {
    threadId,
    place,
    otherProfile: profile
      ? {
        profileId: profile.profileId,
          nickname: profile.nickname,
          profileImageUrl: profile.profileImageUrl,
          nationalityCode: profile.nationalityCode ?? normalizeCountryCode(profile.nationality ?? ''),
          nationality: profile.nationality ?? profile.nationalityCode ?? '',
        }
      : {
          profileId: payload.receiverProfileId,
          nickname: `Buddy ${payload.receiverProfileId}`,
          profileImageUrl: null,
          nationalityCode: '',
          nationality: '',
        },
    messages: [],
    canReply: true,
  };

  MOCK_THREADS.set(threadId, nextRecord);
  return nextRecord;
}

function getThreadPage(record: ThreadRecord, cursor?: string | null, size = 20) {
  const allMessages = sortMessages(record.messages);
  const normalizedSize = Math.min(50, Math.max(1, size));

  if (!cursor) {
    const messages = allMessages.slice(-normalizedSize);
    const hasMore = allMessages.length > normalizedSize;
    return {
      messages,
      hasMore,
      nextCursor: hasMore ? `before:${messages.at(0)!.messageId}` : null,
    };
  }

  if (!cursor.startsWith('before:')) {
    return null;
  }

  const cursorMessageId = Number(cursor.slice('before:'.length));
  if (!Number.isFinite(cursorMessageId)) {
    return null;
  }

  const olderMessages = allMessages.filter((message) => message.messageId < cursorMessageId);
  const messages = olderMessages.slice(-normalizedSize);
  const hasMore = olderMessages.length > normalizedSize;
  return {
    messages,
    hasMore,
    nextCursor: messages.length > 0 ? `before:${messages.at(0)!.messageId}` : null,
  };
}

export function getMockMessageThreadsResponse(cursor?: string | null, size = 20): MessageThreadsResponse {
  Object.keys(useMessageThreadStore.getState().threads).forEach(getThreadRecord);
  const items = [...MOCK_THREADS.values()].map(buildListItem);
  const paginated = paginateList(items, cursor, size);
  if (!paginated) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
      unreadTotal: 0,
    };
  }

  return {
    items: paginated.items,
    nextCursor: paginated.nextCursor,
    hasMore: paginated.hasMore,
    unreadTotal: items.reduce((total, item) => total + item.unreadCount, 0),
  };
}

export function getMockMessageThreadById(
  threadId: string,
  cursor?: string | null,
  size = 20,
): MessageThreadResponse | null {
  const record = getThreadRecord(threadId);
  if (!record) {
    return null;
  }

  const page = getThreadPage(record, cursor, size);
  if (!page) {
    return null;
  }

  return {
    threadId: record.threadId,
    place: localizePlace(record.place, record.threadId),
    otherProfile: { ...record.otherProfile },
    messages: page.messages.map((message) => localizeMessage(record.threadId, message)),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    canReply: record.canReply,
  };
}

export function createOrAppendMockMessageThread(
  payload: MessageThreadCreateRequest,
  content: string,
  idempotencyKey: string,
  context?: MessageThreadRequestContext,
): MessageThreadResponse {
  const fingerprint = getCreateFingerprint(payload, content, context);
  const cached = getCachedIdempotentResponse<MessageThreadResponse>(idempotencyKey, fingerprint);
  if (cached) {
    return cached;
  }

  const threadKey = context?.placeRouteId ?? String(payload.placeId);
  const threadId = `mock-message-thread-${threadKey}-${payload.receiverProfileId}`;
  const record = ensureRecordFromRequest(payload, threadId, context);
  const trimmedContent = normalizeContent(content);
  const sentAt = new Date().toISOString();

  if (context) {
    record.place = {
      ...record.place,
      title: context.placeTitle ?? record.place.title,
      routeId: context.placeRouteId ?? record.place.routeId,
      address: context.placeAddress ?? record.place.address,
      imageUrl: context.placeImageUrl ?? record.place.imageUrl,
    };
  }

  const nextMessage = createMessage({
    messageId: createNextMessageId(),
    threadId,
    senderProfileId: MOCK_CURRENT_PROFILE_ID,
    receiverProfileId: payload.receiverProfileId,
    placeId: payload.placeId,
    content: trimmedContent,
    sentAt,
    read: true,
    readAt: sentAt,
  });

  record.messages = sortMessages([...record.messages, nextMessage]);
  record.place = { ...record.place };
  MOCK_THREADS.set(threadId, record);

  const response: MessageThreadResponse = {
    threadId,
    place: localizePlace(record.place, record.threadId),
    otherProfile: { ...record.otherProfile },
    messages: record.messages.map((message) => localizeMessage(record.threadId, message)),
    nextCursor: null,
    hasMore: false,
    canReply: record.canReply,
  };

  cacheIdempotentResponse(idempotencyKey, {
    kind: 'create',
    fingerprint,
    response,
  });

  return response;
}

export function replyToMockMessageThread(
  threadId: string,
  payload: MessageThreadReplyRequest,
  idempotencyKey?: string,
): MessageThreadMessage | null {
  const record = getThreadRecord(threadId);
  if (!record) {
    return null;
  }

  const fingerprint = getReplyFingerprint(threadId, payload.content);
  if (idempotencyKey) {
    const cached = getCachedIdempotentResponse<MessageThreadMessage>(idempotencyKey, fingerprint);
    if (cached) {
      return cached;
    }
  }

  const sentAt = new Date().toISOString();
  const nextMessage = createMessage({
    messageId: createNextMessageId(),
    threadId,
    senderProfileId: MOCK_CURRENT_PROFILE_ID,
    receiverProfileId: record.otherProfile.profileId,
    placeId: record.place.placeId,
    content: normalizeContent(payload.content),
    sentAt,
    read: true,
    readAt: sentAt,
  });

  record.messages = sortMessages([...record.messages, nextMessage]);
  MOCK_THREADS.set(threadId, record);

  const response = cloneMessage(nextMessage);
  if (idempotencyKey) {
    cacheIdempotentResponse(idempotencyKey, {
      kind: 'reply',
      fingerprint,
      response,
    });
  }

  return response;
}

export function markMockMessageThreadRead(threadId: string): MessageThreadReadResponse | null {
  const record = getThreadRecord(threadId);
  if (!record) {
    return null;
  }

  const readAt = new Date().toISOString();
  record.messages = record.messages.map((message) => {
    if (message.senderProfileId === MOCK_CURRENT_PROFILE_ID || message.read) {
      return message;
    }

    return {
      ...message,
      read: true,
      readAt,
    };
  });
  MOCK_THREADS.set(threadId, record);

  const threadUnreadCount = getUnreadCount(record);
  const unreadTotal = [...MOCK_THREADS.values()].reduce((total, currentRecord) => {
    return total + getUnreadCount(currentRecord);
  }, 0);

  return {
    threadId,
    readAt,
    threadUnreadCount,
    unreadTotal,
  };
}

export function getMockThreadListItemCount() {
  return MOCK_THREADS.size;
}
