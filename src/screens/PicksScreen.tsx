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
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { usePicksStore } from '@/store/picks-store';

const SCOPES: { id: PicksScope; label: string }[] = [
  { id: 'NEARBY', label: '근교' },
  { id: 'NATIONWIDE', label: '전국' },
];

const CARD_HEIGHT = 485;
const FLIP_DURATION = 400;
const SWIPE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 800;
// Fallback only, used until the deck's own remainingThreshold arrives from the server.
const FALLBACK_PREFETCH_THRESHOLD = 5;

export default function PicksScreen() {
  const router = useRouter();
  const hasSeenGuide = usePicksStore((state) => state.hasSeenGuide);
  const dismissGuide = usePicksStore((state) => state.dismissGuide);
  const defaultLocationId = useAuthStore((state) => state.defaultLocationId);

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

  const applyDeck = (deck: RecommendationDeck) => {
    setDeckId(deck.deckId);
    setCards(deck.cards);
    setCursor(deck.nextCursor);
    setHasMore(deck.hasMore);
    setRemainingThreshold(deck.remainingThreshold);
    setCurrentIndex(0);
    setIsLoading(false);
  };

  const loadDeck = (targetScope: PicksScope) => {
    createRecommendationDeck(targetScope, defaultLocationId)
      .then(applyDeck)
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadDeck(scope);
    // Runs once for the initial deck — scope switches and retries go through
    // changeScope/retryLoad below instead, so they can reset UI state synchronously.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the client-side card stack topped up: once fewer unseen cards remain ahead
  // of currentIndex than the server's remainingThreshold, pull the next page.
  useEffect(() => {
    if (!deckId || !hasMore || isFetchingMoreRef.current) return;
    const remaining = cards.length - (currentIndex + 1);
    if (remaining > remainingThreshold) return;

    isFetchingMoreRef.current = true;
    fetchRecommendationDeckPage(deckId, cursor).then((deck) => {
      setCards((prev) => [...prev, ...deck.cards]);
      setCursor(deck.nextCursor);
      setHasMore(deck.hasMore);
      setRemainingThreshold(deck.remainingThreshold);
      isFetchingMoreRef.current = false;
    });
  }, [cards.length, currentIndex, cursor, deckId, hasMore, remainingThreshold]);

  const changeScope = (nextScope: PicksScope) => {
    if (nextScope === scope) return;
    setScope(nextScope);
    setCards([]);
    setCurrentIndex(0);
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
    if (!deckId) return;
    recordRecommendationEvent(deckId, placeId, eventType).catch(() => {});
  };

  const toggleSaved = () => {
    if (!card) return;
    const nextSaved = !card.saved;
    recordEvent(card.placeId, nextSaved ? 'PLACE_SAVED' : 'PLACE_UNSAVED');
    setCards((prev) => prev.map((c, i) => (i === currentIndex ? { ...c, saved: nextSaved } : c)));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader onBack={() => router.back()} title="나를 위한 추천 여행지" />

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
            <CustomText style={styles.stateText}>추천 여행지를 불러오는 중이에요.</CustomText>
          </View>
        )}

        {!isLoading && hasError && (
          <View style={styles.state}>
            <CustomText style={styles.stateText}>추천 여행지를 불러오지 못했어요.</CustomText>
            <Pressable style={styles.retryButton} onPress={retryLoad}>
              <CustomText style={styles.retryText}>다시 시도</CustomText>
            </Pressable>
          </View>
        )}

        {!isLoading && !hasError && card && (
          <PicksDeck
            card={card}
            onToggleSave={toggleSaved}
            onExpand={() => recordEvent(card.placeId, 'CARD_EXPANDED')}
            onViewDetail={() => {
              recordEvent(card.placeId, 'PLACE_DETAIL_CLICKED');
              router.push({ pathname: '/places/[placeId]', params: { placeId: String(card.placeId) } });
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

      {!hasSeenGuide && <PicksGuideOverlay onDismiss={dismissGuide} />}
    </SafeAreaView>
  );
}

type PicksDeckProps = {
  card: PicksCard;
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
  onToggleSave,
  onExpand,
  onViewDetail,
  canSwipeNext,
  canSwipePrev,
  onSwipeNext,
  onSwipePrev,
}: PicksDeckProps) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);

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
          if (finished) {
            translateX.value = 0;
            runOnJS(onSwipeNext)();
          }
        });
      } else if (isSwipeLeft && canSwipePrev) {
        translateX.value = withTiming(-screenWidth, { duration: 250 }, (finished) => {
          if (finished) {
            translateX.value = 0;
            runOnJS(onSwipePrev)();
          }
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

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.cardStack, swipeStyle]}>
        <PicksFlipCard
          key={card.placeId}
          card={card}
          onToggleSave={onToggleSave}
          onExpand={onExpand}
          onViewDetail={onViewDetail}
        />
      </Animated.View>
    </GestureDetector>
  );
}

type PicksFlipCardProps = {
  card: PicksCard;
  onToggleSave: () => void;
  onExpand: () => void;
  onViewDetail: () => void;
};

function PicksFlipCard({ card, onToggleSave, onExpand, onViewDetail }: PicksFlipCardProps) {
  const flip = useSharedValue(0);

  const toggleFlip = () => {
    const isExpanding = flip.value === 0;
    flip.value = withTiming(isExpanding ? 1 : 0, { duration: FLIP_DURATION });
    if (isExpanding) onExpand();
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    zIndex: flip.value < 0.5 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    zIndex: flip.value < 0.5 ? 0 : 1,
  }));

  const heartIcon = (
    <SymbolView
      name={{
        ios: card.saved ? 'heart.fill' : 'heart',
        android: card.saved ? 'favorite' : 'favorite_border',
        web: card.saved ? 'favorite' : 'favorite_border',
      }}
      size={20}
      weight="regular"
      tintColor={card.saved ? Palette.red300 : Palette.grey400}
    />
  );

  return (
    <View style={styles.cardStack}>
      <Animated.View style={[styles.card, styles.cardFace, frontStyle]}>
        <Pressable style={styles.cardImageWrap} onPress={toggleFlip}>
          <Image source={{ uri: card.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Pressable>

        <View style={styles.cardInfo}>
          <View style={styles.cardTextGroup}>
            <CustomText style={styles.cardTitle}>{card.title}</CustomText>
            <View style={styles.cardLocationRow}>
              <SymbolView
                name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
                size={20}
                weight="regular"
                tintColor={Palette.grey600}
              />
              <CustomText style={styles.cardLocation}>{card.locationText}</CustomText>
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={onToggleSave} hitSlop={4}>
            {heartIcon}
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardFace, styles.cardBack, backStyle]}>
        <Pressable style={styles.cardBackContent} onPress={toggleFlip}>
          <View style={styles.cardBackTop}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTextGroup}>
                <CustomText style={styles.cardTitle}>{card.title}</CustomText>
                <View style={styles.cardLocationRow}>
                  <SymbolView
                    name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
                    size={20}
                    weight="regular"
                    tintColor={Palette.grey600}
                  />
                  <CustomText style={styles.cardLocation}>{card.locationText}</CustomText>
                </View>
              </View>

              <Pressable style={styles.saveButton} onPress={onToggleSave} hitSlop={4}>
                {heartIcon}
              </Pressable>
            </View>

            <View style={styles.tagRow}>
              {card.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <CustomText style={styles.tagLabel}>{tag}</CustomText>
                </View>
              ))}
            </View>

            <CustomText style={styles.descriptionText}>{card.shortDescription}</CustomText>
          </View>

          <Pressable style={styles.detailButton} onPress={onViewDetail}>
            <CustomText style={styles.detailButtonText}>여행 코스 확인하기</CustomText>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function PicksGuideOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Pressable style={styles.guideOverlay} onPress={onDismiss}>
      <View style={styles.guideBlock}>
        <CustomText style={styles.guideText}>
          이미지를 터치하여{'\n'}여행 정보를 확인하세요
        </CustomText>
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
        <CustomText style={styles.guideText}>
          카드를 옆으로 밀어{'\n'}다른 여행지를 구경해보세요
        </CustomText>
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
    width: 343,
    height: CARD_HEIGHT,
  },
  card: {
    width: 343,
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
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: CARD_HEIGHT,
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
    top: 16,
    right: 16,
  },
});
