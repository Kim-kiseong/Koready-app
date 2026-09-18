import { useEffect, useRef } from 'react';
import { Platform, type ScrollView } from 'react-native';

// react-native-web's ScrollView only wires up onTouchMove/onWheel — it never
// implemented click-and-drag panning, so a horizontal row that scrolls fine
// via touch or trackpad on the same page has no way to scroll at all with a
// mouse on a desktop that lacks one. This adds that press-and-drag behavior
// using the raw DOM node RNW exposes via getScrollableNode (an RNW-only
// extension RN's own ScrollView type doesn't declare, hence the cast).
// No-op on native, where ScrollView already handles touch scrolling itself.
type WebScrollView = ScrollView & { getScrollableNode?: () => HTMLElement };

export function useHorizontalDragScroll() {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = (scrollViewRef.current as WebScrollView | null)?.getScrollableNode?.();
    if (!node) return;

    let isDragging = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      isDragging = true;
      didDrag = false;
      startX = event.clientX;
      startScrollLeft = node.scrollLeft;
      node.style.cursor = 'grabbing';
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 3) didDrag = true;
      node.scrollLeft = startScrollLeft - delta;
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      node.style.cursor = 'grab';
      if (didDrag) {
        // A drag that actually moved the scroll shouldn't also fire
        // whatever card ends up under the pointer at release — the same
        // "was this a click or a drag" distinction a native ScrollView's
        // touch handling already makes for free.
        const suppressClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };
        node.addEventListener('click', suppressClick, { capture: true, once: true });
      }
    };

    node.style.cursor = 'grab';
    node.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);

    return () => {
      node.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
    };
  }, []);

  return scrollViewRef;
}
