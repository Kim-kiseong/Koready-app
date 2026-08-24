import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { FeaturedEvent } from '@/api/home';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type EventCardProps = {
  event: FeaturedEvent;
  onPress?: () => void;
};

export default function EventCard({ event, onPress }: EventCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0.5, y: 0.12 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CustomText style={styles.title}>{event.title}</CustomText>
      <CustomText style={styles.dateRange}>{event.dateRangeLabel}</CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 225,
    height: 312,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 6,
  },
  imageFallback: {
    backgroundColor: Palette.grey200,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  dateRange: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: '#ffffff',
  },
});
