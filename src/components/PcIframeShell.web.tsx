import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

import { signInWithGoogle } from '@/api/socialAuth';
import { GOOGLE_LOGIN_REQUEST, GOOGLE_LOGIN_RESULT, isEmbeddedInIframe } from '@/api/googleLoginBridge';

// Mirrors the old +html.tsx CSS breakpoint: below this width (an actual
// phone, or this shell's own 440px iframe) the app renders directly.
const DESKTOP_BREAKPOINT = 501;
const PHONE_WIDTH = 440;
const PHONE_HEIGHT = 956;
// Breathing room between the frame and the browser window's edges.
const FRAME_MARGIN = 48;
// Keeps the frame from either shrinking illegibly on a short window or
// blowing up into a blurry (CSS-transform-scaled) mess on a huge monitor.
const MIN_SCALE = 0.6;
const MAX_SCALE = 2.2;

// window.self/top never change after the page loads, so this only needs to
// be read once — captured outside React state to keep the check itself out
// of the render path.
const isTopLevel = !isEmbeddedInIframe();

// This app is mobile-only UI. On an actual phone (or the 440px iframe below)
// it fills the viewport exactly like before. On a wide top-level browser tab
// (a PC opening the web build) it instead renders a static phone-frame shell
// containing an iframe that reloads this same app at 440x956 — giving that
// inner instance a real 440-wide `window` so useWindowDimensions/Dimensions
// and RN Modal's document.body portal both resolve against the phone frame
// instead of the PC's actual window. Google Identity Services refuses to
// render its sign-in button inside any iframe though, so the inner app asks
// this outer, real-top-level window to run the Google sign-in on its behalf
// (see socialAuth.web.ts's isEmbeddedInIframe branch) and forwards the
// result back over postMessage.
export default function PcIframeShell({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [href] = useState(() => window.location.href);
  const showShell = isTopLevel && width >= DESKTOP_BREAKPOINT;
  // The iframe itself always stays exactly 440x956 (so the app inside keeps
  // seeing a consistent phone-sized `window`) — only its visual size scales,
  // via CSS transform, to fill however big the actual browser window is.
  const scale = Math.min(
    Math.max((width - FRAME_MARGIN * 2) / PHONE_WIDTH, MIN_SCALE),
    Math.max((height - FRAME_MARGIN * 2) / PHONE_HEIGHT, MIN_SCALE),
    MAX_SCALE,
  );

  useEffect(() => {
    if (!showShell) return;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; requestId?: string };
      if (data?.type !== GOOGLE_LOGIN_REQUEST || !data.requestId) return;
      const { requestId } = data;

      signInWithGoogle().then(
        ({ idToken }) => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: GOOGLE_LOGIN_RESULT, requestId, idToken },
            window.location.origin,
          );
        },
        () => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: GOOGLE_LOGIN_RESULT, requestId, error: true },
            window.location.origin,
          );
        },
      );
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [showShell]);

  if (!showShell) {
    return children;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#d9dde3',
      }}
    >
      <div
        style={{
          width: PHONE_WIDTH,
          height: PHONE_HEIGHT,
          transform: `scale(${scale})`,
          overflow: 'hidden',
          borderRadius: 24,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 24px 60px rgba(0, 0, 0, 0.28)',
        }}
      >
        <iframe
          ref={iframeRef}
          src={href}
          title="Koready"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>
    </div>
  );
}
