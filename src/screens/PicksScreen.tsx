import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createRecommendationDeck,
  fetchRecommendationDeckPage,
  recordRecommendationEvent,
  type PicksCard,
  type PicksScope,
  type RecommendationDeck,
  type RecommendationEventType,
} from '@/api/picks';
import {
  buildSavedPlaceFromPickCard,
  savePlace,
  unsavePlace,
} from '@/api/saved-place';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import HeartIcon from '@/components/HeartIcon';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { usePicksStore } from '@/store/picks-store';
import { useSavedPlaceStore } from '@/store/saved-place-store';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

// Figma reference size (node 1076:6425) — a 343-wide card: a 400-tall photo
// on top of an 85-tall text footer. Only the photo is a fixed aspect ratio;
// the footer's height comes from its text content, which doesn't get smaller
// just because the card is narrower. So width scales down to fit the screen
// (max 343, same 16px side margin every other screen uses), the photo height
// scales with it to preserve its aspect ratio, and the footer stays fixed —
// blending all of it into one card-wide ratio (as before) very slightly
// squashed the footer's text on narrower phones.
const CARD_MAX_WIDTH = 343;
const CARD_IMAGE_ASPECT_RATIO = 400 / 343;
const CARD_FOOTER_HEIGHT = 85;
const CARD_SCREEN_MARGIN = 16;
const FLIP_DURATION = 400;
// Figma (node 3197:16838): each card behind the top one is a uniformly
// scaled-down copy offset down-and-right from the front card's top-left
// corner — not centered/peeking-below like a plain scale+translateY would
// produce — with a black tint that gets darker per layer back.
const BEHIND_CARD_SCALE_STEP = 0.065;
const BEHIND_CARD_X_OFFSET_RATIO = 0.1;
const BEHIND_CARD_Y_OFFSET_RATIO = 0.045;
const BEHIND_CARD_TINT_BASE_OPACITY = 0.1;
const BEHIND_CARD_TINT_STEP_OPACITY = 0.2;
// nextCards is capped at 2 (PicksScreen: cards.slice(currentIndex + 1,
// currentIndex + 3)) — the deepest layer's right edge sits at
// cardWidth * (1 + MAX_STACK_DEPTH * (X_OFFSET_RATIO - SCALE_STEP)) from the
// front card's left edge. Sizing the front card off the raw screen width
// (as if no stack existed) left zero room for that peek on a standard
// ~375-430pt phone, so it ran off/touched the screen edge instead of
// staying inset like Figma's reference. Reserving this factor up front
// keeps the front card's right margin equal to its left margin even with
// the full stack showing.
const MAX_STACK_DEPTH = 2;
const STACK_WIDTH_FACTOR = 1 + MAX_STACK_DEPTH * (BEHIND_CARD_X_OFFSET_RATIO - BEHIND_CARD_SCALE_STEP);
const SWIPE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 800;
// Fallback only, used until the deck's own remainingThreshold arrives from the server.
const FALLBACK_PREFETCH_THRESHOLD = 5;

// Dev-only: the mock session's access token can't be refreshed by the real
// backend, so calling the real API with it 401s and forces a logout (see
// client.ts's response interceptor). Fall back to local sample cards instead —
// exactly like TermsScreen does for the same reason. Once a real staging test
// token is set via EXPO_PUBLIC_DEV_TEST_ACCESS_TOKEN, the dev session carries
// that instead and this branch stops being hit automatically.
const DEV_FALLBACK_CARDS: Record<PicksScope, PicksCard[]> = {
  NATIONWIDE: [
    {
      placeId: 1,
      title: '경주 문화유산 나들이',
      locationText: '경상북도 경주시',
      imageUrl: 'https://picsum.photos/seed/gyeongju/800/1000',
      saved: false,
      tags: ['역', '카페 거리', '인생샷 명소'],
      shortDescription:
        '서울을 떠나 한국의 살아있는 박물관, 경주의 유구한 역사와 매력적인 로컬 거리를 탐험해 보세요.',
      serviceRegionCode: 'GYEONGSANG',
      travelStyle: 'CULTURE_EXPERIENCE',
    },
    {
      placeId: 2,
      title: '전주 한옥마을 나들이',
      locationText: '전라북도 전주시',
      imageUrl: 'https://picsum.photos/seed/jeonju/800/1000',
      saved: false,
      tags: ['한옥', '전통시장', '길거리 음식'],
      shortDescription: '한옥이 늘어선 골목을 걸으며 전통 공예와 길거리 음식을 함께 즐길 수 있어요.',
      serviceRegionCode: 'JEOLLA',
      travelStyle: 'TRADITIONAL_MARKET',
    },
  ],
  NEARBY: [
    {
      placeId: 101,
      title: '성북천 카페거리 산책',
      locationText: '서울 성북구',
      imageUrl: 'https://picsum.photos/seed/seongbuk/800/1000',
      saved: false,
      tags: ['카페 거리', '도보 여행', '인생샷 명소'],
      shortDescription: '학교에서 멀지 않은 성북천을 따라 걸으며 개성 있는 카페들을 구경해 보세요.',
      serviceRegionCode: 'SEOUL',
      travelStyle: 'LOCAL_FOOD',
    },
    {
      placeId: 102,
      title: '경춘선 숲길 나들이',
      locationText: '서울 노원구',
      imageUrl: 'https://picsum.photos/seed/gyeongchun/800/1000',
      saved: false,
      tags: ['자연', '피크닉', '자전거'],
      shortDescription: '옛 철길을 개조한 숲길을 따라 가볍게 산책하거나 자전거를 탈 수 있어요.',
      serviceRegionCode: 'SEOUL',
      travelStyle: 'NATURE',
    },
  ],
};

// English mirror of DEV_FALLBACK_CARDS — dev-only, so this is what an
// EN-language user sees when the mock session is active (see comment above).
const DEV_FALLBACK_CARDS_EN: Record<PicksScope, PicksCard[]> = {
  NATIONWIDE: [
    {
      placeId: 1,
      title: 'Gyeongju Heritage Walk',
      locationText: 'Gyeongju, Gyeongsangbuk-do',
      imageUrl: 'https://picsum.photos/seed/gyeongju/800/1000',
      saved: false,
      tags: ['Station', 'Cafe Street', 'Photo Spot'],
      shortDescription:
        "Leave Seoul behind and explore Gyeongju's living museum of history and charming local streets.",
      serviceRegionCode: 'GYEONGSANG',
      travelStyle: 'CULTURE_EXPERIENCE',
    },
    {
      placeId: 2,
      title: 'Jeonju Hanok Village Walk',
      locationText: 'Jeonju, Jeollabuk-do',
      imageUrl: 'https://picsum.photos/seed/jeonju/800/1000',
      saved: false,
      tags: ['Hanok', 'Traditional Market', 'Street Food'],
      shortDescription: 'Walk the hanok-lined alleys and enjoy traditional crafts and street food along the way.',
      serviceRegionCode: 'JEOLLA',
      travelStyle: 'TRADITIONAL_MARKET',
    },
  ],
  NEARBY: [
    {
      placeId: 101,
      title: 'Seongbukcheon Cafe Street Stroll',
      locationText: 'Seongbuk-gu, Seoul',
      imageUrl: 'https://picsum.photos/seed/seongbuk/800/1000',
      saved: false,
      tags: ['Cafe Street', 'Walking', 'Photo Spot'],
      shortDescription: 'Walk along Seongbukcheon, not far from campus, and check out its unique cafes.',
      serviceRegionCode: 'SEOUL',
      travelStyle: 'LOCAL_FOOD',
    },
    {
      placeId: 102,
      title: 'Gyeongchun Line Forest Trail',
      locationText: 'Nowon-gu, Seoul',
      imageUrl: 'https://picsum.photos/seed/gyeongchun/800/1000',
      saved: false,
      tags: ['Nature', 'Picnic', 'Cycling'],
      shortDescription: 'Take a light walk or bike ride along this forest trail built on an old rail line.',
      serviceRegionCode: 'SEOUL',
      travelStyle: 'NATURE',
    },
  ],
};

function buildDevFallbackDeck(scope: PicksScope): RecommendationDeck {
  const cards = useLanguageStore.getState().language === 'EN' ? DEV_FALLBACK_CARDS_EN[scope] : DEV_FALLBACK_CARDS[scope];
  return {
    deckId: 'dev-mock-deck',
    scope,
    originLocation: null,
    cards,
    nextCursor: null,
    hasMore: false,
    remainingThreshold: FALLBACK_PREFETCH_THRESHOLD,
  };
}

function formatPickTagLabel(tag: unknown) {
  return toDisplayText(tag).replace(/^#+\s*/, '').trim();
}

export default function PicksScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const SCOPES: { id: PicksScope; label: string }[] = [
    { id: 'NEARBY', label: t.picks.scopeNearby },
    { id: 'NATIONWIDE', label: t.picks.scopeNationwide },
  ];
  const hasSeenGuide = usePicksStore((state) => state.hasSeenGuide);
  const hasSeenGuideHydrated = usePicksStore((state) => state.hasHydrated);
  const dismissGuide = usePicksStore((state) => state.dismissGuide);
  // onboarding-store's currentLocationId is the real backend location id for
  // the user's current location. It's kept current by the onboarding flow,
  // by LocationScreen's POST /users/me/locations call, and — on cold restart
  // — by app/index.tsx syncing it from GET /users/me's defaultLocationId.
  const originLocationId = useOnboardingStore((state) => state.currentLocationId);
  const onboardingHasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
  const upsertSavedPlace = useSavedPlaceStore((state) => state.upsertSavedPlace);
  const removeSavedPlace = useSavedPlaceStore((state) => state.removeSavedPlace);
  const savedPlaceHydrated = useSavedPlaceStore((state) => state.hasHydrated);

  const [scope, setScope] = useState<PicksScope>('NATIONWIDE');
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<PicksCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [remainingThreshold, setRemainingThreshold] = useState(FALLBACK_PREFETCH_THRESHOLD);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isFetchingMoreRef = useRef(false);
  const latestRequestIdRef = useRef(0);
  const activeDeckIdRef = useRef<string | null>(null);
  const isInitialDeckLoadRef = useRef(true);

  // The deck endpoint always returns each card's server-side saved flag, which
  // doesn't know about toggles the user made locally (dev mock session never
  // reports them back, and a freshly created deck elsewhere may lag). Overlay
  // the persisted saved-place store so a previously-toggled heart survives a
  // scope switch or a fresh deck fetch instead of resetting to the API value.
  const reconcileSaved = (deckCards: PicksCard[]): PicksCard[] => {
    const savedByPlaceId = useSavedPlaceStore.getState().savedByPlaceId;
    return deckCards.map((c) => {
      const key = String(c.placeId);
      return Object.prototype.hasOwnProperty.call(savedByPlaceId, key)
        ? { ...c, saved: savedByPlaceId[key] }
        : c;
    });
  };

  const applyDeck = (deck: RecommendationDeck) => {
    activeDeckIdRef.current = deck.deckId;
    setDeckId(deck.deckId);
    const reconciledCards = reconcileSaved(deck.cards);
    setCards(reconciledCards);
    setCursor(deck.nextCursor);
    setHasMore(deck.hasMore);
    setRemainingThreshold(deck.remainingThreshold);
    setCurrentIndex(0);
    setIsLoading(false);

    for (const card of reconciledCards) {
      if (!card.saved) continue;
      upsertSavedPlace(buildSavedPlaceFromPickCard({ ...card, saved: true }, 'RECOMMENDATION_CARD'));
    }
  };

  const loadDeck = (targetScope: PicksScope) => {
    // Scope can change (or retry) before an in-flight request settles — track
    // which call is newest so a slower, stale response can't clobber it, and
    // drop any prefetch lock a scope switch left behind mid-flight.
    const requestId = ++latestRequestIdRef.current;
    isFetchingMoreRef.current = false;

    const request = isDevMockSession
      ? Promise.resolve(buildDevFallbackDeck(targetScope))
      : createRecommendationDeck(targetScope, originLocationId);

    request
      .then((deck) => {
        if (latestRequestIdRef.current !== requestId) return;
        applyDeck(deck);
      })
      .catch(() => {
        if (latestRequestIdRef.current !== requestId) return;
        setHasError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Wait for auth-store hydration so the initial deck request doesn't race a
    // stale accessToken, for onboarding-store hydration so it carries the
    // restored originLocationId instead of a stale null, and for
    // saved-place-store hydration so reconcileSaved has the restored heart
    // state available instead of an empty map on a cold start.
    if (!hasHydrated || !onboardingHasHydrated || !savedPlaceHydrated) return;

    if (isInitialDeckLoadRef.current) {
      isInitialDeckLoadRef.current = false;
      loadDeck(scope);
      return;
    }

    // The deck is generated server-side in whatever language was active at
    // creation time, so a later language toggle doesn't retranslate it —
    // the screen has to throw it away and request a fresh one, same reset
    // changeScope does below.
    setDeckId(null);
    setCards([]);
    setCurrentIndex(0);
    setCursor(null);
    setHasMore(false);
    setIsLoading(true);
    setHasError(false);
    loadDeck(scope);
    // Scope switches and retries go through changeScope/retryLoad below
    // instead, so they can reset UI state synchronously without waiting on
    // this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, onboardingHasHydrated, savedPlaceHydrated, language]);

  // Keep the client-side card stack topped up: once fewer unseen cards remain ahead
  // of currentIndex than the server's remainingThreshold, pull the next page.
  useEffect(() => {
    if (!deckId || !hasMore || isFetchingMoreRef.current) return;
    const remaining = cards.length - (currentIndex + 1);
    if (remaining > remainingThreshold) return;

    const requestDeckId = deckId;
    isFetchingMoreRef.current = true;
    fetchRecommendationDeckPage(deckId, cursor)
      .then((deck) => {
        // The active deck can change (scope switch/retry) while this was in
        // flight — drop a stale page instead of appending it to the wrong deck.
        if (activeDeckIdRef.current !== requestDeckId) return;
        const reconciledCards = reconcileSaved(deck.cards);
        setCards((prev) => [...prev, ...reconciledCards]);
        setCursor(deck.nextCursor);
        setHasMore(deck.hasMore);
        setRemainingThreshold(deck.remainingThreshold);

        for (const card of reconciledCards) {
          if (!card.saved) continue;
          upsertSavedPlace(buildSavedPlaceFromPickCard({ ...card, saved: true }, 'RECOMMENDATION_CARD'));
        }
      })
      .catch(() => {
        // Best-effort prefetch; leave the existing cards/cursor as-is and let
        // the next threshold crossing retry.
      })
      .finally(() => {
        isFetchingMoreRef.current = false;
      });
  }, [cards.length, currentIndex, cursor, deckId, hasMore, remainingThreshold]);

  const changeScope = (nextScope: PicksScope) => {
    if (nextScope === scope) return;
    setScope(nextScope);
    setDeckId(null);
    setCards([]);
    setCurrentIndex(0);
    setCursor(null);
    setHasMore(false);
    setIsLoading(true);
    setHasError(false);
    loadDeck(nextScope);
  };

  const retryLoad = () => {
    setIsLoading(true);
    setHasError(false);
    loadDeck(scope);
  };

  const card = cards[currentIndex];

  const recordEvent = (placeId: number, eventType: RecommendationEventType) => {
    if (!deckId || isDevMockSession) return;
    recordRecommendationEvent(deckId, placeId, eventType).catch(() => {});
  };

  const toggleSaved = () => {
    if (!card) return;
    const nextSaved = !card.saved;

    setCards((prev) => prev.map((c, i) => (i === currentIndex ? { ...c, saved: nextSaved } : c)));

    if (nextSaved) {
      const snapshot = buildSavedPlaceFromPickCard({ ...card, saved: true }, 'RECOMMENDATION_CARD');
      upsertSavedPlace(snapshot);
      void savePlace(card.placeId, 'RECOMMENDATION_CARD', snapshot)
        .then(() => {
          recordEvent(card.placeId, 'PLACE_SAVED');
        })
        .catch(() => {});
      return;
    }

    removeSavedPlace(card.placeId);
    void unsavePlace(card.placeId)
      .then(() => {
        recordEvent(card.placeId, 'PLACE_UNSAVED');
      })
      .catch(() => {});
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={t.picks.headerTitle} rightIcon={null} />

      <View style={styles.content}>
        <View style={styles.scopeToggle}>
          {SCOPES.map((option) => {
            const selected = option.id === scope;
            return (
              <Pressable
                key={option.id}
                style={[styles.scopeSegment, selected && styles.scopeSegmentSelected]}
                onPress={() => changeScope(option.id)}>
                <CustomText
                  style={[styles.scopeLabel, selected ? styles.scopeLabelSelected : styles.scopeLabelUnselected]}>
                  {option.label}
                </CustomText>
              </Pressable>
            );
          })}
        </View>

        {isLoading && (
          <View style={styles.state}>
            <ActivityIndicator color={Palette.primary} />
            <CustomText style={styles.stateText}>{t.picks.loadingText}</CustomText>
          </View>
        )}

        {!isLoading && hasError && (
          <View style={styles.state}>
            <CustomText style={styles.stateText}>{t.picks.errorText}</CustomText>
            <Pressable style={styles.retryButton} onPress={retryLoad}>
              <CustomText style={styles.retryText}>{t.picks.retry}</CustomText>
            </Pressable>
          </View>
        )}

        {!isLoading && !hasError && !card && (
          <View style={styles.state}>
            <CustomText style={styles.stateText}>{t.picks.emptyText}</CustomText>
            <Pressable style={styles.retryButton} onPress={retryLoad}>
              <CustomText style={styles.retryText}>{t.picks.retry}</CustomText>
            </Pressable>
          </View>
        )}

        {!isLoading && !hasError && card && (
          <PicksDeck
            card={card}
            nextCards={cards.slice(currentIndex + 1, currentIndex + 3)}
            onToggleSave={toggleSaved}
            onExpand={() => recordEvent(card.placeId, 'CARD_EXPANDED')}
            onViewDetail={() => {
              recordEvent(card.placeId, 'PLACE_DETAIL_CLICKED');
              router.push({
                pathname: '/places/[placeId]',
                params: {
                  placeId: String(card.placeId),
                  deckId: deckId ?? undefined,
                },
              });
            }}
            canSwipeNext={currentIndex + 1 < cards.length}
            canSwipePrev={currentIndex > 0}
            onSwipeNext={() => {
              recordEvent(card.placeId, 'CARD_NEXT');
              setCurrentIndex((i) => Math.min(i + 1, cards.length - 1));
            }}
            onSwipePrev={() => {
              recordEvent(card.placeId, 'CARD_PREVIOUS');
              setCurrentIndex((i) => Math.max(i - 1, 0));
            }}
          />
        )}
      </View>

      <BottomNavBar active="picks" />

      {hasSeenGuideHydrated && !hasSeenGuide && <PicksGuideOverlay onDismiss={dismissGuide} />}
    </SafeAreaView>
  );
}

type PicksDeckProps = {
  card: PicksCard;
  nextCards: PicksCard[];
  onToggleSave: () => void;
  onExpand: () => void;
  onViewDetail: () => void;
  canSwipeNext: boolean;
  canSwipePrev: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
};

function PicksDeck({
  card,
  nextCards,
  onToggleSave,
  onExpand,
  onViewDetail,
  canSwipeNext,
  canSwipePrev,
  onSwipeNext,
  onSwipePrev,
}: PicksDeckProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(CARD_MAX_WIDTH, (screenWidth - CARD_SCREEN_MARGIN * 2) / STACK_WIDTH_FACTOR);
  const cardSize = { width: cardWidth, height: cardWidth * CARD_IMAGE_ASPECT_RATIO + CARD_FOOTER_HEIGHT };

  return (
    <View style={[styles.cardStack, cardSize]}>
      {/* Furthest card first so nearer ones paint on top of it. */}
      {[...nextCards].reverse().map((behindCard, reverseIndex) => (
        <BehindCard
          key={behindCard.placeId}
          card={behindCard}
          depth={nextCards.length - reverseIndex}
          cardSize={cardSize}
        />
      ))}

      <PicksFlipCard
        key={card.placeId}
        card={card}
        cardSize={cardSize}
        screenWidth={screenWidth}
        canSwipeNext={canSwipeNext}
        canSwipePrev={canSwipePrev}
        onSwipeNext={onSwipeNext}
        onSwipePrev={onSwipePrev}
        onToggleSave={onToggleSave}
        onExpand={onExpand}
        onViewDetail={onViewDetail}
      />
    </View>
  );
}

type CardSize = { width: number; height: number };

function BehindCard({ card, depth, cardSize }: { card: PicksCard; depth: number; cardSize: CardSize }) {
  const scale = 1 - depth * BEHIND_CARD_SCALE_STEP;
  const width = cardSize.width * scale;
  const height = cardSize.height * scale;

  return (
    <View
      style={[
        styles.card,
        styles.behindCard,
        {
          width,
          height,
          left: cardSize.width * BEHIND_CARD_X_OFFSET_RATIO * depth,
          top: cardSize.width * BEHIND_CARD_Y_OFFSET_RATIO * depth,
          borderRadius: 16 * scale,
        },
      ]}
      pointerEvents="none">
      {card.imageUrl ? (
        <Image source={{ uri: card.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cardImageFallback]} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.behindCardTint,
          { opacity: BEHIND_CARD_TINT_BASE_OPACITY + depth * BEHIND_CARD_TINT_STEP_OPACITY },
        ]}
      />
    </View>
  );
}

type PicksFlipCardProps = {
  card: PicksCard;
  cardSize: CardSize;
  screenWidth: number;
  canSwipeNext: boolean;
  canSwipePrev: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  onToggleSave: () => void;
  onExpand: () => void;
  onViewDetail: () => void;
};

// Keyed by card.placeId in PicksDeck, so this whole component (translateX
// included) remounts fresh for every card — there's never a stale
// off-center position to reset between one card and the next, which used to
// race against the index update and flicker.
function PicksFlipCard({
  card,
  cardSize,
  screenWidth,
  canSwipeNext,
  canSwipePrev,
  onSwipeNext,
  onSwipePrev,
  onToggleSave,
  onExpand,
  onViewDetail,
}: PicksFlipCardProps) {
  const t = useTranslation();
  const flip = useSharedValue(0);
  const translateX = useSharedValue(0);

  const toggleFlip = () => {
    const isExpanding = flip.value === 0;
    flip.value = withTiming(isExpanding ? 1 : 0, { duration: FLIP_DURATION });
    if (isExpanding) onExpand();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const isSwipeRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > SWIPE_VELOCITY_THRESHOLD;
      const isSwipeLeft = event.translationX < -SWIPE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY_THRESHOLD;

      if (isSwipeRight && canSwipeNext) {
        translateX.value = withTiming(screenWidth, { duration: 250 }, (finished) => {
          if (finished) runOnJS(onSwipeNext)();
        });
      } else if (isSwipeLeft && canSwipePrev) {
        translateX.value = withTiming(-screenWidth, { duration: 250 }, (finished) => {
          if (finished) runOnJS(onSwipePrev)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${interpolate(translateX.value, [-screenWidth, 0, screenWidth], [-8, 0, 8])}deg` },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    zIndex: flip.value < 0.5 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    zIndex: flip.value < 0.5 ? 0 : 1,
  }));

  const heartIcon = (
    <HeartIcon filled={card.saved} color={card.saved ? Palette.red300 : Palette.grey400} size={20} />
  );

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.cardStack, cardSize, styles.topCard, swipeStyle]}>
        <Animated.View style={[styles.card, styles.cardFace, cardSize, frontStyle]}>
          <Pressable style={styles.cardImageWrap} onPress={toggleFlip}>
            {card.imageUrl ? (
              <Image source={{ uri: card.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.cardImageFallback]} />
            )}
          </Pressable>

          <View style={styles.cardInfo}>
            <View style={styles.cardTextGroup}>
              <CustomText style={styles.cardTitle}>{card.title}</CustomText>
              <View style={styles.cardLocationRow}>
                <View style={styles.cardLocationIconFrame}>
                  <Image
                    source={require('@/assets/images/location-pin-detail.svg')}
                    style={styles.cardLocationIcon}
                    contentFit="contain"
                  />
                </View>
                <CustomText style={styles.cardLocation}>{card.locationText}</CustomText>
              </View>
            </View>

            <Pressable style={styles.saveButton} onPress={onToggleSave} hitSlop={4}>
              {heartIcon}
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardFace, styles.cardBack, cardSize, backStyle]}>
          <Pressable style={styles.cardBackContent} onPress={toggleFlip}>
            <View style={styles.cardBackTop}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTextGroup}>
                  <CustomText style={styles.cardTitle}>{card.title}</CustomText>
                  <View style={styles.cardLocationRow}>
                    <View style={styles.cardLocationIconFrame}>
                      <Image
                        source={require('@/assets/images/location-pin-detail.svg')}
                        style={styles.cardLocationIcon}
                        contentFit="contain"
                      />
                    </View>
                    <CustomText style={styles.cardLocation}>{card.locationText}</CustomText>
                  </View>
                </View>

                <Pressable style={styles.saveButton} onPress={onToggleSave} hitSlop={4}>
                  {heartIcon}
                </Pressable>
              </View>

              <View style={styles.tagRow}>
                {card.tags.map((tag, index) => (
                  <View key={toStableListKey(tag, index)} style={styles.tagChip}>
                    <CustomText style={styles.tagLabel}>{formatPickTagLabel(tag)}</CustomText>
                  </View>
                ))}
              </View>

              <CustomText style={styles.descriptionText}>{card.shortDescription}</CustomText>
            </View>

            <Pressable style={styles.detailButton} onPress={onViewDetail}>
              <CustomText style={styles.detailButtonText}>{t.picks.detailButton}</CustomText>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function PicksGuideOverlay({ onDismiss }: { onDismiss: () => void }) {
  const t = useTranslation();
  return (
    <Pressable style={styles.guideOverlay} onPress={onDismiss}>
      <View style={styles.guideBlock}>
        <CustomText style={styles.guideText}>{t.picks.guideTapText}</CustomText>
        <SymbolView
          name={{ ios: 'hand.tap.fill', android: 'touch_app', web: 'touch_app' }}
          size={40}
          weight="regular"
          tintColor="#ffffff"
        />
      </View>

      <Image
        source={require('@/assets/images/hi-hori-v1.png')}
        style={styles.guideMascot}
        contentFit="contain"
      />

      <View style={styles.guideBlock}>
        <SymbolView
          name={{ ios: 'hand.draw.fill', android: 'swipe', web: 'swipe' }}
          size={40}
          weight="regular"
          tintColor="#ffffff"
        />
        <CustomText style={styles.guideText}>{t.picks.guideSwipeText}</CustomText>
      </View>

      <Pressable style={styles.guideClose} onPress={onDismiss} hitSlop={8}>
        <SymbolView
          name={{ ios: 'xmark', android: 'close', web: 'close' }}
          size={24}
          weight="regular"
          tintColor="#ffffff"
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  scopeToggle: {
    flexDirection: 'row',
    width: 343,
    height: 44,
    padding: 4,
    borderRadius: 100,
    backgroundColor: Palette.grey150,
  },
  scopeSegment: {
    flex: 1,
    height: 38,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeSegmentSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  scopeLabel: {
    fontSize: 15,
    letterSpacing: -0.3,
  },
  scopeLabelSelected: {
    fontFamily: FontFamily.pretendard.bold,
    color: Palette.text,
  },
  scopeLabelUnselected: {
    fontFamily: FontFamily.pretendard.medium,
    color: Palette.grey500,
  },
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 52,
  },
  stateText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  retryButton: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Palette.primary,
  },
  retryText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  cardStack: {
    position: 'relative',
  },
  topCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  behindCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  behindCardTint: {
    backgroundColor: '#000000',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    flexDirection: 'column',
  },
  cardBackContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardBackTop: {
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: Palette.grey150,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
    letterSpacing: -0.28,
  },
  descriptionText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.grey600,
    letterSpacing: -0.28,
  },
  detailButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: -0.32,
  },
  cardImageWrap: {
    flex: 1,
    width: '100%',
  },
  cardImageFallback: {
    backgroundColor: Palette.grey200,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
  },
  cardTextGroup: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.text,
    letterSpacing: -0.36,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocationIconFrame: {
    width: 18,
    height: 18,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  cardLocationIcon: {
    width: 12,
    height: 14,
  },
  cardLocation: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey600,
    letterSpacing: -0.28,
  },
  saveButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28,28,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 92,
    gap: 12,
  },
  guideBlock: {
    alignItems: 'center',
    gap: 8,
  },
  guideText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22.4,
    letterSpacing: -0.32,
  },
  guideMascot: {
    width: 125,
    height: 142,
  },
  guideClose: {
    position: 'absolute',
    top: 59,
    right: 16,
  },
});
