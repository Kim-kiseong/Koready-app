import { create } from 'zustand';

import type { TermContentFormat } from '@/api/terms';

// Transient handoff buffer, not persisted — TermsScreen stashes the tapped
// term's live API content here (up to 100k chars, too large/unsafe to pass
// as a router param) right before navigating to /terms/[code], and
// TermsDetailScreen reads it once on mount. Anything that isn't a fresh
// same-code handoff (deep link, Settings entry, stale nav state) falls back
// to the screen's local static copy instead.
type PendingTermDetail = {
  code: string;
  title: string;
  content: string;
  contentFormat: TermContentFormat | null;
};

type TermDetailState = {
  pending: PendingTermDetail | null;
  setPending: (term: PendingTermDetail) => void;
  clearPending: () => void;
};

export const useTermDetailStore = create<TermDetailState>((set) => ({
  pending: null,
  setPending: (term) => set({ pending: term }),
  clearPending: () => set({ pending: null }),
}));
