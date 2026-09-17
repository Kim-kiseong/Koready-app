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
        {/* ScrollViewStyleReset (above) only sets body's overflow to hidden,
            not #root's — on a real phone that's never mattered because
            #root's own content happens to fit its box exactly, but at
            exactly 393x852 (the phone-frame size PcIframeShell's iframe
            uses, see src/components) some screens overflow by a few
            pixels, which without this shows up as a real OS scrollbar
            (glaring in an iframe, which can't inherit the outer page's
            overlay-scrollbar styling). Clip it here unconditionally instead
            of re-deriving it per screen. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `#root { overflow: hidden; }`,
          }}
        />
        {/* RN Web's ScrollView is a plain div with overflow-y:auto, so any
            screen with more content than fits (e.g. the home feed) gets a
            real OS scrollbar on desktop Chrome — barely noticeable at full
            browser width, but a chunky classic-style bar eating into a
            393px-wide phone frame, breaking the native-app illusion
            entirely. Mouse wheel/trackpad/drag-scroll all keep working;
            this only removes the visible track/thumb chrome, the same
            trick Twitter/Instagram's web clients use. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { scrollbar-width: none; }
              *::-webkit-scrollbar { display: none; }
            `,
          }}
        />
        {/* RN Web's TextInput renders a plain native <input>. Screens that
            autoFocus one (e.g. PlaceSearchScreen) trigger Chrome's
            focus-visible heuristic for programmatic focus, drawing its
            default black focus ring tightly around the placeholder text
            instead of the app's own pill-shaped search-bar styling —
            visually reads as the text being doubled/outlined. This app has
            no keyboard-nav flow that needs the native ring to begin with. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `input, textarea { outline: none; }`,
          }}
        />
        {/* This app is mobile-only UI. On a wide top-level web tab (a PC
            opening the web build), PcIframeShell (src/components) swaps in a
            phone-frame shell around an iframe that reloads the app at
            393x852 — CSS alone can't clamp the *inside* of that box (see its
            doc comment for why), so this just keeps the page backdrop calm
            for the brief moment before React mounts and PcIframeShell takes
            over. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (min-width: 501px) {
                html, body { height: 100%; background: #d9dde3; }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
