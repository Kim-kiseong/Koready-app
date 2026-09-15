import * as Crypto from 'expo-crypto';

import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { useAuthStore } from '@/store/auth-store';
import { useMessageThreadStore } from '@/store/message-thread-store';
import {
  createOrAppendMockMessageThread,
  getMockMessageThreadById,
  getMockMessageThreadsResponse,
  markMockMessageThreadRead,
  prepareMockMessageThreads,
  replyToMockMessageThread,
} from '@/mock/message-threads';

import { client } from './client';
import type {
  MessageThreadCreateRequest,
  MessageThreadEnvelope,
  MessageThreadMessage,
  MessageThreadMessageEnvelope,
  MessageThreadReadEnvelope,
  MessageThreadReadResponse,
  MessageThreadReplyRequest,
  MessageThreadResponse,
  MessageThreadsEnvelope,
  MessageThreadsResponse,
  MessageThreadRequestContext,
} from './types';

async function withMessageSession<T>(
  request: (isMock: boolean, signal: AbortSignal) => Promise<T> | T,
): Promise<T> {
  const { user, accessToken } = useAuthStore.getState();
  if (!user || !accessToken) throw new Error('Login is required to access messages.');

  useMessageThreadStore.getState().prepareForUser(user.publicId);
  const { sessionVersion } = useMessageThreadStore.getState();
  const controller = new AbortController();
  const unsubscribe = useMessageThreadStore.subscribe((state) => {
    if (state.sessionVersion !== sessionVersion) controller.abort();
  });
  const isMock = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;

  try {
    if (isMock) prepareMockMessageThreads(sessionVersion);
    const result = await request(isMock, controller.signal);
    if (controller.signal.aborted || useAuthStore.getState().user?.publicId !== user.publicId) {
      throw new Error('The message session has changed.');
    }
    return result;
  } finally {
    unsubscribe();
  }
}

export function createMessageThreadIdempotencyKey() {
  return Crypto.randomUUID().replace(/-/g, '');
}

export async function sendMessageThread(
  payload: MessageThreadCreateRequest,
  idempotencyKey: string,
  context?: MessageThreadRequestContext,
): Promise<MessageThreadResponse> {
  return withMessageSession(async (isMock, signal) => {
    if (isMock) {
      return createOrAppendMockMessageThread(payload, payload.content, idempotencyKey, context);
    }
    const response = await client.post<MessageThreadEnvelope>('/message-threads', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    });
    return response.data.data;
  });
}

export async function fetchMessageThreads({
  cursor,
  size = 20,
}: {
  cursor?: string | null;
  size?: number;
} = {}): Promise<MessageThreadsResponse> {
  return withMessageSession(async (isMock, signal) => {
    if (isMock) return getMockMessageThreadsResponse(cursor, size);
    const response = await client.get<MessageThreadsEnvelope>('/message-threads', {
      params: { cursor: cursor ?? undefined, size },
      signal,
    });
    return response.data.data;
  });
}

export async function fetchMessageThread(
  threadId: string,
  { cursor, size = 20 }: { cursor?: string | null; size?: number } = {},
): Promise<MessageThreadResponse> {
  return withMessageSession(async (isMock, signal) => {
    if (isMock) {
      const thread = getMockMessageThreadById(threadId, cursor, size);
      if (!thread) throw new Error('Message thread not found.');
      return thread;
    }
    const response = await client.get<MessageThreadEnvelope>(`/message-threads/${threadId}`, {
      params: { cursor: cursor ?? undefined, size },
      signal,
    });
    return response.data.data;
  });
}

export async function replyMessageThread(
  threadId: string,
  payload: MessageThreadReplyRequest,
  idempotencyKey: string,
): Promise<MessageThreadMessage> {
  return withMessageSession(async (isMock, signal) => {
    if (isMock) {
      const message = replyToMockMessageThread(threadId, payload, idempotencyKey);
      if (!message) throw new Error('Message thread not found.');
      return message;
    }
    const response = await client.post<MessageThreadMessageEnvelope>(
      `/message-threads/${threadId}/messages`, payload,
      { headers: { 'Idempotency-Key': idempotencyKey }, signal },
    );
    return response.data.data;
  });
}

export async function markMessageThreadRead(threadId: string): Promise<MessageThreadReadResponse> {
  return withMessageSession(async (isMock, signal) => {
    if (isMock) {
      const result = markMockMessageThreadRead(threadId);
      if (!result) throw new Error('Message thread not found.');
      return result;
    }
    const response = await client.put<MessageThreadReadEnvelope>(
      `/message-threads/${threadId}/read`, undefined, { signal },
    );
    return response.data.data;
  });
}
