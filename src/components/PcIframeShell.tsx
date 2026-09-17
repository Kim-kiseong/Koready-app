import type { ReactNode } from 'react';

// Native (and, via PcIframeShell.web.tsx, mobile web / the embedded iframe
// itself) render children as-is — only a wide top-level web browser tab
// swaps in the phone-frame + iframe shell. See PcIframeShell.web.tsx.
export default function PcIframeShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
