import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPicksCards, type PicksCard, type PicksScope } from '@/api/picks';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { PicksImages } from '@/constants/picks-images';
import { FontFamily } from '@/constants/typography';
import { usePicksStore } from '@/store/picks-store';

const SCOPES: { id: PicksScope; label: string }[] = [
  { id: 'NEARBY', label: '근교' },
  { id: 'NATIONWIDE', label: '전국' },
];

export default function PicksScreen() {
  const router = useRouter();
  const hasSeenGuide = usePicksStore((state) => state.hasSeenGuide);
  const dismissGuide = usePicksStore((state) => state.dismissGuide);

  const [scope, setScope] = useState<PicksScope>('NATIONWIDE');
  const [cards, setCards] = useState<PicksCard[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPicksCards(scope).then(setCards);
  }, [scope]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const card = cards[0];

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
                onPress={() => setScope(option.id)}>
                <CustomText
                  style={[styles.scopeLabel, selected ? styles.scopeLabelSelected : styles.scopeLabelUnselected]}>
                  {option.label}
                </CustomText>
              </Pressable>
            );
          })}
        </View>

        {card && (
          <View style={styles.card}>
            <Pressable
              style={styles.cardImageWrap}
              onPress={() => router.push({ pathname: '/places/[placeId]', params: { placeId: card.id } })}>
              <Image source={PicksImages[card.imageKey]} style={StyleSheet.absoluteFill} contentFit="cover" />
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
                  <CustomText style={styles.cardLocation}>{card.location}</CustomText>
                </View>
              </View>

              <Pressable style={styles.saveButton} onPress={() => toggleSaved(card.id)} hitSlop={4}>
                <SymbolView
                  name={{
                    ios: savedIds.has(card.id) ? 'heart.fill' : 'heart',
                    android: savedIds.has(card.id) ? 'favorite' : 'favorite_border',
                    web: savedIds.has(card.id) ? 'favorite' : 'favorite_border',
                  }}
                  size={20}
                  weight="regular"
                  tintColor={savedIds.has(card.id) ? Palette.red300 : Palette.grey400}
                />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <BottomNavBar active="picks" />

      {!hasSeenGuide && <PicksGuideOverlay onDismiss={dismissGuide} />}
    </SafeAreaView>
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
  cardImageWrap: {
    height: 400,
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
