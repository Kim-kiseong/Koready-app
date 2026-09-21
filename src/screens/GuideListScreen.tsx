import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { GuideCategoryId, GuideVideo } from '@/api/home';
import { fetchGuideVideos, GUIDE_CATEGORY_IDS } from '@/api/home';
import CustomText from '@/components/CustomText';
import GuideVideoCard from '@/components/GuideVideoCard';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { GuideCategoryImages } from '@/constants/guide-category-images';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

const GRID_COLUMNS = 2;
const GRID_GAP = 13;
const SCREEN_PADDING = 16;

export default function GuideListScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  // Measured from the screen's own onLayout instead of useWindowDimensions —
  // see EventListScreen for why: useWindowDimensions can resolve against the
  // wrong window inside PcIframeShell's iframe on PC web, computing a card
  // width far wider than what actually fits and collapsing the grid to a
  // single column.
  const [screenWidth, setScreenWidth] = useState(0);
  // Floored so 2 cards + the gap always land a hair under the container's
  // width instead of exactly at it — browser zoom's sub-pixel rounding can
  // otherwise wrap this to a single column. Only used on native; web uses
  // real CSS Grid below and needs no JS-computed width at all.
  const guideCardWidth = Math.floor(
    (screenWidth - SCREEN_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
  );
  const [category, setCategory] = useState<GuideCategoryId>('TRANSPORT');
  const [guides, setGuides] = useState<GuideVideo[]>([]);

  useEffect(() => {
    fetchGuideVideos(category, language).then(setGuides);
  }, [category, language]);

  const handleCategoryPress = (id: GuideCategoryId) => {
    // LANGUAGE has no card grid of its own — it's a single 6-card phrase
    // carousel, so tapping the tab jumps straight into that flow instead.
    if (id === 'LANGUAGE') {
      router.push('/guides/language');
      return;
    }
    setCategory(id);
  };

  const handleGuidePress = (guide: GuideVideo) => {
    if (guide.id === 'ktx-booking') {
      router.push('/guides/ktx');
      return;
    }
    router.push({ pathname: '/guides/[guideId]', params: { guideId: guide.id } });
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'bottom']}
      onLayout={(event) => setScreenWidth(event.nativeEvent.layout.width)}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={t.guideList.title} rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoryRow}>
          {GUIDE_CATEGORY_IDS.map((id) => (
            <CategoryAvatar
              key={id}
              label={t.guideList.categories[id]}
              imageKey={id}
              selected={category === id}
              onPress={() => handleCategoryPress(id)}
            />
          ))}
        </View>

        <View style={styles.descriptionBox}>
          <CustomText style={styles.descriptionText}>{t.guideList.description[category]}</CustomText>
        </View>

        <View style={styles.grid}>
          {guides.map((guide) => (
            <GuideVideoCard
              key={guide.id}
              guide={guide}
              width={Platform.OS === 'web' ? undefined : guideCardWidth}
              onPress={() => handleGuidePress(guide)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryAvatar({
  label,
  imageKey,
  selected,
  onPress,
}: {
  label: string;
  imageKey: GuideCategoryId;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.categoryItem} onPress={onPress}>
      <View style={[styles.categoryAvatar, selected ? styles.categoryAvatarSelected : styles.categoryAvatarDefault]}>
        <Image source={GuideCategoryImages[imageKey]} style={styles.categoryIcon} contentFit="contain" />
      </View>
      <CustomText style={selected ? styles.categoryLabelSelected : styles.categoryLabel}>{label}</CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: 79,
    alignItems: 'center',
    gap: 6,
  },
  categoryAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryAvatarDefault: {
    backgroundColor: '#ffffff',
    borderColor: Palette.grey150,
  },
  categoryAvatarSelected: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.primary,
  },
  categoryIcon: {
    width: 64,
    height: 64,
  },
  categoryLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.text,
  },
  categoryLabelSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.primary,
  },
  descriptionBox: {
    backgroundColor: Palette.grey100,
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey600,
  },
  grid: Platform.select({
    // CSS Grid needs no JS-measured width at all — the browser's own layout
    // engine divides the row into exactly 2 equal tracks, so there's nothing
    // for browser zoom's sub-pixel rounding (or a stale onLayout measurement)
    // to disagree with. flexWrap's approach (still used natively, where none
    // of that applies) has to get a computed per-card width exactly right or
    // it wraps to a single column — this sidesteps that class of bug
    // entirely instead of chasing another rounding edge case.
    web: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      columnGap: GRID_GAP,
      rowGap: GRID_GAP,
    } as object,
    default: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: GRID_GAP,
      rowGap: GRID_GAP,
    },
  }),
});
