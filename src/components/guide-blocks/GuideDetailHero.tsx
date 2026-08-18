import { LinearGradient } from 'expo-linear-gradient';
import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type GuideDetailHeroProps = {
  image: ImageSource;
  categoryBadge: string;
  title: string;
  description: string;
};

// Shared header block for every single-page guide screen: hero photo with a
// bottom-fade gradient and category pill, then a title + description below it.
export default function GuideDetailHero({ image, categoryBadge, title, description }: GuideDetailHeroProps) {
  return (
    <View style={styles.group}>
      <View style={styles.imageWrap}>
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
          start={{ x: 0.5, y: 0.12 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.badge}>
          <CustomText style={styles.badgeText}>{categoryBadge}</CustomText>
        </View>
      </View>

      <View style={styles.textGroup}>
        <CustomText style={styles.title}>{title}</CustomText>
        <CustomText style={styles.description}>{description}</CustomText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 16,
    width: '100%',
  },
  imageWrap: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.primary,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  textGroup: {
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 20,
    color: Palette.text,
  },
  description: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.grey600,
  },
});
