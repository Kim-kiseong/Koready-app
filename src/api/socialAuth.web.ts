import { GOOGLE_WEB_CLIENT_ID } from '@/constants/env';

import { GOOGLE_LOGIN_REQUEST, GOOGLE_LOGIN_RESULT, isEmbeddedInIframe } from './googleLoginBridge';
import { GoogleSignInCancelledError, signInWithApple } from './socialAuth.shared';
import type { SocialAuthResult } from './socialAuth.shared';

export type { SocialAuthResult };
export { GoogleSignInCancelledError, signInWithApple };

// Minimal surface of Google Identity Services (GIS) — only what we call.
// https://developers.google.com/identity/gsi/web/reference/js-reference
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let gisReadyPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisReadyPromise) return gisReadyPromise;

  gisReadyPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
    document.head.appendChild(script);
  });
  return gisReadyPromise;
}

let pendingSignIn: { resolve: (result: SocialAuthResult) => void; reject: (error: Error) => void } | null =
  null;
let realGoogleButton: HTMLElement | null = null;

// GIS only ever hands out an ID token through its own rendered button (or One
// Tap), never through a function call we control directly. So we render
// Google's real button off-screen once, and forward every click on our
// Figma-styled button to it — that keeps the click inside the same user
// gesture GIS needs to open its sign-in popup instead of getting blocked.
async function ensureGoogleButtonReady(): Promise<HTMLElement> {
  await loadGisScript();
  if (realGoogleButton) return realGoogleButton;

  window.google!.accounts.id.initialize({
    client_id: GOOGLE_WEB_CLIENT_ID,
    callback: (response) => {
      pendingSignIn?.resolve({ idToken: response.credential });
      pendingSignIn = null;
    },
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  document.body.appendChild(container);
  window.google!.accounts.id.renderButton(container, { type: 'standard' });

  const button = container.querySelector<HTMLElement>('div[role="button"]');
  if (!button) {
    throw new Error('Google Identity Services button failed to render.');
  }
  realGoogleButton = button;
  return button;
}

// Runs only when this page is the 440x956 iframe inside PcIframeShell (see
// components/PcIframeShell.web.tsx). GIS won't render its button here, so
// this asks the parent — a real top-level window — to sign in for us.
function signInWithGoogleViaParentBridge(): Promise<SocialAuthResult> {
  return new Promise((resolve, reject) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; requestId?: string; idToken?: string; error?: boolean };
      if (data?.type !== GOOGLE_LOGIN_RESULT || data.requestId !== requestId) return;

      window.removeEventListener('message', onMessage);
      if (data.error || !data.idToken) {
        reject(new GoogleSignInCancelledError());
      } else {
        resolve({ idToken: data.idToken });
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: GOOGLE_LOGIN_REQUEST, requestId }, window.location.origin);
  });
}

export async function signInWithGoogle(): Promise<SocialAuthResult> {
  if (isEmbeddedInIframe()) {
    return signInWithGoogleViaParentBridge();
  }

  const button = await ensureGoogleButtonReady();

  return new Promise<SocialAuthResult>((resolve, reject) => {
    pendingSignIn = { resolve, reject };
    button.click();

    // GIS's popup flow has no cancel callback. Closing the popup returns focus
    // to this window either way (success or cancel), so treat "refocused but
    // no credential arrived shortly after" as a cancel — otherwise a dismissed
    // popup would leave this promise, and the login button, stuck forever.
    const onWindowFocus = () => {
      window.removeEventListener('focus', onWindowFocus);
      setTimeout(() => {
        if (pendingSignIn) {
          pendingSignIn = null;
          reject(new GoogleSignInCancelledError());
        }
      }, 700);
    };
    window.addEventListener('focus', onWindowFocus);
  });
}

export async function signOutOfGoogle(): Promise<void> {
  window.google?.accounts.id.disableAutoSelect();
}
