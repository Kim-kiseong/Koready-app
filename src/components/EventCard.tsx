import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import type { FeaturedEvent } from '@/api/home';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type EventCardProps = {
  event: FeaturedEvent;
  onPress?: () => void;
  // Reports that this card's photo has settled (loaded or failed) — lets
  // HomeScreen keep the whole featured row behind a loading state until
  // every card's image is ready, instead of photos popping in one by one.
  onImageSettled?: () => void;
};

export default function EventCard({ event, onPress, onImageSettled }: EventCardProps) {
  useEffect(() => {
    // No photo to wait for — count it as settled immediately so a mix of
    // photo/no-photo cards doesn't leave the row stuck loading.
    if (!event.imageUrl) onImageSettled?.();
    // Only meant to fire once, for whichever card this is — the eslint rule
    // would want onImageSettled/event.imageUrl listed, but this card never
    // changes which event it's showing (see the `key` it's mounted with).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {event.imageUrl ? (
        <Image
          source={{ uri: event.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          onLoadEnd={onImageSettled}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
        start={{ x: 0.5, y: 0.434 }}
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
    ...(Platform.OS === 'web'
      ? ({ textShadow: '0 0 4px rgba(0, 0, 0, 0.2)' } as object)
      : {
          textShadowColor: 'rgba(0,0,0,0.2)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 4,
        }),
  },
  dateRange: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: '#ffffff',
  },
});
