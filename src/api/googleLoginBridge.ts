// Message contract for the Google sign-in bridge between the PC-web outer
// shell (components/PcIframeShell.web.tsx — a real top-level window, where
// Google Identity Services works normally) and the app instance running
// inside its 440x956 iframe (socialAuth.web.ts). GIS refuses to render its
// button inside any iframe, same-origin or not, so the iframe can't sign
// in on its own and has to ask its parent to do it on its behalf.
export const GOOGLE_LOGIN_REQUEST = 'koready:pc-shell:google-login-request';
export const GOOGLE_LOGIN_RESULT = 'koready:pc-shell:google-login-result';

export function isEmbeddedInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parent access throws — definitely embedded in something
    // we don't control, which is at least as isolated as our own iframe.
    return true;
  }
}
