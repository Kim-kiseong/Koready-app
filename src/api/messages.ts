import axios from 'axios';
import * as Crypto from 'expo-crypto';

import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { useAuthStore } from '@/store/auth-store';
import {
  createOrAppendMockMessageThread,
  getMockMessageThreadById,
  getMockMessageThreadsResponse,
  markMockMessageThreadRead,
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

function isDevMockSession() {
  return __DEV__ && useAuthStore.getState().accessToken === DEV_MOCK_ACCESS_TOKEN;
}

function hasMockThread(threadId: string) {
  return getMockMessageThreadById(threadId) !== null;
}

function shouldFallbackToMock(error: unknown, threadId?: string) {
  if (threadId && hasMockThread(threadId)) {
    return true;
  }

  return axios.isAxiosError(error);
}

export function createMessageThreadIdempotencyKey() {
  return Crypto.randomUUID().replace(/-/g, '');
}

export async function sendMessageThread(
  payload: MessageThreadCreateRequest,
  idempotencyKey: string,
  context?: MessageThreadRequestContext,
): Promise<MessageThreadResponse> {
  if (isDevMockSession()) {
    return createOrAppendMockMessageThread(payload, payload.content, idempotencyKey, context);
  }

  try {
    const response = await client.post<MessageThreadEnvelope>('/message-threads', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });

    return response.data.data;
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      return createOrAppendMockMessageThread(payload, payload.content, idempotencyKey, context);
    }

    throw error;
  }
}

export async function fetchMessageThreads({
  cursor,
  size = 20,
}: {
  cursor?: string | null;
  size?: number;
} = {}): Promise<MessageThreadsResponse> {
  if (isDevMockSession()) {
    return getMockMessageThreadsResponse(cursor, size);
  }

  try {
    const response = await client.get<MessageThreadsEnvelope>('/message-threads', {
      params: {
        cursor: cursor ?? undefined,
        size,
      },
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return getMockMessageThreadsResponse(cursor, size);
    }

    throw error;
  }
}

export async function fetchMessageThread(
  threadId: string,
  {
    cursor,
    size = 20,
  }: {
    cursor?: string | null;
    size?: number;
  } = {},
): Promise<MessageThreadResponse> {
  if (isDevMockSession()) {
    const mockThread = getMockMessageThreadById(threadId, cursor, size);
    if (mockThread) {
      return mockThread;
    }
  }

  try {
    const response = await client.get<MessageThreadEnvelope>(`/message-threads/${threadId}`, {
      params: {
        cursor: cursor ?? undefined,
        size,
      },
    });

    return response.data.data;
  } catch (error) {
    const mockThread = getMockMessageThreadById(threadId, cursor, size);
    if (mockThread) {
      return mockThread;
    }

    throw error;
  }
}

export async function replyMessageThread(
  threadId: string,
  payload: MessageThreadReplyRequest,
  idempotencyKey: string,
): Promise<MessageThreadMessage> {
  if (isDevMockSession()) {
    const mockMessage = replyToMockMessageThread(threadId, payload);
    if (mockMessage) {
      return mockMessage;
    }
  }

  try {
    const response = await client.post<MessageThreadMessageEnvelope>(
      `/message-threads/${threadId}/messages`,
      payload,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    const mockMessage = replyToMockMessageThread(threadId, payload);
    if (mockMessage) {
      return mockMessage;
    }

    throw error;
  }
}

export async function markMessageThreadRead(threadId: string): Promise<MessageThreadReadResponse> {
  if (isDevMockSession()) {
    const mockRead = markMockMessageThreadRead(threadId);
    if (mockRead) {
      return mockRead;
    }
  }

  try {
    const response = await client.put<MessageThreadReadEnvelope>(`/message-threads/${threadId}/read`);
    return response.data.data;
  } catch (error) {
    const mockRead = markMockMessageThreadRead(threadId);
    if (mockRead) {
      return mockRead;
    }

    throw error;
  }
}
