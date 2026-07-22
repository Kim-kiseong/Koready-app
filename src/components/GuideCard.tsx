import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import type { GuideArticle } from '@/api/home';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { HomeImages } from '@/constants/home-images';
import { FontFamily } from '@/constants/typography';

export type GuideCardProps = {
  guide: GuideArticle;
  onPress?: () => void;
};

export default function GuideCard({ guide, onPress }: GuideCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.photoSection}>
        <Image source={HomeImages[guide.imageKey]} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
          start={{ x: 0.5, y: 0.12 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.badge}>
          <CustomText style={styles.badgeText}>{guide.badge}</CustomText>
        </View>
        <View style={styles.textGroup}>
          <CustomText style={styles.title}>{guide.title}</CustomText>
          <CustomText style={styles.description}>{guide.description}</CustomText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tagRow}>
          {guide.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <CustomText style={styles.tagText}>{tag}</CustomText>
            </View>
          ))}
        </View>
        <Pressable style={styles.arrowButton} onPress={onPress}>
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
            size={14}
            weight="semibold"
            tintColor="#ffffff"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 343,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    overflow: 'hidden',
  },
  photoSection: {
    height: 200,
    padding: 16,
    justifyContent: 'space-between',
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
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  description: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: '#ffffff',
  },
  footer: {
    height: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  tag: {
    backgroundColor: Palette.secondary,
    borderWidth: 1,
    borderColor: Palette.primaryPale,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.primary,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
