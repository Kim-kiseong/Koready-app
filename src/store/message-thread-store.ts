import { create } from 'zustand';

import type { MessageThreadResponse } from '@/api/types';

type MessageThreadState = {
  ownerPublicId: string | null;
  sessionVersion: number;
  threads: Record<string, MessageThreadResponse>;
  prepareForUser: (publicId: string) => void;
  upsertThread: (thread: MessageThreadResponse, sessionVersion: number) => void;
  replaceThread: (thread: MessageThreadResponse, sessionVersion: number) => void;
  clearThread: (threadId: string) => void;
  reset: () => void;
};

function mergeThreadMessages(
  existingMessages: MessageThreadResponse['messages'],
  nextMessages: MessageThreadResponse['messages'],
) {
  const messageMap = new Map<number, MessageThreadResponse['messages'][number]>();

  existingMessages.forEach((message) => {
    messageMap.set(message.messageId, message);
  });

  nextMessages.forEach((message) => {
    messageMap.set(message.messageId, message);
  });

  return [...messageMap.values()].sort((left, right) => {
    const sentDiff = left.sentAt.localeCompare(right.sentAt);
    if (sentDiff !== 0) {
      return sentDiff;
    }

    return left.messageId - right.messageId;
  });
}

export const useMessageThreadStore = create<MessageThreadState>()((set) => ({
  ownerPublicId: null,
  sessionVersion: 0,
  threads: {},
  prepareForUser: (publicId) => set((state) => state.ownerPublicId === publicId
    ? state
    : { ownerPublicId: publicId, sessionVersion: state.sessionVersion + 1, threads: {} }),
  upsertThread: (thread, sessionVersion) =>
    set((state) => {
      if (!state.ownerPublicId || state.sessionVersion !== sessionVersion) return state;
      const existingThread = state.threads[thread.threadId];

      if (!existingThread) {
        return {
          threads: {
            ...state.threads,
            [thread.threadId]: thread,
          },
        };
      }

      return {
        threads: {
          ...state.threads,
          [thread.threadId]: {
            ...existingThread,
            ...thread,
            messages: mergeThreadMessages(existingThread.messages, thread.messages),
          },
        },
      };
    }),
  replaceThread: (thread, sessionVersion) =>
    set((state) => !state.ownerPublicId || state.sessionVersion !== sessionVersion ? state : ({
      threads: {
        ...state.threads,
        [thread.threadId]: thread,
      },
    })),
  clearThread: (threadId) =>
    set((state) => {
      if (!(threadId in state.threads)) {
        return state;
      }

      const nextThreads = { ...state.threads };
      delete nextThreads[threadId];
      return { threads: nextThreads };
    }),
  reset: () => set((state) => ({
    ownerPublicId: null,
    sessionVersion: state.sessionVersion + 1,
    threads: {},
  })),
}));
