import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import type { GuideVideo } from '@/api/home';
import CustomText from '@/components/CustomText';
import { HomeImages } from '@/constants/home-images';
import { FontFamily } from '@/constants/typography';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

export type GuideVideoCardProps = {
  guide: GuideVideo;
  onPress?: () => void;
};

export default function GuideVideoCard({ guide, onPress }: GuideVideoCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={HomeImages[guide.imageKey]} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0.5, y: 0.12 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.playBadge}>
        <SymbolView
          name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
          size={14}
          weight="regular"
          tintColor="#ffffff"
        />
      </View>

      <CustomText style={styles.title}>{guide.title}</CustomText>
      <View style={styles.tagRow}>
        {guide.tags.map((tag, index) => (
          <View key={toStableListKey(tag, index)} style={styles.tag}>
            <CustomText style={styles.tagText}>{toDisplayText(tag)}</CustomText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 165,
    height: 204,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 8,
  },
  playBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 15,
    lineHeight: 21,
    color: '#ffffff',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
    fontFamily: FontFamily.pretendard.medium,
    color: '#ffffff',
  },
});
