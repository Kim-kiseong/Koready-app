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
      </head>
      <body>{children}</body>
    </html>
  );
}
