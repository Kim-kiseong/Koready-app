import { create } from 'zustand';

import type { MessageThreadResponse } from '@/api/types';

type MessageThreadState = {
  threads: Record<string, MessageThreadResponse>;
  upsertThread: (thread: MessageThreadResponse) => void;
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
  threads: {},
  upsertThread: (thread) =>
    set((state) => {
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
  clearThread: (threadId) =>
    set((state) => {
      if (!(threadId in state.threads)) {
        return state;
      }

      const nextThreads = { ...state.threads };
      delete nextThreads[threadId];
      return { threads: nextThreads };
    }),
  reset: () => set({ threads: {} }),
}));
