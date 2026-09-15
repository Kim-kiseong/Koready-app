import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Customizes Expo Router's default root HTML document (web only) — see
// https://docs.expo.dev/router/reference/static-rendering/#root-html.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover (missing from Expo's default meta tag) is required
            for `env(safe-area-inset-*)` to report real values on iOS Safari —
            without it, react-native-safe-area-context's insets are stuck at 0
            there, even though they work correctly in the native app. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style
          // ScrollViewStyleReset (above) sets html/body/#root to height:100%.
          // On iOS Safari that resolves against the "large" viewport — the
          // height as if the address bar/bottom toolbar were fully collapsed
          // — which is taller than what's actually visible. Screens that
          // position content from window.innerHeight (the real visible
          // height, e.g. LoginScreen's `scale`) then end up shorter than the
          // oversized #root: the page becomes scrollable, a blank/background
          // strip appears below the fold, and absolutely-positioned content
          // reads as shifted. 100dvh tracks the real visible viewport instead
          // and is well supported on iOS Safari (15.4+); 100% remains the
          // fallback below for anything older.
          dangerouslySetInnerHTML={{
            __html: `@supports (height: 100dvh) { html, body, #root { height: 100dvh; } }`,
          }}
        />
        {/* This app is mobile-only UI — on an actual phone (or anything under
            DESKTOP_BREAKPOINT) it should fill the viewport exactly like
            today. On a wider viewport (a PC opening the web build) it's
            clamped to an iPhone 16 Pro's frame (440x956) and centered, same
            idea as Twitter/Instagram's web clients, instead of stretching
            phone-only layouts across a desktop window. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (min-width: 501px) {
                html, body { height: 100%; background: #d9dde3; }
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                #root {
                  width: 440px;
                  height: 956px;
                  max-height: 100vh;
                  overflow: hidden;
                  border-radius: 24px;
                  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 24px 60px rgba(0, 0, 0, 0.28);
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
