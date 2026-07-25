import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchGuideVideos, GUIDE_CATEGORY_IDS } from '@/api/home';
import type { GuideCategoryId, GuideVideo } from '@/api/home';
import CustomText from '@/components/CustomText';
import GuideVideoCard from '@/components/GuideVideoCard';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { GuideCategoryImages } from '@/constants/guide-category-images';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export default function GuideListScreen() {
  const router = useRouter();
  const t = useTranslation();
  const [category, setCategory] = useState<GuideCategoryId>('TRANSPORT');
  const [guides, setGuides] = useState<GuideVideo[]>([]);

  useEffect(() => {
    fetchGuideVideos(category).then(setGuides);
  }, [category]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} title={t.guideList.title} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoryRow}>
          {GUIDE_CATEGORY_IDS.map((id) => (
            <CategoryAvatar
              key={id}
              label={t.guideList.categories[id]}
              imageKey={id}
              selected={category === id}
              onPress={() => setCategory(id)}
            />
          ))}
        </View>

        <View style={styles.descriptionBox}>
          <CustomText style={styles.descriptionText}>{t.guideList.description}</CustomText>
        </View>

        <View style={styles.grid}>
          {guides.map((guide) => (
            <GuideVideoCard key={guide.id} guide={guide} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 13,
    rowGap: 13,
  },
});
